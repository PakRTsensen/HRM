#!/bin/bash

# HRM Demo Runner Script
echo "Starting HRM Demo..."

# Check if data directory exists
if [ ! -d "data" ]; then
    echo "Creating data directory..."
    mkdir -p data
fi

# Check if we have a demo dataset
if [ ! -d "data/sudoku-demo" ]; then
    echo "Creating demo Sudoku dataset..."
    python3 dataset/build_sudoku_dataset.py \
        --output-dir data/sudoku-demo \
        --subsample-size 50 \
        --num-aug 50
    
    if [ $? -ne 0 ]; then
        echo "Failed to create dataset"
        exit 1
    fi
fi

# Run training
echo "Starting training..."
python3 pretrain.py \
    data_path=data/sudoku-demo \
    epochs=1000 \
    eval_interval=200 \
    global_batch_size=16 \
    lr=1e-4 \
    puzzle_emb_lr=1e-4 \
    weight_decay=1.0 \
    puzzle_emb_weight_decay=1.0

echo "Demo completed!"