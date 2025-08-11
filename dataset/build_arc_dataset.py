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

# --- Configuration ---
class DataProcessConfig(BaseModel):
    dataset_dirs: List[str] = [
        "dataset/raw-data/ARC-AGI-1/data", 
#        "dataset/raw-data/ConceptARC/data", 
#        "dataset/raw-data/RE-ARC/data", 
#        "dataset/raw-data/Mini-ARC/data", 
#       "dataset/raw-data/ARC-Heavy/data", 
#        "dataset/raw-data/ARC_synthetic_extend/data", 
#        "dataset/raw-data/arc-community/data",
        "dataset/raw-data/ARC-AGI-2/data"
    ]
    output_dir: str = "data/arc-aug-chunks"
    seed: int = 42
    num_aug: int = 5

ARCMaxGridSize = 128
ARCAugmentRetriesFactor = 5
    
# --- Data Structures ---
@dataclass
class ARCPuzzle:
    id: str
    examples: List[Tuple[np.ndarray, np.ndarray]]

# --- Core Functions ---
def arc_grid_to_np(grid: List[List[int]]):
    arr = np.array(grid)
    assert arr.ndim == 2 and arr.shape[0] <= ARCMaxGridSize and arr.shape[1] <= ARCMaxGridSize and np.all((arr >= 0) & (arr <= 9))
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
        if eos_row < ARCMaxGridSize: grid[eos_row, pad_c:eos_col] = 1
        if eos_col < ARCMaxGridSize: grid[pad_r:eos_row, eos_col] = 1
        result.append(grid.flatten())
    return result

def puzzle_hash(puzzle: dict):
    def _grid_hash(grid: np.ndarray):
        return hashlib.sha256(grid.tobytes()).hexdigest()
    hashes = [f"{_grid_hash(ex[0])}|{_grid_hash(ex[1])}" for ex in puzzle.examples]
    hashes.sort()
    return hashlib.sha256("|".join(hashes).encode()).hexdigest()

def get_single_puzzle_augmentations(default_name: str, puzzle_json: dict, aug_count: int) -> List[ARCPuzzle]:
    name = puzzle_json.get("name", default_name)
    converted = ARCPuzzle(name, [])
    for examples in puzzle_json.values():
        if isinstance(examples, list):
            converted.examples.extend([(arc_grid_to_np(ex["input"]), arc_grid_to_np(ex["output"])) for ex in examples])
    
    group = [converted]
    if aug_count > 0:
        hashes = {puzzle_hash(converted)}
        with tqdm(total=aug_count, desc=f"Augmenting {name}", leave=False, unit="aug") as pbar:
            for _ in range(ARCAugmentRetriesFactor * aug_count):
                if len(group) >= aug_count + 1: break
                trans_id = np.random.randint(0, 8)
                mapping = np.random.permutation(np.arange(10, dtype=np.uint8))
                def _map_grid(grid: np.ndarray): return dihedral_transform(mapping[grid], trans_id)
                augmented = ARCPuzzle(f"{converted.id}_aug", [(_map_grid(inp), _map_grid(lab)) for inp, lab in converted.examples])
                h = puzzle_hash(augmented)
                if h not in hashes:
                    hashes.add(h)
                    group.append(augmented)
                    pbar.update(1)
        if len(group) - 1 < aug_count:
            tqdm.write(f"[Warning] Puzzle {name}: Augmentation incomplete. Got {len(group) - 1}/{aug_count}.")
    return group

def process_and_save_chunk(dataset_dir: str, config: DataProcessConfig, identifier_map: Dict[str, int]):
    np.random.seed(config.seed)
    is_train_split = 'train' in Path(dataset_dir).name.lower() or 'train' in Path(dataset_dir).parent.name.lower()
    split_name, subset_name = ("train", "all") if is_train_split else ("test", "all")
    chunk_name_slug = re.sub(r'[^a-z0-9]+', '-', Path(dataset_dir).parent.name.lower()).strip('-')
    output_chunk_dir = os.path.join(config.output_dir, split_name)
    os.makedirs(output_chunk_dir, exist_ok=True)

    all_files = glob(os.path.join(dataset_dir, "*.json")) + glob(os.path.join(dataset_dir, "*/*.json"))
    if not all_files:
        print(f"No puzzles found in {dataset_dir}, skipping.")
        return

    # --- In-Memory Buffer for the entire chunk ---
    results = {k: [] for k in ["inputs", "labels", "puzzle_identifiers", "puzzle_indices", "group_indices"]}
    results["puzzle_indices"].append(0)
    results["group_indices"].append(0)
    
    example_id, puzzle_id, total_examples, total_puzzles, total_groups = 0, 0, 0, 0, 0

    desc = f"Processing {chunk_name_slug}"
    for filename in tqdm(all_files, desc=desc, unit="puzzle"):
        with open(filename, 'r') as f:
            puzzle_json = json.load(f)
        
        puzzle_group = get_single_puzzle_augmentations(Path(filename).stem, puzzle_json, config.num_aug)
        
        for puzzle in puzzle_group:
            original_puzzle_id = puzzle.id.split('_')[0]
            results['puzzle_identifiers'].append(identifier_map[original_puzzle_id])
            
            for inp, out in puzzle.examples:
                inp_aug, out_aug = np_grid_to_seq_translational_augment(inp, out, do_translation=is_train_split)
                results['inputs'].append(inp_aug)
                results['labels'].append(out_aug)
                example_id += 1
            
            results['puzzle_indices'].append(example_id)
            puzzle_id += 1
        
        results['group_indices'].append(puzzle_id)
        total_groups += 1
        total_puzzles += len(puzzle_group)
        total_examples += sum(len(p.examples) for p in puzzle_group)

    # --- Save the completed chunk from RAM to Disk ---
    print(f"Saving chunk {chunk_name_slug} to disk...")
    for k, v in results.items():
        if k in {"inputs", "labels"}:
            v_np = np.array(v, dtype=np.uint8)
        else:
            v_np = np.array(v, dtype=np.int32)
        
        chunk_filename = f"{subset_name}___{k}_chunk_{chunk_name_slug}.npy"
        np.save(os.path.join(output_chunk_dir, chunk_filename), v_np)

    # Save chunk metadata
    metadata = PuzzleDatasetMetadata(
        seq_len=ARCMaxGridSize * ARCMaxGridSize, vocab_size=12, pad_id=0, ignore_label_id=0,
        blank_identifier_id=0, num_puzzle_identifiers=len(identifier_map) + 1,
        total_groups=total_groups,
        mean_puzzle_examples=total_examples / total_puzzles if total_puzzles > 0 else 0,
        sets=[subset_name]
    )
    metadata_filename = f"metadata_chunk_{chunk_name_slug}.json"
    with open(os.path.join(output_chunk_dir, metadata_filename), "w") as f:
        json.dump(metadata.model_dump(), f)
    
    print(f"Finished chunk {chunk_name_slug}.")

def build_global_identifier_map(config: DataProcessConfig) -> Dict[str, int]:
    print("Building global puzzle identifier map...")
    identifier_map = {}
    num_identifiers = 1
    for dataset_dir in config.dataset_dirs:
        if not os.path.exists(dataset_dir): continue
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
