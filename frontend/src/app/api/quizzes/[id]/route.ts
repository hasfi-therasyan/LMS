/**
 * GET /api/quizzes/:id - Get a specific quiz
 * PUT /api/quizzes/:id - Update a quiz (Admin only)
 * DELETE /api/quizzes/:id - Delete a quiz (Admin only)
 */

import { NextRequest } from 'next/server';
import { authenticate, requireRole, createErrorResponse, createSuccessResponse } from '@/lib/api/middleware/auth';
import { supabase } from '@/lib/api/config/supabase';
import { z } from 'zod';

const updateQuizSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  timeLimit: z.number().positive().optional(),
  questions: z.array(
    z.object({
      questionText: z.string().min(1),
      optionA: z.string().min(1),
      optionB: z.string().min(1),
      optionC: z.string().min(1),
      optionD: z.string().min(1),
      optionE: z.string().min(1),
      correctAnswer: z.enum(['A', 'B', 'C', 'D', 'E']),
      points: z.number().positive().default(1),
      orderIndex: z.number().int().nonnegative()
    })
  ).min(1)
});

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
    if (user.role === 'mahasiswa') {
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
              option_e,
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
            option_e: q.option_e,
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
          option_e: q.option_e,
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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await authenticate(request);
    requireRole(user, 'admin');

    const body = await request.json();
    const { title, description, timeLimit, questions } = updateQuizSchema.parse(body);

    const { data: quiz, error: fetchError } = await supabase
      .from('quizzes')
      .select('id, created_by')
      .eq('id', params.id)
      .single();

    if (fetchError || !quiz) {
      return createErrorResponse('Quiz not found', 404);
    }

    if (quiz.created_by !== user.id) {
      return createErrorResponse('You can only edit your own quizzes', 403);
    }

    const { error: updateError } = await supabase
      .from('quizzes')
      .update({
        title,
        description: description ?? null,
        time_limit: timeLimit ?? null
      })
      .eq('id', params.id);

    if (updateError) throw updateError;

    await supabase.from('quiz_questions').delete().eq('quiz_id', params.id);

    const questionsData = questions.map(q => ({
      quiz_id: params.id,
      question_text: q.questionText,
      option_a: q.optionA,
      option_b: q.optionB,
      option_c: q.optionC,
      option_d: q.optionD,
      option_e: q.optionE,
      correct_answer: q.correctAnswer,
      points: q.points,
      order_index: q.orderIndex
    }));

    const { data: createdQuestions, error: questionsError } = await supabase
      .from('quiz_questions')
      .insert(questionsData)
      .select();

    if (questionsError) throw questionsError;

    const { data: updatedQuiz } = await supabase
      .from('quizzes')
      .select('*')
      .eq('id', params.id)
      .single();

    return createSuccessResponse({
      message: 'Quiz updated successfully',
      quiz: {
        ...updatedQuiz,
        questions: createdQuestions
      }
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
    return createErrorResponse(error.message || 'Failed to update quiz', 500);
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
