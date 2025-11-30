# 📋 Panduan Form Pengajuan A1, A2, A3

Bot WhatsApp ini dapat otomatis mendeteksi dan mencatat form pengajuan A1, A2, dan A3 ke database Supabase.

## 📝 Format Form

### Form Pengajuan A1 (Usaha)

```
Form Pengajuan A1

Tanggal: 29-11-2024
Nama: John Doe
Usaha: Toko Kelontong
Plafon Pengajuan: Rp 50.000.000
Tenor: 12 bulan
Nomor Telepon: 081234567890
Nama dan nomor HP pasangan: Jane Doe / 081234567891
Bank/Nomor Rekening/Atas Nama: BCA / 1234567890 / John Doe
```

### Form Pengajuan A2 (Jaminan)

```
Form Pengajuan A2

Tanggal: 29-11-2024
Nama: John Doe
Jenis Jaminan: BPKB Motor
Nopol/a.n. BPKB: B 1234 XYZ / John Doe
Plafon Pengajuan: Rp 30.000.000
Tenor: 24 bulan
Nomor Telepon: 081234567890
Nama dan nomor HP pasangan: Jane Doe / 081234567891
Bank/Nomor Rekening/Nama: BCA / 1234567890 / John Doe
```

### Form Pengajuan A3 (Sederhana)

```
Form Pengajuan A3

Tanggal: 29-11-2024
Nama: John Doe
Plafon Pengajuan: Rp 10.000.000
Bank/Nomor Rekening/Atas Nama: BCA / 1234567890 / John Doe
```

## 🤖 Cara Kerja

1. **Deteksi Form**: Bot mendeteksi keyword "Form Pengajuan A1", "Form A1", "Form Pengajuan A2", dll.
2. **Parse Data**: Bot extract semua field dari pesan
3. **Validasi**: Bot memvalidasi format data (tanggal, nominal, dll)
4. **Simpan ke DB**: Data disimpan ke tabel yang sesuai di Supabase
5. **Konfirmasi**: Bot mengirim reply dengan ringkasan data yang dicatat

## 📊 Data yang Diextract

### Form A1
- ✅ Tanggal
- ✅ Nama
- ✅ Usaha
- ✅ Plafon Pengajuan (dikonversi ke angka)
- ✅ Tenor
- ✅ Nomor Telepon
- ✅ Nama Pasangan
- ✅ Nomor HP Pasangan
- ✅ Bank
- ✅ Nomor Rekening
- ✅ Atas Nama

### Form A2
- ✅ Tanggal
- ✅ Nama
- ✅ Jenis Jaminan
- ✅ Nopol
- ✅ A.n. BPKB
- ✅ Plafon Pengajuan (dikonversi ke angka)
- ✅ Tenor
- ✅ Nomor Telepon
- ✅ Nama Pasangan
- ✅ Nomor HP Pasangan
- ✅ Bank
- ✅ Nomor Rekening
- ✅ Atas Nama

### Form A3
- ✅ Tanggal
- ✅ Nama
- ✅ Plafon Pengajuan (dikonversi ke angka)
- ✅ Bank
- ✅ Nomor Rekening
- ✅ Atas Nama

## 💡 Tips Pengisian Form

### Format Tanggal
Bot mendukung berbagai format:
- `29-11-2024`
- `29/11/2024`
- `2024-11-29`

### Format Nominal
Bot akan otomatis membersihkan dan convert ke angka:
- `Rp 50.000.000` → `50000000`
- `50000000` → `50000000`
- `50.000.000` → `50000000`

### Format Pasangan
Pisahkan nama dan nomor dengan `/` atau `-`:
- `Jane Doe / 081234567891`
- `Jane Doe - 081234567891`

### Format Rekening
Pisahkan bank, nomor, dan nama dengan `/`:
- `BCA / 1234567890 / John Doe`
- `Mandiri / 9876543210 / Jane Doe`

### Format Nopol/BPKB (Form A2)
Pisahkan nopol dan nama dengan `/` atau `-`:
- `B 1234 XYZ / John Doe`
- `D 5678 ABC - Jane Doe`

## 📱 Contoh Penggunaan

### Kirim Form di Grup WhatsApp

```
Form Pengajuan A1

Tanggal: 29-11-2024
Nama: Budi Santoso
Usaha: Warung Makan
Plafon Pengajuan: Rp 75.000.000
Tenor: 18 bulan
Nomor Telepon: 081234567890
Nama dan nomor HP pasangan: Siti Nurhaliza / 081234567891
Bank/Nomor Rekening/Atas Nama: BCA / 1234567890 / Budi Santoso
```

### Bot akan Reply

```
✅ Form Pengajuan A1 berhasil dicatat!

📋 *Form Pengajuan A1*

📅 Tanggal: 2024-11-29
👤 Nama: Budi Santoso
🏢 Usaha: Warung Makan
💰 Plafon: Rp 75,000,000
📆 Tenor: 18 bulan
📱 No. Telepon: 081234567890
👫 Pasangan: Siti Nurhaliza 081234567891
🏦 Rekening: BCA / 1234567890 / Budi Santoso
```

## 🗄️ Database Schema

### Tabel: form_pengajuan_a1
```sql
CREATE TABLE form_pengajuan_a1 (
  id BIGSERIAL PRIMARY KEY,
  tanggal DATE,
  nama TEXT NOT NULL,
  usaha TEXT,
  plafon_pengajuan BIGINT,
  tenor TEXT,
  nomor_telepon TEXT,
  nama_pasangan TEXT,
  nomor_hp_pasangan TEXT,
  bank TEXT,
  nomor_rekening TEXT,
  atas_nama TEXT,
  sender_name TEXT NOT NULL,
  sender_number TEXT NOT NULL,
  group_name TEXT NOT NULL,
  group_id TEXT NOT NULL,
  raw_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Tabel: form_pengajuan_a2
```sql
CREATE TABLE form_pengajuan_a2 (
  id BIGSERIAL PRIMARY KEY,
  tanggal DATE,
  nama TEXT NOT NULL,
  jenis_jaminan TEXT,
  nopol TEXT,
  an_bpkb TEXT,
  plafon_pengajuan BIGINT,
  tenor TEXT,
  nomor_telepon TEXT,
  nama_pasangan TEXT,
  nomor_hp_pasangan TEXT,
  bank TEXT,
  nomor_rekening TEXT,
  atas_nama TEXT,
  sender_name TEXT NOT NULL,
  sender_number TEXT NOT NULL,
  group_name TEXT NOT NULL,
  group_id TEXT NOT NULL,
  raw_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Tabel: form_pengajuan_a3
```sql
CREATE TABLE form_pengajuan_a3 (
  id BIGSERIAL PRIMARY KEY,
  tanggal DATE,
  nama TEXT NOT NULL,
  plafon_pengajuan BIGINT,
  bank TEXT,
  nomor_rekening TEXT,
  atas_nama TEXT,
  sender_name TEXT NOT NULL,
  sender_number TEXT NOT NULL,
  group_name TEXT NOT NULL,
  group_id TEXT NOT NULL,
  raw_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 📈 Query Database

### Lihat Semua Pengajuan
```sql
SELECT * FROM v_all_pengajuan
ORDER BY created_at DESC;
```

### Statistik Per Form Type
```sql
SELECT * FROM v_pengajuan_stats;
```

### Pengajuan Hari Ini
```sql
SELECT 
  form_type,
  nama,
  formatted_plafon,
  tenor,
  group_name,
  created_at
FROM v_all_pengajuan
WHERE DATE(created_at) = CURRENT_DATE
ORDER BY created_at DESC;
```

### Total Plafon Per Grup
```sql
SELECT 
  group_name,
  COUNT(*) as total_pengajuan,
  SUM(plafon_pengajuan) as total_plafon,
  'Rp ' || TO_CHAR(SUM(plafon_pengajuan), 'FM999,999,999,999') as formatted_total
FROM (
  SELECT group_name, plafon_pengajuan FROM form_pengajuan_a1
  UNION ALL
  SELECT group_name, plafon_pengajuan FROM form_pengajuan_a2
  UNION ALL
  SELECT group_name, plafon_pengajuan FROM form_pengajuan_a3
) as all_forms
WHERE plafon_pengajuan IS NOT NULL
GROUP BY group_name
ORDER BY total_plafon DESC;
```

### Pengajuan Per Orang
```sql
SELECT 
  nama,
  COUNT(*) as total_pengajuan,
  SUM(plafon_pengajuan) as total_plafon,
  'Rp ' || TO_CHAR(SUM(plafon_pengajuan), 'FM999,999,999,999') as formatted_total
FROM (
  SELECT nama, plafon_pengajuan FROM form_pengajuan_a1
  UNION ALL
  SELECT nama, plafon_pengajuan FROM form_pengajuan_a2
  UNION ALL
  SELECT nama, plafon_pengajuan FROM form_pengajuan_a3
) as all_forms
WHERE plafon_pengajuan IS NOT NULL
GROUP BY nama
ORDER BY total_plafon DESC;
```

## ⚠️ Troubleshooting

### Form Tidak Terdeteksi
- Pastikan ada keyword "Form Pengajuan A1", "Form A1", dll di awal pesan
- Keyword tidak case-sensitive (bisa huruf besar/kecil)

### Data Tidak Lengkap
- Cek format field sesuai panduan
- Field yang tidak wajib boleh dikosongkan
- Bot akan tetap simpan data meskipun ada field kosong

### Nominal Salah
- Pastikan format nominal menggunakan angka
- Boleh pakai "Rp", titik, atau koma
- Bot akan otomatis membersihkan format

### Tanggal Tidak Valid
- Gunakan format DD-MM-YYYY, DD/MM/YYYY, atau YYYY-MM-DD
- Jika tanggal tidak valid, akan disimpan sebagai NULL

## 🔧 Customization

### Menambah Field Baru

1. Update schema di `form-schema.sql`
2. Update parser di `utils/formParser.js`
3. Update function `formatFormSummary()` untuk tampilkan field baru

### Mengubah Format Reply

Edit function `formatFormSummary()` di `utils/formParser.js`:

```javascript
export function formatFormSummary(formType, formData) {
  let summary = `📋 *Form Pengajuan ${formType}*\n\n`;
  // Customize format di sini
  return summary;
}
```

### Menambah Validasi

Edit function parser di `utils/formParser.js`:

```javascript
export function parseFormA1(message) {
  const data = {
    // ... extract data
  };
  
  // Tambah validasi di sini
  if (!data.nama) {
    throw new Error('Nama wajib diisi');
  }
  
  return data;
}
```

## 📝 Best Practices

1. **Konsisten Format**: Gunakan format yang sama untuk semua form
2. **Lengkapi Data**: Isi semua field yang tersedia
3. **Cek Reply Bot**: Pastikan bot reply dengan data yang benar
4. **Backup Database**: Lakukan backup rutin database Supabase
5. **Monitor Error**: Cek console log jika ada error

## 🎯 Fitur Mendatang

- [ ] Export data ke Excel
- [ ] Dashboard statistik
- [ ] Notifikasi ke admin
- [ ] Approval workflow
- [ ] Edit/Delete pengajuan
- [ ] Upload dokumen pendukung
