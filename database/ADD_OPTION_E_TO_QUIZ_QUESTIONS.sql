-- Migration: Add option E to quiz questions
-- This script adds option_e column and updates the correct_answer constraint

-- Step 1: Add option_e column (nullable first for existing data)
ALTER TABLE public.quiz_questions 
ADD COLUMN IF NOT EXISTS option_e TEXT;

-- Step 2: Update existing rows to have a default value for option_e
UPDATE public.quiz_questions 
SET option_e = 'N/A' 
WHERE option_e IS NULL;

-- Step 3: Make option_e NOT NULL
ALTER TABLE public.quiz_questions 
ALTER COLUMN option_e SET NOT NULL;

-- Step 3: Drop the old constraint
ALTER TABLE public.quiz_questions 
DROP CONSTRAINT IF EXISTS quiz_questions_correct_answer_check;

-- Step 4: Add new constraint that includes 'E'
ALTER TABLE public.quiz_questions 
ADD CONSTRAINT quiz_questions_correct_answer_check 
CHECK (correct_answer IN ('A', 'B', 'C', 'D', 'E'));

-- Step 5: Refresh schema cache
NOTIFY pgrst, 'reload schema';
