/**
 * GET /api/submissions/quiz/:quizId
 * Get all submissions for a specific quiz (Admin only)
 */

import { NextRequest } from 'next/server';
import { authenticate, requireRole, createErrorResponse, createSuccessResponse } from '@/lib/api/middleware/auth';
import { supabase } from '@/lib/api/config/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { quizId: string } }
) {
  try {
    const user = await authenticate(request);
    requireRole(user, 'admin');

    // Verify quiz belongs to admin
    const { data: quiz } = await supabase
      .from('quizzes')
      .select('created_by')
      .eq('id', params.quizId)
      .single();

    if (!quiz || quiz.created_by !== user.id) {
      return createErrorResponse('You can only view submissions for your own quizzes', 403);
    }

    // Get submissions with student info
    const { data: submissions, error } = await supabase
      .from('quiz_submissions')
      .select(`
        *,
        profiles (
          id,
          full_name,
          email
        )
      `)
      .eq('quiz_id', params.quizId)
      .order('submitted_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Get detailed answers for each submission
    const submissionsWithAnswers = await Promise.all(
      (submissions || []).map(async (submission: any) => {
        const { data: answers } = await supabase
          .from('quiz_answers')
          .select(`
            *,
            quiz_questions (
              id,
              question_text,
              correct_answer,
              points
            )
          `)
          .eq('submission_id', submission.id);

        return {
          ...submission,
          answers: answers || []
        };
      })
    );

    return createSuccessResponse(submissionsWithAnswers);
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
