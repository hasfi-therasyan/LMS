/**
 * GET /api/quizzes/:id - Get a specific quiz
 * DELETE /api/quizzes/:id - Delete a quiz (Admin only)
 */

import { NextRequest } from 'next/server';
import { authenticate, requireRole, createErrorResponse, createSuccessResponse } from '@/lib/api/middleware/auth';
import { supabase } from '@/lib/api/config/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await authenticate(request);

    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .select(`
        *,
        classes (
          id,
          name,
          code
        )
      `)
      .eq('id', params.id)
      .single();

    if (quizError || !quiz) {
      return createErrorResponse('Quiz not found', 404);
    }

    // Get questions
    const { data: questions, error: questionsError } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('quiz_id', params.id)
      .order('order_index', { ascending: true });

    if (questionsError) {
      throw questionsError;
    }

    // For student, check if already submitted
    if (user.role === 'student') {
      const { data: existingSubmission } = await supabase
        .from('quiz_submissions')
        .select('id, score, total_points, submitted_at')
        .eq('quiz_id', params.id)
        .eq('student_id', user.id)
        .single();

      if (existingSubmission) {
        // Get detailed answers
        const { data: answers } = await supabase
          .from('quiz_answers')
          .select(`
            *,
            quiz_questions!inner (
              id,
              question_text,
              option_a,
              option_b,
              option_c,
              option_d,
              correct_answer,
              points,
              order_index
            )
          `)
          .eq('submission_id', existingSubmission.id);
        
        const sortedAnswers = (answers || []).sort((a: any, b: any) => {
          const orderA = a.quiz_questions?.order_index || 0;
          const orderB = b.quiz_questions?.order_index || 0;
          return orderA - orderB;
        });

        const incorrectQuestions: any[] = [];
        sortedAnswers.forEach((answer: any) => {
          const question = answer.quiz_questions;
          if (!answer.is_correct && question) {
            incorrectQuestions.push({
              questionId: question.id,
              questionText: question.question_text,
              studentAnswer: answer.student_answer,
              correctAnswer: question.correct_answer
            });
          }
        });

        return createSuccessResponse({
          ...quiz,
          questions: questions?.map(q => ({
            id: q.id,
            question_text: q.question_text,
            option_a: q.option_a,
            option_b: q.option_b,
            option_c: q.option_c,
            option_d: q.option_d,
            points: q.points,
            order_index: q.order_index
          })),
          alreadySubmitted: true,
          submission: {
            ...existingSubmission,
            incorrectQuestions: incorrectQuestions.length > 0 ? incorrectQuestions : undefined,
            answers: sortedAnswers
          }
        });
      }

      // Not submitted yet
      return createSuccessResponse({
        ...quiz,
        questions: questions?.map(q => ({
          id: q.id,
          question_text: q.question_text,
          option_a: q.option_a,
          option_b: q.option_b,
          option_c: q.option_c,
          option_d: q.option_d,
          points: q.points,
          order_index: q.order_index
        })),
        alreadySubmitted: false
      });
    } else {
      // Admins see correct answers
      return createSuccessResponse({
        ...quiz,
        questions
      });
    }
  } catch (error: any) {
    if (error.message?.includes('authorization')) {
      return createErrorResponse('Missing or invalid authorization header', 401);
    }
    return createErrorResponse(error.message || 'Failed to fetch quiz', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await authenticate(request);
    requireRole(user, 'admin');

    // Check if quiz exists and belongs to admin
    const { data: quiz, error: fetchError } = await supabase
      .from('quizzes')
      .select('created_by')
      .eq('id', params.id)
      .single();

    if (fetchError || !quiz) {
      return createErrorResponse('Quiz not found', 404);
    }

    // Check if admin owns this quiz
    if (quiz.created_by !== user.id) {
      return createErrorResponse('You can only delete your own quizzes', 403);
    }

    // Delete the quiz
    const { error: deleteError } = await supabase
      .from('quizzes')
      .delete()
      .eq('id', params.id);

    if (deleteError) {
      throw deleteError;
    }

    return createSuccessResponse({ message: 'Quiz deleted successfully' });
  } catch (error: any) {
    if (error.message?.includes('authorization')) {
      return createErrorResponse('Missing or invalid authorization header', 401);
    }
    if (error.message?.includes('requires')) {
      return createErrorResponse(error.message, 403);
    }
    return createErrorResponse(error.message || 'Failed to delete quiz', 500);
  }
}
