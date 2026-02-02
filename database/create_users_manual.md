# Cara Manual: Create Users di Database

## Step-by-Step Instructions

### Step 1: Create Users di Supabase Auth

1. **Buka Supabase Dashboard**
   - URL: https://supabase.com/dashboard/project/ngxlniymmmmkijefhjbm

2. **Go to Authentication → Users**

3. **Create Admin User:**
   - Klik "Add User" → "Create new user"
   - Email: `wiwik@unp.id`
   - Password: `wr77hs20`
   - Auto Confirm User: ✅ (centang)
   - Klik "Create User"
   - **Copy User ID** (UUID) yang muncul - simpan untuk Step 2

4. **Create Mahasiswa User:**
   - Klik "Add User" → "Create new user"
   - Email: `hasfi@unp.id`
   - Password: `hasfi123`
   - Auto Confirm User: ✅ (centang)
   - Klik "Create User"
   - **Copy User ID** (UUID) yang muncul - simpan untuk Step 2

### Step 2: Insert ke Table Profiles

1. **Buka SQL Editor** di Supabase Dashboard

2. **Copy script berikut dan ganti UUID-nya:**

```sql
-- ADMIN/DOSEN
INSERT INTO public.profiles (id, email, full_name, role)
VALUES (
  'PASTE_ADMIN_USER_ID_DISINI',  -- UUID dari Step 1
  'wiwik@unp.id',
  'Wiwik',
  'admin'
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role;

-- MAHASISWA
INSERT INTO public.profiles (id, email, full_name, role)
VALUES (
  'PASTE_MAHASISWA_USER_ID_DISINI',  -- UUID dari Step 1
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
   - `PASTE_ADMIN_USER_ID_DISINI` → UUID dari user wiwik@unp.id
   - `PASTE_MAHASISWA_USER_ID_DISINI` → UUID dari user hasfi@unp.id

4. **Klik Run**

### Step 3: Verify

Jalankan query ini untuk verify:

```sql
SELECT id, email, full_name, role, created_at 
FROM public.profiles 
ORDER BY created_at;
```

Anda harus melihat:
- wiwik@unp.id dengan role 'admin'
- hasfi@unp.id dengan role 'mahasiswa'

## Quick Copy-Paste Script

Setelah dapat User ID, gunakan script ini (ganti UUID-nya):

```sql
-- ADMIN
INSERT INTO public.profiles (id, email, full_name, role)
VALUES ('ADMIN_UUID_HERE', 'wiwik@unp.id', 'Wiwik', 'admin')
ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, full_name = EXCLUDED.full_name, role = EXCLUDED.role;

-- MAHASISWA
INSERT INTO public.profiles (id, email, full_name, role)
VALUES ('MAHASISWA_UUID_HERE', 'hasfi@unp.id', 'Muhammad Hasfi Rasya', 'mahasiswa')
ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, full_name = EXCLUDED.full_name, role = EXCLUDED.role;
```
