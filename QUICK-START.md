# 🚀 Quick Start Guide

Panduan cepat untuk menjalankan bot WhatsApp Transfer & Form Pengajuan.

## ⚡ Setup Cepat (5 Menit)

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Supabase

1. Buat akun gratis di [supabase.com](https://supabase.com)
2. Buat project baru
3. Buka **SQL Editor**
4. Jalankan 2 file SQL:
   - `supabase-schema.sql` (untuk bukti transfer)
   - `form-schema.sql` (untuk form pengajuan)

### 3. Konfigurasi Environment

1. Copy `.env.example` menjadi `.env`
2. Isi dengan kredensial Supabase:

```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Cara dapat URL & Key:**
- Buka project Supabase
- Klik **Settings** > **API**
- Copy **Project URL** dan **anon/public key**

### 4. Jalankan Bot

```bash
npm start
```

### 5. Scan QR Code

- QR code akan muncul di terminal
- Buka WhatsApp di HP
- Klik **⋮** > **Linked Devices** > **Link a Device**
- Scan QR code
- Tunggu sampai muncul "✅ Bot WhatsApp siap!"

## 🎯 Test Bot

### Test 1: Bukti Transfer

Kirim pesan di grup WhatsApp:

```
Bukti transfer hari ini
```

Lalu kirim gambar bukti transfer. Bot akan:
- Download gambar
- OCR untuk baca nominal
- Simpan ke database
- Reply dengan konfirmasi

### Test 2: Form Pengajuan A1

Copy paste ke grup WhatsApp:

```
Form Pengajuan A1

Tanggal: 29-11-2024
Nama: Test User
Usaha: Toko Online
Plafon Pengajuan: Rp 50.000.000
Tenor: 12 bulan
Nomor Telepon: 081234567890
Nama dan nomor HP pasangan: Test Pasangan / 081234567891
Bank/Nomor Rekening/Atas Nama: BCA / 1234567890 / Test User
```

Bot akan:
- Deteksi form A1
- Extract semua data
- Simpan ke database
- Reply dengan ringkasan

### Test 3: Cek Database

Buka Supabase > **Table Editor**:
- `transfer_bukti` - Lihat data bukti transfer
- `form_pengajuan_a1` - Lihat data form A1
- `form_pengajuan_a2` - Lihat data form A2
- `form_pengajuan_a3` - Lihat data form A3

## 📊 View Data

### Lihat Semua Pengajuan

```sql
SELECT * FROM v_all_pengajuan
ORDER BY created_at DESC;
```

### Statistik Pengajuan

```sql
SELECT * FROM v_pengajuan_stats;
```

### Total Transfer Hari Ini

```sql
SELECT 
  COUNT(*) as total,
  SUM(nominal) as total_nominal,
  'Rp ' || TO_CHAR(SUM(nominal), 'FM999,999,999,999') as formatted
FROM transfer_bukti
WHERE DATE(created_at) = CURRENT_DATE
  AND nominal IS NOT NULL;
```

## 🔧 Troubleshooting

### Bot tidak connect

```bash
# Hapus session dan scan ulang
rm -rf .wwebjs_auth/
npm start
```

### Error Supabase

- Cek `.env` sudah benar
- Pastikan tabel sudah dibuat
- Disable RLS di Supabase untuk testing

### OCR lambat

- Normal, OCR butuh 5-15 detik
- Untuk production, gunakan Google Cloud Vision API

### Form tidak terdeteksi

- Pastikan ada keyword "Form Pengajuan A1" atau "Form A1"
- Jangan ubah format field (Nama:, Tanggal:, dll)

## 📚 Dokumentasi Lengkap

- **README.md** - Overview & setup lengkap
- **OCR-GUIDE.md** - Panduan OCR & extract nominal
- **FORM-GUIDE.md** - Panduan form pengajuan A1/A2/A3
- **template-form.txt** - Template form untuk copy paste

## 🎓 Tutorial Video

Coming soon!

## 💬 Support

Jika ada masalah:
1. Cek dokumentasi di atas
2. Cek console log untuk error message
3. Buat issue di repository

## 🎉 Selamat!

Bot WhatsApp sudah siap digunakan! 🚀

**Next Steps:**
1. Tambahkan bot ke grup WhatsApp yang diinginkan
2. Test dengan data real
3. Monitor database di Supabase
4. Customize sesuai kebutuhan

---

**Tips Pro:**
- Gunakan `npm run dev` untuk development (auto-reload)
- Backup database secara rutin
- Monitor console log untuk troubleshooting
- Baca FORM-GUIDE.md untuk format form yang benar
