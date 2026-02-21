/**
 * PATCH /api/quizzes/:id/publish
 * Set quiz visibility to mahasiswa (Upload = publish, Archive = unpublish). Admin only.
 * Only updates quizzes.is_published. Submissions and scores are never deleted or reset.
 */

import { NextRequest } from 'next/server';
import { authenticate, requireRole, createErrorResponse, createSuccessResponse } from '@/lib/api/middleware/auth';
import { supabase } from '@/lib/api/config/supabase';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await authenticate(request);
    requireRole(user, 'admin');

    const body = await request.json();
    const is_published = body.is_published;
    if (typeof is_published !== 'boolean') {
      return createErrorResponse('is_published must be a boolean', 400);
    }

    const { data: quiz, error: fetchError } = await supabase
      .from('quizzes')
      .select('id, created_by')
      .eq('id', params.id)
      .single();

    if (fetchError || !quiz) {
      return createErrorResponse('Quiz not found', 404);
    }

    if (quiz.created_by !== user.id) {
      return createErrorResponse('You can only update your own quizzes', 403);
    }

    // Only update visibility; never touch quiz_submissions or quiz_answers
    const { error: updateError } = await supabase
      .from('quizzes')
      .update({ is_published })
      .eq('id', params.id);

    if (updateError) throw updateError;

    return createSuccessResponse({
      message: is_published ? 'Quiz published (visible to mahasiswa)' : 'Quiz archived (hidden from mahasiswa)',
      is_published
    });
  } catch (error: any) {
    if (error.message?.includes('authorization')) {
      return createErrorResponse('Missing or invalid authorization header', 401);
    }
    if (error.message?.includes('requires')) {
      return createErrorResponse(error.message, 403);
    }
    return createErrorResponse(error.message || 'Failed to update quiz visibility', 500);
  }
}
