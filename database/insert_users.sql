-- ============================================
-- INSERT USERS TO DATABASE
-- ============================================
-- 
-- STEP 1: Create users in Supabase Auth first:
--   1. Go to Supabase Dashboard → Authentication → Users
--   2. Click "Add User" → "Create new user"
--   3. Create these users:
--      - Email: wiwik@unp.id, Password: wr77hs20
--      - Email: hasfi@unp.id, Password: hasfi123
--   4. Copy the User ID (UUID) for each user
--
-- STEP 2: Replace the UUIDs below with actual User IDs from Auth
-- STEP 3: Run this script in SQL Editor
-- ============================================

-- ============================================
-- ADMIN/DOSEN: wiwik@unp.id
-- ============================================
-- Replace 'YOUR_ADMIN_USER_ID' with actual UUID from auth.users
INSERT INTO public.profiles (id, email, full_name, role)
VALUES (
  'YOUR_ADMIN_USER_ID',  -- ⚠️ REPLACE: Get from Authentication → Users → wiwik@unp.id
  'wiwik@unp.id',
  'Wiwik',
  'admin'
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role;

-- ============================================
-- MAHASISWA: hasfi@unp.id
-- ============================================
-- Replace 'YOUR_MAHASISWA_USER_ID' with actual UUID from auth.users
INSERT INTO public.profiles (id, email, full_name, role)
VALUES (
  'YOUR_MAHASISWA_USER_ID',  -- ⚠️ REPLACE: Get from Authentication → Users → hasfi@unp.id
  'hasfi@unp.id',
  'Muhammad Hasfi Rasya',
  'mahasiswa'
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role;

-- ============================================
-- VERIFICATION
-- ============================================
-- Run this to check if users were created:
-- SELECT id, email, full_name, role, created_at FROM public.profiles ORDER BY created_at;
