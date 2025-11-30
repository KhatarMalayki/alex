# 🤖 Panduan Fitur OCR & Extract Nominal

## Cara Kerja OCR

Bot ini menggunakan **Tesseract.js** untuk membaca text dari gambar bukti transfer. Berikut prosesnya:

### 1. Pre-processing Gambar
Sebelum OCR, gambar diproses dengan **Sharp** untuk meningkatkan akurasi:
- Convert ke grayscale (hitam putih)
- Normalize contrast
- Sharpen untuk ketajaman

### 2. OCR (Optical Character Recognition)
- Menggunakan Tesseract.js dengan bahasa Indonesia + English
- Membaca semua text yang ada di gambar
- Progress ditampilkan di console

### 3. Extract Nominal
Bot mencari nominal dengan pattern:
- `Rp 100.000` atau `IDR 100000`
- `Transfer: 500000`
- `Nominal: Rp 1.000.000`
- `Jumlah: 250000`
- Dan berbagai format lainnya

### 4. Validasi
- Nominal harus antara Rp 1.000 - Rp 999.999.999.999
- Jika ada multiple nominal, ambil yang terbesar
- Nominal disimpan sebagai integer (tanpa titik/koma)

## Format Nominal yang Didukung

✅ **Format yang bisa dibaca:**
```
Rp 100.000
Rp 100000
IDR 100.000
100.000
Transfer Rp 500.000
Nominal: 1.000.000
Jumlah: Rp 250000
Total: IDR 1.500.000
```

❌ **Format yang sulit dibaca:**
- Nominal dalam gambar blur/tidak jelas
- Text terlalu kecil
- Gambar miring/rotasi
- Nominal di area gelap

## Tips Agar OCR Akurat

1. **Kualitas Gambar**
   - Pastikan gambar jelas dan tidak blur
   - Pencahayaan cukup
   - Resolusi minimal 800x600

2. **Format Screenshot**
   - Screenshot langsung dari aplikasi banking
   - Hindari foto layar HP dengan kamera
   - Pastikan text tidak terpotong

3. **Posisi Nominal**
   - Nominal sebaiknya di tengah gambar
   - Tidak tertutup watermark
   - Background kontras dengan text

## Contoh Output Console

```
📨 Pesan baru terdeteksi:
👤 Pengirim: John Doe
👥 Grup: Pembayaran Bulanan
💬 Pesan: Bukti transfer bulan ini
🖼️  Ada gambar: Ya
⏳ Mengunduh gambar...
✅ Gambar berhasil diunduh
🔍 Memproses gambar dengan OCR...
   OCR Progress: 25%
   OCR Progress: 50%
   OCR Progress: 75%
   OCR Progress: 100%
✅ OCR selesai

📊 Hasil OCR:
   Text terdeteksi: BCA TRANSFER BERHASIL Nominal Rp 500.000 Ke: PT EXAMPLE...
   💰 Nominal terdeteksi: Rp 500,000
✅ Bukti transfer berhasil disimpan
```

## Query Database untuk Analisis

### Total Transfer Per Grup
```sql
SELECT 
  group_name,
  COUNT(*) as total_transfer,
  SUM(nominal) as total_nominal,
  'Rp ' || TO_CHAR(SUM(nominal), 'FM999,999,999,999') as formatted_total
FROM transfer_bukti
WHERE nominal IS NOT NULL
GROUP BY group_name
ORDER BY total_nominal DESC;
```

### Transfer Hari Ini
```sql
SELECT 
  sender_name,
  group_name,
  nominal,
  'Rp ' || TO_CHAR(nominal, 'FM999,999,999,999') as formatted_nominal,
  created_at
FROM transfer_bukti
WHERE DATE(created_at) = CURRENT_DATE
  AND nominal IS NOT NULL
ORDER BY created_at DESC;
```

### Top 10 Transfer Terbesar
```sql
SELECT 
  sender_name,
  group_name,
  nominal,
  'Rp ' || TO_CHAR(nominal, 'FM999,999,999,999') as formatted_nominal,
  created_at
FROM transfer_bukti
WHERE nominal IS NOT NULL
ORDER BY nominal DESC
LIMIT 10;
```

### Transfer Tanpa Nominal (Perlu Review Manual)
```sql
SELECT 
  id,
  sender_name,
  group_name,
  message_text,
  extracted_text,
  created_at
FROM transfer_bukti
WHERE has_image = TRUE 
  AND nominal IS NULL
ORDER BY created_at DESC;
```

## Troubleshooting OCR

### Nominal Tidak Terdeteksi
1. Cek `extracted_text` di database untuk melihat text yang terbaca
2. Jika text terbaca tapi nominal tidak terdeteksi, tambahkan pattern baru di `ocrProcessor.js`
3. Jika text tidak terbaca sama sekali, kemungkinan gambar terlalu blur

### Nominal Salah
1. Cek apakah ada multiple nominal di gambar
2. Bot akan ambil nominal terbesar
3. Bisa customize logic di function `extractNominalFromText()`

### OCR Lambat
1. OCR membutuhkan waktu 5-15 detik per gambar
2. Ini normal untuk Tesseract.js
3. Untuk production, pertimbangkan:
   - Google Cloud Vision API
   - AWS Textract
   - Azure Computer Vision

## Customization

### Menambah Pattern Nominal Baru

Edit `utils/ocrProcessor.js`:

```javascript
const patterns = [
  /(?:RP|IDR|RUPIAH|NOMINAL|JUMLAH|TOTAL|AMOUNT)[\s:]*\.?\s*([\d.,]+)/gi,
  /(?:TRANSFER|BAYAR|PEMBAYARAN)[\s:]*\.?\s*(?:RP|IDR)?\s*([\d.,]+)/gi,
  // Tambahkan pattern baru di sini
  /PATTERN_ANDA[\s:]*([\d.,]+)/gi,
];
```

### Mengubah Range Nominal Valid

Edit `utils/ocrProcessor.js`:

```javascript
// Default: 1.000 - 999.999.999.999
if (amount >= 1000 && amount <= 999999999999) {
  foundAmounts.push(amount);
}

// Ubah sesuai kebutuhan, misal minimal 10.000
if (amount >= 10000 && amount <= 999999999999) {
  foundAmounts.push(amount);
}
```

## Performance

- **OCR Time**: 5-15 detik per gambar
- **Accuracy**: ~85-95% tergantung kualitas gambar
- **Memory**: ~100-200MB per proses OCR
- **CPU**: Intensive saat OCR berjalan

## Alternatif OCR (Untuk Production)

Jika perlu akurasi dan kecepatan lebih tinggi:

1. **Google Cloud Vision API**
   - Akurasi tinggi
   - Cepat (1-2 detik)
   - Berbayar ($1.50 per 1000 images)

2. **AWS Textract**
   - Khusus untuk dokumen finansial
   - Bisa extract structured data
   - Berbayar

3. **Azure Computer Vision**
   - Akurasi baik
   - Support banyak bahasa
   - Berbayar

Untuk implementasi API cloud, tinggal ganti function `extractTextFromImage()` di `ocrProcessor.js`.
