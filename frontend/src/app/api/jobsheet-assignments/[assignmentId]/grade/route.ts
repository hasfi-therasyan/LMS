/**
 * PUT /api/jobsheet-assignments/:assignmentId/grade
 * Grade an assignment (Admin only)
 */

import { NextRequest } from 'next/server';
import { authenticate, requireRole, createErrorResponse, createSuccessResponse } from '@/lib/api/middleware/auth';
import { supabase } from '@/lib/api/config/supabase';
import { z } from 'zod';

const gradeAssignmentSchema = z.object({
  grade: z.number().min(0).max(100),
  feedback: z.string().optional()
});

export async function PUT(
  request: NextRequest,
  { params }: { params: { assignmentId: string } }
) {
  try {
    const user = await authenticate(request);
    requireRole(user, 'admin');

    const body = await request.json();
    const { grade, feedback } = gradeAssignmentSchema.parse(body);

    // Verify assignment exists and belongs to admin's jobsheet
    const { data: assignment, error: assignmentError } = await supabase
      .from('jobsheet_assignments')
      .select(`
        *,
        classes (
          id,
          admin_id
        )
      `)
      .eq('id', params.assignmentId)
      .single();

    if (assignmentError || !assignment) {
      return createErrorResponse('Assignment not found', 404);
    }

    const jobsheet = assignment.classes as any;
    if (jobsheet.admin_id !== user.id) {
      return createErrorResponse('You can only grade assignments for your own jobsheets', 403);
    }

    // Update assignment with grade
    const { data: updatedAssignment, error: updateError } = await supabase
      .from('jobsheet_assignments')
      .update({
        grade,
        feedback: feedback || null,
        graded_by: user.id,
        graded_at: new Date().toISOString()
      })
      .eq('id', params.assignmentId)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    return createSuccessResponse({
      message: 'Assignment graded successfully',
      assignment: updatedAssignment
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
    return createErrorResponse(error.message || 'Failed to grade assignment', 500);
  }
}
