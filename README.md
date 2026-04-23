# 🖥️ CoinTrash Admin & Central API

> **Pusat kendali operasional dan Backend API untuk ekosistem CoinTrash.** Dashboard web ini dirancang khusus untuk operator stand agar dapat memproses transaksi setoran sampah secara real-time dan menyediakan data bagi aplikasi mobile.

![PHP](https://img.shields.io/badge/PHP-777BB4?style=for-the-badge&logo=php&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-00000F?style=for-the-badge&logo=mysql&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)

---

## 🚀 Fitur Utama

Dashboard Admin ini memiliki fungsi krusial dalam siklus bisnis CoinTrash:

* **Verifikasi Pengguna Dinamis:** Operator dapat mencari dan memverifikasi data pengguna berdasarkan Nama, Email, atau Nomor HP sebelum memulai transaksi.
* **Input Data Sampah Digital:** Memungkinkan operator menginput jenis sampah (Plastik, Logam, Kertas, dll.) dan beratnya secara presisi.
* **Kalkulasi Koin Otomatis:** Sistem secara otomatis menghitung jumlah koin yang didapatkan pengguna berdasarkan harga per kg yang tersimpan di database.
* **Manajemen Saldo (Wallets):** Setiap transaksi yang dikonfirmasi akan otomatis memperbarui saldo di tabel `wallets` pengguna di MySQL.
* **Central API Gateway:** Menyediakan endpoint JSON untuk mendukung fitur Login, Registrasi, Sinkronisasi Riwayat, dan Pembaruan Harga pada aplikasi Mobile.

---

## ⚙️ Arsitektur API

Sistem ini menggunakan **Action-Based HTTP API** dengan parameter `?action=...` untuk memproses berbagai permintaan:

| Action | Metode | Deskripsi |
| :--- | :--- | :--- |
| `verify_user` | GET | Mencari user berdasarkan Email/Nama/HP untuk verifikasi operator. |
| `save_transaction` | POST | Menyimpan data setoran sampah dan mengupdate saldo dompet. |
| `login` | POST | Validasi akun pengguna untuk aplikasi mobile. |
| `get_prices` | GET | Mengambil daftar harga sampah terbaru dari database. |
| `get_history` | GET | Mengambil riwayat transaksi (mendukung filter per user). |

---

## 🛠️ Panduan Instalasi (Server Lokal)

### Prasyarat:
* [XAMPP](https://www.apachefriends.org/) (Apache & MySQL).
* Browser web modern (Chrome/Edge).

### Langkah-langkah:
1.  **Clone Repositori:**
    ```bash
    git clone [https://github.com/AhsanAzira/cointrash-admin.git](https://github.com/AhsanAzira/cointrash-admin.git)
    ```

2.  **Konfigurasi Folder XAMPP:**
    * Pindahkan seluruh isi folder ini ke `C:\xampp\htdocs\cointrash-admin\`.
    * **Penting:** Pastikan nama folder adalah `cointrash-admin` agar sinkron dengan aplikasi mobile.

3.  **Setup Database:**
    * Buka `phpMyAdmin` dan buat database baru bernama `cointrash`.
    * Import file `cointrash.sql` yang tersedia di repositori ini.
    * Gunakan perintah SQL berikut untuk menambahkan data harga awal:
        ```sql
        INSERT INTO waste_types (name, price_per_kg) VALUES ('Plastik PET', 3500), ('Kardus', 2000), ('Aluminium', 8000);
        ```

4.  **Akses Dashboard:**
    * Jalankan modul Apache dan MySQL di XAMPP.
    * Buka alamat `http://localhost/cointrash-admin/index.html` di browser kamu.

---

## 👥 Tim Pengembang

Proyek ini dikembangkan oleh **Kelompok 3 - Software Startup Business (2026)**:
* **Ahsan Azira** - Lead Developer (Backend & API)
* *(Tambahkan nama anggota kelompok lainnya di sini)*

---

*© 2026 CoinTrash Admin System. Dibuat sebagai solusi pengelolaan sampah digital yang efisien.*
