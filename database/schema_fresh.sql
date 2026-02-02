-- ============================================
-- LMS Database Schema for Supabase PostgreSQL
-- ============================================
-- This is a FRESH schema - drops existing tables first
-- Run this if you want to start completely fresh

-- ============================================
-- STEP 1: DROP EXISTING TABLES (if any)
-- ============================================
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

-- ============================================
-- STEP 2: CREATE EXTENSIONS
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- STEP 3: CREATE TABLES
-- ============================================

-- ============================================
-- USERS TABLE (extends Supabase auth.users)
-- ============================================
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    role TEXT NOT NULL CHECK (role IN ('admin', 'mahasiswa')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- ============================================
-- CLASSES TABLE
-- ============================================
CREATE TABLE public.classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    description TEXT,
    admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

-- Admins can view their own classes
CREATE POLICY "Admins can view own classes" ON public.classes
    FOR SELECT USING (
        admin_id = auth.uid() OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- ============================================
-- ENROLLMENTS TABLE
-- ============================================
CREATE TABLE public.enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, class_id)
);

ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

-- Mahasiswa can view their own enrollments
CREATE POLICY "Mahasiswa can view own enrollments" ON public.enrollments
    FOR SELECT USING (student_id = auth.uid());

-- Mahasiswa can view classes they're enrolled in
CREATE POLICY "Mahasiswa can view enrolled classes" ON public.classes
    FOR SELECT USING (
        id IN (SELECT class_id FROM public.enrollments WHERE student_id = auth.uid())
    );

-- ============================================
-- MODULES TABLE
-- ============================================
CREATE TABLE public.modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    file_url TEXT NOT NULL,
    extracted_text TEXT,
    uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;

-- Admins can view modules in their classes
CREATE POLICY "Admins can view own modules" ON public.modules
    FOR SELECT USING (
        uploaded_by = auth.uid() OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Mahasiswa can view modules in their enrolled classes
CREATE POLICY "Mahasiswa can view modules in enrolled classes" ON public.modules
    FOR SELECT USING (
        class_id IN (SELECT class_id FROM public.enrollments WHERE student_id = auth.uid())
    );

-- ============================================
-- QUIZZES TABLE
-- ============================================
CREATE TABLE public.quizzes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    time_limit INTEGER,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

-- Mahasiswa can view quizzes for modules in their classes
CREATE POLICY "Mahasiswa can view quizzes" ON public.quizzes
    FOR SELECT USING (
        module_id IN (
            SELECT m.id FROM public.modules m
            JOIN public.enrollments e ON m.class_id = e.class_id
            WHERE e.student_id = auth.uid()
        )
    );

-- Admins can view their own quizzes
CREATE POLICY "Admins can view own quizzes" ON public.quizzes
    FOR SELECT USING (
        created_by = auth.uid() OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- ============================================
-- QUIZ QUESTIONS TABLE
-- ============================================
CREATE TABLE public.quiz_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT NOT NULL,
    correct_answer TEXT NOT NULL CHECK (correct_answer IN ('A', 'B', 'C', 'D')),
    points INTEGER DEFAULT 1,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;

-- Mahasiswa can view questions for quizzes they can access
CREATE POLICY "Mahasiswa can view quiz questions" ON public.quiz_questions
    FOR SELECT USING (
        quiz_id IN (
            SELECT id FROM public.quizzes WHERE module_id IN (
                SELECT m.id FROM public.modules m
                JOIN public.enrollments e ON m.class_id = e.class_id
                WHERE e.student_id = auth.uid()
            )
        )
    );

-- Admins can view questions for their quizzes
CREATE POLICY "Admins can view own quiz questions" ON public.quiz_questions
    FOR SELECT USING (
        quiz_id IN (
            SELECT id FROM public.quizzes WHERE created_by = auth.uid()
        ) OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- ============================================
-- QUIZ SUBMISSIONS TABLE
-- ============================================
CREATE TABLE public.quiz_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    total_points INTEGER NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(quiz_id, student_id)
);

ALTER TABLE public.quiz_submissions ENABLE ROW LEVEL SECURITY;

-- Mahasiswa can view their own submissions
CREATE POLICY "Mahasiswa can view own submissions" ON public.quiz_submissions
    FOR SELECT USING (student_id = auth.uid());

-- Admins can view submissions for their quizzes
CREATE POLICY "Admins can view quiz submissions" ON public.quiz_submissions
    FOR SELECT USING (
        quiz_id IN (
            SELECT id FROM public.quizzes WHERE created_by = auth.uid()
        ) OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- ============================================
-- QUIZ ANSWERS TABLE
-- ============================================
CREATE TABLE public.quiz_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_id UUID REFERENCES public.quiz_submissions(id) ON DELETE CASCADE,
    question_id UUID REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
    student_answer TEXT NOT NULL CHECK (student_answer IN ('A', 'B', 'C', 'D')),
    is_correct BOOLEAN NOT NULL,
    points_earned INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.quiz_answers ENABLE ROW LEVEL SECURITY;

-- Mahasiswa can view their own answers
CREATE POLICY "Mahasiswa can view own answers" ON public.quiz_answers
    FOR SELECT USING (
        submission_id IN (
            SELECT id FROM public.quiz_submissions WHERE student_id = auth.uid()
        )
    );

-- Admins can view answers for their quizzes
CREATE POLICY "Admins can view quiz answers" ON public.quiz_answers
    FOR SELECT USING (
        submission_id IN (
            SELECT qs.id FROM public.quiz_submissions qs
            JOIN public.quizzes q ON qs.quiz_id = q.id
            WHERE q.created_by = auth.uid()
        ) OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- ============================================
-- AI CHAT SESSIONS TABLE
-- ============================================
CREATE TABLE public.ai_chat_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_id UUID REFERENCES public.quiz_submissions(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    question_id UUID REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.ai_chat_sessions ENABLE ROW LEVEL SECURITY;

-- Mahasiswa can view their own chat sessions
CREATE POLICY "Mahasiswa can view own chat sessions" ON public.ai_chat_sessions
    FOR SELECT USING (student_id = auth.uid());

-- ============================================
-- AI CHAT MESSAGES TABLE
-- ============================================
CREATE TABLE public.ai_chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES public.ai_chat_sessions(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.ai_chat_messages ENABLE ROW LEVEL SECURITY;

-- Mahasiswa can view messages in their own chat sessions
CREATE POLICY "Mahasiswa can view own chat messages" ON public.ai_chat_messages
    FOR SELECT USING (
        session_id IN (
            SELECT id FROM public.ai_chat_sessions WHERE student_id = auth.uid()
        )
    );

-- ============================================
-- INDEXES for Performance
-- ============================================
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_modules_class_id ON public.modules(class_id);
CREATE INDEX idx_quizzes_module_id ON public.quizzes(module_id);
CREATE INDEX idx_quiz_questions_quiz_id ON public.quiz_questions(quiz_id);
CREATE INDEX idx_quiz_submissions_quiz_id ON public.quiz_submissions(quiz_id);
CREATE INDEX idx_quiz_submissions_student_id ON public.quiz_submissions(student_id);
CREATE INDEX idx_quiz_answers_submission_id ON public.quiz_answers(submission_id);
CREATE INDEX idx_quiz_answers_question_id ON public.quiz_answers(question_id);
CREATE INDEX idx_enrollments_student_id ON public.enrollments(student_id);
CREATE INDEX idx_enrollments_class_id ON public.enrollments(class_id);
CREATE INDEX idx_ai_chat_sessions_submission_id ON public.ai_chat_sessions(submission_id);
CREATE INDEX idx_ai_chat_messages_session_id ON public.ai_chat_messages(session_id);

-- ============================================
-- FUNCTIONS
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS
-- ============================================
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON public.classes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_modules_updated_at BEFORE UPDATE ON public.modules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quizzes_updated_at BEFORE UPDATE ON public.quizzes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
