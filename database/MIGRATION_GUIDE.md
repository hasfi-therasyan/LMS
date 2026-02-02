# Database Migration Guide

## Problem: Tables Already Exist

Jika Anda sudah menjalankan schema sebelumnya dan mendapat error "relation already exists", gunakan salah satu solusi berikut:

## Solusi 1: Drop All Tables (Fresh Start) - RECOMMENDED

**Gunakan jika:** Anda belum punya data penting atau ingin start fresh

1. Buka Supabase Dashboard → SQL Editor
2. Copy dan jalankan file `database/drop_all_tables.sql`
3. Setelah itu, jalankan file `database/schema_fresh.sql`

**ATAU** langsung jalankan `database/schema_fresh.sql` yang sudah include DROP statements di awal.

## Solusi 2: Manual Drop via Supabase Dashboard

1. Buka Supabase Dashboard → Table Editor
2. Hapus tabel satu per satu (mulai dari yang paling dependen):
   - ai_chat_messages
   - ai_chat_sessions
   - quiz_answers
   - quiz_submissions
   - quiz_questions
   - quizzes
   - modules
   - enrollments
   - classes
   - profiles
3. Setelah semua terhapus, jalankan `database/schema.sql` yang baru

## Solusi 3: Update Existing Schema (Jika ada data penting)

Jika Anda sudah punya data dan tidak ingin kehilangan:

1. Backup data dulu (export via Supabase Dashboard)
2. Jalankan migration script untuk update:
   - Update role: `lecturer` → `admin`, `student` → `mahasiswa`
   - Rename column: `lecturer_id` → `admin_id` di table `classes`
3. Update policies yang berubah

## Recommended: Use schema_fresh.sql

File `database/schema_fresh.sql` sudah include:
- ✅ DROP semua tabel yang ada (dengan CASCADE)
- ✅ CREATE semua tabel baru
- ✅ Setup RLS policies
- ✅ Create indexes
- ✅ Create functions & triggers

**Cara pakai:**
1. Copy seluruh isi `database/schema_fresh.sql`
2. Paste di Supabase SQL Editor
3. Klik Run
4. Selesai! ✅

## Verifikasi

Setelah menjalankan schema, verifikasi di Table Editor:
- ✅ profiles
- ✅ classes
- ✅ enrollments
- ✅ modules
- ✅ quizzes
- ✅ quiz_questions
- ✅ quiz_submissions
- ✅ quiz_answers
- ✅ ai_chat_sessions
- ✅ ai_chat_messages

## Catatan

- **DROP CASCADE** akan menghapus semua data yang ada
- Pastikan backup data jika penting
- Setelah schema baru, buat user admin pertama via Supabase Auth + update profile
