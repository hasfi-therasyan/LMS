-- ============================================
-- Migration: Remove modules table and update quizzes to reference classes
-- ============================================
-- This migration:
-- 1. Updates quizzes table to reference classes instead of modules
-- 2. Removes all modules-related RLS policies
-- 3. Drops the modules table
-- 4. Updates RLS policies for quizzes to work with classes
-- 5. Updates indexes
-- 
-- IMPORTANT: Run this in Supabase SQL Editor and refresh the schema cache after completion

-- Step 1: First, ensure classes table exists and has id column
-- (This is a safety check)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'classes'
    ) THEN
        RAISE EXCEPTION 'Classes table does not exist. Please create it first.';
    END IF;
END $$;

-- Step 2: Drop foreign key constraint from quizzes to modules (if exists)
ALTER TABLE public.quizzes 
DROP CONSTRAINT IF EXISTS quizzes_module_id_fkey;

-- Step 3: Add new column class_id to quizzes
-- IMPORTANT: Add WITHOUT foreign key first, then add constraint separately
DO $$
BEGIN
    -- Check if class_id column already exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'quizzes' 
        AND column_name = 'class_id'
    ) THEN
        -- Add column without constraint first
        ALTER TABLE public.quizzes 
        ADD COLUMN class_id UUID;
        
        -- Then add foreign key constraint
        ALTER TABLE public.quizzes
        ADD CONSTRAINT quizzes_class_id_fkey 
        FOREIGN KEY (class_id) 
        REFERENCES public.classes(id) 
        ON DELETE CASCADE;
    END IF;
END $$;

-- Step 4: For existing quizzes, try to get class_id from modules (if modules still exist)
-- This is a safety measure - if modules table is already empty or doesn't exist, skip this
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'modules'
    ) THEN
        -- Check if module_id column exists before trying to use it
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'quizzes' 
            AND column_name = 'module_id'
        ) THEN
            UPDATE public.quizzes q
            SET class_id = m.class_id
            FROM public.modules m
            WHERE q.module_id = m.id AND q.class_id IS NULL;
        END IF;
    END IF;
END $$;

-- Step 5: Make class_id NOT NULL (after migration)
-- First, set any remaining NULL values to a default (you may need to adjust this)
-- For safety, we'll allow NULL temporarily and handle it in application code
-- ALTER TABLE public.quizzes ALTER COLUMN class_id SET NOT NULL;

-- Step 6: Drop the old module_id column (only if it exists)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'quizzes' 
        AND column_name = 'module_id'
    ) THEN
        ALTER TABLE public.quizzes DROP COLUMN module_id;
    END IF;
END $$;

-- Step 7: Update RLS policies for quizzes
-- Drop old policies that reference modules
DROP POLICY IF EXISTS "Mahasiswa can view quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Admins can view own quizzes" ON public.quizzes;

-- Create new policies based on classes
-- Mahasiswa can view ALL quizzes (no enrollment required)
CREATE POLICY "Mahasiswa can view quizzes" ON public.quizzes
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'mahasiswa')
    );

-- Admins can view quizzes in their classes
CREATE POLICY "Admins can view own quizzes" ON public.quizzes
    FOR SELECT USING (
        created_by = auth.uid() OR
        (class_id IN (SELECT id FROM public.classes WHERE admin_id = auth.uid())) OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Step 8: Update quiz_questions RLS policies
DROP POLICY IF EXISTS "Mahasiswa can view quiz questions" ON public.quiz_questions;
DROP POLICY IF EXISTS "Admins can view own quiz questions" ON public.quiz_questions;

-- Mahasiswa can view questions for quizzes they can access
CREATE POLICY "Mahasiswa can view quiz questions" ON public.quiz_questions
    FOR SELECT USING (
        quiz_id IN (
            SELECT id FROM public.quizzes
            WHERE EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'mahasiswa')
        )
    );

-- Admins can view questions for their quizzes
CREATE POLICY "Admins can view own quiz questions" ON public.quiz_questions
    FOR SELECT USING (
        quiz_id IN (
            SELECT id FROM public.quizzes 
            WHERE created_by = auth.uid() OR
                  class_id IN (SELECT id FROM public.classes WHERE admin_id = auth.uid())
        ) OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Step 9: Update quiz_submissions RLS policies (they should still work, but verify)
-- These should still work as they reference quizzes, not modules directly

-- Step 10: Update indexes
DROP INDEX IF EXISTS idx_quizzes_module_id;
CREATE INDEX IF NOT EXISTS idx_quizzes_class_id ON public.quizzes(class_id);

-- Step 11: Drop modules table and related objects (only if it exists)
DO $$
BEGIN
    -- Check if modules table exists before trying to drop anything
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'modules'
    ) THEN
        -- Drop RLS policies on modules
        DROP POLICY IF EXISTS "Admins can view own modules" ON public.modules;
        DROP POLICY IF EXISTS "Mahasiswa can view modules in enrolled classes" ON public.modules;
        
        -- Drop triggers on modules
        DROP TRIGGER IF EXISTS update_modules_updated_at ON public.modules;
        
        -- Drop indexes on modules
        DROP INDEX IF EXISTS idx_modules_class_id;
        
        -- Drop the modules table (this will cascade to any remaining foreign keys)
        DROP TABLE public.modules CASCADE;
        
        RAISE NOTICE 'Modules table and related objects dropped successfully';
    ELSE
        RAISE NOTICE 'Modules table does not exist, skipping drop operations';
    END IF;
END $$;

-- Step 13: Add extracted_text column to classes if it doesn't exist
-- This column stores extracted text from PDF files for AI context
ALTER TABLE public.classes 
ADD COLUMN IF NOT EXISTS extracted_text TEXT;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_classes_extracted_text ON public.classes(extracted_text) 
WHERE extracted_text IS NOT NULL;

-- ============================================
-- IMPORTANT: Refresh Schema Cache
-- ============================================
-- After running this migration, you MUST refresh the Supabase schema cache:
-- 1. Go to Supabase Dashboard
-- 2. Click on "Database" → "Tables"
-- 3. Click the refresh button (or wait a few seconds for auto-refresh)
-- 4. Alternatively, you can run: NOTIFY pgrst, 'reload schema';

-- Force schema reload (PostgREST)
NOTIFY pgrst, 'reload schema';

-- ============================================
-- Verification queries (run these to check):
-- ============================================
-- Verify class_id column exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'quizzes' 
  AND column_name = 'class_id';

-- Check for any quizzes with NULL class_id (should be handled)
SELECT id, title, class_id 
FROM public.quizzes 
WHERE class_id IS NULL;

-- Verify module_id column is removed
SELECT column_name 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'quizzes' 
  AND column_name = 'module_id';
-- Should return 0 rows

-- Verify modules table is removed
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'modules';
-- Should return 0 rows

-- Verify extracted_text column exists in classes
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'classes' 
  AND column_name = 'extracted_text';
-- Should return 1 row
