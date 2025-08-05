#!/bin/bash

# HRM Dependencies Installation Script
echo "Installing HRM Dependencies..."

# Check if Python 3.8+ is available
python_version=$(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:2])))')
echo "Python version: $python_version"

# Install basic requirements
echo "Installing Python packages..."
pip3 install -r requirements.txt

# Try to install FlashAttention (optional but recommended)
echo "Attempting to install FlashAttention..."
pip3 install flash-attn || echo "FlashAttention installation failed - continuing without it"

# Create necessary directories
echo "Creating directories..."
mkdir -p data
mkdir -p checkpoints
mkdir -p dataset/raw-data

echo "Installation completed!"
echo ""
echo "Next steps:"
echo "1. Run 'wandb login' to authenticate with Weights & Biases"
echo "2. Run 'python3 setup.py' for full setup"
echo "3. Or run 'python3 quick_demo.py' for a quick demonstration"