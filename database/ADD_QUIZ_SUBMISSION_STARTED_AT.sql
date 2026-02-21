-- Migration: Add started_at to quiz_submissions for duration tracking
-- started_at = when mahasiswa opened/started the quiz; duration = submitted_at - started_at

ALTER TABLE public.quiz_submissions
ADD COLUMN IF NOT EXISTS started_at TIMESTAMP WITH TIME ZONE;

COMMENT ON COLUMN public.quiz_submissions.started_at IS 'When the student opened/started the quiz; used with submitted_at to compute attempt duration.';
