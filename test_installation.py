#!/usr/bin/env python3
"""
Test script to verify HRM installation
"""

import sys
import importlib
import torch

def test_import(module_name, description=""):
    """Test if a module can be imported"""
    try:
        importlib.import_module(module_name)
        print(f"✓ {module_name} {description}")
        return True
    except ImportError as e:
        print(f"✗ {module_name} {description} - Error: {e}")
        return False

def test_torch_cuda():
    """Test PyTorch CUDA availability"""
    if torch.cuda.is_available():
        device_count = torch.cuda.device_count()
        device_name = torch.cuda.get_device_name(0)
        print(f"✓ CUDA available - {device_count} device(s), {device_name}")
        return True
    else:
        print("✗ CUDA not available - will use CPU")
        return False

def test_flash_attention():
    """Test FlashAttention availability"""
    try:
        from flash_attn import flash_attn_func
        print("✓ FlashAttention available")
        return True
    except ImportError:
        try:
            from flash_attn_interface import flash_attn_func
            print("✓ FlashAttention 3 available")
            return True
        except ImportError:
            print("✗ FlashAttention not available - will use standard attention")
            return False

def main():
    print("=" * 60)
    print("HRM Installation Test")
    print("=" * 60)
    
    # Test Python version
    version = sys.version_info
    if version.major >= 3 and version.minor >= 8:
        print(f"✓ Python {version.major}.{version.minor}.{version.micro}")
    else:
        print(f"✗ Python {version.major}.{version.minor}.{version.micro} - Need 3.8+")
        return False
    
    # Test core dependencies
    success = True
    success &= test_import("torch", "- PyTorch")
    success &= test_import("numpy", "- NumPy")
    success &= test_import("tqdm", "- Progress bars")
    success &= test_import("wandb", "- Weights & Biases")
    success &= test_import("omegaconf", "- Configuration")
    success &= test_import("hydra", "- Hydra")
    success &= test_import("pydantic", "- Data validation")
    success &= test_import("einops", "- Tensor operations")
    success &= test_import("adam_atan2", "- AdamATan2 optimizer")
    success &= test_import("coolname", "- Name generation")
    success &= test_import("huggingface_hub", "- HuggingFace Hub")
    
    # Test CUDA
    test_torch_cuda()
    
    # Test FlashAttention
    test_flash_attention()
    
    # Test project modules
    success &= test_import("models.hrm.hrm_act_v1", "- HRM model")
    success &= test_import("models.losses", "- Loss functions")
    success &= test_import("puzzle_dataset", "- Dataset loader")
    
    print("\n" + "=" * 60)
    if success:
        print("✓ All core dependencies are available!")
        print("You can now run the training scripts.")
    else:
        print("✗ Some dependencies are missing.")
        print("Please run 'python setup.py' to install missing dependencies.")
    
    print("\nNext steps:")
    print("1. Run 'wandb login' if you haven't already")
    print("2. Try the quick demo: 'python quick_demo.py'")
    print("3. Or create a dataset and start training")
    
    return success

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)