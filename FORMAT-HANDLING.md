# 📝 Format Handling - Bot WhatsApp

## ✅ **Format yang Didukung**

Bot sekarang lebih **flexible** dan bisa handle berbagai variasi format!

### **Keyword yang Diterima:**

#### Form A1:
- ✅ `Form Pengajuan A1`
- ✅ `Form A1`
- ✅ `Pengajuan A1`
- ✅ `Formulir A1`
- ✅ `Form  Pengajuan  A  1` (extra spasi OK)
- ✅ `FORM PENGAJUAN A1` (case insensitive)

#### Form A2:
- ✅ `Form Pengajuan A2`
- ✅ `Form A2`
- ✅ `Pengajuan A2`
- ✅ `Formulir A2`

#### Form A3:
- ✅ `Form Pengajuan A3`
- ✅ `Form A3`
- ✅ `Pengajuan A3`
- ✅ `Formulir A3`

---

## ⚠️ **Kalau Format Field Salah**

### **Skenario 1: Field Tidak Lengkap**

**Input:**
```
Form Pengajuan A1

Nama: Test User
Plafon: 50 juta  ❌ (harusnya "Plafon Pengajuan")
```

**Output Bot:**
```
✅ Form Pengajuan A1 berhasil dicatat!

📋 *Form Pengajuan A1*
👤 Nama: Test User

🚨 *Peringatan:*
⚠️ Plafon Pengajuan tidak terdeteksi (gunakan format: Plafon Pengajuan: Rp 50.000.000)

📝 Gunakan template yang benar untuk hasil optimal. Ketik "template A1" untuk melihat contoh.
```

**Database:**
- Data tetap disimpan
- Field yang tidak terdeteksi akan `NULL`
- Bisa diperbaiki manual di Supabase

---

### **Skenario 2: Keyword Tidak Ada**

**Input:**
```
Pengajuan Pinjaman  ❌

Nama: Test User
Plafon: 50 juta
```

**Output Bot:**
- Bot **TIDAK** respond
- Pesan di-ignore

**Solusi:**
- Harus ada keyword: `Form Pengajuan A1/A2/A3`

---

### **Skenario 3: Typo di Keyword**

**Input:**
```
Form Pengajuaan A1  ❌ (typo)
```

**Output Bot:**
- Bot **TIDAK** respond
- Pesan di-ignore

**Solusi:**
- Gunakan keyword yang benar
- Atau ketik `template A1` untuk minta template

---

## 🆘 **Command Helper**

### **Minta Template:**

Ketik di grup:
```
template A1
```

Bot akan reply:
```
📋 *Template Form Pengajuan A1*

Form Pengajuan A1

Tanggal: DD-MM-YYYY
Nama: [Nama Lengkap]
Usaha: [Jenis Usaha]
Plafon Pengajuan: Rp [Nominal]
Tenor: [Tenor dalam bulan]
Nomor Telepon: [Nomor HP]
Nama dan nomor HP pasangan: [Nama] / [Nomor]
Bank/Nomor Rekening/Atas Nama: [Bank] / [Nomor] / [Nama]
```

**Command yang tersedia:**
- `template A1` - Template form A1
- `template A2` - Template form A2
- `template A3` - Template form A3

---

## 📊 **Field Validation**

Bot akan validasi field penting:

### **Form A1 & A2:**
- ✅ Nama (wajib)
- ✅ Plafon Pengajuan (wajib)
- ✅ Tenor (wajib)

### **Form A3:**
- ✅ Nama (wajib)
- ✅ Plafon Pengajuan (wajib)

**Kalau field tidak terdeteksi:**
- Bot tetap simpan data
- Kasih warning di reply
- Suggest untuk pakai template

---

## 💡 **Best Practices**

### ✅ **DO:**
1. Gunakan keyword yang benar: `Form Pengajuan A1`
2. Gunakan nama field yang sesuai: `Plafon Pengajuan:` bukan `Plafon:`
3. Format nominal: `Rp 50.000.000` atau `50000000`
4. Ketik `template A1` kalau lupa format

### ❌ **DON'T:**
1. Ubah nama field (Nama:, Tanggal:, dll)
2. Hapus keyword `Form Pengajuan`
3. Kirim di private chat (harus di grup)
4. Typo di keyword utama

---

## 🔧 **Troubleshooting**

### **Q: Bot tidak respond?**
**A:** 
- Pastikan ada keyword `Form Pengajuan A1/A2/A3`
- Kirim di **GRUP** (bukan private)
- Cek terminal ada output `[DEBUG]`

### **Q: Field tidak terdeteksi?**
**A:**
- Gunakan nama field yang benar
- Format: `Nama Field: Nilai`
- Ketik `template A1` untuk minta contoh

### **Q: Nominal tidak terbaca?**
**A:**
- Gunakan format: `Plafon Pengajuan: Rp 50.000.000`
- Bukan: `Plafon: 50 juta`

### **Q: Data salah tersimpan?**
**A:**
- Edit manual di Supabase Table Editor
- Atau kirim ulang dengan format yang benar

---

## 📈 **Contoh Lengkap**

### **Format BENAR ✅**

```
Form Pengajuan A1

Tanggal: 30-11-2024
Nama: Budi Santoso
Usaha: Warung Makan
Plafon Pengajuan: Rp 75.000.000
Tenor: 18 bulan
Nomor Telepon: 081234567890
Nama dan nomor HP pasangan: Siti Nurhaliza / 081234567891
Bank/Nomor Rekening/Atas Nama: BCA / 1234567890 / Budi Santoso
```

**Result:** ✅ Semua field terdeteksi, tidak ada warning

---

### **Format KURANG LENGKAP ⚠️**

```
Form A1

Nama: Budi Santoso
Plafon: 75 juta
```

**Result:** ⚠️ Data tersimpan tapi ada warning untuk field yang tidak terdeteksi

---

### **Format SALAH ❌**

```
Pengajuan Pinjaman

Nama: Budi Santoso
Plafon: 75 juta
```

**Result:** ❌ Bot tidak respond (tidak ada keyword yang benar)

---

## 🎯 **Summary**

| Aspek | Status | Keterangan |
|-------|--------|------------|
| **Flexible Keyword** | ✅ | Support berbagai variasi |
| **Typo Tolerance** | ⚠️ | Spasi extra OK, typo huruf tidak |
| **Field Validation** | ✅ | Kasih warning kalau field salah |
| **Template Helper** | ✅ | Ketik `template A1/A2/A3` |
| **Partial Data** | ✅ | Tetap simpan meski tidak lengkap |
| **Auto-suggest** | ✅ | Kasih saran kalau format salah |

---

**Kesimpulan:** Bot sekarang lebih **user-friendly** dan bisa handle format yang tidak sempurna! 🎉
