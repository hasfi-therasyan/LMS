-- ============================================
-- QUICK INSERT USERS - READ INSTRUCTIONS FIRST!
-- ============================================
--
-- INSTRUCTIONS:
-- 1. Go to Supabase Dashboard → Authentication → Users
-- 2. Create user: wiwik@unp.id (password: wr77hs20)
--    → Copy the User ID (UUID)
-- 3. Create user: hasfi@unp.id (password: hasfi123)
--    → Copy the User ID (UUID)
-- 4. Replace UUIDs below with actual User IDs
-- 5. Run this script
--
-- ============================================

-- ADMIN/DOSEN: wiwik@unp.id
-- ⚠️ REPLACE '00000000-0000-0000-0000-000000000001' with actual UUID
INSERT INTO public.profiles (id, email, full_name, role)
VALUES (
  '00000000-0000-0000-0000-000000000001',  -- ⚠️ REPLACE THIS UUID
  'wiwik@unp.id',
  'Wiwik',
  'admin'
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role;

-- MAHASISWA: hasfi@unp.id
-- ⚠️ REPLACE '00000000-0000-0000-0000-000000000002' with actual UUID
INSERT INTO public.profiles (id, email, full_name, role)
VALUES (
  '00000000-0000-0000-0000-000000000002',  -- ⚠️ REPLACE THIS UUID
  'hasfi@unp.id',
  'Muhammad Hasfi Rasya',
  'mahasiswa'
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role;

-- ============================================
-- VERIFY (Run this after inserting)
-- ============================================
-- SELECT id, email, full_name, role FROM public.profiles WHERE email IN ('wiwik@unp.id', 'hasfi@unp.id');
