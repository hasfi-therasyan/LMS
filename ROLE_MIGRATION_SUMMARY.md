# Summary: Migrasi dari 3 Role ke 2 Role

## Perubahan Role

### Sebelumnya:
- `admin` - Full system access
- `lecturer` - Manage classes, upload modules, create quizzes  
- `student` - Take quizzes, view modules

### Sekarang:
- `admin` - Semua fungsi admin + dosen (gabungan)
- `mahasiswa` - Semua fungsi student

## Perubahan Database

### Table `profiles`
```sql
-- SEBELUM
role TEXT NOT NULL CHECK (role IN ('admin', 'lecturer', 'student'))

-- SEKARANG
role TEXT NOT NULL CHECK (role IN ('admin', 'mahasiswa'))
```

### Table `classes`
```sql
-- SEBELUM
lecturer_id UUID REFERENCES public.profiles(id)

-- SEKARANG
admin_id UUID REFERENCES public.profiles(id)
```

## Perubahan Backend

### Routes yang diupdate:
1. ✅ `auth.ts` - `/create-lecturer` → `/create-admin`
2. ✅ `modules.ts` - Role check: `['admin', 'lecturer']` → `'admin'`
3. ✅ `quizzes.ts` - Role check: `['admin', 'lecturer']` → `'admin'`
4. ✅ `quizzes.ts` - Submit: `'student'` → `'mahasiswa'`
5. ✅ `ai.ts` - All routes: `'student'` → `'mahasiswa'`
6. ✅ `submissions.ts` - Role check: `['admin', 'lecturer']` → `'admin'`
7. ✅ `submissions.ts` - Student route: `'student'` → `'mahasiswa'`
8. ✅ `classes.ts` - Role check: `['admin', 'lecturer']` → `'admin'`
9. ✅ `classes.ts` - Field: `lecturer_id` → `admin_id`
10. ✅ `admin.ts` - Check: `'student'` → `'mahasiswa'`

### Middleware
- ✅ `auth.ts` - Type definition: `'admin' | 'lecturer' | 'student'` → `'admin' | 'mahasiswa'`

## Perubahan Frontend (Perlu dilakukan)

### Files yang perlu diupdate:
1. `frontend/src/store/authStore.ts` - Type definition
2. `frontend/src/app/login/page.tsx` - Sign up role
3. `frontend/src/app/admin/page.tsx` - Role checks
4. `frontend/src/app/lecturer/page.tsx` - Rename atau merge dengan admin
5. `frontend/src/app/student/page.tsx` - Role check: `'student'` → `'mahasiswa'`
6. `frontend/src/components/CreateLecturerModal.tsx` - Rename ke CreateAdminModal
7. `frontend/src/lib/api.ts` - API calls update

## Migration Script (jika sudah ada data)

```sql
-- Update existing roles
UPDATE public.profiles SET role = 'admin' WHERE role = 'lecturer';
UPDATE public.profiles SET role = 'mahasiswa' WHERE role = 'student';

-- Rename column (jika tabel sudah ada)
ALTER TABLE public.classes RENAME COLUMN lecturer_id TO admin_id;
```

## Testing Checklist

- [ ] Database schema berhasil dijalankan
- [ ] Admin bisa login dan akses semua fitur
- [ ] Mahasiswa bisa sign up sendiri
- [ ] Mahasiswa bisa view modules
- [ ] Mahasiswa bisa take quizzes
- [ ] Admin bisa upload modules
- [ ] Admin bisa create quizzes
- [ ] Admin bisa view submissions
- [ ] AI chatbot muncul untuk mahasiswa setelah quiz submission
