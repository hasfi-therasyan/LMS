/**
 * PATCH /api/jobsheet-submissions/:submissionId/grade
 * Grade a jobsheet submission (Admin only)
 */

import { NextRequest } from 'next/server';
import { authenticate, requireRole, createErrorResponse, createSuccessResponse } from '@/lib/api/middleware/auth';
import { supabase } from '@/lib/api/config/supabase';
import { z } from 'zod';

const gradeSchema = z.object({
  grade: z.number().min(0).max(100),
  feedback: z.string().optional()
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { submissionId: string } }
) {
  try {
    const user = await authenticate(request);
    requireRole(user, 'admin');

    const body = await request.json();
    const { grade, feedback } = gradeSchema.parse(body);

    // Get submission and verify access
    const { data: submission, error: fetchError } = await supabase
      .from('jobsheet_submissions')
      .select(`
        *,
        modules!inner (
          uploaded_by,
          classes!inner (
            admin_id
          )
        )
      `)
      .eq('id', params.submissionId)
      .single();

    if (fetchError || !submission) {
      return createErrorResponse('Submission not found', 404);
    }

    const module = (submission.modules as any);
    if (module.uploaded_by !== user.id && module.classes.admin_id !== user.id) {
      return createErrorResponse('You can only grade submissions for your own modules', 403);
    }

    // Update submission with grade
    const { data: updated, error: updateError } = await supabase
      .from('jobsheet_submissions')
      .update({
        grade,
        feedback: feedback || null,
        graded_by: user.id,
        graded_at: new Date().toISOString()
      })
      .eq('id', params.submissionId)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    return createSuccessResponse({
      message: 'Submission graded successfully',
      submission: updated
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return createErrorResponse('Validation error', 400);
    }
    if (error.message?.includes('authorization')) {
      return createErrorResponse('Missing or invalid authorization header', 401);
    }
    if (error.message?.includes('requires')) {
      return createErrorResponse(error.message, 403);
    }
    return createErrorResponse(error.message || 'Failed to grade submission', 500);
  }
}
