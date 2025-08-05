# HRM Setup Guide

Bu rehber Hierarchical Reasoning Model (HRM) projesini kurmanız ve çalıştırmanız için gerekli adımları içerir.

## Hızlı Başlangıç

### 1. Otomatik Kurulum
```bash
# Kurulum scriptini çalıştır
python3 setup.py

# Veya bash script ile
chmod +x install_dependencies.sh
./install_dependencies.sh
```

### 2. Hızlı Demo (Sudoku Çözücü)
```bash
# Küçük bir demo çalıştır
python3 quick_demo.py

# Özelleştirilmiş demo
python3 quick_demo.py --dataset-size 100 --epochs 5000
```

## Manuel Kurulum

### Gereksinimler
- Python 3.8+
- CUDA (opsiyonel ama önerilen)
- 8GB+ RAM
- GPU (önerilen)

### Adım 1: Python Paketlerini Yükle
```bash
pip install -r requirements.txt
```

### Adım 2: FlashAttention Yükle (Opsiyonel)
```bash
# FlashAttention 2 (çoğu GPU için)
pip install flash-attn

# Veya Hopper GPU'lar için FlashAttention 3
git clone https://github.com/Dao-AILab/flash-attention.git
cd flash-attention/hopper
python setup.py install
```

### Adım 3: Weights & Biases Kurulumu
```bash
wandb login
```

### Adım 4: Veri Setlerini Hazırla

#### Sudoku (Hızlı Test)
```bash
python dataset/build_sudoku_dataset.py --output-dir data/sudoku-demo --subsample-size 100 --num-aug 100
```

#### ARC-AGI
```bash
# Submodule'ları başlat
git submodule update --init --recursive

# ARC veri setini oluştur
python dataset/build_arc_dataset.py
```

#### Maze
```bash
python dataset/build_maze_dataset.py
```

## Eğitim

### Hızlı Sudoku Eğitimi
```bash
python pretrain.py \
    data_path=data/sudoku-demo \
    epochs=2000 \
    eval_interval=500 \
    global_batch_size=32 \
    lr=1e-4 \
    puzzle_emb_lr=1e-4 \
    weight_decay=1.0 \
    puzzle_emb_weight_decay=1.0
```

### ARC Eğitimi
```bash
python pretrain.py \
    data_path=data/arc-aug-1000 \
    epochs=100000 \
    eval_interval=10000
```

### Çoklu GPU Eğitimi
```bash
OMP_NUM_THREADS=8 torchrun --nproc-per-node 8 pretrain.py data_path=data/arc-aug-1000
```

## Değerlendirme

### Model Değerlendirme
```bash
python evaluate.py checkpoint=checkpoints/path/to/model
```

### ARC Sonuçları
```bash
# Jupyter notebook ile sonuçları incele
jupyter notebook arc_eval.ipynb
```

## Veri Seti Görselleştirme

Veri setlerini görselleştirmek için:
1. `puzzle_visualizer.html` dosyasını tarayıcıda aç
2. Veri seti klasörünü yükle (örn: `data/sudoku-demo`)

## Sorun Giderme

### CUDA Sorunları
```bash
# CUDA versiyonunu kontrol et
nvidia-smi

# PyTorch CUDA desteğini kontrol et
python -c "import torch; print(torch.cuda.is_available())"
```

### Bellek Sorunları
- `global_batch_size` değerini azalt
- Daha küçük model kullan
- CPU modunda çalıştır

### FlashAttention Sorunları
```bash
# FlashAttention'ı devre dışı bırak
export DISABLE_FLASH_ATTN=1
python pretrain.py ...
```

## Önceden Eğitilmiş Modeller

Hugging Face'den önceden eğitilmiş modelleri indirebilirsiniz:
- [ARC-AGI-2](https://huggingface.co/sapientinc/HRM-checkpoint-ARC-2)
- [Sudoku Extreme](https://huggingface.co/sapientinc/HRM-checkpoint-sudoku-extreme)
- [Maze 30x30](https://huggingface.co/sapientinc/HRM-checkpoint-maze-30x30-hard)

## Performans İpuçları

1. **GPU Kullanımı**: CUDA destekli GPU kullanın
2. **Batch Size**: GPU belleğinize göre ayarlayın
3. **FlashAttention**: Hız için mutlaka yükleyin
4. **Çoklu GPU**: Büyük modeller için torchrun kullanın
5. **Veri Augmentasyonu**: Küçük veri setleri için artırın

## Destek

Sorunlarınız için:
1. Bu README'yi kontrol edin
2. GitHub Issues'a bakın
3. Weights & Biases loglarını kontrol edin