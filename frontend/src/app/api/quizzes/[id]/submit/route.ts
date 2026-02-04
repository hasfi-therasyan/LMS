/**
 * POST /api/quizzes/:id/submit
 * Submit quiz answers (Mahasiswa only)
 */

import { NextRequest } from 'next/server';
import { authenticate, requireRole, createErrorResponse, createSuccessResponse } from '@/lib/api/middleware/auth';
import { supabase } from '@/lib/api/config/supabase';
import { z } from 'zod';

const submitQuizSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string().uuid(),
      answer: z.enum(['A', 'B', 'C', 'D', 'E'])
    })
  )
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await authenticate(request);
    requireRole(user, 'student');

    const body = await request.json();
    const { answers } = submitQuizSchema.parse(body);

    // Get quiz and questions
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .select('*')
      .eq('id', params.id)
      .single();

    if (quizError || !quiz) {
      return createErrorResponse('Quiz not found', 404);
    }

    // Check if already submitted
    const { data: existingSubmission } = await supabase
      .from('quiz_submissions')
      .select('id')
      .eq('quiz_id', params.id)
      .eq('student_id', user.id)
      .single();

    if (existingSubmission) {
      return createErrorResponse('You have already submitted this quiz', 400);
    }

    // Get all questions
    const { data: questions, error: questionsError } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('quiz_id', params.id);

    if (questionsError) {
      throw questionsError;
    }

    if (!questions || questions.length === 0) {
      return createErrorResponse('Quiz has no questions', 400);
    }

    // Get class information for extracted text
    const { data: classData } = await supabase
      .from('classes')
      .select('extracted_text, file_url')
      .eq('id', quiz.class_id)
      .single();

    // Evaluate answers
    let totalScore = 0;
    let totalPoints = 0;
    const answerRecords: any[] = [];
    const incorrectQuestions: any[] = [];

    for (const question of questions) {
      totalPoints += question.points;
      const studentAnswer = answers.find(a => a.questionId === question.id);
      const isCorrect = studentAnswer?.answer === question.correct_answer;
      const pointsEarned = isCorrect ? question.points : 0;
      totalScore += pointsEarned;

      answerRecords.push({
        question_id: question.id,
        student_answer: studentAnswer?.answer || null,
        is_correct: isCorrect,
        points_earned: pointsEarned
      });

      if (!isCorrect) {
        incorrectQuestions.push({
          questionId: question.id,
          questionText: question.question_text,
          studentAnswer: studentAnswer?.answer || 'No answer',
          correctAnswer: question.correct_answer
        });
      }
    }

    // Create submission
    const { data: submission, error: submissionError } = await supabase
      .from('quiz_submissions')
      .insert({
        quiz_id: params.id,
        student_id: user.id,
        score: totalScore,
        total_points: totalPoints
      })
      .select()
      .single();

    if (submissionError) {
      throw submissionError;
    }

    // Create answer records
    const answersData = answerRecords.map(ar => ({
      submission_id: submission.id,
      question_id: ar.question_id,
      student_answer: ar.student_answer,
      is_correct: ar.is_correct,
      points_earned: ar.points_earned
    }));

    const { error: answersError } = await supabase
      .from('quiz_answers')
      .insert(answersData);

    if (answersError) {
      // Rollback submission
      await supabase.from('quiz_submissions').delete().eq('id', submission.id);
      throw answersError;
    }

    return createSuccessResponse({
      message: 'Quiz submitted successfully',
      submission: {
        ...submission,
        incorrectQuestions: incorrectQuestions.length > 0 ? incorrectQuestions : undefined,
        extractedText: classData?.extracted_text || null
      }
    }, 201);
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
    return createErrorResponse(error.message || 'Failed to submit quiz', 500);
  }
}
