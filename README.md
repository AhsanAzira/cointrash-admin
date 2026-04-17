# CoinTrash — Operator Admin Panel

Aplikasi web ringan untuk operator stand CoinTrash dalam mengeksekusi **Langkah 6 & 7** alur penggunaan:
- **Langkah 6**: Serahkan & Timbang — operator menerima dan menimbang sampah pengguna
- **Langkah 7**: Proses Operator (Wizard of Oz) — operator menginput data secara manual ke sistem

---

## Cara Menjalankan

1. Buka folder project ini di VS Code
2. Install ekstensi **Live Server** (oleh Ritwick Dey) jika belum ada
3. Klik kanan `index.html` → **Open with Live Server**
4. Atau cukup buka file `index.html` langsung di browser

Tidak perlu Node.js, npm, atau framework apapun. Murni HTML + CSS + JavaScript.

---

## Struktur File

```
cointrash-admin/
├── index.html   → Struktur halaman utama
├── style.css    → Semua styling
├── app.js       → Logika aplikasi
└── README.md    → Dokumentasi ini
```

---

## Fitur

### 1. Input Sampah (Halaman Utama)
- **Scan QR / Input ID Pengguna** — verifikasi pengguna secara cepat
- **Multi-jenis sampah** — tambah banyak jenis sekaligus dengan tombol "+"
- **Kalkulasi otomatis** — koin dihitung real-time saat berat diinput
- **Kondisi sampah** — bersih / kotor (diskon 20%) / campuran (diskon 10%)
- **Catatan operator** — field opsional untuk keterangan tambahan
- **Konfirmasi pop-up** — modal sukses muncul setelah transaksi berhasil

### 2. Riwayat Transaksi
- Tampilan semua transaksi yang telah diproses
- **Export CSV** — download data transaksi ke file spreadsheet

### 3. Statistik Stand
- Ringkasan total transaksi, berat, dan koin yang dikeluarkan
- Grafik bar breakdown per jenis sampah

---

## Daftar Harga Sampah (Default)

| Jenis | Koin/kg |
|-------|---------|
| Botol Plastik (PET) | 150 |
| Kardus / Karton | 100 |
| Kertas HVS / Koran | 80 |
| Kaleng Aluminium | 200 |
| Botol Kaca | 120 |
| Elektronik Bekas | 300 |
| Minyak Jelantah | 250 |
| Besi / Logam Lain | 180 |

> **1 Koin = Rp 10**

Untuk mengubah harga, edit array `TRASH_TYPES` di file `app.js`.

---

## Teknologi

- HTML5, CSS3, Vanilla JavaScript (ES6+)
- Font: Syne (judul) + DM Sans (body) dari Google Fonts
- Data disimpan sementara di `localStorage` browser
