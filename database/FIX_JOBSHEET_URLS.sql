-- Fix Jobsheet URLs in database
-- This script helps identify and fix broken file URLs in the classes table
-- Run this in Supabase SQL Editor

-- First, check current URLs
SELECT 
  id,
  name,
  code,
  file_url,
  CASE 
    WHEN file_url LIKE '%/storage/v1/object/public/%' THEN 'Valid format'
    WHEN file_url LIKE '%/storage/v1/object/sign/%' THEN 'Signed URL'
    WHEN file_url IS NULL THEN 'No URL'
    ELSE 'Invalid format'
  END as url_status
FROM public.classes
WHERE file_url IS NOT NULL
ORDER BY created_at DESC;

-- To manually fix a URL, you need to:
-- 1. Go to Supabase Storage → jobsheets bucket
-- 2. Find the file path
-- 3. Update the URL using this format:
--    https://[your-project-id].supabase.co/storage/v1/object/public/jobsheets/[file-path]

-- Example update (replace with actual values):
-- UPDATE public.classes
-- SET file_url = 'https://[project-id].supabase.co/storage/v1/object/public/jobsheets/jobsheets/[filename]'
-- WHERE id = '[jobsheet-id]';

-- Note: The backend will automatically regenerate URLs when fetching jobsheets,
-- but you can also manually fix them using the query above.
