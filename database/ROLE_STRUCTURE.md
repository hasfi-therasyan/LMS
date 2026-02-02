# Struktur Role Database - 2 Role System

## Role yang Tersedia

### 1. **admin** (Admin/Dosen)
- Bisa melakukan semua fungsi admin dan dosen
- Upload modules/jobsheet
- Create quizzes
- View student submissions
- Manage classes
- Create user accounts
- Enroll students

### 2. **mahasiswa** (Student)
- Self-register (sign up sendiri)
- View modules di enrolled classes
- Take quizzes
- View grades
- Chat with AI setelah quiz submission

## Struktur Database

### Table: `profiles`
```sql
role TEXT NOT NULL CHECK (role IN ('admin', 'mahasiswa'))
```

### Table: `classes`
```sql
admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL
```
- Field `lecturer_id` diubah menjadi `admin_id`
- Admin/dosen yang memiliki class

### Table: `enrollments`
```sql
student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE
```
- Tetap menggunakan `student_id` (referensi ke mahasiswa)

## Perubahan dari Sistem Lama

### Sebelumnya (3 Role):
- `admin` - Full system access
- `lecturer` - Manage classes, upload modules, create quizzes
- `student` - Take quizzes, view modules

### Sekarang (2 Role):
- `admin` - Semua fungsi admin + dosen (gabungan)
- `mahasiswa` - Semua fungsi student

## Migration Notes

Jika sudah ada data dengan role lama:
1. Update semua `lecturer` menjadi `admin`
2. Update semua `student` menjadi `mahasiswa`
3. Update field `lecturer_id` menjadi `admin_id` di table `classes`

```sql
-- Migration script (jika perlu)
UPDATE public.profiles SET role = 'admin' WHERE role = 'lecturer';
UPDATE public.profiles SET role = 'mahasiswa' WHERE role = 'student';
ALTER TABLE public.classes RENAME COLUMN lecturer_id TO admin_id;
```
