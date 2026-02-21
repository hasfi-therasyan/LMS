-- Migration: Allow answer 'E' in quiz_answers (student_answer)
-- Required so mahasiswa can submit quizzes when correct answer is E.

-- Drop existing check constraint (name may vary; try common names)
ALTER TABLE public.quiz_answers 
DROP CONSTRAINT IF EXISTS quiz_answers_student_answer_check;

-- Add new constraint including 'E'
ALTER TABLE public.quiz_answers 
ADD CONSTRAINT quiz_answers_student_answer_check 
CHECK (student_answer IN ('A', 'B', 'C', 'D', 'E'));
