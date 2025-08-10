*Hierarchical Reasoning Model (HRM) Documentation*
Dokumen ini berisi penjelasan dokumentasi mendalam, penjelasan baris demi baris, dan konteks penelitian dari setiap file dalam proyek *Hierarchical Reasoning Model (HRM)*. Tujuannya adalah untuk memahami arsitektur, alur data, dan logika di balik implementasi model AI ini, dengan menghubungkan kode secara langsung ke konsep dan hasil yang dipublikasikan dalam paper penelitiannya.

---

 Bab 1: Gambaran Umum Proyek (Berdasarkan Paper & README)

# 1.1. Masalah & Solusi

- **Masalah yang Dipecahkan**: Model bahasa besar (LLM) standar, meskipun sukses, memiliki "kedalaman komputasi" yang dangkal. Arsitektur Transformer yang *fixed-depth* membatasi kemampuan mereka untuk melakukan penalaran algoritmik kompleks yang memerlukan banyak langkah sekuensial (misalnya, *tree-search*, *backtracking*). Metode *Chain-of-Thought* (CoT) adalah sebuah "penopang", bukan solusi fundamental, karena ia rapuh, butuh banyak data, dan lambat.
- **Solusi yang Ditawarkan (HRM)**: HRM adalah arsitektur rekuren baru yang terinspirasi dari dua prinsip di otak manusia: **pemrosesan hierarkis** dan **pemisahan skala waktu**. Tujuannya adalah untuk mencapai kedalaman komputasi yang masif sambil menjaga stabilitas dan efisiensi pelatihan.

# 1.2. Arsitektur & Konsep Inti

- **Modul Hierarkis**: Model ini memiliki dua modul rekuren yang saling terkait:
    1.  **Modul Tingkat Tinggi (H)**: Beroperasi pada skala waktu "lambat", bertanggung jawab untuk perencanaan abstrak dan strategis.
    2.  **Modul Tingkat Rendah (L)**: Beroperasi pada skala waktu "cepat", menangani komputasi detail dan eksekusi taktis.
- **Hierarchical Convergence**: Tidak seperti RNN standar yang konvergen terlalu cepat ke satu titik, modul L di HRM berulang kali konvergen ke *ekuilibrium lokal* yang ditentukan oleh state H. Setelah itu, modul H diperbarui, memberikan konteks baru dan "mereset" modul L untuk memulai fase komputasi baru. Proses ini memungkinkan penalaran multi-langkah yang dalam dan terstruktur.
- **Approximate Gradient (1-Step Gradien)**: Untuk menghindari *Backpropagation Through Time* (BPTT) yang mahal secara komputasi dan memori (`O(T)`), HRM menggunakan trik gradien cerdas yang terinspirasi oleh *Deep Equilibrium Models* (DEQ). Gradien hanya dihitung untuk **satu langkah komputasi terakhir**, memperlakukan state sebelumnya sebagai konstan. Ini mengurangi kebutuhan memori menjadi `O(1)` dan secara drastis meningkatkan efisiensi pelatihan.
- **Adaptive Computation Time (ACT)**: Model ini secara dinamis belajar berapa banyak langkah komputasi yang diperlukan untuk setiap masalah. Ini dicapai dengan melatih "Q-head" menggunakan Q-learning untuk memutuskan apakah akan **berhenti** atau **melanjutkan** komputasi di setiap langkah.

# 1.3. Performa Utama

- **Efisiensi Data & Ukuran**: Dengan hanya **~27 juta parameter** dan dilatih pada **~1000 sampel** per tugas, HRM menunjukkan performa yang luar biasa.
- **Hasil Benchmark**:
    -   **ARC-AGI-2**: Mencapai akurasi **40.3%**, secara signifikan mengungguli model CoT yang jauh lebih besar seperti o3-mini-high (34.5%) dan Claude 3.7 (21.2%).
    -   **Sudoku-Extreme & Maze-Hard**: Mencapai akurasi **mendekati sempurna** pada tugas-tugas yang memerlukan penalaran simbolis dan pencarian mendalam, di mana metode CoT dan model Transformer standar gagal total (akurasi ~0%).

---

  Bab 2: Analisis Dependensi (`requirements.txt`)

File ini mendaftarkan semua pustaka Python pihak ketiga yang dibutuhkan oleh proyek. Memahami peran setiap pustaka akan memberi kita gambaran tentang tumpukan teknologi (tech stack) yang digunakan.

# 2.1. Pustaka Inti Machine Learning

-   `torch`: Ini adalah fondasi dari keseluruhan proyek. PyTorch adalah kerangka kerja (framework) deep learning utama yang digunakan untuk membangun, melatih, dan mengevaluasi model HRM.
-   `adam-atan2`: Ini adalah varian dari optimizer Adam yang populer. Penggunaan optimizer spesifik ini (bukan Adam standar yang ada di PyTorch) menunjukkan bahwa penulis mungkin mencari stabilitas atau konvergensi yang lebih baik untuk arsitektur model mereka yang unik. Ini adalah detail halus yang menandakan perhatian pada proses optimisasi.
-   `einops`: Pustaka untuk operasi tensor (data multi-dimensi) yang kompleks. `einops` memungkinkan manipulasi tensor seperti perubahan bentuk dan dimensi dengan cara yang lebih mudah dibaca dan andal dibandingkan dengan fungsi bawaan PyTorch. Kehadirannya menandakan bahwa model ini kemungkinan besar melakukan banyak operasi tensor yang canggih.

# 2.2. Pustaka Konfigurasi & Eksperimen

-   `hydra-core` & `omegaconf`: Ini adalah sistem manajemen konfigurasi yang sangat kuat dan modern. `hydra` memungkinkan peneliti untuk mendefinisikan konfigurasi dalam file (seperti file `.yaml`) dan kemudian dengan mudah menimpanya (override) melalui baris perintah. Contoh perintah `python pretrain.py data_path=... arch.loss.loss_type=...` di `README.md` adalah sintaks khas `hydra`. Ini menunjukkan bahwa proyek ini dirancang untuk fleksibilitas eksperimen yang tinggi.
-   `pydantic` & `argdantic`: `pydantic` menggunakan type hints Python untuk validasi data. `argdantic` secara cerdas menggabungkannya dengan `argparse` untuk membuat antarmuka baris perintah (CLI) langsung dari model data `pydantic`. Kombinasi ini memastikan bahwa semua konfigurasi dan argumen yang diberikan ke program tidak hanya benar secara format tetapi juga tervalidasi.
-   `wandb`: Klien untuk *Weights & Biases*. Ini menegaskan apa yang disebutkan di `README.md`, yaitu semua eksperimen (metrik seperti *loss* dan *accuracy*) dilacak dan divisualisasikan menggunakan platform ini.
-   `huggingface_hub`: Pustaka untuk berinteraksi dengan Hugging Face Hub. Ini digunakan untuk mengunduh model-model yang sudah dilatih (checkpoints) yang disebutkan di `README.md`.

# 2.3. Pustaka Utilitas

-   `tqdm`: Pustaka standar untuk membuat bilah kemajuan (progress bars). Ini sangat berguna untuk memantau kemajuan proses yang berjalan lama seperti epoch pelatihan atau pemrosesan dataset.
-   `coolname`: Pustaka sederhana untuk menghasilkan nama acak yang "keren" (misalnya, `useful-whale-25`). Ini kemungkinan besar digunakan untuk memberi nama unik pada setiap proses eksperimen (`experiment run`) secara otomatis, membuatnya lebih mudah diidentifikasi di `wandb`.

# 2.4. Kesimpulan dari Dependensi

Tumpukan teknologi ini modern, kuat, dan sangat umum digunakan dalam lingkungan riset AI yang serius. Penggunaan `hydra` untuk konfigurasi, `wandb` untuk pelacakan, dan `einops` untuk kode tensor yang bersih menunjukkan bahwa proyek ini dibangun dengan praktik terbaik (best practices) dalam rekayasa machine learning.

---

 Bab 3: Analisis Konfigurasi (Direktori `config/`)

Direktori `config/` adalah otak dari semua eksperimen. Dengan menggunakan `hydra`, file-file YAML di sini memungkinkan kita untuk mendefinisikan dan mengubah setiap aspek dari model dan proses pelatihan tanpa harus mengubah kode Python.

# 3.1. `cfg_pretrain.yaml`: Konfigurasi Pelatihan Utama

File ini adalah titik masuk konfigurasi untuk skrip `pretrain.py`.

-   *`defaults`*: Bagian ini adalah inti dari `hydra`.
    -   `- arch: hrm_v1`: Baris ini menginstruksikan `hydra` untuk mencari file bernama `hrm_v1.yaml` di dalam sub-direktori `arch/` dan memuat semua pengaturannya ke dalam sebuah grup bernama `arch`. Ini adalah cara `hydra` menyusun konfigurasi dari beberapa file.
    -   `- _self_`: Memastikan bahwa pengaturan di dalam file ini juga dimuat.
-   *`data_path`*: Menentukan lokasi default dari dataset yang akan digunakan, yaitu `data/arc-aug-1000`. Nilai ini dapat dengan mudah diganti melalui baris perintah.
-   *Hyperparameter Pelatihan*:
    -   `global_batch_size`, `epochs`, `eval_interval`: Mengontrol parameter dasar dari loop pelatihan.
    -   `lr`, `lr_min_ratio`, `lr_warmup_steps`: Mendefinisikan jadwal laju pembelajaran (learning rate schedule), termasuk periode "pemanasan" (warmup) yang merupakan praktik standar untuk stabilitas pelatihan.
    -   `beta1`, `beta2`, `weight_decay`: Parameter standar untuk optimizer AdamW. Komentar di file menyebutkan bahwa nilai-nilai ini diambil dari praktik terbaik untuk melatih model bahasa besar seperti Llama.
-   *Wawasan Kunci: Perlakuan Khusus untuk *Puzzle Embeddings**
    -   Terdapat dua parameter terpisah: `puzzle_emb_weight_decay` dan `puzzle_emb_lr`.
    -   `puzzle_emb_lr` diatur ke `1e-2`, yang *100 kali lebih tinggi* dari `lr` utama (`1e-4`).
    -   Ini adalah petunjuk arsitektur yang sangat penting. Ini menyiratkan bahwa setiap "puzzle" atau soal memiliki representasi (embedding) yang bisa dipelajari. Model ini belajar representasi spesifik untuk setiap soal dengan sangat cepat (LR tinggi), sementara model penalaran utamanya belajar pola umum dengan lebih lambat dan hati-hati (LR rendah).

# 3.2. `arch/hrm_v1.yaml`: Konfigurasi Arsitektur Model

File ini mendefinisikan "cetak biru" dari `HierarchicalReasoningModel_ACTV1`.

-   *`name: hrm.hrm_act_v1@HierarchicalReasoningModel_ACTV1`*: Ini adalah sintaks `hydra` untuk instansiasi objek. Ini memberitahu `hydra` untuk:
    1.  Melihat file `models/hrm/hrm_act_v1.py`.
    2.  Menemukan kelas `HierarchicalReasoningModel_ACTV1`.
    3.  Membuat sebuah instance dari kelas tersebut, dengan semua parameter di file YAML ini sebagai argumen untuk `__init__`.
-   *Konfirmasi Arsitektur Hierarkis*:
    -   `H_cycles: 2` dan `H_layers: 4`: Menentukan bahwa modul *H*igh-level memiliki 4 lapisan dan berulang sebanyak 2 siklus.
    -   `L_cycles: 2` dan `L_layers: 4`: Menentukan bahwa modul *L*ow-level memiliki 4 lapisan dan berulang sebanyak 2 siklus.
    -   Ini secara langsung memetakan ke arsitektur dual-modul yang dijelaskan di `README.md`.
-   *Konfirmasi *Adaptive Computation Time (ACT)**:
    -   Nama model yang diakhiri dengan `_ACTV1` adalah petunjuk pertama.
    -   `loss: name: losses@ACTLossHead`: Menggunakan kepala kerugian (loss head) khusus untuk ACT.
    -   `halt_max_steps: 16`: Jumlah langkah komputasi rekuren maksimum yang diizinkan.
    -   `halt_exploration_prob: 0.1`: Probabilitas untuk "memaksa" model melakukan langkah tambahan selama pelatihan untuk mendorong eksplorasi.
    -   Ini menegaskan bahwa model secara dinamis belajar berapa banyak langkah komputasi yang diperlukan untuk setiap input, sebuah teknik canggih untuk model rekuren.
-   *Detail Implementasi Modern*:
    -   `hidden_size`, `num_heads`, `expansion`: Parameter standar yang mendefinisikan dimensi internal model, mirip dengan arsitektur Transformer.
    -   `pos_encodings: rope`: Menggunakan *Rotary Position Embeddings (RoPE)*. Ini adalah teknik penyandian posisi yang canggih dan efektif, yang menunjukkan bahwa arsitektur ini mengadopsi praktik-praktik terbaik dari model-model Transformer modern.
    -   `puzzle_emb_ndim: ${.hidden_size}`: Sintaks interpolasi `hydra` untuk memastikan dimensi embedding puzzle cocok dengan dimensi tersembunyi model, sebuah cara bersih untuk menghindari hardcoding.

---

 Bab 4: Analisis Persiapan Dataset

Direktori ini bertanggung jawab untuk mengubah data mentah dari berbagai sumber menjadi format terstruktur yang seragam dan siap untuk dilatih oleh model. Proses ini disebut ETL (Extract, Transform, Load) dalam skala kecil.

# 4.1. `common.py`: Fondasi Umum

File ini menyediakan blok bangunan yang digunakan bersama oleh semua skrip pembuatan dataset.

-   *`PuzzleDatasetMetadata`*: Ini adalah kelas `pydantic` yang berfungsi sebagai "paspor" untuk setiap dataset yang dibuat. Ini mendefinisikan struktur data yang jelas untuk semua informasi penting yang diperlukan untuk menggunakan dataset, seperti `vocab_size`, `seq_len`, dan ID token khusus (`pad_id`, `ignore_label_id`). Ini adalah praktik rekayasa yang sangat baik yang membuat dataset menjadi deskriptif dan mudah digunakan.
-   *`dihedral_transform`*: Fungsi ini mengimplementasikan 8 transformasi simetri dari sebuah persegi (rotasi dan pencerminan). Ini adalah strategi *augmentasi data generik* yang cerdas untuk puzzle berbasis grid (seperti ARC atau labirin). Dengan menerapkan transformasi ini, jumlah data pelatihan dapat diperbanyak secara signifikan (misalnya, 8x lipat) dengan membuat variasi baru dari puzzle yang ada yang secara logis ekuivalen.

# 4.2. Studi Kasus Mendalam: `build_sudoku_dataset.py`

Skrip ini adalah contoh sempurna dari alur kerja persiapan data proyek.

*Alur Kerja:*

1.  *Unduh Data (`hf_hub_download`)*: Data mentah (file `.csv`) tidak disimpan di dalam repositori, melainkan diunduh secara otomatis dari *dataset repository* di Hugging Face Hub. Ini membuat repositori kode tetap ringan dan memastikan semua orang menggunakan sumber data yang sama.
2.  *Parse & Filter*: Skrip membaca file CSV, mem-parsing string kuis (`q`) dan jawaban (`a`) menjadi papan Sudoku 9x9 dalam bentuk array NumPy. Skrip ini juga dapat memfilter puzzle berdasarkan tingkat kesulitannya.
3.  *Subsampling*: Jika `subsample_size` ditentukan (misalnya, 1000 untuk eksperimen cepat), skrip akan secara acak memilih sejumlah puzzle dari set pelatihan.
4.  *Augmentasi Spesifik-Domain (`shuffle_sudoku`)*:
    -   Ini adalah temuan kunci. Alih-alih menggunakan `dihedral_transform` yang generik, skrip ini menggunakan fungsi `shuffle_sudoku` yang dirancang khusus untuk Sudoku.
    -   Fungsi ini melakukan transformasi yang valid secara matematis untuk Sudoku:
        -   *Relabeling*: Mengganti semua angka secara konsisten (misal, semua 1 jadi 5, semua 2 jadi 8, dst.).
        -   *Permutasi*: Menukar baris dan kolom dalam "pita" (3 baris) dan "tumpukan" (3 kolom) yang valid.
        -   *Transposisi*: Mencerminkan papan di sepanjang diagonalnya.
    -   Ini menunjukkan bahwa strategi augmentasi disesuaikan dengan domain masalah untuk menghasilkan data yang lebih beragam dan berkualitas tinggi.
5.  *Strukturisasi & Penyimpanan*:
    -   Semua papan 9x9 diratakan (flatten) menjadi urutan (sequence) dengan panjang 81.
    -   Nilai angka digeser (misal, 0-9 menjadi 1-10) agar angka `0` bisa digunakan sebagai `pad_id`.
    -   Metadata dibuat menggunakan kelas `PuzzleDatasetMetadata` dari `common.py`.
    -   Hasil akhir disimpan ke direktori output:
        -   `dataset.json`: File JSON yang berisi semua metadata.
        -   `*.npy`: Sekumpulan file biner NumPy yang berisi data sebenarnya (`inputs`, `labels`, `puzzle_identifiers`, dll).

# 4.3. Generalisasi ke Skrip Lain (`build_arc_dataset.py`, `build_maze_dataset.py`)

Dengan memahami skrip Sudoku, kita dapat menyimpulkan bahwa skrip-skrip lain mengikuti pola yang sama:
-   Membaca format data mentah mereka masing-masing.
-   Menerapkan strategi augmentasi yang sesuai (kemungkinan besar `dihedral_transform` untuk ARC yang lebih umum).
-   Menyimpan hasilnya dalam format standar yang sama (`.npy` + `dataset.json`).

# 4.4. Konteks Tambahan dari Paper

- **`Sudoku-Extreme`**: Paper ini mengonfirmasi bahwa dataset ini sengaja dibuat sulit. Tingkat kesulitannya diukur dengan jumlah *backtracks* (tebakan) yang dibutuhkan oleh solver algoritmik canggih. Dataset ini memiliki rata-rata **22 backtracks**, jauh lebih tinggi dari dataset Sudoku standar lainnya (misalnya, Sudoku-Bench hanya 0.45). Ini memaksa model untuk belajar strategi pencarian yang sebenarnya, bukan hanya aturan sederhana.
- **`Maze-Hard`**: Dibuat dengan menyaring labirin 30x30 untuk hanya menyisakan yang "sulit", di mana kesulitan didefinisikan sebagai panjang jalur terpendek. Ini memastikan tugas tersebut memerlukan perencanaan jangka panjang.
- **Augmentasi**: Paper ini mengonfirmasi strategi augmentasi yang kita identifikasi:
    - **Sudoku**: Permutasi digit dan baris/kolom dalam blok yang valid.
    - **ARC**: Transformasi dihedral (rotasi/pencerminan) dan permutasi warna.
    - **Maze**: Augmentasi dinonaktifkan.

---

 Bab 5: Analisis Arsitektur Model

# 5.1. `sparse_embedding.py`: Puzzle Embeddings yang Efisien

File ini menyediakan solusi rekayasa yang cerdas untuk menangani *puzzle embeddings* (representasi unik untuk setiap soal).

-   *Masalah*: Memiliki embedding yang dapat dilatih untuk ribuan puzzle akan sangat memakan memori GPU jika menggunakan `nn.Embedding` standar, karena optimizer (seperti Adam) akan menyimpan state untuk setiap embedding.
-   *Solusi*:
    1.  *`CastedSparseEmbedding`*: Lapisan embedding kustom ini memisahkan penyimpanan dan komputasi. Ia memiliki satu tensor `weights` besar (tanpa gradien) untuk menyimpan semua embedding, dan satu tensor `local_weights` kecil (dengan gradien) yang hanya menampung embedding untuk batch saat ini. Ini secara drastis mengurangi jejak memori.
    2.  *`CastedSparseEmbeddingSignSGD_Distributed`*: Optimizer kustom yang dibuat khusus untuk lapisan di atas. Ia menggunakan *SignSGD* (yang efisien untuk gradien sparse) dan dirancang untuk bekerja dalam mode multi-GPU, dengan benar menggabungkan gradien dari seluruh perangkat sebelum memperbarui `weights` utama.

# 5.2. `layers.py`: Kumpulan Blok Transformer Modern

File ini adalah "kotak perkakas" yang berisi semua komponen untuk membangun blok Transformer yang canggih, setara dengan yang ada di LLM terkemuka.

-   *`Attention`*: Modul atensi yang sangat efisien karena menggunakan *FlashAttention*.
-   *`RotaryEmbedding` (RoPE)*: Implementasi penyandian posisi rotari yang modern dan efektif.
-   *`SwiGLU`*: Blok *feed-forward network* (FFN) yang berperforma tinggi.
-   *`rms_norm`*: Fungsi normalisasi (RMSNorm) yang lebih ringan dari LayerNorm.
-   *`Casted...` Layers*: Wrapper kustom untuk lapisan `Linear` dan `Embedding` standar untuk memastikan penanganan *mixed-precision training* yang aman.
-   
# 5.3. `losses.py`: Implementasi *Deep Supervision* dan *Q-Learning*

- **Deep Supervision**: Loop pelatihan utama di `pretrain.py` yang memanggil model berulang kali dan menghitung kerugian setelah setiap pemanggilan adalah implementasi dari *deep supervision*. Setiap pemanggilan ini disebut "segmen". State `carry` dari model di-*detach* sebelum digunakan di segmen berikutnya. Ini memberikan sinyal pembelajaran yang lebih sering ke modul H dan menstabilkan pelatihan, sebuah teknik yang terbukti efektif dalam *deep equilibrium models*.
- **Q-Learning untuk ACT**: `q_halt_loss` dan `q_continue_loss` adalah implementasi langsung dari algoritma Q-learning untuk melatih `q_head`.
    - **State**: `z_H` (state modul High-level).
    - **Actions**: {Halt, Continue}.
    - **Reward**: `1` jika prediksi benar saat *halt*, `0` jika *continue*.
    - **Target Q-value**: Dihitung dengan "mengintip" satu langkah ke depan, persis seperti yang kita lihat di kode `HierarchicalReasoningModel_ACTV1`.

# 5.4. `hrm/hrm_act_v1.py`: Implementasi *Hierarchical Convergence* & *1-Step Gradien*

- **Hierarchical Convergence dalam Kode**:
    - Siklus `for _H_step` dan `for _L_step` di dalam `HierarchicalReasoningModel_ACTV1_Inner` adalah implementasi eksplisit dari konsep ini. State `z_H` tetap konstan selama siklus `L`, memberikan panduan strategis. State `z_L` kemudian digunakan untuk memperbarui `z_H` di akhir siklus.
- **1-Step Gradien dalam Kode**:
    - Blok `with torch.no_grad():` yang membungkus hampir seluruh siklus H-L, diikuti oleh satu langkah komputasi terakhir di luar blok tersebut, adalah implementasi harfiah dari **1-step gradient approximation**. Ini adalah wawasan kunci yang menghubungkan teori di paper dengan kode: gradien hanya mengalir melalui satu langkah terakhir dari komputasi rekuren, membuat pelatihan menjadi efisien.

# 5.5. Diagram Alur Konseptual

Berikut adalah diagram sederhana untuk memvisualisasikan alur keseluruhan:

```
[pretrain.py] -> [ACTLossHead] -> [HierarchicalReasoningModel_ACTV1 (Outer ACT Wrapper)]
                                                     |
                                                     | (Looping with Halting Logic)
                                                     v
                                     [HierarchicalReasoningModel_ACTV1_Inner]
                                      |
                                      | (H-L Cycles with grad-trick)
                                      v
                      +--------------------------------------+
                      | z_H_prev, z_L_prev, input_embeddings |
                      |                                      |
                      |    +----------------------------+    |
                      |    | L_level (Low)              |    |
                      |    | computes using z_H + input |    |
                      |    +----------------------------+    |
                      |                 |                  |
                      |                 v                  |
                      |    +----------------------------+    |
                      |    | H_level (High)             |    |
                      |    | computes using z_L         |    |
                      |    +----------------------------+    |
                      |                 |                  |
                      |                 v                  |
                      |      z_H_new, z_L_new, logits      |
                      +--------------------------------------+
```

---

Bab 6: Analisis Logika Utama (`pretrain.py`)

Jika direktori `models/` adalah "otak" dari proyek, maka `pretrain.py` adalah "sistem saraf pusat" yang membuatnya hidup. Skrip ini adalah sang sutradara yang mengorkestrasi seluruh proses pelatihan, menyatukan konfigurasi, data, dan model.

# 6.1. Inisialisasi dan Konfigurasi

-   *Entry Point*: Eksekusi dimulai dari fungsi `launch` yang didekorasi oleh `@hydra.main`. Ini menyerahkan kontrol konfigurasi sepenuhnya kepada Hydra, yang memuat `config/cfg_pretrain.yaml` dan memungkinkan penimpaan parameter dari baris perintah.
-   *Setup Terdistribusi (Multi-GPU)*: Skrip secara otomatis mendeteksi jika dijalankan melalui `torchrun` (untuk multi-GPU). Jika ya, ia akan:
    1.  Menginisialisasi grup proses terdistribusi (`dist.init_process_group`).
    2.  Menetapkan setiap proses ke GPU lokalnya masing-masing.
    3.  Menyinkronkan objek konfigurasi final dari proses utama (`rank 0`) ke semua proses lainnya untuk memastikan konsistensi absolut.
-   *Reproducibility*: Skrip ini melakukan hal-hal penting untuk reproduktifitas:
    1.  Mengatur *seed* untuk generator angka acak.
    2.  Menyimpan salinan kode sumber model dan file konfigurasi yang digunakan ke dalam direktori checkpoint.

# 6.2. Pembuatan Model dan Optimizer

Fungsi `create_model` bertanggung jawab untuk membangun objek model dan optimizer.

-   *Instansiasi Model Dinamis*: Model tidak dibuat secara statis. Nama kelas model (misalnya, `HierarchicalReasoningModel_ACTV1`) dan kepala kerugian (`ACTLossHead`) dibaca dari konfigurasi, dan kelasnya dimuat secara dinamis menggunakan fungsi utilitas `load_model_class`.
-   *Kompilasi Model*: Model yang telah dibuat kemudian dibungkus dengan `torch.compile(model)`. Ini adalah fitur modern PyTorch yang menggunakan kompilasi *Just-In-Time* (JIT) untuk mengoptimalkan dan mempercepat eksekusi model secara signifikan.
-   *Dua Optimizer Berbeda*: Ini adalah salah satu bagian paling cerdas dari skrip. Ia tidak menggunakan satu optimizer untuk semua, melainkan dua:
    1.  *`AdamATan2`*: Varian Adam ini (dari pustaka `adam-atan2`) digunakan untuk semua parameter "normal" dari model.
    2.  *`CastedSparseEmbeddingSignSGD_Distributed`*: Optimizer kustom yang kita analisis di Bab 5.1, yang secara khusus menangani parameter dari `puzzle_emb`.
    
    Pemisahan ini memungkinkan penerapan *learning rate* dan *weight decay* yang berbeda untuk embedding puzzle dan sisa model, sesuai dengan yang kita lihat di file konfigurasi.

# 6.3. Loop Pelatihan dan Evaluasi

-   *Manajemen State (`carry`)*: Loop pelatihan dengan benar mengelola `carry`, objek yang menyimpan state rekuren dari model ACT. State ini diinisialisasi pada awal dan kemudian terus diperbarui dan diumpankan kembali ke model di setiap langkah, memungkinkan model untuk memiliki "memori" antar batch.
-   *Langkah Pelatihan (`train_batch`)*:
    1.  Data dikirim ke GPU.
    2.  Model (`ACTLossHead`) dipanggil, yang menjalankan *forward pass* dan mengembalikan total kerugian dan metrik.
    3.  `loss.backward()` menghitung gradien lokal di setiap GPU.
    4.  `dist.all_reduce(param.grad)` menjumlahkan gradien dari *semua* GPU. Ini adalah inti dari sinkronisasi dalam *Distributed Data Parallel* (DDP).
    5.  *Learning rate* untuk langkah saat ini dihitung menggunakan jadwal *cosine annealing with warmup*.
    6.  `optimizer.step()` dipanggil untuk kedua optimizer untuk memperbarui bobot model.
    7.  Metrik dari proses `rank 0` dikirim ke `wandb` untuk logging.
-   *Langkah Evaluasi (`evaluate`)*:
    -   Dipanggil secara berkala. Model disetel ke mode `eval()` dan semua komputasi berjalan di dalam `torch.inference_mode()`.
    -   *Logika ACT*: Loop evaluasi dengan benar menangani sifat komputasi variabel dari ACT. Ia menjalankan model dalam loop `while True` pada batch yang sama, dan baru berhenti ketika model mengeluarkan sinyal `all_finish`, yang berarti semua sekuens dalam batch telah berhenti.

# 6.4. Kesimpulan

`pretrain.py` adalah contoh buku teks dari skrip pelatihan AI modern yang kuat dan dapat direproduksi. Ia dengan mulus mengintegrasikan:
-   Manajemen konfigurasi yang fleksibel dengan *Hydra*.
-   Pelatihan terdistribusi multi-GPU dengan *`torch.distributed`*.
-   Akselerasi model dengan *`torch.compile`*.
-   Pelacakan eksperimen dengan *`wandb`*.
-   Logika yang dibuat khusus untuk menangani model rekuren yang kompleks dengan state (HRM-ACT).

# 6.5. `evaluate.py`: Menjalankan Model yang Sudah Dilatih

Skrip ini adalah utilitas yang fokus pada satu tujuan: mengambil *checkpoint* model yang sudah dilatih dan mengevaluasinya pada dataset. Ini adalah contoh bagus dari penggunaan kembali kode.

-   *Tujuan*: Untuk menjalankan inferensi (evaluasi) pada model yang sudah jadi dan menyimpan hasilnya.
-   *Konfigurasi Cerdas*: Skrip ini tidak menggunakan `hydra` secara penuh. Sebaliknya, ia meminta path ke file checkpoint, lalu dengan cerdas memuat file `all_config.yaml` yang tersimpan di direktori checkpoint yang sama. Ini adalah praktik yang sangat baik karena menjamin bahwa model dievaluasi menggunakan konfigurasi arsitektur yang sama persis seperti saat dilatih.
-   *Penggunaan Kembali Kode*: Skrip ini sangat efisien karena tidak menduplikasi logika. Ia secara langsung mengimpor dan menggunakan kembali fungsi-fungsi inti dari `pretrain.py`:
    -   `create_dataloader`: Untuk memuat dataset.
    -   `init_train_state`: Untuk membangun struktur model yang kosong.
    -   `evaluate`: Fungsi evaluasi yang identik dengan yang dipanggil selama loop pelatihan.
-   *Alur Kerja*:
    1.  Memuat konfigurasi dari file `yaml` di direktori checkpoint.
    2.  Membangun model dan memuat data.
    3.  Memuat bobot (weights) yang telah dilatih dari file checkpoint ke dalam model. Terdapat penanganan khusus untuk checkpoint yang disimpan oleh model yang dioptimalkan dengan `torch.compile`.
    4.  Memanggil fungsi `evaluate` untuk menjalankan model pada data tes.
    5.  Mencetak metrik akhir ke konsol.
    6.  -   Menyimpan output mentah model (misalnya, `logits`, `inputs`, `labels`) ke sebuah file, yang kemudian dapat digunakan oleh skrip analisis lain seperti `arc_eval.ipynb`.

---

 Bab 7: Utilitas dan Kesimpulan Akhir

Pada bab terakhir ini, kita akan melihat file-file pendukung yang melengkapi proyek dan menarik kesimpulan akhir dari keseluruhan analisis kita.

# 7.1. `puzzle_dataset.py`: Jembatan Efisien Antara Disk dan GPU

File ini mendefinisikan kelas `PuzzleDataset`, sebuah *data loader* canggih yang menjembatani file `.npy` di disk dengan model di GPU.

-   *`IterableDataset`*: Kelas ini dibangun di atas `IterableDataset` PyTorch, yang memungkinkannya mengelola logika *batching* dan *shuffling* yang kompleks secara internal.
-   *Memory Mapping*: Fitur utamanya adalah penggunaan `mmap_mode='r'` saat memuat data. Ini memungkinkan proyek untuk menangani dataset yang jauh lebih besar dari RAM yang tersedia dengan memetakan file di disk ke memori secara virtual.
-   *Sadar Distribusi*: Kelas ini secara internal menangani pembagian data untuk pelatihan multi-GPU, memastikan setiap proses (`rank`) menerima porsi data yang unik.
-   *Logika Kustom*: Ia memiliki logika iterasi yang berbeda untuk pelatihan (mengacak grup dan memilih augmentasi secara acak) dan pengujian (iterasi sekuensial).

# 7.2. `utils/functions.py`: Utilitas Pemuatan Dinamis

File kecil ini menyediakan dua fungsi penting yang memungkinkan fleksibilitas dan reproduktifitas.

-   *`load_model_class`*: Menerjemahkan string dari file konfigurasi (misalnya, `hrm.hrm_act_v1@ClassName`) menjadi objek kelas Python yang sebenarnya. Ini adalah perekat yang memungkinkan Hydra untuk membangun model secara dinamis.
-   *`get_model_source_path`*: Menemukan path ke file kode sumber dari sebuah model. Ini memungkinkan skrip pelatihan untuk secara otomatis membuat cadangan kode yang digunakan untuk sebuah eksperimen.

# 7.3. File Lainnya

-   *`arc_eval.ipynb`*: Sebuah Jupyter Notebook yang digunakan untuk analisis mendalam terhadap hasil evaluasi pada dataset ARC. Ia memuat file output yang disimpan oleh `evaluate.py`.
-   *`puzzle_visualizer.html`*: Alat bantu visual berbasis web untuk memeriksa puzzle dalam dataset yang telah dibuat.
-   *`.gitignore` & `.gitmodules`*: File standar Git untuk mengabaikan file-file tertentu (seperti output sementara) dan mengelola sub-repositori (untuk data mentah).
-   *`LICENSE`*: File lisensi perangkat lunak untuk proyek ini.

---

 Bab 8: Hasil Eksperimental & Wawasan Kunci (dari Paper)

*(Bab baru ini merangkum bukti empiris yang mendukung desain arsitektur.)*

# 8.1. Kebutuhan akan Kedalaman Komputasi (Gambar 2)

- Paper menunjukkan bahwa untuk tugas seperti Sudoku, menambah *lebar* (hidden size) Transformer standar tidak meningkatkan performa. Namun, menambah *kedalaman* (jumlah lapisan) memberikan peningkatan, meskipun akhirnya jenuh.
- HRM, melalui arsitektur rekurennya, secara efektif menciptakan "kedalaman komputasi" yang jauh lebih besar, memungkinkannya untuk terus meningkat dan mencapai akurasi mendekati sempurna di mana Transformer standar gagal.

# 8.2. Efektivitas Adaptive Computation Time (ACT) (Gambar 5)

- **Penghematan Komputasi**: Model dengan ACT mencapai performa yang sebanding dengan model yang berjalan dengan jumlah langkah maksimum yang tetap, tetapi dengan **jumlah langkah rata-rata yang jauh lebih sedikit**. Ini membuktikan bahwa model belajar mengalokasikan sumber daya komputasi hanya saat dibutuhkan.
- **Skalabilitas Saat Inferensi**: Model yang dilatih dengan `M_max` tertentu (misalnya, 8 langkah) dapat terus meningkatkan akurasinya saat dijalankan dengan batas langkah yang lebih tinggi saat inferensi (misalnya, 16 langkah), tanpa perlu pelatihan ulang.

# 8.3. Analisis Mekanisme Internal

- **Strategi Penalaran yang Berbeda (Gambar 7)**: Visualisasi state internal menunjukkan bahwa HRM tampaknya belajar strategi yang berbeda untuk tugas yang berbeda:
    - **Sudoku**: Menyerupai *depth-first search*, di mana ia mengeksplorasi solusi potensial dan melakukan *backtrack* saat menemui jalan buntu.
    - **ARC**: Menyerupai *hill-climbing*, di mana ia secara bertahap melakukan penyesuaian kecil pada papan sampai solusi tercapai.
- **Hierarki Dimensionalitas yang Muncul (Gambar 8)**: Ini adalah salah satu temuan paling mendalam.
    - Dengan menganalisis *Participation Ratio* (PR), sebuah ukuran "dimensionalitas efektif" dari representasi neural, para peneliti menemukan bahwa:
        - Modul **High-level (H)** yang terlatih mengembangkan representasi berdimensi **sangat tinggi**, yang skalanya meningkat dengan jumlah tugas yang berbeda.
        - Modul **Low-level (L)** yang terlatih mempertahankan representasi berdimensi **rendah** dan stabil.
    - Hierarki ini **tidak ada** pada model yang belum dilatih; ini adalah **properti yang muncul dari proses pembelajaran**.
    - Rasio dimensionalitas H/L di HRM (≈2.98) sangat mirip dengan yang diamati di korteks tikus (≈2.25), menunjukkan bahwa model ini mungkin telah menemukan prinsip pengorganisasian fundamental yang sama dengan yang digunakan oleh otak.