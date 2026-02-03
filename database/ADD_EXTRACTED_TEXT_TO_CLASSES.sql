-- ============================================
-- Add extracted_text column to classes table
-- ============================================
-- This column stores extracted text from PDF files for AI context
-- Run this in Supabase SQL Editor

-- Add extracted_text column if it doesn't exist
ALTER TABLE public.classes 
ADD COLUMN IF NOT EXISTS extracted_text TEXT;

-- Add index for better query performance (only if column exists)
CREATE INDEX IF NOT EXISTS idx_classes_extracted_text ON public.classes(extracted_text) 
WHERE extracted_text IS NOT NULL;

-- Verify the column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'classes'
  AND column_name = 'extracted_text';

-- If the query above returns a row, the column was added successfully!
