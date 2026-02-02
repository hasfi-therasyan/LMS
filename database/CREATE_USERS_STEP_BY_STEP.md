# Step-by-Step: Create Users di Database

## Data yang akan dimasukkan:

**ADMIN/DOSEN:**
- Email: `wiwik@unp.id`
- Password: `wr77hs20`
- Full Name: `Wiwik`
- Role: `admin`

**MAHASISWA:**
- Email: `hasfi@unp.id`
- Password: `hasfi123`
- Full Name: `Muhammad Hasfi Rasya`
- Role: `mahasiswa`

---

## STEP 1: Create Users di Supabase Auth

1. **Buka:** https://supabase.com/dashboard/project/ngxlniymmmmkijefhjbm/auth/users

2. **Create Admin User:**
   - Klik **"Add User"** → **"Create new user"**
   - **Email:** `wiwik@unp.id`
   - **Password:** `wr77hs20`
   - ✅ Centang **"Auto Confirm User"**
   - Klik **"Create User"**
   - **📋 COPY User ID** (UUID) yang muncul - contoh: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`

3. **Create Mahasiswa User:**
   - Klik **"Add User"** → **"Create new user"**
   - **Email:** `hasfi@unp.id`
   - **Password:** `hasfi123`
   - ✅ Centang **"Auto Confirm User"**
   - Klik **"Create User"**
   - **📋 COPY User ID** (UUID) yang muncul

---

## STEP 2: Insert ke Table Profiles

1. **Buka:** Supabase Dashboard → SQL Editor

2. **Copy script berikut dan GANTI UUID-nya:**

```sql
-- ADMIN/DOSEN: wiwik@unp.id
INSERT INTO public.profiles (id, email, full_name, role)
VALUES (
  'PASTE_ADMIN_UUID_DISINI',  -- ⚠️ GANTI dengan UUID dari Step 1
  'wiwik@unp.id',
  'Wiwik',
  'admin'
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role;

-- MAHASISWA: hasfi@unp.id
INSERT INTO public.profiles (id, email, full_name, role)
VALUES (
  'PASTE_MAHASISWA_UUID_DISINI',  -- ⚠️ GANTI dengan UUID dari Step 1
  'hasfi@unp.id',
  'Muhammad Hasfi Rasya',
  'mahasiswa'
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role;
```

3. **Replace:**
   - `PASTE_ADMIN_UUID_DISINI` → UUID dari user wiwik@unp.id
   - `PASTE_MAHASISWA_UUID_DISINI` → UUID dari user hasfi@unp.id

4. **Klik "Run"** (atau Ctrl+Enter)

---

## STEP 3: Verify

Jalankan query ini untuk memastikan users sudah dibuat:

```sql
SELECT id, email, full_name, role, created_at 
FROM public.profiles 
WHERE email IN ('wiwik@unp.id', 'hasfi@unp.id')
ORDER BY created_at;
```

Anda harus melihat 2 rows:
- ✅ wiwik@unp.id dengan role 'admin'
- ✅ hasfi@unp.id dengan role 'mahasiswa'

---

## Selesai! 🎉

Sekarang Anda bisa login:
- **Admin:** http://localhost:3000/login → wiwik@unp.id / wr77hs20
- **Mahasiswa:** http://localhost:3000/login → hasfi@unp.id / hasfi123
