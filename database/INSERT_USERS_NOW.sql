-- ============================================
-- INSERT USERS - COPY PASTE READY
-- ============================================
-- 
-- CARA PAKAI:
-- 1. Buka Supabase Dashboard → Authentication → Users
-- 2. Create user: wiwik@unp.id (password: wr77hs20)
--    → Copy User ID (UUID)
-- 3. Create user: hasfi@unp.id (password: hasfi123)  
--    → Copy User ID (UUID)
-- 4. GANTI UUID di bawah dengan User ID yang Anda copy
-- 5. Run script ini di SQL Editor
-- ============================================

-- ADMIN/DOSEN: wiwik@unp.id
-- ⚠️ GANTI UUID INI dengan User ID dari Authentication → Users
INSERT INTO public.profiles (id, email, full_name, role)
VALUES (
  'GANTI_DENGAN_UUID_WIWIK',  -- ⚠️ PASTE UUID dari wiwik@unp.id di sini
  'wiwik@unp.id',
  'Wiwik',
  'admin'
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role;

-- MAHASISWA: hasfi@unp.id
-- ⚠️ GANTI UUID INI dengan User ID dari Authentication → Users
INSERT INTO public.profiles (id, email, full_name, role)
VALUES (
  'GANTI_DENGAN_UUID_HASFI',  -- ⚠️ PASTE UUID dari hasfi@unp.id di sini
  'hasfi@unp.id',
  'Muhammad Hasfi Rasya',
  'mahasiswa'
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role;

-- ============================================
-- VERIFY (Jalankan ini setelah insert)
-- ============================================
SELECT id, email, full_name, role, created_at 
FROM public.profiles 
WHERE email IN ('wiwik@unp.id', 'hasfi@unp.id')
ORDER BY created_at;
