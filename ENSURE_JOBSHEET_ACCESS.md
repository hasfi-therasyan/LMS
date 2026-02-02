# Memastikan Mahasiswa Bisa Melihat Jobsheet PDF

## Status Saat Ini

✅ **Backend sudah benar:**
- Route `/api/jobsheet` memfilter jobsheets berdasarkan enrollment
- Route `/api/jobsheet/:id` memeriksa enrollment sebelum mengizinkan akses
- File URL disimpan sebagai **public URL** menggunakan `getPublicUrl()`

✅ **Frontend sudah benar:**
- Student dashboard menampilkan jobsheets yang enrolled
- Card jobsheet bisa diklik untuk melihat PDF
- PDF viewer menggunakan iframe dengan public URL

## Yang Perlu Dipastikan

### 1. Storage Bucket `jobsheets` Harus Public

**Cara memastikan:**
1. Buka Supabase Dashboard → Storage
2. Cari bucket `jobsheets`
3. Pastikan **Public bucket** sudah diaktifkan (centang)
4. Jika belum, klik bucket → Settings → Enable "Public bucket"

### 2. Mahasiswa Harus Di-Enroll ke Jobsheet

**Cara enroll mahasiswa:**
1. Login sebagai Admin
2. Buka Admin Dashboard → Users section
3. Pilih mahasiswa yang ingin di-enroll
4. Klik "Enroll" dan pilih jobsheet/class
5. Atau gunakan API/script untuk enroll

### 3. Verifikasi File URL

File URL yang disimpan di database harus berbentuk:
```
https://[PROJECT_ID].supabase.co/storage/v1/object/public/jobsheets/[file_path]
```

Jika URL tidak mengandung `/public/`, file tidak bisa diakses oleh mahasiswa.

## Testing Checklist

- [ ] Storage bucket `jobsheets` sudah public
- [ ] Mahasiswa sudah di-enroll ke jobsheet
- [ ] File URL di database adalah public URL
- [ ] Frontend bisa menampilkan jobsheet di dashboard
- [ ] Klik jobsheet card membuka PDF viewer
- [ ] PDF bisa di-download

## Troubleshooting

### Problem: Mahasiswa tidak melihat jobsheet di dashboard
**Solusi:**
- Pastikan mahasiswa sudah di-enroll ke jobsheet/class
- Cek console browser untuk error
- Cek backend logs untuk error API

### Problem: PDF tidak bisa dibuka
**Solusi:**
- Pastikan storage bucket `jobsheets` adalah public
- Cek file URL di database (harus mengandung `/public/`)
- Cek browser console untuk CORS atau access errors

### Problem: Error "Forbidden" saat akses jobsheet
**Solusi:**
- Pastikan mahasiswa sudah enrolled
- Cek enrollment di database: `SELECT * FROM enrollments WHERE student_id = '[mahasiswa_id]'`
- Pastikan `class_id` di enrollment sesuai dengan jobsheet yang diakses
