/**
 * POST /api/ai/chat/start
 * Start a new AI chat session for an incorrect question
 */

import { NextRequest } from 'next/server';
import { authenticate, requireRole, createErrorResponse, createSuccessResponse } from '@/lib/api/middleware/auth';
import { supabase } from '@/lib/api/config/supabase';
import { generateAIResponse, buildAIContext } from '@/lib/api/config/gemini';
import { z } from 'zod';

const startChatSchema = z.object({
  submissionId: z.string().uuid(),
  questionId: z.string().uuid()
});

export async function POST(request: NextRequest) {
  try {
    const user = await authenticate(request);
    requireRole(user, 'student');

    const body = await request.json();
    const { submissionId, questionId } = startChatSchema.parse(body);

    // Verify submission belongs to student
    const { data: submission, error: subError } = await supabase
      .from('quiz_submissions')
      .select('*, quizzes(*)')
      .eq('id', submissionId)
      .eq('student_id', user.id)
      .single();

    if (subError || !submission) {
      return createErrorResponse('Submission not found', 404);
    }

    // Verify question belongs to the quiz
    const { data: question, error: qError } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('id', questionId)
      .eq('quiz_id', (submission.quizzes as any).id)
      .single();

    if (qError || !question) {
      return createErrorResponse('Question not found', 404);
    }

    // Verify the answer was incorrect
    const { data: answer, error: aError } = await supabase
      .from('quiz_answers')
      .select('*')
      .eq('submission_id', submissionId)
      .eq('question_id', questionId)
      .single();

    if (aError || !answer || answer.is_correct) {
      return createErrorResponse('Chat is only available for incorrect answers', 400);
    }

    // Check if session already exists
    const { data: existingSession } = await supabase
      .from('ai_chat_sessions')
      .select('*')
      .eq('submission_id', submissionId)
      .eq('question_id', questionId)
      .single();

    if (existingSession) {
      const { data: messages } = await supabase
        .from('ai_chat_messages')
        .select('*')
        .eq('session_id', existingSession.id)
        .order('created_at', { ascending: true });

      return createSuccessResponse({
        session: existingSession,
        messages: messages || []
      });
    }

    // Get all questions from the quiz for context
    const { data: allQuestions, error: questionsError } = await supabase
      .from('quiz_questions')
      .select('question_text, option_a, option_b, option_c, option_d, correct_answer')
      .eq('quiz_id', (submission.quizzes as any).id)
      .order('order_index', { ascending: true });

    if (questionsError) {
      throw questionsError;
    }

    // Get class extracted text for module context
    const quiz = submission.quizzes as any;
    let classData = null;
    
    if (quiz?.class_id) {
      const { data, error: classError } = await supabase
        .from('classes')
        .select('extracted_text, file_url')
        .eq('id', quiz.class_id)
        .single();
      
      if (!classError) {
        classData = data;
      }
    }

    // Find question number
    const questionIndex = allQuestions?.findIndex(q => q.question_text === question.question_text) ?? -1;
    const questionNumber = questionIndex >= 0 ? questionIndex + 1 : 1;

    // Build AI context
    const context = buildAIContext(
      allQuestions || [],
      question.question_text,
      answer.student_answer,
      question.correct_answer,
      classData?.extracted_text || null,
      questionNumber
    );

    // Create chat session
    const { data: session, error: sessionError } = await supabase
      .from('ai_chat_sessions')
      .insert({
        submission_id: submissionId,
        student_id: user.id,
        question_id: questionId
      })
      .select()
      .single();

    if (sessionError) {
      throw sessionError;
    }

    // Generate initial AI response
    let aiResponse: string;
    try {
      aiResponse = await generateAIResponse(context, []);
    } catch (aiError: any) {
      await supabase.from('ai_chat_sessions').delete().eq('id', session.id);
      throw new Error(`Failed to generate AI response: ${aiError.message || 'Unknown error'}`);
    }

    // Store initial AI message
    const { data: aiMessage, error: msgError } = await supabase
      .from('ai_chat_messages')
      .insert({
        session_id: session.id,
        role: 'assistant',
        content: aiResponse
      })
      .select()
      .single();

    if (msgError) {
      await supabase.from('ai_chat_sessions').delete().eq('id', session.id);
      throw msgError;
    }

    return createSuccessResponse({
      message: 'Chat session started',
      session,
      messages: [aiMessage]
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
    return createErrorResponse(error.message || 'Failed to start chat session', 500);
  }
}
