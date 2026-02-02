# Fix: RLS Policies Still Blocking Mahasiswa Access

## Root Cause Diagnosis

Masalah dimulai dari **RLS (Row Level Security) policies di database** yang masih menggunakan enrollment check. Meskipun backend code sudah tidak check enrollment, RLS policies di Supabase masih aktif dan memblokir akses.

### Masalah yang Ditemukan:

1. **Policy "Mahasiswa can view enrolled classes"** di tabel `classes`
   - Masih check: `id IN (SELECT class_id FROM public.enrollments WHERE student_id = auth.uid())`
   - Ini memblokir mahasiswa yang tidak enrolled

2. **Policy "Mahasiswa can view modules in enrolled classes"** di tabel `modules`
   - Masih check: `class_id IN (SELECT class_id FROM public.enrollments WHERE student_id = auth.uid())`
   - Ini memblokir mahasiswa yang tidak enrolled

3. **Policy "Mahasiswa can view quizzes"** di tabel `quizzes`
   - Masih check enrollment melalui modules
   - Ini memblokir mahasiswa yang tidak enrolled

## Solution

### Option 1: Update RLS Policies (Recommended)

Jalankan SQL script di Supabase SQL Editor:

**File:** `database/REMOVE_ENROLLMENT_RLS_POLICIES.sql`

Script ini akan:
1. Drop policies lama yang menggunakan enrollment
2. Create policies baru yang allow semua mahasiswa
3. Optional: Drop enrollments table (jika diinginkan)

### Option 2: Drop Enrollments Table Completely

Jika Anda yakin tidak akan menggunakan enrollment lagi:

```sql
-- Drop all enrollment-related policies first
DROP POLICY IF EXISTS "Mahasiswa can view enrolled classes" ON public.classes;
DROP POLICY IF EXISTS "Mahasiswa can view modules in enrolled classes" ON public.modules;
DROP POLICY IF EXISTS "Mahasiswa can view quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Mahasiswa can view own enrollments" ON public.enrollments;

-- Drop the enrollments table
DROP TABLE IF EXISTS public.enrollments CASCADE;

-- Create new policies that allow all mahasiswa
CREATE POLICY "Mahasiswa can view all classes" ON public.classes
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'mahasiswa')
    );

CREATE POLICY "Mahasiswa can view all modules" ON public.modules
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'mahasiswa')
    );

CREATE POLICY "Mahasiswa can view all quizzes" ON public.quizzes
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'mahasiswa')
    );
```

## Step-by-Step Fix

### 1. Buka Supabase Dashboard
- Login ke https://supabase.com/dashboard
- Pilih project Anda

### 2. Buka SQL Editor
- Klik menu **SQL Editor** di sidebar
- Atau: `https://supabase.com/dashboard/project/YOUR_PROJECT_ID/sql/new`

### 3. Jalankan SQL Script
- Copy seluruh isi dari `database/REMOVE_ENROLLMENT_RLS_POLICIES.sql`
- Paste ke SQL Editor
- Klik **Run** atau tekan `Ctrl+Enter`

### 4. Verifikasi
- Cek apakah policies sudah ter-update
- Test dengan login sebagai mahasiswa
- Mahasiswa seharusnya bisa melihat semua jobsheets/quizzes

## Why This Happened

Backend menggunakan **service role key** yang bypass RLS, jadi backend code tidak terpengaruh. TAPI:

1. Jika ada query dari frontend yang langsung ke Supabase (menggunakan anon key), RLS akan berlaku
2. RLS policies masih aktif di database
3. Policies lama masih memblokir mahasiswa yang tidak enrolled

## After Fix

Setelah menjalankan SQL script:
- ✅ Mahasiswa bisa melihat semua classes/jobsheets
- ✅ Mahasiswa bisa melihat semua modules
- ✅ Mahasiswa bisa melihat semua quizzes
- ✅ Tidak perlu enrollment lagi
- ✅ Backend code sudah benar, sekarang database juga sudah benar

## Important Note

**Tidak perlu delete tabel enrollments secara manual** jika Anda tidak ingin. Tabel bisa tetap ada, tapi tidak akan digunakan lagi. Policies yang baru akan mengizinkan semua mahasiswa tanpa perlu enrollment.
