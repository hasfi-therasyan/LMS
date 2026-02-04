/**
 * GET /api/jobsheet-submissions/module/:moduleId
 * Get all submissions for a module (Admin only)
 */

import { NextRequest } from 'next/server';
import { authenticate, requireRole, createErrorResponse, createSuccessResponse } from '@/lib/api/middleware/auth';
import { supabase } from '@/lib/api/config/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { moduleId: string } }
) {
  try {
    const user = await authenticate(request);
    requireRole(user, 'admin');

    // Verify module belongs to admin
    const { data: module } = await supabase
      .from('modules')
      .select('uploaded_by, classes!inner(admin_id)')
      .eq('id', params.moduleId)
      .single();

    if (!module || (module.uploaded_by !== user.id && (module.classes as any).admin_id !== user.id)) {
      return createErrorResponse('You can only view submissions for your own modules', 403);
    }

    // Get submissions with student info
    const { data: submissions, error } = await supabase
      .from('jobsheet_submissions')
      .select(`
        *,
        profiles!student_id (
          id,
          full_name,
          email
        )
      `)
      .eq('module_id', params.moduleId)
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
