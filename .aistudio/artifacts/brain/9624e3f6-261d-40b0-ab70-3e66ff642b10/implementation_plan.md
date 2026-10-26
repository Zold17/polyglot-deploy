# Modul Pembelajaran Kata Perkata Hiragana & Kanji

Rencana pengembangan modul pembelajaran kata perkata Hiragana dan Kanji terintegrasi untuk bahasa Jepang di PolyglotLingo, mencakup modul eksplorasi karakter mandiri, pembedah kata per kata interaktif pada kalimat dialog percakapan, audio pelafalan penutur asli, dan kuis tebak bacaan.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> Ringkasan preferensi yang telah dikonfirmasi oleh pengguna pada tahap klarifikasi:
> - **Format Pembelajaran**: Modul huruf mandiri (Hiragana 46 huruf + Kanji dasar N5/N4 percakapan) serta pembedah kata per kata langsung pada baris dialog.
> - **Fitur Interaktif Utama**: Pemutaran audio suara asli per karakter/kata, pembacaan Romaji dan furigana interaktif, makna bahasa Indonesia, serta kuis tebak bacaan kata.

---

## 1. Overview & Core Concept

- **Tujuan**: Membantu pembelajar bahasa Jepang memahami struktur kalimat dan kosa kata sampai ke tingkat karakter (Hiragana dan Kanji dasar sehari-hari), sehingga tidak hanya menghafal kalimat jadi tetapi mengerti arti setiap unsur pembentuknya.
- **Sasaran Pengguna**: Pemula (A1) hingga dasar lanjutan (A2) yang ingin lancar membaca menu, papan jalan, dan teks percakapan nyata di Jepang tanpa merasa terintimidasi oleh aksara Kanji.
- **Nilai Tambah**: Menghubungkan teori aksara dengan dialog praktis: ketika pembelajar melihat kalimat seperti *"ホットコーヒーを一つください"* atau *"山手線のホームはどこですか"*, mereka dapat mengeklik setiap kata atau kanji (`一`, `つ`, `山手線`, `駅`, `水`, `食`, dll.) untuk melihat cara baca, pecahan Hiragana, audio pelafalan, dan maknanya secara instan.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Alur 1: Eksplorasi Modul Hiragana & Kanji Mandiri**:
   - Pengguna membuka tab baru **"Aksara & Kanji"** di bilah navigasi ketika Bahasa Jepang sedang aktif.
   - Pilihan toggle segmented: **Tabel 46 Hiragana** (*Gojuon*) dan **Koleksi Kanji Percakapan Harian** (dikelompokkan per tema: Angka/Waktu, Makanan & Minuman, Transportasi & Tempat, Orang & Kegiatan).
   - Mengetuk kartu huruf/kanji menampilkan:
     - Aksara besar dengan font tipografi Jepang (*Noto Sans JP*).
     - Cara baca Hiragana + Romaji + Makna Indonesia.
     - Cara baca Kunyomi (Jepang asli) & Onyomi (Sino-Jepang).
     - Tombol audio pelafalan instan (*SpeechSynthesis ja-JP*).
     - Contoh kata dan kalimat penggunaannya dalam percakapan sehari-hari.

2. **Alur 2: Pembedah Kata Per Kata dalam Dialog (Word-by-Word Breakdown)**:
   - Pada **Studio Dialog** dan **Roleplay**, setiap kalimat percakapan kini dapat diuraikan menjadi kepingan kata/frasa interaktif (*clickable tokens*).
   - Mengetuk kata apa saja (misalnya *"美味しい"*, *"お願いします"*, *"切符売り場"*) memunculkan kartu melayang (*popover*) yang menampilkan:
     - Bentuk Kanji asli + Furigana Hiragana di atasnya.
     - Cara baca Romaji.
     - Kelas kata (kata benda, kata kerja, partikel, kata sifat).
     - Arti dalam konteks kalimat tersebut.
     - Tombol putar audio pengucapan kata tunggal secara terisolasi.

3. **Alur 3: Kuis Tebak Bacaan & Makna Kata**:
   - Mode kuis interaktif untuk menguji kemampuan mengingat cara baca Hiragana dari Kanji, atau mencocokkan kata Jepang dengan artinya dalam bahasa Indonesia.
   - Dilengkapi umpan balik audio (*success/streak chime*) dan penambahan skor XP belajar.

### Visual Identity & Layout

- **Tipografi Aksara**: Menggunakan font khusus `Noto Sans JP` dengan bobot `font-bold` dan ukuran hierarki yang kontras agar goresan kanji terlihat tajam dan mudah dibedakan.
- **Warna & Permukaan**:
  - Dominan kanvas netral bersih (`#F8FAFC`).
  - Aksen Hiragana: Indigo / Slate yang tenang.
  - Aksen Kanji: Crimson / Rose lembut yang melambangkan keanggunan budaya visual Jepang.
- **Disiplin Anti-Slop**: Menghindari pill badge dekoratif bertumpuk; menggunakan pembatas tipografis halus (`·`) dan label status yang fungsional.

---

## 3. Key Product Decisions & Trade-Offs

- **Keputusan 1: Tokenisasi Kalimat Dialog Terstruktur vs Eksternal Parser**:
  - *Pendekatan*: Melengkapi metadata dialog dengan data `wordBreakdown` terstruktur yang mencakup pemisahan morfem/kata, furigana kanji, partikel, dan arti kontekstual.
  - *Alasan*: Menghasilkan pemisahan kata yang 100% akurat tanpa jeda loading atau ketergantungan parser runtime yang rentan keliru memotong partikel (`は`, `が`, `を`).
- **Keputusan 2: Audio Pelafalan Karakter & Kata**:
  - *Pendekatan*: Memanfaatkan Web Speech API `SpeechSynthesis` dengan kode bahasa `ja-JP` dengan pitch dan rate yang dioptimalkan untuk pengucapan kata tunggal.
  - *Alasan*: Respon instan tanpa latensi jaringan (<50ms) dan kompatibel penuh saat offline.

---

## 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                       PolyglotLingo                         │
│                  Header & Language State                    │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
               ▼                              ▼
    ┌────────────────────┐         ┌────────────────────┐
    │ Studio Dialog &    │         │  Modul Aksara &    │
    │  Word Breakdown    │         │  Kanji Mandiri     │
    │                    │         │                    │
    │ • Tokenized Words  │         │ • Hiragana Chart   │
    │ • Furigana Overlay │         │ • Essential Kanji  │
    │ • Isolated Audio   │         │ • Kun/On Readings  │
    │ • Part-of-speech   │         │ • Meaning & Audio  │
    └─────────┬──────────┘         └─────────┬──────────┘
              │                              │
              ▼                              ▼
    ┌───────────────────────────────────────────────────┐
    │          ProgressContext & Quiz Engine            │
    │  • Word Mastery Tracking                          │
    │  • Kuis Tebak Bacaan (Reading Quiz)               │
    │  • Audio Feedback (SpeechService ja-JP)           │
    └───────────────────────────────────────────────────┘
```

### Komponen Baru yang Akan Dibuat:
1. `src/types/kanji.ts`: Definisi tipe data karakter Hiragana, Kanji harian, data token kalimat, dan opsi kuis aksara.
2. `src/data/japaneseScriptData.ts`: Dataset 46 huruf Hiragana dasar, serta 40+ Kanji harian esensial kurikulum A1/A2 lengkap dengan Onyomi, Kunyomi, arti bahasa Indonesia, dan contoh kata.
3. `src/components/JapaneseScriptExplorer.tsx`: Tampilan modul belajar aksara mandiri (Tabel Hiragana interaktif, Kartu Kanji harian, dan Kuis Tebak Bacaan).
4. `src/components/WordBreakdownCard.tsx`: Komponen popover bedah kata interaktif ketika kata dalam dialog atau kanji diketuk.
5. Integrasi ke `src/components/DialoguePlayer.tsx`, `src/components/Header.tsx`, dan `src/App.tsx`.
