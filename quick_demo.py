#!/usr/bin/env python3
"""
Quick demo script for HRM - Sudoku solver
This creates a small dataset and trains a model quickly for demonstration
"""

import os
import sys
import subprocess
import argparse

def run_command(cmd, check=True):
    """Run a command and return the result"""
    print(f"Running: {cmd}")
    result = subprocess.run(cmd, shell=True)
    if check and result.returncode != 0:
        print(f"Error running command: {cmd}")
        return False
    return True

def main():
    parser = argparse.ArgumentParser(description="Quick HRM Demo")
    parser.add_argument("--dataset-size", type=int, default=50, help="Number of puzzles to use")
    parser.add_argument("--augmentations", type=int, default=50, help="Number of augmentations per puzzle")
    parser.add_argument("--epochs", type=int, default=2000, help="Number of training epochs")
    parser.add_argument("--eval-interval", type=int, default=500, help="Evaluation interval")
    
    args = parser.parse_args()
    
    print("=" * 60)
    print("HRM Quick Demo - Sudoku Solver")
    print("=" * 60)
    
    # Create demo dataset
    print("Step 1: Creating demo dataset...")
    dataset_cmd = f"""python dataset/build_sudoku_dataset.py \
        --output-dir data/sudoku-demo \
        --subsample-size {args.dataset_size} \
        --num-aug {args.augmentations}"""
    
    if not run_command(dataset_cmd):
        print("Failed to create dataset")
        return False
    
    # Start training
    print("Step 2: Starting training...")
    train_cmd = f"""python pretrain.py \
        data_path=data/sudoku-demo \
        epochs={args.epochs} \
        eval_interval={args.eval_interval} \
        global_batch_size=32 \
        lr=1e-4 \
        puzzle_emb_lr=1e-4 \
        weight_decay=1.0 \
        puzzle_emb_weight_decay=1.0"""
    
    if not run_command(train_cmd):
        print("Training failed")
        return False
    
    print("Demo completed!")
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)