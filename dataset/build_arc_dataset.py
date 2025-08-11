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
#       "dataset/raw-data/ConceptARC/data", 
#        "dataset/raw-data/RE-ARC/data", 
        "dataset/raw-data/Mini-ARC/data", 
#        "dataset/raw-data/ARC-Heavy/data", 
#        "dataset/raw-data/ARC_synthetic_extend/data", 
#        "dataset/raw-data/arc-community/data",
#        "dataset/raw-data/ARC-AGI-2/data"
    ]
    output_dir: str = "data/arc-aug-chunks"
    seed: int = 42
    num_aug: int = 1000
    
    
ARCMaxGridSize = 30
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


def convert_single_arc_puzzle(results: dict, default_name: str, puzzle_json: dict, aug_count: int, dest_mapping: Dict[str, Tuple[str, str]]):
    name = puzzle_json.pop("name", default_name)
    
    dests = set(dest_mapping.values())
    converted = {dest: ARCPuzzle(name, []) for dest in dests}
    for example_type, examples in puzzle_json.items():
        dest = dest_mapping[example_type]
        converted[dest].examples.extend([(arc_grid_to_np(ex["input"]), arc_grid_to_np(ex["output"])) for ex in examples])

    group = [converted]
    
    if aug_count > 0:
        hashes = {puzzle_hash(converted)}
        with tqdm(total=aug_count, desc=f"Augmenting {name}", leave=False, unit="aug") as pbar:
            for _trial in range(ARCAugmentRetriesFactor * aug_count):
                if len(group) >= aug_count + 1: break
                trans_id = np.random.randint(0, 8)
                mapping = np.concatenate([np.arange(0, 1, dtype=np.uint8), np.random.permutation(np.arange(1, 10, dtype=np.uint8))])
                aug_repr = f"t{trans_id}_{''.join(str(x) for x in mapping)}"
                
                def _map_grid(grid: np.ndarray): return dihedral_transform(mapping[grid], trans_id)
                
                augmented = {dest: ARCPuzzle(f"{p.id}_{aug_repr}", [(_map_grid(inp), _map_grid(lab)) for (inp, lab) in p.examples]) for dest, p in converted.items()}
                h = puzzle_hash(augmented)
                if h not in hashes:
                    hashes.add(h)
                    group.append(augmented)
                    pbar.update(1)
        
        if len(group) < aug_count + 1:
            tqdm.write(f"[Warning] Puzzle {name}: augmentation not full, only got {len(group) - 1}/{aug_count} unique samples.")

    for dest in dests:
        dest_split, dest_set = dest
        results.setdefault(dest_split, {}).setdefault(dest_set, []).append([p[dest] for p in group])


def load_puzzles_for_chunk(results: dict, dataset_path: str, config: DataProcessConfig):
    train_dest = ("train", "all")
    test_map = {"evaluation": [(1.0, ("test", "all"))], "_default": [(1.0, ("train", "all"))]}
    
    puzzles = []
    for subdir in os.scandir(dataset_path):
        if subdir.is_dir():
            for filename in glob(os.path.join(subdir.path, "*.json")):
                with open(filename, "r") as f:
                    puzzles.append((Path(filename).stem, json.load(f)))
    
    np.random.shuffle(puzzles)
    
    desc = f"Processing {Path(dataset_path).parent.name}/{Path(dataset_path).name}"
    for idx, (default_name, puzzle_json) in enumerate(tqdm(puzzles, desc=desc, unit="puzzle")):
        fraction = idx / len(puzzles)
        test_dest = None
        for f, dest in test_map.get(os.path.basename(os.path.dirname(puzzle_json.get("path", ""))), test_map["_default"]):
             if fraction < f:
                test_dest = dest
                break
        
        convert_single_arc_puzzle(results, default_name, puzzle_json, config.num_aug, {"train": train_dest, "test": test_dest})

    print(f"[{dataset_path}] total puzzles processed: {len(puzzles)}")


def process_and_save_chunk(dataset_dir: str, config: DataProcessConfig, identifier_map: Dict[str, int]):
    np.random.seed(config.seed)
    chunk_data = {}
    load_puzzles_for_chunk(chunk_data, dataset_dir, config)

    chunk_name_slug = re.sub(r'[^a-z0-9]+', '-', Path(dataset_dir).parent.name.lower()).strip('-')

    for split_name, split in chunk_data.items():
        os.makedirs(os.path.join(config.output_dir, split_name), exist_ok=True)
        enable_translational_augment = split_name == "train"

        for subset_name, subset in split.items():
            results = {k: [] for k in ["inputs", "labels", "puzzle_identifiers", "puzzle_indices", "group_indices"]}
            results["puzzle_indices"].append(0)
            results["group_indices"].append(0)
            
            example_id, puzzle_id, total_examples, total_puzzles, total_groups = 0, 0, 0, 0, 0

            for group in subset:
                for puzzle in group:
                    no_aug_id = np.random.randint(0, len(puzzle.examples))
                    for _idx_ex, (inp, out) in enumerate(puzzle.examples):
                        inp_aug, out_aug = np_grid_to_seq_translational_augment(inp, out, do_translation=enable_translational_augment and _idx_ex != no_aug_id)
                        results["inputs"].append(inp_aug)
                        results["labels"].append(out_aug)
                        example_id += 1
                        total_examples += 1
                    
                    results["puzzle_indices"].append(example_id)
                    results["puzzle_identifiers"].append(identifier_map[puzzle.id])
                    puzzle_id += 1
                    total_puzzles += 1
                
                results["group_indices"].append(puzzle_id)
                total_groups += 1
            
            # Save chunk files
            for k, v in results.items():
                if k in {"inputs", "labels"}: v = np.stack(v, 0)
                else: v = np.array(v, dtype=np.int32)
                
                chunk_filename = f"{subset_name}___{k}_chunk_{chunk_name_slug}.npy"
                np.save(os.path.join(config.output_dir, split_name, chunk_filename), v)

            # Save chunk metadata
            metadata = PuzzleDatasetMetadata(
                seq_len=ARCMaxGridSize * ARCMaxGridSize, vocab_size=12, pad_id=0, ignore_label_id=0,
                blank_identifier_id=0, num_puzzle_identifiers=len(identifier_map) + 1,
                total_groups=total_groups,
                mean_puzzle_examples=total_examples / total_puzzles if total_puzzles > 0 else 0,
                sets=[subset_name]
            )
            metadata_filename = f"metadata_chunk_{chunk_name_slug}.json"
            with open(os.path.join(config.output_dir, split_name, metadata_filename), "w") as f:
                json.dump(metadata.model_dump(), f)


def build_global_identifier_map(config: DataProcessConfig) -> Dict[str, int]:
    print("Building global puzzle identifier map...")
    identifier_map = {}
    num_identifiers = 1  # 0 is blank
    for dataset_dir in config.dataset_dirs:
        for subdir in os.scandir(dataset_dir):
            if subdir.is_dir():
                for filename in glob(os.path.join(subdir.path, "*.json")):
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
    
    # 1. Build and save global identifier map first
    identifier_map = build_global_identifier_map(config)
    ids_mapping_path = os.path.join(config.output_dir, "identifiers.json")
    with open(ids_mapping_path, "w") as f:
        ids_mapping = {v: k for k, v in identifier_map.items()}
        json.dump([ids_mapping.get(i, "<blank>") for i in range(len(identifier_map) + 1)], f)
    print(f"Global identifier map saved to {ids_mapping_path}")

    # 2. Process each dataset directory as a separate chunk
    for dataset_dir in config.dataset_dirs:
        if os.path.exists(dataset_dir):
            process_and_save_chunk(dataset_dir, config, identifier_map)
        else:
            print(f"Warning: Directory not found, skipping: {dataset_dir}")

    print("\nChunk generation complete.")
    print(f"Next step: run stitch_datasets.py to combine chunks.")


if __name__ == "__main__":
    cli()
