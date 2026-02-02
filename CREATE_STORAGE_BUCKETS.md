# Create Supabase Storage Buckets

## Required Storage Buckets

Untuk sistem LMS ini berfungsi dengan baik, Anda perlu membuat beberapa storage buckets di Supabase:

### 1. Bucket: `modules`
- **Digunakan untuk:** Module/Jobsheet PDF yang diupload oleh dosen
- **Status:** Sudah ada (dari setup sebelumnya)

### 2. Bucket: `jobsheets` ⚠️ **REQUIRED**
- **Digunakan untuk:** PDF jobsheet yang diupload saat create jobsheet
- **Status:** **BELUM ADA** - perlu dibuat sekarang

### 3. Bucket: `jobsheet-submissions`
- **Digunakan untuk:** PDF submission dari mahasiswa
- **Status:** **BELUM ADA** - perlu dibuat

## Cara Membuat Bucket

### Langkah-langkah:

1. **Buka Supabase Dashboard**
   - Login ke https://supabase.com/dashboard
   - Pilih project Anda

2. **Masuk ke Storage**
   - Klik menu **Storage** di sidebar kiri
   - Atau langsung ke: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/storage/buckets

3. **Create Bucket: `jobsheets`**
   - Klik tombol **"New bucket"** atau **"Create bucket"**
   - **Name:** `jobsheets`
   - **Public bucket:** ✅ **Centang** (atau configure RLS policies jika ingin lebih secure)
   - Klik **"Create bucket"**

4. **Create Bucket: `jobsheet-submissions`**
   - Klik tombol **"New bucket"** lagi
   - **Name:** `jobsheet-submissions`
   - **Public bucket:** ✅ **Centang** (atau configure RLS policies)
   - Klik **"Create bucket"**

## Verifikasi

Setelah membuat buckets, coba lagi:
1. Create jobsheet dengan upload PDF
2. Seharusnya tidak ada error "Bucket not found" lagi

## Catatan Keamanan

Jika Anda ingin lebih secure (tidak public):
1. Buat bucket sebagai **Private**
2. Configure RLS policies di Supabase untuk mengontrol akses
3. Update backend code untuk menggunakan signed URLs jika diperlukan

## Quick Setup Script (Manual)

Jika Anda ingin membuat bucket secara manual via SQL (tidak direkomendasikan, lebih baik via Dashboard):

```sql
-- Note: Creating buckets via SQL requires admin access
-- It's easier to create via Dashboard UI
```

**Rekomendasi:** Gunakan Dashboard UI untuk membuat buckets, lebih mudah dan aman.
