/**
 * GET /api/jobsheet-assignments/student
 * Get student's own assignments (Mahasiswa only)
 */

import { NextRequest } from 'next/server';
import { authenticate, requireRole, createErrorResponse, createSuccessResponse } from '@/lib/api/middleware/auth';
import { supabase } from '@/lib/api/config/supabase';

export async function GET(request: NextRequest) {
  try {
    const user = await authenticate(request);
    requireRole(user, 'student');

    const { data: assignments, error } = await supabase
      .from('jobsheet_assignments')
      .select(`
        *,
        classes (
          id,
          name,
          code
        )
      `)
      .eq('student_id', user.id)
      .order('uploaded_at', { ascending: false });

    if (error) {
      throw error;
    }

    return createSuccessResponse(assignments || []);
  } catch (error: any) {
    if (error.message?.includes('authorization')) {
      return createErrorResponse('Missing or invalid authorization header', 401);
    }
    if (error.message?.includes('requires')) {
      return createErrorResponse(error.message, 403);
    }
    return createErrorResponse(error.message || 'Failed to fetch assignments', 500);
  }
}
