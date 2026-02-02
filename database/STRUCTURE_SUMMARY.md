# Struktur Database - 2 Role System

## Role System

### 1. **admin** (Admin/Dosen)
- Semua fungsi admin dan dosen digabung
- Upload modules/jobsheet
- Create quizzes
- View student submissions & analytics
- Manage classes
- Create admin accounts
- Enroll mahasiswa

### 2. **mahasiswa** (Student)
- Self-register (sign up sendiri)
- View modules di enrolled classes
- Take quizzes
- View grades
- Chat with AI setelah quiz submission

## Struktur Database

### Table: `profiles`
```sql
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    email TEXT NOT NULL,
    full_name TEXT,
    role TEXT NOT NULL CHECK (role IN ('admin', 'mahasiswa')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Table: `classes`
```sql
CREATE TABLE public.classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    description TEXT,
    admin_id UUID REFERENCES public.profiles(id),  -- Changed from lecturer_id
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Table: `enrollments`
```sql
CREATE TABLE public.enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.profiles(id),  -- References mahasiswa
    class_id UUID REFERENCES public.classes(id),
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, class_id)
);
```

## Relasi Database

```
profiles (role: 'admin' atau 'mahasiswa')
  ├── classes (admin_id) - jika role = 'admin'
  ├── enrollments (student_id) - jika role = 'mahasiswa'
  ├── modules (uploaded_by) - jika role = 'admin'
  └── quizzes (created_by) - jika role = 'admin'

classes
  ├── modules (class_id)
  └── enrollments (class_id)

modules
  └── quizzes (module_id)

quizzes
  ├── quiz_questions (quiz_id)
  └── quiz_submissions (quiz_id)

quiz_submissions
  ├── quiz_answers (submission_id)
  └── ai_chat_sessions (submission_id)
```

## Perbedaan dengan Sistem Lama

| Aspek | Sebelumnya (3 Role) | Sekarang (2 Role) |
|-------|-------------------|-------------------|
| Role | admin, lecturer, student | admin, mahasiswa |
| Classes owner | lecturer_id | admin_id |
| Self-register | student | mahasiswa |
| Admin functions | Full access | Full access + dosen functions |
| Lecturer functions | Manage classes, upload, create quiz | Digabung ke admin |

## Setup Database

1. Jalankan `database/schema.sql` di Supabase SQL Editor
2. Pastikan semua tabel dibuat dengan benar
3. Pastikan RLS policies aktif
4. Test dengan membuat user admin dan mahasiswa
