-- ============================================
-- FIX: Add RLS Policy for Mahasiswa to Delete Own Assignments
-- ============================================
-- This script adds a policy that allows mahasiswa to delete their own assignments
-- Run this in Supabase SQL Editor

-- Drop existing policy if it exists (optional, for clean re-run)
DROP POLICY IF EXISTS "Mahasiswa can delete own assignments" ON public.jobsheet_assignments;

-- Create policy for mahasiswa to delete their own assignments
CREATE POLICY "Mahasiswa can delete own assignments" ON public.jobsheet_assignments
    FOR DELETE USING (student_id = auth.uid());

-- Verify the policy was created
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'jobsheet_assignments'
ORDER BY policyname;
