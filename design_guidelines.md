# Panduan Desain Hurtrock Music Store

## Pendekatan Desain

**Estetika Rock Vintage**: Terinspirasi dari budaya musik vintage dan nuansa rockstar, menggabungkan suasana toko musik klasik dengan pola e-commerce modern. Desain ini menghadirkan pengalaman imersif yang mengingatkan pada toko musik legendaris, namun tetap menjaga standar kegunaan dan aksesibilitas modern.

## Elemen Desain Inti

### A. Palet Warna

**Warna Utama (Dark Mode)**:

* Latar Belakang: 25 15% 8% (charcoal gelap dengan nuansa hangat)
* Permukaan: 25 12% 12% (lapisan terangkat)
* Teks Utama: 35 8% 92% (putih hangat)

**Oranye Brand (dari logo)**:

* Oranye Utama: 25 85% 55% (oranye vintage cerah)
* Oranye Aksen: 30 75% 45% (oranye terbakar lebih gelap)
* Oranye Terang: 35 60% 70% (sorotan oranye lembut)

**Warna Pendukung**:

* Aksen Emas: 45 70% 60% (emas/brass vintage untuk item premium)
* Oranye Redup: 25 45% 35% (garis batas dan elemen halus)

### B. Tipografi

* **Utama**: Google Fonts "Bebas Neue" (judul, nuansa rockstar)
* **Sekunder**: "Inter" (teks isi, keterbacaan)
* **Aksen**: "Rock Salt" (elemen dekoratif, nuansa vintage)

### C. Sistem Layout

Gunakan spacing Tailwind: **2, 4, 6, 8, 12, 16**

* Rapat: p-2, m-4
* Standar: p-6, gap-8
* Luas: p-12, mb-16

### D. Komponen

**Navigasi**: Header gelap dengan logo vintage, efek hover oranye
**Kartu Produk**: Latar gelap dengan border oranye saat hover, tipografi vintage
**Tombol**: Oranye utama dengan efek tekstur halus, varian outline dengan latar buram
**Formulir**: Input gelap dengan cincin fokus oranye, label bergaya vintage
**Hero Section**: Layar penuh dengan overlay gradasi bernuansa oranye brand

### E. Gaya Visual

**Gradasi**:

* Hero: charcoal gelap ke oranye (25 15% 8% → 25 85% 55%)
* Tombol: gradasi oranye lembut (25 85% 55% → 30 75% 45%)
* Kartu: overlay hitam transparan ke nuansa oranye

**Tekstur**: Overlay tekstur kertas vintage, efek tepi usang pada elemen utama

**Latar**: Basis gelap dengan efek pencahayaan oranye hangat, bagian terinspirasi poster konser vintage

## Bagian Gambar

**Hero Image**: Amplifier, gitar, atau panggung konser dengan overlay cahaya oranye
**Gambar Produk**: Foto instrumen berkualitas tinggi dengan latar gelap dan cahaya hangat
**Banner Kategori**: Grafis vintage sesuai kategori (gitar, drum, vinyl)
**Elemen Latar**: Pola bertema musik (notasi, gelombang suara) dengan opasitas rendah

## Prinsip Desain Utama

1. **Nuansa Rockstar Vintage**: Tekstur usang, tipografi tegas, layout terinspirasi konser
2. **Konsistensi Oranye Brand**: Gunakan oranye logo sebagai aksen utama dan CTA
3. **Dark Mode First**: Latar gelap hangat menciptakan suasana venue musik intim
4. **Hierarki Kontras**: Oranye digunakan strategis melawan latar gelap
5. **Responsif Mobile-First**: Estetika vintage tetap indah di semua perangkat

## Detail Implementasi

### Breakpoints Responsif

* **Mobile**: ≤768px (satu kolom, navigasi drawer)
* **Tablet**: 768px–1024px (grid dua kolom, navigasi ringkas)
* **Desktop**: ≥1024px (multi-kolom, navigasi penuh)

### Spesifikasi Komponen

**Header**:

* Latar gelap dengan aksen logo oranye
* Navigasi sticky dengan scroll halus
* Menu hamburger mobile dengan drawer
* Search bar dengan fokus oranye
* Ikon keranjang dengan badge jumlah item

**Kartu Produk**:

* Latar gelap dengan border halus
* Efek hover border oranye transisi lembut
* Gambar produk berkualitas tinggi, rasio terjaga
* Hierarki tipografi: Bebas Neue (judul), Inter (deskripsi)
* Tombol CTA oranye dengan efek hover elevasi

**Keranjang Belanja**:

* Panel slide-out non-intrusif
* Persisten berbasis sesi meski refresh
* Kontrol jumlah dengan tombol oranye
* Perhitungan total real-time dengan format mata uang

**Panel Admin**:

* Dashboard gelap dengan aksen oranye
* Komponen form dengan validasi
* Tabel data dengan sorting dan filter
* Dialog modal untuk operasi CRUD

### Standar Aksesibilitas

* Kontras warna sesuai WCAG 2.1 AA
* Navigasi keyboard untuk semua elemen interaktif
* Optimasi screen reader dengan ARIA labels
* Indikator fokus warna oranye
* Struktur HTML semantik

### Optimasi Performa

* Lazy loading untuk gambar/komponen
* Optimasi font dengan display: swap
* CSS-in-JS dengan Tailwind purge
* Optimasi gambar dengan atribut srcset

### Pertimbangan Internasional

* Dukungan layout RTL (rencana)
* Posisi simbol mata uang IDR/USD
* Ruang teks untuk terjemahan
* Sensitivitas budaya warna (oranye sudah diuji lintas budaya)

Desain sistem ini menciptakan atmosfer rock vintage autentik sekaligus memastikan fungsi e-commerce modern, aksesibilitas, dan performa optimal di semua perangkat serta konteks pengguna.
