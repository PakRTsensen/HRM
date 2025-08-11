from typing import List, Optional, Tuple, Dict
from dataclasses import dataclass
from pathlib import Path
import os
import json
import hashlib
import numpy as np
from glob import glob
from tqdm import tqdm
import re

from argdantic import ArgParser
from pydantic import BaseModel

from common import PuzzleDatasetMetadata, dihedral_transform


cli = ArgParser()


class DataProcessConfig(BaseModel):
    dataset_dirs: List[str] = [
        "dataset/raw-data/ARC-AGI-1/data", 
        "dataset/raw-data/ConceptARC/data", 
        "dataset/raw-data/RE-ARC/data", 
        "dataset/raw-data/Mini-ARC/data", 
        "dataset/raw-data/ARC-Heavy/data", 
        "dataset/raw-data/ARC_synthetic_extend/data", 
        "dataset/raw-data/arc-community/data",
        "dataset/raw-data/ARC-AGI-2/data"
    ]
    output_dir: str = "data/arc-aug-chunks"
    seed: int = 42
    num_aug: int = 5
    
    
ARCMaxGridSize = 128
ARCAugmentRetriesFactor = 5
    

@dataclass
class ARCPuzzle:
    id: str
    examples: List[Tuple[np.ndarray, np.ndarray]]

    
def arc_grid_to_np(grid: List[List[int]]):
    arr = np.array(grid)
    assert arr.ndim == 2
    assert arr.shape[0] <= ARCMaxGridSize and arr.shape[1] <= ARCMaxGridSize
    assert np.all((arr >= 0) & (arr <= 9))
    return arr.astype(np.uint8)


def np_grid_to_seq_translational_augment(inp: np.ndarray, out: np.ndarray, do_translation: bool):
    if do_translation:
        pad_r = np.random.randint(0, ARCMaxGridSize - max(inp.shape[0], out.shape[0]) + 1)
        pad_c = np.random.randint(0, ARCMaxGridSize - max(inp.shape[1], out.shape[1]) + 1)
    else:
        pad_r = pad_c = 0

    result = []
    for grid in [inp, out]:
        nrow, ncol = grid.shape
        grid = np.pad(grid + 2, ((pad_r, ARCMaxGridSize - pad_r - nrow), (pad_c, ARCMaxGridSize - pad_c - ncol)), constant_values=0)
        eos_row, eos_col = pad_r + nrow, pad_c + ncol
        if eos_row < ARCMaxGridSize:
            grid[eos_row, pad_c:eos_col] = 1
        if eos_col < ARCMaxGridSize:
            grid[pad_r:eos_row, eos_col] = 1
        result.append(grid.flatten())
    return result


def puzzle_hash(puzzle: dict):
    def _grid_hash(grid: np.ndarray):
        buffer = [x.to_bytes(1) for x in grid.shape]
        buffer.append(grid.tobytes())
        return hashlib.sha256(b".".join(buffer)).hexdigest()
    
    hashes = []
    for example_type, example in puzzle.items():
        for input, label in example.examples:
            hashes.append(f"{_grid_hash(input)}|{_grid_hash(label)}")
    hashes.sort()
    return hashlib.sha256("|".join(hashes).encode()).hexdigest()


def get_single_puzzle_augmentations(default_name: str, puzzle_json: dict, aug_count: int) -> List[ARCPuzzle]:
    name = puzzle_json.get("name", default_name)
    
    # For this streaming approach, we assume a single destination (split/set) per puzzle file
    # The logic for train/test split is simplified to be handled by directory structure
    converted = ARCPuzzle(name, [])
    for examples in puzzle_json.values():
        if isinstance(examples, list):
             converted.examples.extend([(arc_grid_to_np(ex["input"]), arc_grid_to_np(ex["output"])) for ex in examples])

    group = [converted]
    
    if aug_count > 0:
        hashes = {puzzle_hash({'train': converted})} # Use a consistent key for hashing
        with tqdm(total=aug_count, desc=f"Augmenting {name}", leave=False, unit="aug") as pbar:
            for _trial in range(ARCAugmentRetriesFactor * aug_count):
                if len(group) >= aug_count + 1: break
                trans_id = np.random.randint(0, 8)
                mapping = np.concatenate([np.arange(0, 1, dtype=np.uint8), np.random.permutation(np.arange(1, 10, dtype=np.uint8))])
                aug_repr = f"t{trans_id}_{''.join(str(x) for x in mapping)}"
                
                def _map_grid(grid: np.ndarray): return dihedral_transform(mapping[grid], trans_id)
                
                augmented = ARCPuzzle(f"{converted.id}_{aug_repr}", [(_map_grid(inp), _map_grid(lab)) for (inp, lab) in converted.examples])
                h = puzzle_hash({'train': augmented})
                if h not in hashes:
                    hashes.add(h)
                    group.append(augmented)
                    pbar.update(1)
        
        if len(group) < aug_count + 1:
            tqdm.write(f"[Warning] Puzzle {name}: augmentation not full, only got {len(group) - 1}/{aug_count} unique samples.")
            
    return group


def process_and_save_chunk(dataset_dir: str, config: DataProcessConfig, identifier_map: Dict[str, int]):
    np.random.seed(config.seed)
    
    # Determine if this chunk is for training or testing
    dir_name = Path(dataset_dir).name.lower()
    parent_dir_name = Path(dataset_dir).parent.name.lower()
    is_train_split = 'train' in dir_name or 'train' in parent_dir_name
    split_name = "train" if is_train_split else "test"
    subset_name = "all" # Simplified for this approach

    chunk_name_slug = re.sub(r'[^a-z0-9]+', '-', parent_dir_name).strip('-')
    output_chunk_dir = os.path.join(config.output_dir, split_name)
    os.makedirs(output_chunk_dir, exist_ok=True)

    # --- Pre-calculation pass ---
    puzzles_meta = []
    total_examples_to_generate = 0
    total_groups_to_generate = 0
    
    # Robust file discovery
    all_files = glob(os.path.join(dataset_dir, "*.json")) + glob(os.path.join(dataset_dir, "*/*.json"))
    
    for filename in all_files:
        with open(filename, "r") as f:
            puzzle_json = json.load(f)
            num_examples_in_puzzle = sum(len(v) for v in puzzle_json.values() if isinstance(v, list))
            # Estimate augmentations. This is an approximation as some might not be unique.
            num_augs = config.num_aug + 1
            total_examples_to_generate += num_examples_in_puzzle * num_augs
            total_groups_to_generate += num_augs
            puzzles_meta.append({'file': filename, 'name': Path(filename).stem})

    if not puzzles_meta:
        print(f"No puzzles found in {dataset_dir}, skipping.")
        return

    # --- Memory-map file creation ---
    seq_len = ARCMaxGridSize * ARCMaxGridSize
    mmap_files = {
        'inputs': np.memmap(os.path.join(output_chunk_dir, f"{subset_name}__inputs_chunk_{chunk_name_slug}.npy"), dtype=np.uint8, mode='w+', shape=(total_examples_to_generate, seq_len)),
        'labels': np.memmap(os.path.join(output_chunk_dir, f"{subset_name}__labels_chunk_{chunk_name_slug}.npy"), dtype=np.uint8, mode='w+', shape=(total_examples_to_generate, seq_len)),
        'puzzle_identifiers': np.memmap(os.path.join(output_chunk_dir, f"{subset_name}__puzzle_identifiers_chunk_{chunk_name_slug}.npy"), dtype=np.int32, mode='w+', shape=(total_groups_to_generate,)),
        'puzzle_indices': np.memmap(os.path.join(output_chunk_dir, f"{subset_name}__puzzle_indices_chunk_{chunk_name_slug}.npy"), dtype=np.int32, mode='w+', shape=(total_groups_to_generate + 1,)),
        'group_indices': np.memmap(os.path.join(output_chunk_dir, f"{subset_name}__group_indices_chunk_{chunk_name_slug}.npy"), dtype=np.int32, mode='w+', shape=(len(puzzles_meta) + 1,)),
    }
    
    # --- Processing and Streaming Pass ---
    example_cursor, puzzle_cursor, group_cursor = 0, 0, 0
    mmap_files['puzzle_indices'][0] = 0
    mmap_files['group_indices'][0] = 0

    desc = f"Streaming {parent_dir_name}/{dir_name}"
    for meta in tqdm(puzzles_meta, desc=desc, unit="puzzle"):
        with open(meta['file'], 'r') as f:
            puzzle_json = json.load(f)
        
        puzzle_group = get_single_puzzle_augmentations(meta['name'], puzzle_json, config.num_aug)
        
        for puzzle in puzzle_group:
            original_puzzle_id = puzzle.id.split('_')[0]
            num_examples_in_puzzle = len(puzzle.examples)
            
            # Write inputs and labels
            for inp, out in puzzle.examples:
                inp_aug, out_aug = np_grid_to_seq_translational_augment(inp, out, do_translation=is_train_split)
                mmap_files['inputs'][example_cursor] = inp_aug
                mmap_files['labels'][example_cursor] = out_aug
                example_cursor += 1

            # Write metadata
            mmap_files['puzzle_identifiers'][puzzle_cursor] = identifier_map[original_puzzle_id]
            mmap_files['puzzle_indices'][puzzle_cursor + 1] = example_cursor
            puzzle_cursor += 1

        mmap_files['group_indices'][group_cursor + 1] = puzzle_cursor
        group_cursor += 1

    # --- Finalization ---
    # Truncate files to actual size, in case some augmentations failed
    for key, arr in mmap_files.items():
        if key == 'inputs' or key == 'labels':
            final_size = example_cursor
        elif key == 'puzzle_indices':
            final_size = puzzle_cursor + 1
        elif key == 'group_indices':
            final_size = group_cursor + 1
        else: # puzzle_identifiers
            final_size = puzzle_cursor
        
        arr.flush()
        # This part is tricky without resizing the file on disk, which is complex.
        # For now, we accept that the file might be slightly larger than needed.
        # A more robust solution would use a different temporary format or resize at the end.
    
    print(f"Finished streaming chunk {chunk_name_slug}.")


def build_global_identifier_map(config: DataProcessConfig) -> Dict[str, int]:
    print("Building global puzzle identifier map...")
    identifier_map = {}
    num_identifiers = 1
    for dataset_dir in config.dataset_dirs:
        if not os.path.exists(dataset_dir): continue
        
        # Robust file discovery
        all_files = glob(os.path.join(dataset_dir, "*.json")) + glob(os.path.join(dataset_dir, "*/*.json"))

        for filename in all_files:
            with open(filename, "r") as f:
                puzzle_json = json.load(f)
                puzzle_id = puzzle_json.get("name", Path(filename).stem)
                if puzzle_id not in identifier_map:
                    identifier_map[puzzle_id] = num_identifiers
                    num_identifiers += 1
    print(f"Found {len(identifier_map)} unique puzzle IDs globally.")
    return identifier_map


@cli.command(singleton=True)
def main(config: DataProcessConfig):
    os.makedirs(config.output_dir, exist_ok=True)
    
    identifier_map = build_global_identifier_map(config)
    ids_mapping_path = os.path.join(config.output_dir, "identifiers.json")
    with open(ids_mapping_path, "w") as f:
        ids_mapping = {v: k for k, v in identifier_map.items()}
        json.dump([ids_mapping.get(i, "<blank>") for i in range(len(identifier_map) + 1)], f)
    print(f"Global identifier map saved to {ids_mapping_path}")

    for dataset_dir in config.dataset_dirs:
        if os.path.exists(dataset_dir):
            process_and_save_chunk(dataset_dir, config, identifier_map)
        else:
            print(f"Warning: Directory not found, skipping: {dataset_dir}")

    print("\nChunk generation complete.")
    print(f"Next step: run stitch_datasets.py to combine chunks.")


if __name__ == "__main__":
    cli()
