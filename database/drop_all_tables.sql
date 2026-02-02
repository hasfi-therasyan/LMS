-- ============================================
-- DROP ALL TABLES (Run this first if tables already exist)
-- ============================================
-- WARNING: This will delete ALL data!
-- Only run this if you want to start fresh

-- Drop tables in reverse order of dependencies
DROP TABLE IF EXISTS public.ai_chat_messages CASCADE;
DROP TABLE IF EXISTS public.ai_chat_sessions CASCADE;
DROP TABLE IF EXISTS public.quiz_answers CASCADE;
DROP TABLE IF EXISTS public.quiz_submissions CASCADE;
DROP TABLE IF EXISTS public.quiz_questions CASCADE;
DROP TABLE IF EXISTS public.quizzes CASCADE;
DROP TABLE IF EXISTS public.modules CASCADE;
DROP TABLE IF EXISTS public.enrollments CASCADE;
DROP TABLE IF EXISTS public.classes CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Drop indexes (optional, will be recreated)
DROP INDEX IF EXISTS idx_profiles_role CASCADE;
DROP INDEX IF EXISTS idx_modules_class_id CASCADE;
DROP INDEX IF EXISTS idx_quizzes_module_id CASCADE;
DROP INDEX IF EXISTS idx_quiz_questions_quiz_id CASCADE;
DROP INDEX IF EXISTS idx_quiz_submissions_quiz_id CASCADE;
DROP INDEX IF EXISTS idx_quiz_submissions_student_id CASCADE;
DROP INDEX IF EXISTS idx_quiz_answers_submission_id CASCADE;
DROP INDEX IF EXISTS idx_quiz_answers_question_id CASCADE;
DROP INDEX IF EXISTS idx_enrollments_student_id CASCADE;
DROP INDEX IF EXISTS idx_enrollments_class_id CASCADE;
DROP INDEX IF EXISTS idx_ai_chat_sessions_submission_id CASCADE;
DROP INDEX IF EXISTS idx_ai_chat_messages_session_id CASCADE;
