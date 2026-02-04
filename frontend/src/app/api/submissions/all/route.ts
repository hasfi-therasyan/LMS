/**
 * GET /api/submissions/all
 * Get all quiz submissions for admin (grouped by student)
 */

import { NextRequest } from 'next/server';
import { authenticate, requireRole, createErrorResponse, createSuccessResponse } from '@/lib/api/middleware/auth';
import { supabase } from '@/lib/api/config/supabase';

export async function GET(request: NextRequest) {
  try {
    const user = await authenticate(request);
    requireRole(user, 'admin');

    // Get all quiz submissions with student and quiz info
    const { data: submissions, error } = await supabase
      .from('quiz_submissions')
      .select(`
        *,
        profiles (
          id,
          full_name,
          email
        ),
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
