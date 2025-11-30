# WhatsApp Transfer Bot - Supabase Integration

Bot WhatsApp yang otomatis mencatat bukti transfer dan form pengajuan dari grup WhatsApp ke database Supabase.

## 🔗 Quick Links

- **[🚀 Quick Start Guide](QUICK-START.md)** - Setup bot dalam 5 menit
- **[📋 Form Guide](FORM-GUIDE.md)** - Panduan lengkap form pengajuan A1/A2/A3
- **[🤖 OCR Guide](OCR-GUIDE.md)** - Panduan OCR & extract nominal
- **[📝 Template Form](template-form.txt)** - Template form untuk copy paste

## 🚀 Fitur

### Bukti Transfer
- ✅ Deteksi otomatis pesan bukti transfer berdasarkan keyword
- 📸 Menyimpan gambar bukti transfer
- 🤖 **OCR (Optical Character Recognition)** - Membaca text dari gambar
- 💰 **Extract Nominal** - Otomatis mendeteksi nominal transfer dari gambar
- 🔔 Auto-reply konfirmasi dengan nominal terdeteksi

### Form Pengajuan
- 📋 **Form Pengajuan A1** - Form pengajuan dengan data usaha
- 📋 **Form Pengajuan A2** - Form pengajuan dengan jaminan BPKB
- 📋 **Form Pengajuan A3** - Form pengajuan sederhana
- 🤖 **Auto-parse** - Extract otomatis semua field dari form
- 💾 Simpan data ke Supabase secara real-time
- 👥 Support untuk multiple grup WhatsApp

## 📋 Prerequisites

- Node.js v18 atau lebih tinggi
- Akun Supabase (gratis)
- WhatsApp aktif untuk scan QR code

## 🛠️ Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Supabase

1. Buat akun di [Supabase](https://supabase.com)
2. Buat project baru
3. Buat tabel `transfer_bukti` dengan struktur berikut:

```sql
CREATE TABLE transfer_bukti (
  id BIGSERIAL PRIMARY KEY,
  sender_name TEXT NOT NULL,
  sender_number TEXT NOT NULL,
  group_name TEXT NOT NULL,
  group_id TEXT NOT NULL,
  message_text TEXT,
  has_image BOOLEAN DEFAULT FALSE,
  image_url TEXT,
  nominal BIGINT,
  extracted_text TEXT,
  timestamp BIGINT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index untuk performa lebih baik
CREATE INDEX idx_sender_number ON transfer_bukti(sender_number);
CREATE INDEX idx_group_id ON transfer_bukti(group_id);
CREATE INDEX idx_created_at ON transfer_bukti(created_at DESC);
CREATE INDEX idx_nominal ON transfer_bukti(nominal);
```

4. Copy URL dan Anon Key dari Settings > API

### 3. Konfigurasi Environment

1. Copy file `.env.example` menjadi `.env`:

```bash
cp .env.example .env
```

2. Edit file `.env` dan isi dengan kredensial Supabase:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key-here
```

### 4. Jalankan Bot

```bash
npm start
```

Atau untuk development dengan auto-reload:

```bash
npm run dev
```

### 5. Scan QR Code

- QR code akan muncul di terminal
- Scan dengan WhatsApp di HP
- Tunggu sampai muncul pesan "✅ Bot WhatsApp siap!"

## 📱 Cara Kerja

Bot akan otomatis mendeteksi pesan yang mengandung keyword berikut:

- "bukti transfer"
- "bukti tf"
- "transfer"
- "pembayaran"
- "bayar"
- "sudah transfer"
- "sudah bayar"
- "tf"
- "lunas"

Atau pesan yang memiliki gambar/media.

Setiap kali terdeteksi, bot akan:

1. Mengunduh gambar (jika ada)
2. Membaca text dari gambar menggunakan OCR (Tesseract.js)
3. Extract nominal transfer dari text yang terbaca
4. Menyimpan data lengkap ke Supabase
5. Mengirim reply konfirmasi dengan nominal terdeteksi

## Struktur Data di Supabase

| Field         | Type      | Deskripsi                   |
| ------------- | --------- | --------------------------- |
| id            | BIGSERIAL | Primary key auto-increment  |
| sender_name   | TEXT      | Nama pengirim dari WhatsApp |
| sender_number | TEXT      | Nomor WhatsApp pengirim     |
| group_name    | TEXT      | Nama grup WhatsApp          |
| group_id      | TEXT      | ID unik grup                |
| message_text  | TEXT      | Isi pesan                   |
| has_image     | BOOLEAN   | Apakah ada gambar           |
| image_url     | TEXT      | Base64 data gambar          |
| nominal       | BIGINT    | Nominal transfer (hasil OCR) |
| extracted_text| TEXT      | Text lengkap dari OCR       |
| timestamp     | BIGINT    | Unix timestamp pesan        |
| created_at    | TIMESTAMP | Waktu data disimpan         |

## Kustomisasi

### Menambah Keyword Deteksi

Edit file `utils/messageHandler.js`, tambahkan keyword di array `transferKeywords`:

```javascript
const transferKeywords = [
  "bukti transfer",
  "keyword baru anda",
  // tambahkan keyword lain
];
```

### Mengubah Pesan Reply

Edit file `index.js` pada bagian:

```javascript
await message.reply("✅ Bukti transfer telah dicatat. Terima kasih!");
```

## 📁 Struktur Project

```
whatsapp-transfer-bot/
├── config/
│   └── supabase.js          # Konfigurasi Supabase
├── utils/
│   ├── messageHandler.js    # Handler pesan dan database
│   ├── ocrProcessor.js      # OCR dan extract nominal
│   └── formParser.js        # Parser form pengajuan
├── index.js                 # Main bot file
├── package.json
├── supabase-schema.sql      # Schema bukti transfer
├── form-schema.sql          # Schema form pengajuan
├── .env.example
├── .gitignore
├── README.md
├── OCR-GUIDE.md             # Panduan OCR
└── FORM-GUIDE.md            # Panduan Form
```

## ⚠️ Catatan Penting

1. **Session WhatsApp**: Setelah scan QR pertama kali, session akan disimpan di folder `.wwebjs_auth/`. Jangan hapus folder ini agar tidak perlu scan ulang.

2. **Gambar**: Gambar disimpan dalam format base64 di database. Untuk production, disarankan upload ke storage (Supabase Storage) dan simpan URL-nya saja.

3. **Rate Limiting**: WhatsApp memiliki rate limit. Jangan spam atau gunakan bot untuk hal yang melanggar TOS WhatsApp.

4. **Security**: Jangan commit file `.env` ke git. API key harus dijaga kerahasiaannya.

## 🐛 Troubleshooting

### Bot tidak bisa connect

- Pastikan Node.js versi 18+
- Coba hapus folder `.wwebjs_auth/` dan scan ulang
- Pastikan tidak ada WhatsApp Web lain yang aktif

### Error Supabase

- Cek kredensial di `.env`
- Pastikan tabel sudah dibuat dengan struktur yang benar
- Cek RLS (Row Level Security) di Supabase, disable untuk testing

### Gambar tidak tersimpan

- Pastikan kolom `image_url` di database bertipe TEXT (bukan VARCHAR)
- Untuk gambar besar, pertimbangkan upload ke storage terpisah

## 📝 License

MIT

## 🤝 Support

Jika ada pertanyaan atau issue, silakan buat issue di repository ini.
