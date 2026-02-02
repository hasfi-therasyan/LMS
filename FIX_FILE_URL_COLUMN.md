# Fix: 'file_url' column not found in 'classes' table

## Problem
Error: `Could not find the 'file_url' column of 'classes' in the schema cache`

## Solution

### Step 1: Run SQL Migration

1. **Buka Supabase Dashboard**
   - Login ke https://supabase.com/dashboard
   - Pilih project Anda

2. **Buka SQL Editor**
   - Klik menu **SQL Editor** di sidebar kiri
   - Atau langsung ke: `https://supabase.com/dashboard/project/YOUR_PROJECT_ID/sql/new`

3. **Jalankan SQL Migration**
   - Copy seluruh isi dari file: `database/add_file_url_to_classes_complete.sql`
   - Paste ke SQL Editor
   - Klik **Run** atau tekan `Ctrl+Enter`

4. **Verifikasi**
   - Setelah run, cek hasil query di bagian bawah
   - Seharusnya ada 1 row yang menunjukkan kolom `file_url` dengan type `text`

### Step 2: Refresh Schema Cache (Jika perlu)

Jika masih error setelah menambahkan kolom:

1. **Via Supabase Dashboard:**
   - Go to **Settings** → **API**
   - Scroll down dan klik **"Refresh schema cache"** (jika ada)
   - Atau restart backend server

2. **Via Backend:**
   - Stop backend server (Ctrl+C)
   - Start lagi: `npm run dev`

### Step 3: Verify Column Exists

Jalankan query ini di SQL Editor untuk memastikan kolom sudah ada:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'classes'
  AND column_name = 'file_url';
```

Jika query mengembalikan 1 row, berarti kolom sudah berhasil ditambahkan!

## Quick Fix SQL

Jika Anda ingin langsung menambahkan kolom tanpa verifikasi:

```sql
ALTER TABLE public.classes 
ADD COLUMN IF NOT EXISTS file_url TEXT;
```

## After Fix

Setelah kolom ditambahkan:
1. Restart backend server
2. Coba lagi create jobsheet
3. Seharusnya tidak ada error lagi
