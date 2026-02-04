/**
 * GET /api/jobsheet-assignments/all
 * Get all assignments grouped by student (Admin only)
 */

import { NextRequest } from 'next/server';
import { authenticate, requireRole, createErrorResponse, createSuccessResponse } from '@/lib/api/middleware/auth';
import { supabase } from '@/lib/api/config/supabase';

export async function GET(request: NextRequest) {
  try {
    const user = await authenticate(request);
    requireRole(user, 'admin');

    // Get all assignments from admin's jobsheets
    const { data: adminJobsheets, error: jobsheetError } = await supabase
      .from('classes')
      .select('id')
      .eq('admin_id', user.id);

    if (jobsheetError) {
      throw jobsheetError;
    }

    const jobsheetIds = adminJobsheets?.map(j => j.id) || [];

    if (jobsheetIds.length === 0) {
      return createSuccessResponse({ assignments: [], groupedByStudent: [] });
    }

    // Get all assignments
    const { data: assignments, error } = await supabase
      .from('jobsheet_assignments')
      .select(`
        *,
        profiles!jobsheet_assignments_student_id_fkey (
          id,
          full_name,
          email
        ),
        classes!jobsheet_assignments_jobsheet_id_fkey (
          id,
          name,
          code
        )
      `)
      .in('jobsheet_id', jobsheetIds)
      .order('uploaded_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Group by student
    const groupedByStudent: Record<string, any> = {};
    assignments?.forEach((assignment: any) => {
      const student = assignment.profiles;
      const key = `${assignment.student_id}_${assignment.nim}`;
      
      if (!groupedByStudent[key]) {
        groupedByStudent[key] = {
          student_id: assignment.student_id,
          student_name: student?.full_name || 'Unknown',
          student_email: student?.email || '',
          nim: assignment.nim,
          assignments: []
        };
      }
      groupedByStudent[key].assignments.push(assignment);
    });

    return createSuccessResponse({
      assignments: assignments || [],
      groupedByStudent: Object.values(groupedByStudent)
    });
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
