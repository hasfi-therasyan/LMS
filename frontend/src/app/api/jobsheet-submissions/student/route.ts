/**
 * GET /api/jobsheet-submissions/student
 * Get student's own submissions (Mahasiswa only)
 */

import { NextRequest } from 'next/server';
import { authenticate, requireRole, createErrorResponse, createSuccessResponse } from '@/lib/api/middleware/auth';
import { supabase } from '@/lib/api/config/supabase';

export async function GET(request: NextRequest) {
  try {
    const user = await authenticate(request);
    requireRole(user, 'mahasiswa');

    const { data: submissions, error } = await supabase
      .from('jobsheet_submissions')
      .select(`
        *,
        modules (
          id,
          title,
          description,
          classes (
            id,
            name,
            code
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
