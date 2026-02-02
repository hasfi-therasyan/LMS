-- ============================================
-- QUICK SETUP SCRIPT
-- ============================================
-- Use this AFTER creating users in Supabase Auth
-- Replace the UUIDs with actual user IDs from auth.users

-- ============================================
-- STEP 1: Get User IDs from Supabase Auth
-- ============================================
-- Go to: Authentication → Users
-- Copy the UUID for each user you created
-- Replace the placeholders below

-- ============================================
-- STEP 2: Create Admin Profile
-- ============================================
-- Replace 'YOUR_ADMIN_USER_ID' with actual UUID from auth.users
INSERT INTO public.profiles (id, email, full_name, role)
VALUES (
  'YOUR_ADMIN_USER_ID',  -- ⚠️ REPLACE THIS with UUID from auth.users
  'admin@university.ac.id',  -- ⚠️ REPLACE with actual email
  'Admin User',  -- ⚠️ REPLACE with actual name
  'admin'
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role;

-- ============================================
-- STEP 3: Create Mahasiswa Profile (Optional - if manual)
-- ============================================
-- Usually mahasiswa sign up via frontend, but if you want to create manually:
-- INSERT INTO public.profiles (id, email, full_name, role)
-- VALUES (
--   'YOUR_MAHASISWA_USER_ID',  -- ⚠️ REPLACE THIS
--   'mahasiswa@student.ac.id',  -- ⚠️ REPLACE
--   'Nama Mahasiswa',  -- ⚠️ REPLACE
--   'mahasiswa'
-- )
-- ON CONFLICT (id) DO UPDATE SET
--   email = EXCLUDED.email,
--   full_name = EXCLUDED.full_name,
--   role = EXCLUDED.role;

-- ============================================
-- STEP 4: Create a Test Class (Optional)
-- ============================================
-- After creating admin profile, you can create a class:
-- INSERT INTO public.classes (name, code, description, admin_id)
-- VALUES (
--   'Introduction to Computer Science',
--   'CS101',
--   'Basic computer science course',
--   'YOUR_ADMIN_USER_ID'  -- ⚠️ REPLACE with admin user ID
-- );

-- ============================================
-- STEP 5: Enroll Mahasiswa (Optional)
-- ============================================
-- After creating class and mahasiswa:
-- INSERT INTO public.enrollments (student_id, class_id)
-- VALUES (
--   'YOUR_MAHASISWA_USER_ID',  -- ⚠️ REPLACE
--   'YOUR_CLASS_ID'  -- ⚠️ REPLACE with class ID from classes table
-- );

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check all profiles
-- SELECT id, email, full_name, role FROM public.profiles;

-- Check all classes
-- SELECT id, name, code, admin_id FROM public.classes;

-- Check all enrollments
-- SELECT e.*, p.email, c.name as class_name 
-- FROM public.enrollments e
-- JOIN public.profiles p ON e.student_id = p.id
-- JOIN public.classes c ON e.class_id = c.id;
