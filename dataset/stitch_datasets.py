import os
import json
import numpy as np
from glob import glob
from tqdm import tqdm
from collections import defaultdict
import re

from argdantic import ArgParser
from pydantic import BaseModel

from common import PuzzleDatasetMetadata

cli = ArgParser()

class StitchConfig(BaseModel):
    source_dir: str = "data/arc-aug-chunks"
    output_dir: str = "data/arc-aug-final"

def stitch_group(output_path: str, chunk_files: List[str]):
    """Stitches numpy chunks together using memory-mapping."""
    print(f"Stitching {len(chunk_files)} chunks into {output_path}...")
    
    # First pass: determine final shape without loading data
    total_rows = 0
    dtype = None
    final_shape_rest = None

    for f in chunk_files:
        with np.load(f, mmap_mode='r') as chunk:
            if dtype is None:
                dtype = chunk.dtype
            if final_shape_rest is None:
                final_shape_rest = chunk.shape[1:]
            total_rows += chunk.shape[0]
    
    final_shape = (total_rows,) + final_shape_rest
    
    # Create the final memory-mapped file
    if os.path.exists(output_path):
        os.remove(output_path)
    stitched_array = np.memmap(output_path, dtype=dtype, mode='w+', shape=final_shape)
    
    # Second pass: copy data
    current_row = 0
    with tqdm(total=total_rows, desc=f"Copying to {os.path.basename(output_path)}", unit="row") as pbar:
        for f in chunk_files:
            with np.load(f, mmap_mode='r') as chunk:
                rows_in_chunk = chunk.shape[0]
                stitched_array[current_row : current_row + rows_in_chunk] = chunk
                current_row += rows_in_chunk
                pbar.update(rows_in_chunk)

    stitched_array.flush()
    print(f"Stitching for {os.path.basename(output_path)} complete.")


def stitch_indices(output_path: str, chunk_files: List[str]):
    """Stitches index-based numpy chunks with offset correction."""
    print(f"Stitching indices for {output_path}...")
    
    all_indices = []
    offset = 0
    dtype = np.int32

    for f in sorted(chunk_files): # Sort to ensure order
        with np.load(f) as chunk:
            # First element is always 0, skip it for all but the first chunk
            data_to_add = chunk[1:] if all_indices else chunk
            all_indices.append(data_to_add + offset)
            offset += chunk[-1]

    final_array = np.concatenate(all_indices).astype(dtype)
    np.save(output_path, final_array)
    print(f"Index stitching for {os.path.basename(output_path)} complete.")
    return final_array

def get_chunk_name(filename: str) -> str:
    match = re.search(r'_chunk_([a-z0-9\-]+)\.npy$', filename)
    return match.group(1) if match else ''

@cli.command(singleton=True)
def main(config: StitchConfig):
    os.makedirs(config.output_dir, exist_ok=True)

    for split_name in ["train", "test"]:
        split_source_dir = os.path.join(config.source_dir, split_name)
        if not os.path.isdir(split_source_dir):
            print(f"Source directory for split '{split_name}' not found, skipping.")
            continue

        # Group chunk files by their base name (inputs, labels, etc.)
        file_groups = defaultdict(list)
        for f in glob(os.path.join(split_source_dir, "*.npy")):
            base_name = os.path.basename(f).split('__')[1].split('_chunk_')[0]
            file_groups[base_name].append(f)

        # Stitch each group
        for base_name, files in file_groups.items():
            output_filename = f"{split_name}__{base_name}.npy"
            output_path = os.path.join(config.output_dir, output_filename)
            
            if 'indices' in base_name:
                stitch_indices(output_path, sorted(files))
            else:
                stitch_group(output_path, sorted(files))

        # Combine metadata
        total_groups = 0
        total_examples = 0
        total_puzzles_in_metadata = 0 # Cannot be summed directly
        all_sets = set()

        metadata_files = glob(os.path.join(split_source_dir, "metadata_chunk_*.json"))
        for f in metadata_files:
            with open(f, 'r') as meta_f:
                meta = json.load(meta_f)
                total_groups += meta['total_groups']
                # This is a rough estimation, as mean is not additive
                total_examples += meta['mean_puzzle_examples'] * meta['total_groups'] 
                all_sets.update(meta['sets'])
        
        # Load final puzzle identifiers to get puzzle count
        puzzles_ident_path = os.path.join(config.output_dir, f"{split_name}__puzzle_identifiers.npy")
        if os.path.exists(puzzles_ident_path):
            total_puzzles_in_metadata = len(np.load(puzzles_ident_path))

        # Load global identifier map for vocab size
        global_ids_path = os.path.join(config.source_dir, "identifiers.json")
        num_puzzle_identifiers = 0
        if os.path.exists(global_ids_path):
            with open(global_ids_path, 'r') as f:
                num_puzzle_identifiers = len(json.load(f))

        final_metadata = PuzzleDatasetMetadata(
            seq_len=ARCMaxGridSize * ARCMaxGridSize, vocab_size=12, pad_id=0, ignore_label_id=0,
            blank_identifier_id=0, num_puzzle_identifiers=num_puzzle_identifiers,
            total_groups=total_groups,
            mean_puzzle_examples=total_examples / total_groups if total_groups > 0 else 0,
            sets=sorted(list(all_sets))
        )
        
        final_metadata_path = os.path.join(config.output_dir, f"{split_name}_dataset.json")
        with open(final_metadata_path, "w") as f:
            json.dump(final_metadata.model_dump(), f, indent=2)
        print(f"Final metadata for '{split_name}' split saved to {final_metadata_path}")

    # Copy the global identifiers file to the final output directory
    global_ids_source_path = os.path.join(config.source_dir, "identifiers.json")
    global_ids_dest_path = os.path.join(config.output_dir, "identifiers.json")
    if os.path.exists(global_ids_source_path):
        import shutil
        shutil.copy(global_ids_source_path, global_ids_dest_path)
        print(f"Copied identifiers.json to {config.output_dir}")

    print("\nStitching process complete.")

if __name__ == "__main__":
    cli()
