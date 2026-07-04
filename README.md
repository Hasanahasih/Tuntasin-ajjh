# Tuntasin — Bayar Tagihan & Isi Pulsa

**Tagline:** Beres, sekali klik.

Aplikasi web frontend (client-side, tanpa backend nyata) untuk simulasi pembayaran tagihan rutin (Listrik/PLN, PDAM, Internet, Seminar), cicilan biaya kuliah (SPP), serta pengisian pulsa & paket data. Dibangun dengan **HTML5, CSS3, dan Vanilla JavaScript (ES6+)** — tanpa framework.

Fokus tugas: **Mobile** (sesuai ketentuan NIM Genap). Tampilan desktop tetap dirancang secara utuh, ditampilkan sebagai mock-up perangkat mobile agar pengalaman "aplikasi pembayaran di ponsel" tetap konsisten di layar besar.

## Cara menjalankan

Tidak perlu instalasi atau server. Cukup buka `index.html` langsung di browser (Chrome/Edge/Firefox terbaru), atau jalankan lewat Live Server jika ingin path relatif lebih stabil.

```
Tuntasin/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── data.js      → seluruh data dummy (hardcoded)
│   ├── utils.js      → helper: format rupiah, validasi, localStorage, toast
│   └── app.js        → logika utama aplikasi & routing antar section
└── README.md
```

## Fitur yang sudah diimplementasikan

### Navigasi (SPA style, 5 tab utama)
- Beranda, Bayar Tagihan, Biaya Kuliah, Isi Pulsa, Riwayat — via bottom navigation bar.
- Profil & Bantuan/FAQ dapat diakses lewat ikon avatar/quick access di Beranda.

### Beranda
- Kartu saldo simulasi (gaya "tiket sobek") + tombol Top Up (nominal masuk ke localStorage).
- Akses cepat ke seluruh kategori layanan.
- Banner promo (scrollable).
- 3 transaksi terakhir, sinkron dengan localStorage.

### Bayar Tagihan (Listrik, PDAM, Internet, Seminar)
- Pilih kategori → form input nomor pelanggan/ID/kode registrasi.
- Validasi real-time (panjang karakter, numerik/alfanumerik khusus seminar).
- Simulasi "Cek Tagihan" dengan loading state (800–1500ms).
- Menampilkan nama pelanggan, periode, tagihan pokok, denda (jika ada), total, jatuh tempo.
- Edge case: nomor tidak terdaftar → pesan error jelas.

### Biaya Kuliah / SPP (fitur unggulan)
- Input NIM (9 digit, tervalidasi) → daftar cicilan semester (6–8 item per mahasiswa).
- Checkbox multi-pilih, total otomatis terhitung ulang.
- Item yang sudah **Lunas** otomatis terkunci (tidak bisa dipilih ulang) — mencegah pembayaran ganda.
- Edge case: NIM tidak terdaftar → pesan error.

### Isi Pulsa & Paket Data
- Grid provider (Telkomsel, XL, Indosat, Tri, Smartfren, Axis) dengan deteksi otomatis dari 4 digit awal nomor HP.
- Validasi nomor HP (10–13 digit, wajib awalan `08`).
- Pilihan nominal pulsa tetap atau custom (Rp10.000–Rp1.000.000), atau tab Paket Data.
- Preview total sebelum lanjut ke pembayaran.

### Pembayaran (berlaku untuk semua kategori)
- 3 metode wajib:
  - **Virtual Account** — pilih bank (BCA/BNI/Mandiri/BRI), nomor VA digenerate otomatis.
  - **QRIS** — kode QR simulatif + countdown 5 menit (kedaluwarsa otomatis).
  - **Bayar di Teller/Kasir** — kode pembayaran + daftar lokasi mitra.
- Validasi: tombol "Bayar Sekarang" menolak jika metode belum dipilih, atau saldo tidak mencukupi.
- Loading state saat memproses pembayaran.
- Struk/bukti pembayaran otomatis + tombol Cetak (`window.print()`, mendukung CSS print media).
- Transaksi otomatis tersimpan ke localStorage & saldo simulasi berkurang.

### Riwayat Transaksi
- Tabel/daftar transaksi dari localStorage, dengan filter kategori.
- Cetak ulang struk dari riwayat.
- Hapus seluruh riwayat (dengan konfirmasi).

### Fitur tambahan (nilai plus)
- Dark/Light mode toggle (tersimpan di localStorage).
- Halaman Profil (fake login, dapat diedit & disimpan).
- Halaman Bantuan/FAQ (accordion).
- Aksesibilitas dasar: fokus keyboard terlihat, semantic HTML, `aria-current`, label eksplisit pada setiap input.

## Data simulasi (contoh untuk testing)

**Listrik:** `112233445566`, `223344556677`, `334455667788`, `445566778899`, `556677889900`
**PDAM:** `PD10023344`, `PD10088221`, `PD10077310`
**Internet:** `INET8801122`, `INET8804456`, `INET8809981`
**Seminar:** `SEM2026WEB01`, `SEM2026DEV02`, `SEM2026AI003`
**NIM (Biaya Kuliah):** `202410001`, `202410002`, `202410003`
**Nomor HP:** awali dengan `08` + 8–11 digit apa saja, mis. `081234567890` (Telkomsel)

## Teknologi

- HTML5, CSS3 (Custom Properties, Flexbox, Grid, media queries)
- Vanilla JavaScript ES6+ (tanpa library framework)
- Font Awesome 6 (ikon, via CDN)
- Google Fonts: Sora (display), Inter (UI), IBM Plex Mono (angka & kode transaksi)
- `localStorage` untuk state saldo, transaksi, profil, dan tema

## Catatan

Seluruh transaksi adalah simulasi. Tidak ada koneksi ke backend, API, atau bank sungguhan.
