-- Add file_url column to classes table for jobsheet PDF
ALTER TABLE public.classes 
ADD COLUMN IF NOT EXISTS file_url TEXT;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_classes_file_url ON public.classes(file_url) WHERE file_url IS NOT NULL;
