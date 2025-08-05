#!/usr/bin/env python3
"""
Setup script for Hierarchical Reasoning Model (HRM)
This script helps set up the environment and dependencies for HRM
"""

import os
import sys
import subprocess
import platform

def run_command(cmd, check=True):
    """Run a command and return the result"""
    print(f"Running: {cmd}")
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if check and result.returncode != 0:
        print(f"Error running command: {cmd}")
        print(f"Error output: {result.stderr}")
        return False
    return True

def check_python_version():
    """Check if Python version is compatible"""
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print("Error: Python 3.8 or higher is required")
        return False
    print(f"Python version: {version.major}.{version.minor}.{version.micro} ✓")
    return True

def check_cuda():
    """Check CUDA availability"""
    try:
        import torch
        if torch.cuda.is_available():
            print(f"CUDA available: {torch.cuda.get_device_name(0)} ✓")
            return True
        else:
            print("CUDA not available - CPU mode will be used")
            return False
    except ImportError:
        print("PyTorch not installed yet")
        return False

def install_requirements():
    """Install Python requirements"""
    print("Installing Python requirements...")
    if not run_command("pip install -r requirements.txt"):
        return False
    
    # Try to install FlashAttention
    print("Attempting to install FlashAttention...")
    # First try FlashAttention 2 (more compatible)
    if not run_command("pip install flash-attn", check=False):
        print("FlashAttention installation failed - will use fallback attention")
    
    return True

def setup_wandb():
    """Setup Weights & Biases"""
    print("\nSetting up Weights & Biases...")
    print("Please run 'wandb login' manually to authenticate with W&B")
    print("You can get your API key from: https://wandb.ai/authorize")

def create_data_directories():
    """Create necessary data directories"""
    directories = [
        "data",
        "checkpoints",
        "dataset/raw-data"
    ]
    
    for dir_path in directories:
        os.makedirs(dir_path, exist_ok=True)
        print(f"Created directory: {dir_path}")

def download_sample_data():
    """Download sample datasets"""
    print("\nTo download datasets, you can run:")
    print("1. For Sudoku: python dataset/build_sudoku_dataset.py --subsample-size 100 --num-aug 10")
    print("2. For ARC: python dataset/build_arc_dataset.py")
    print("3. For Maze: python dataset/build_maze_dataset.py")

def main():
    """Main setup function"""
    print("=" * 60)
    print("Hierarchical Reasoning Model (HRM) Setup")
    print("=" * 60)
    
    # Check Python version
    if not check_python_version():
        return False
    
    # Create directories
    create_data_directories()
    
    # Install requirements
    if not install_requirements():
        print("Failed to install requirements")
        return False
    
    # Check CUDA
    check_cuda()
    
    # Setup W&B
    setup_wandb()
    
    # Show next steps
    print("\n" + "=" * 60)
    print("Setup completed! Next steps:")
    print("=" * 60)
    print("1. Run 'wandb login' to authenticate with Weights & Biases")
    print("2. Download a dataset using one of the build scripts")
    print("3. Start training with: python pretrain.py")
    print("\nFor a quick demo with Sudoku:")
    print("python dataset/build_sudoku_dataset.py --output-dir data/sudoku-demo --subsample-size 100 --num-aug 100")
    print("python pretrain.py data_path=data/sudoku-demo epochs=1000 eval_interval=200")
    
    download_sample_data()
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)