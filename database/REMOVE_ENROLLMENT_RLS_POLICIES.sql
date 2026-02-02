-- ============================================
-- Remove Enrollment Requirements from RLS Policies
-- ============================================
-- This script updates RLS policies to allow all mahasiswa to access
-- all classes, modules, and quizzes without enrollment requirement
-- ============================================

-- ============================================
-- STEP 1: Drop old enrollment-based policies
-- ============================================

-- Drop policy that restricts mahasiswa to enrolled classes only
DROP POLICY IF EXISTS "Mahasiswa can view enrolled classes" ON public.classes;

-- Drop policy that restricts mahasiswa to enrolled modules only
DROP POLICY IF EXISTS "Mahasiswa can view modules in enrolled classes" ON public.modules;

-- Drop policy that restricts mahasiswa to enrolled quizzes only
DROP POLICY IF EXISTS "Mahasiswa can view quizzes" ON public.quizzes;

-- Drop policy for quiz questions (if exists)
DROP POLICY IF EXISTS "Mahasiswa can view quiz questions" ON public.quiz_questions;

-- ============================================
-- STEP 2: Create new policies that allow all mahasiswa access
-- ============================================

-- Allow all mahasiswa to view ALL classes (no enrollment required)
CREATE POLICY "Mahasiswa can view all classes" ON public.classes
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'mahasiswa')
    );

-- Allow all mahasiswa to view ALL modules (no enrollment required)
CREATE POLICY "Mahasiswa can view all modules" ON public.modules
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'mahasiswa')
    );

-- Allow all mahasiswa to view ALL quizzes (no enrollment required)
CREATE POLICY "Mahasiswa can view all quizzes" ON public.quizzes
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'mahasiswa')
    );

-- Allow all mahasiswa to view quiz questions (no enrollment required)
-- Drop old policy first (if exists with different name)
DROP POLICY IF EXISTS "Mahasiswa can view questions for quizzes they can access" ON public.quiz_questions;

CREATE POLICY "Mahasiswa can view all quiz questions" ON public.quiz_questions
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'mahasiswa')
    );

-- ============================================
-- STEP 3: Optional - Drop enrollments table (if you want to completely remove it)
-- ============================================
-- Uncomment the following lines if you want to completely remove the enrollments table
-- WARNING: This will delete all enrollment data!

-- DROP POLICY IF EXISTS "Mahasiswa can view own enrollments" ON public.enrollments;
-- DROP TABLE IF EXISTS public.enrollments CASCADE;

-- ============================================
-- Verification
-- ============================================
-- After running this script, verify the policies:
-- SELECT * FROM pg_policies WHERE tablename IN ('classes', 'modules', 'quizzes', 'quiz_questions');
