-- ============================================
-- JOBSHEET ASSIGNMENTS TABLE
-- ============================================
-- Stores mahasiswa assignments (PDF uploads) for jobsheets
-- Each mahasiswa can upload up to 4 files per jobsheet

CREATE TABLE IF NOT EXISTS public.jobsheet_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    jobsheet_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    nim TEXT NOT NULL, -- Student ID number
    file_url TEXT NOT NULL, -- Supabase Storage URL
    file_name TEXT NOT NULL, -- Original file name
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    grade INTEGER, -- Grade from 0-100
    feedback TEXT,
    graded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    graded_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.jobsheet_assignments ENABLE ROW LEVEL SECURITY;

-- Mahasiswa can insert their own assignments
CREATE POLICY "Mahasiswa can insert own assignments" ON public.jobsheet_assignments
    FOR INSERT WITH CHECK (student_id = auth.uid());

-- Mahasiswa can view their own assignments
CREATE POLICY "Mahasiswa can view own assignments" ON public.jobsheet_assignments
    FOR SELECT USING (student_id = auth.uid());

-- Admins can view all assignments for jobsheets they own
CREATE POLICY "Admins can view assignments" ON public.jobsheet_assignments
    FOR SELECT USING (
        jobsheet_id IN (
            SELECT id FROM public.classes WHERE admin_id = auth.uid()
        ) OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Admins can update grades and feedback for assignments
CREATE POLICY "Admins can update assignments" ON public.jobsheet_assignments
    FOR UPDATE USING (
        jobsheet_id IN (
            SELECT id FROM public.classes WHERE admin_id = auth.uid()
        ) OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    ) WITH CHECK (
        graded_by = auth.uid() OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Admins can delete assignments
CREATE POLICY "Admins can delete assignments" ON public.jobsheet_assignments
    FOR DELETE USING (
        jobsheet_id IN (
            SELECT id FROM public.classes WHERE admin_id = auth.uid()
        ) OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_jobsheet_assignments_jobsheet_id ON public.jobsheet_assignments(jobsheet_id);
CREATE INDEX IF NOT EXISTS idx_jobsheet_assignments_student_id ON public.jobsheet_assignments(student_id);
CREATE INDEX IF NOT EXISTS idx_jobsheet_assignments_nim ON public.jobsheet_assignments(nim);
