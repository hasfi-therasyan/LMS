-- Migration: Add is_published to quizzes for Upload/Archive (visibility to mahasiswa)
-- Run this in Supabase SQL Editor

-- Add column: false = draft/archived (not shown to mahasiswa), true = published/online (shown to mahasiswa)
ALTER TABLE public.quizzes 
ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT false;

-- Optional: set existing quizzes to published so current behavior is preserved
-- UPDATE public.quizzes SET is_published = true WHERE is_published IS NULL;

COMMENT ON COLUMN public.quizzes.is_published IS 'When true, quiz is visible to mahasiswa (Online). When false, quiz is archived (not shown).';
