-- ============================================
-- Add file_url column to classes table
-- ============================================
-- This migration adds the file_url column to store PDF URLs for jobsheets
-- Run this in Supabase SQL Editor

-- Add file_url column if it doesn't exist
ALTER TABLE public.classes 
ADD COLUMN IF NOT EXISTS file_url TEXT;

-- Add index for better query performance (only if column exists)
CREATE INDEX IF NOT EXISTS idx_classes_file_url ON public.classes(file_url) 
WHERE file_url IS NOT NULL;

-- Verify the column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'classes'
  AND column_name = 'file_url';

-- If the query above returns a row, the column was added successfully!
