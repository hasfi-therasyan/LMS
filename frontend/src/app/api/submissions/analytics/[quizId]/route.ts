/**
 * GET /api/submissions/analytics/:quizId
 * Get analytics for a quiz (Admin only)
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
      return createErrorResponse('You can only view analytics for your own quizzes', 403);
    }

    // Get all submissions
    const { data: submissions } = await supabase
      .from('quiz_submissions')
      .select('score, total_points')
      .eq('quiz_id', params.quizId);

    if (!submissions || submissions.length === 0) {
      return createSuccessResponse({
        totalSubmissions: 0,
        averageScore: 0,
        averagePercentage: 0,
        correctnessRatio: 0
      });
    }

    // Calculate analytics
    const totalSubmissions = submissions.length;
    const totalScore = submissions.reduce((sum, s) => sum + s.score, 0);
    const totalPoints = submissions.reduce((sum, s) => sum + s.total_points, 0);
    const averageScore = totalScore / totalSubmissions;
    const averagePercentage = (totalScore / totalPoints) * 100;

    // Get all answers to calculate correctness ratio
    const { data: allAnswers } = await supabase
      .from('quiz_answers')
      .select('is_correct')
      .in('submission_id', submissions.map(s => s.id));

    const totalAnswers = allAnswers?.length || 0;
    const correctAnswers = allAnswers?.filter(a => a.is_correct).length || 0;
    const correctnessRatio = totalAnswers > 0 ? (correctAnswers / totalAnswers) * 100 : 0;

    return createSuccessResponse({
      totalSubmissions,
      averageScore: Math.round(averageScore * 100) / 100,
      averagePercentage: Math.round(averagePercentage * 100) / 100,
      correctnessRatio: Math.round(correctnessRatio * 100) / 100
    });
  } catch (error: any) {
    if (error.message?.includes('authorization')) {
      return createErrorResponse('Missing or invalid authorization header', 401);
    }
    if (error.message?.includes('requires')) {
      return createErrorResponse(error.message, 403);
    }
    return createErrorResponse(error.message || 'Failed to fetch analytics', 500);
  }
}
