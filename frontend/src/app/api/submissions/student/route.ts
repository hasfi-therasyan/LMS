/**
 * GET /api/submissions/student
 * Get all submissions for the current mahasiswa
 */

import { NextRequest } from 'next/server';
import { authenticate, requireRole, createErrorResponse, createSuccessResponse } from '@/lib/api/middleware/auth';
import { supabase } from '@/lib/api/config/supabase';

export async function GET(request: NextRequest) {
  try {
    const user = await authenticate(request);
    requireRole(user, 'student');

    // Get all submissions for the student with quiz info
    const { data: submissions, error } = await supabase
      .from('quiz_submissions')
      .select(`
        *,
        quizzes (
          id,
          title,
          description,
          classes (
            code,
            name
          )
        )
      `)
      .eq('student_id', user.id)
      .order('submitted_at', { ascending: false });

    if (error) {
      throw error;
    }

    return createSuccessResponse(submissions || []);
  } catch (error: any) {
    if (error.message?.includes('authorization')) {
      return createErrorResponse('Missing or invalid authorization header', 401);
    }
    if (error.message?.includes('requires')) {
      return createErrorResponse(error.message, 403);
    }
    return createErrorResponse(error.message || 'Failed to fetch submissions', 500);
  }
}
