# Panduan Setup HRM

Panduan ini berisi langkah-langkah untuk menyiapkan dan menjalankan proyek Model Penalaran Hirarkis (HRM).

## Mulai Cepat

### 1. Instalasi Otomatis
```bash
# Jalankan skrip setup
python3 setup.py

# Atau dengan skrip bash
chmod +x install_dependencies.sh
./install_dependencies.sh
```

### 2. Demo Cepat (Sudoku Solver)
```bash
# Jalankan demo kecil
python3 quick_demo.py

# Demo yang disesuaikan
python3 quick_demo.py --dataset-size 100 --epochs 5000
```



## Instalasi Manual

#### Persyaratan
- Python 3.8+
- CUDA (opsional tetapi disarankan)
- 8GB+ RAM
- GPU (disarankan)

### Langkah 1: Menginstal Paket Python
```bash
pip install -r requirements.txt
```

### Langkah 2: Instal FlashAttention (Opsional)
```bash
# FlashAttention 2 (untuk sebagian besar GPU)
pip install flash-attn

# FlashAttention 3 untuk GPU Hopper
git clone https://github.com/Dao-AILab/flash-attention.git
cd flash-attention/hopper
python setup.py install
```

### Langkah 3: Pengaturan Weights & Biases
```bash
wandb login
```

### Langkah 4: Menyiapkan Kumpulan Data

#### Sudoku (Tes Cepat)
```bash
python dataset/build_sudoku_dataset.py --output-dir data/sudoku-demo --subsample-size 100 --num-aug 100
```

#### ARC-AGI
```bash
# Inisialisasi submodul
git submodule update --init --recursive

# Membuat kumpulan data ARC
python dataset/build_arc_dataset.py
```

#### Maze
```bash
python dataset/build_maze_dataset.py
```

## Pelatihan

### Tutorial Sudoku Cepat
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

### Pelatihan ARC
```bash
python pretrain.py \
    data_path=data/arc-aug-1000 \
    epochs=100000 \
    eval_interval=10000
```

### Tutorial Beberapa GPU
```bash
OMP_NUM_THREADS=8 torchrun --nproc-per-node 8 pretrain.py data_path=data/arc-aug-1000
```

## Evaluasi

### Evaluasi Model
```bash
python evaluate.py checkpoint=checkpoints/path/to/model
```

### Hasil ARC
```bash
# Memeriksa hasil dengan Jupyter notebook
jupyter notebook arc_eval.ipynb
```

## Visualisasi Kumpulan Data

Untuk memvisualisasikan kumpulan data:
1. Buka file `puzzle_visualiser.html` di browser
2. Muat folder kumpulan data (mis. `data/sudoku-demo`)

## Pemecahan masalah

## Masalah CUDA
```bash
# Periksa versi CUDA
nvidia-smi

# PyTorch memeriksa dukungan CUDA
python -c "import torch; print(torch.cuda.is_available())"
```

### Masalah Memori
- Kurangi nilai `global_batch_size`
- Gunakan model yang lebih kecil
- Jalankan dalam mode CPU

### Masalah FlashAttention
```bash
# Nonaktifkan FlashAttention
export DISABLE_FLASH_ATTN=1
python pretrain.py ...
```

## Model yang Sudah dilatih

Anda dapat mengunduh model yang sudah terlatih dari Hugging Face:
- [ARC-AGI-2](https://huggingface.co/sapientinc/HRM-checkpoint-ARC-2)
- [Sudoku Extreme](https://huggingface.co/sapientinc/HRM-checkpoint-sudoku-extreme)
- [Maze 30x30](https://huggingface.co/sapientinc/HRM-checkpoint-maze-30x30-hard)

## Tips Performa

1. **Penggunaan GPU**: Gunakan GPU yang didukung CUDA
2. **Ukuran Batch**: Atur sesuai dengan memori GPU Anda
3. **Perhatian Flash**: Pastikan untuk menginstal untuk kecepatan
4. **Banyak GPU**: Gunakan torchrun untuk model besar
5. **Penambahan Data**: Tingkatkan untuk kumpulan data kecil

## Dukungan

Untuk masalah Anda:
1. Periksa README ini
2. Lihat Masalah GitHub
3. Periksa log Weights & Biases
