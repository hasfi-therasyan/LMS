# Quick Fix: Database RLS Policies

## Masalah
RLS policies di database masih menghubungkan mahasiswa dengan admin melalui enrollment, sehingga memblokir akses mahasiswa ke jobsheets/quizzes.

## Solusi Cepat

### Step 1: Buka Supabase SQL Editor
1. Login ke https://supabase.com/dashboard
2. Pilih project Anda
3. Klik **SQL Editor** di sidebar

### Step 2: Jalankan SQL Script
Copy dan paste seluruh isi dari file:
**`database/REMOVE_ENROLLMENT_RLS_POLICIES.sql`**

Klik **Run** atau tekan `Ctrl+Enter`

### Step 3: Verifikasi
Setelah script berhasil dijalankan, test:
1. Login sebagai mahasiswa
2. Seharusnya bisa melihat semua jobsheets
3. Seharusnya bisa melihat semua quizzes

## Apa yang Dilakukan Script?

1. **Drop policies lama** yang menggunakan enrollment:
   - "Mahasiswa can view enrolled classes"
   - "Mahasiswa can view modules in enrolled classes"
   - "Mahasiswa can view quizzes" (yang check enrollment)
   - "Mahasiswa can view quiz questions" (yang check enrollment)

2. **Create policies baru** yang allow semua mahasiswa:
   - "Mahasiswa can view all classes"
   - "Mahasiswa can view all modules"
   - "Mahasiswa can view all quizzes"
   - "Mahasiswa can view all quiz questions"

## Apakah Perlu Delete Tabel Enrollments?

**TIDAK PERLU** - Tabel enrollments bisa tetap ada, tidak akan digunakan lagi. Policies baru sudah tidak reference ke enrollments.

Jika ingin delete (optional), uncomment bagian di akhir script SQL.

## Setelah Fix

✅ Mahasiswa bisa akses semua jobsheets (tanpa enrollment)
✅ Mahasiswa bisa akses semua quizzes (tanpa enrollment)
✅ Mahasiswa bisa akses semua modules (tanpa enrollment)
✅ Tidak ada lagi hubungan enrollment antara mahasiswa dan admin
