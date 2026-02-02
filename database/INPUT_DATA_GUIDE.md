# Panduan Input Data ke Database

## Field Requirements

### 1. ADMIN (Admin/Dosen)

#### Di Supabase Auth (Authentication → Users):
- **Email** (required) - contoh: `admin@university.ac.id`
- **Password** (required) - minimal 6 karakter
- **Email Confirmed** - bisa langsung set ke `true` atau biarkan user verify sendiri

#### Di Table `profiles` (setelah user dibuat di Auth):
- **id** (UUID) - Copy dari `auth.users.id` setelah user dibuat
- **email** (TEXT, required) - Sama dengan email di Auth
- **full_name** (TEXT, optional) - contoh: `Dr. John Doe`
- **role** (TEXT, required) - Harus: `'admin'`

### 2. MAHASISWA (Student)

#### Via Frontend (Self-Register):
Mahasiswa bisa sign up sendiri di frontend, field yang diperlukan:
- **Email** (required)
- **Password** (required, minimal 6 karakter)
- **Full Name** (required)

Sistem akan otomatis:
1. Create user di Supabase Auth
2. Create profile dengan role `'mahasiswa'`

#### Manual via Supabase (jika perlu):
- **Email** (required)
- **Password** (required)
- **Full Name** (optional)
- **role** = `'mahasiswa'`

## Cara Input Data

### Method 1: Via Supabase Dashboard (Manual)

#### Step 1: Create Admin User

1. **Buka Supabase Dashboard → Authentication → Users**
2. **Klik "Add User" → "Create new user"**
3. **Isi:**
   - Email: `admin@university.ac.id`
   - Password: `your_secure_password`
   - Auto Confirm User: ✅ (centang)
4. **Klik "Create User"**
5. **Copy User ID** (UUID) yang muncul

6. **Buka SQL Editor**, jalankan:
```sql
INSERT INTO public.profiles (id, email, full_name, role)
VALUES (
  'PASTE_USER_ID_DARI_AUTH_DISINI',
  'admin@university.ac.id',
  'Admin User',
  'admin'
);
```

#### Step 2: Create Mahasiswa (Manual - Optional)

Jika ingin create manual (biasanya via frontend):

1. **Create user di Auth** (sama seperti admin)
2. **Insert ke profiles:**
```sql
INSERT INTO public.profiles (id, email, full_name, role)
VALUES (
  'PASTE_USER_ID_DARI_AUTH_DISINI',
  'mahasiswa@student.ac.id',
  'Nama Mahasiswa',
  'mahasiswa'
);
```

### Method 2: Via Frontend (Recommended untuk Mahasiswa)

1. **Login sebagai admin** (yang sudah dibuat di Method 1)
2. **Buka Admin Dashboard**
3. **Klik "Create Admin/Dosen"** untuk membuat admin baru
4. **Atau biarkan mahasiswa sign up sendiri** di halaman login

### Method 3: Via API (Programmatic)

#### Create Admin:
```bash
POST /api/auth/create-admin
Headers: Authorization: Bearer <admin_token>
Body: {
  "userId": "<uuid-dari-supabase-auth>",
  "email": "admin@example.com",
  "fullName": "Admin Name"
}
```

## Field Summary Table

| Field | Admin | Mahasiswa | Required | Notes |
|-------|-------|-----------|----------|-------|
| **Auth Users** |
| email | ✅ | ✅ | Yes | Must be unique |
| password | ✅ | ✅ | Yes | Min 6 chars |
| **Profiles Table** |
| id | ✅ | ✅ | Yes | UUID from auth.users |
| email | ✅ | ✅ | Yes | Same as auth email |
| full_name | ⚠️ | ⚠️ | Optional | Recommended to fill |
| role | ✅ | ✅ | Yes | 'admin' or 'mahasiswa' |
| created_at | ✅ | ✅ | Auto | Timestamp |
| updated_at | ✅ | ✅ | Auto | Timestamp |

## Quick Start Script

Jalankan ini di SQL Editor setelah membuat user di Auth:

```sql
-- Replace dengan User ID dari Supabase Auth
-- Untuk Admin
INSERT INTO public.profiles (id, email, full_name, role)
VALUES (
  'YOUR_ADMIN_USER_ID_HERE',
  'admin@university.ac.id',
  'Admin User',
  'admin'
);

-- Untuk Mahasiswa (jika manual)
INSERT INTO public.profiles (id, email, full_name, role)
VALUES (
  'YOUR_MAHASISWA_USER_ID_HERE',
  'mahasiswa@student.ac.id',
  'Nama Mahasiswa',
  'mahasiswa'
);
```

## Next Steps After Creating Users

1. **Create Class** (via Admin Dashboard atau SQL):
```sql
INSERT INTO public.classes (name, code, description, admin_id)
VALUES (
  'Introduction to Computer Science',
  'CS101',
  'Basic computer science course',
  'YOUR_ADMIN_USER_ID_HERE'
);
```

2. **Enroll Mahasiswa** (via Admin Dashboard atau SQL):
```sql
INSERT INTO public.enrollments (student_id, class_id)
VALUES (
  'YOUR_MAHASISWA_USER_ID_HERE',
  'YOUR_CLASS_ID_HERE'
);
```

## Testing Checklist

- [ ] Admin user created in Auth
- [ ] Admin profile created in database
- [ ] Can login as admin
- [ ] Mahasiswa can sign up via frontend
- [ ] Mahasiswa profile auto-created
- [ ] Can login as mahasiswa
