/**
 * GET /api/jobsheet-assignments/jobsheet/:jobsheetId
 * Get all assignments for a jobsheet (Admin only)
 */

import { NextRequest } from 'next/server';
import { authenticate, requireRole, createErrorResponse, createSuccessResponse } from '@/lib/api/middleware/auth';
import { supabase } from '@/lib/api/config/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { jobsheetId: string } }
) {
  try {
    const user = await authenticate(request);
    requireRole(user, 'admin');

    // Verify jobsheet exists and belongs to admin
    const { data: jobsheet, error: jobsheetError } = await supabase
      .from('classes')
      .select('id, admin_id')
      .eq('id', params.jobsheetId)
      .single();

    if (jobsheetError || !jobsheet) {
      return createErrorResponse('Jobsheet not found', 404);
    }

    if (jobsheet.admin_id !== user.id) {
      return createErrorResponse('You can only view assignments for your own jobsheets', 403);
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
      .eq('jobsheet_id', params.jobsheetId)
      .order('uploaded_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Group assignments by student (NIM)
    const groupedByStudent: Record<string, any[]> = {};
    assignments?.forEach((assignment: any) => {
      const key = `${assignment.student_id}_${assignment.nim}`;
      if (!groupedByStudent[key]) {
        groupedByStudent[key] = [];
      }
      groupedByStudent[key].push(assignment);
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
