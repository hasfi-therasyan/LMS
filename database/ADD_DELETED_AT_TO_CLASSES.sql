-- Migration: Soft delete for classes (jobsheets)
-- When admin "deletes" a jobsheet, we set deleted_at instead of removing the row.
-- Quizzes and their data remain intact. AI chatbot can still use extracted_text.
-- Run this in Supabase SQL Editor.

ALTER TABLE public.classes
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

COMMENT ON COLUMN public.classes.deleted_at IS 'When set, jobsheet is soft-deleted (hidden from list). Quiz data and extracted_text remain for AI context.';
