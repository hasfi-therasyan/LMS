-- ============================================
-- JOBSHEET SUBMISSIONS TABLE
-- ============================================
-- Stores student submissions for jobsheets (PDF uploads)

CREATE TABLE IF NOT EXISTS public.jobsheet_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL, -- Supabase Storage URL for submitted PDF
    grade INTEGER, -- Grade given by admin/dosen (NULL if not graded yet)
    feedback TEXT, -- Feedback from admin/dosen
    graded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- Admin who graded
    graded_at TIMESTAMP WITH TIME ZONE, -- When it was graded
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(module_id, student_id) -- One submission per student per jobsheet
);

ALTER TABLE public.jobsheet_submissions ENABLE ROW LEVEL SECURITY;

-- Mahasiswa can view their own submissions
CREATE POLICY "Mahasiswa can view own jobsheet submissions" ON public.jobsheet_submissions
    FOR SELECT USING (student_id = auth.uid());

-- Mahasiswa can insert their own submissions
CREATE POLICY "Mahasiswa can submit jobsheets" ON public.jobsheet_submissions
    FOR INSERT WITH CHECK (student_id = auth.uid());

-- Admins can view all submissions for modules they uploaded or classes they manage
CREATE POLICY "Admins can view jobsheet submissions" ON public.jobsheet_submissions
    FOR SELECT USING (
        module_id IN (
            SELECT id FROM public.modules WHERE uploaded_by = auth.uid()
        ) OR
        module_id IN (
            SELECT m.id FROM public.modules m
            JOIN public.classes c ON m.class_id = c.id
            WHERE c.admin_id = auth.uid()
        ) OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Admins can update (grade) submissions
CREATE POLICY "Admins can grade jobsheet submissions" ON public.jobsheet_submissions
    FOR UPDATE USING (
        module_id IN (
            SELECT id FROM public.modules WHERE uploaded_by = auth.uid()
        ) OR
        module_id IN (
            SELECT m.id FROM public.modules m
            JOIN public.classes c ON m.class_id = c.id
            WHERE c.admin_id = auth.uid()
        ) OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_jobsheet_submissions_module_id ON public.jobsheet_submissions(module_id);
CREATE INDEX IF NOT EXISTS idx_jobsheet_submissions_student_id ON public.jobsheet_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_jobsheet_submissions_graded_by ON public.jobsheet_submissions(graded_by);
