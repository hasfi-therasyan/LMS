-- ============================================
-- Quick Fix: Add class_id to quizzes table
-- ============================================
-- Run this if you get error: "Could not find the 'class_id' column"
-- This script safely adds the class_id column and refreshes schema cache

-- Step 1: Check if class_id already exists, if not add it
DO $$
BEGIN
    -- Check if class_id column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'quizzes' 
        AND column_name = 'class_id'
    ) THEN
        -- Add column without constraint first
        ALTER TABLE public.quizzes 
        ADD COLUMN class_id UUID;
        
        -- Add foreign key constraint
        ALTER TABLE public.quizzes
        ADD CONSTRAINT quizzes_class_id_fkey 
        FOREIGN KEY (class_id) 
        REFERENCES public.classes(id) 
        ON DELETE CASCADE;
        
        RAISE NOTICE 'class_id column added successfully';
    ELSE
        RAISE NOTICE 'class_id column already exists';
    END IF;
END $$;

-- Step 2: Migrate data from modules if module_id still exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'quizzes' 
        AND column_name = 'module_id'
    ) AND EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'modules'
    ) THEN
        -- Migrate class_id from modules
        UPDATE public.quizzes q
        SET class_id = m.class_id
        FROM public.modules m
        WHERE q.module_id = m.id 
        AND q.class_id IS NULL;
        
        RAISE NOTICE 'Data migrated from modules to class_id';
    END IF;
END $$;

-- Step 3: Refresh PostgREST schema cache
-- This is IMPORTANT to fix the "Could not find column" error
NOTIFY pgrst, 'reload schema';

-- Step 4: Verify the column was added
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'quizzes' 
  AND column_name = 'class_id';

-- If the query above returns a row with class_id, the column was added successfully!
-- Wait a few seconds for schema cache to refresh, then try your operation again.
