/**
 * POST /api/ai/chat/:sessionId/message
 * Send a message in an existing chat session
 */

import { NextRequest } from 'next/server';
import { authenticate, requireRole, createErrorResponse, createSuccessResponse } from '@/lib/api/middleware/auth';
import { supabase } from '@/lib/api/config/supabase';
import { generateAIResponse, buildAIContext } from '@/lib/api/config/gemini';
import { z } from 'zod';

const sendMessageSchema = z.object({
  content: z.string().min(1).max(1000)
});

export async function POST(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const user = await authenticate(request);
    requireRole(user, 'student');

    const body = await request.json();
    const { content } = sendMessageSchema.parse(body);

    // Verify session belongs to student
    const { data: session, error: sessionError } = await supabase
      .from('ai_chat_sessions')
      .select('*, quiz_questions(*), quiz_submissions(*, quizzes(*))')
      .eq('id', params.sessionId)
      .eq('student_id', user.id)
      .single();

    if (sessionError || !session) {
      return createErrorResponse('Chat session not found', 404);
    }

    // Get conversation history
    const { data: messages, error: msgError } = await supabase
      .from('ai_chat_messages')
      .select('*')
      .eq('session_id', params.sessionId)
      .order('created_at', { ascending: true });

    if (msgError) {
      throw msgError;
    }

    // Store user message
    const { data: userMessage, error: userMsgError } = await supabase
      .from('ai_chat_messages')
      .insert({
        session_id: params.sessionId,
        role: 'user',
        content
      })
      .select()
      .single();

    if (userMsgError) {
      throw userMsgError;
    }

    // Get question and answer details
    const question = session.quiz_questions as any;
    const submission = session.quiz_submissions as any;
    const quiz = submission.quizzes as any;

    // Get student's answer
    const { data: answer } = await supabase
      .from('quiz_answers')
      .select('*')
      .eq('submission_id', submission.id)
      .eq('question_id', question.id)
      .single();

    // Get all questions from the quiz for context
    const { data: allQuestions, error: questionsError } = await supabase
      .from('quiz_questions')
      .select('question_text, option_a, option_b, option_c, option_d, correct_answer')
      .eq('quiz_id', quiz.id)
      .order('order_index', { ascending: true });

    if (questionsError) {
      throw questionsError;
    }

    // Get class extracted text
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

    // Check if user's message contains the correct answer
    const correctAnswer = question.correct_answer;
    const userMessageUpper = content.toUpperCase().trim();
    const correctAnswerDetected = 
      userMessageUpper === correctAnswer ||
      userMessageUpper.includes(`ANSWER IS ${correctAnswer}`) ||
      userMessageUpper.includes(`THE ANSWER IS ${correctAnswer}`) ||
      userMessageUpper.includes(`IT'S ${correctAnswer}`) ||
      userMessageUpper.includes(`IT IS ${correctAnswer}`) ||
      userMessageUpper.includes(`CORRECT ANSWER IS ${correctAnswer}`) ||
      (userMessageUpper.length === 1 && userMessageUpper === correctAnswer);

    // Build context
    let context = buildAIContext(
      allQuestions || [],
      question.question_text,
      answer?.student_answer || 'No answer',
      question.correct_answer,
      classData?.extracted_text || null,
      questionNumber
    );

    // Build conversation history
    const conversationHistory = (messages || []).map((m: any) => ({
      role: m.role,
      content: m.content
    }));

    conversationHistory.push({
      role: 'user',
      content
    });

    // Add special instruction if correct answer detected
    if (correctAnswerDetected) {
      context += `\n\n🎯 PENTING: Mahasiswa baru saja memberikan JAWABAN YANG BENAR (${correctAnswer}) dalam pesan mereka!
        
        Anda HARUS:
        1. Segera puji mereka dengan antusias: "Bagus sekali! Jawabanmu benar!" atau "Luar biasa! Kamu sudah memahaminya!"
        2. Konfirmasi pemahaman mereka: "Kamu telah menunjukkan bahwa kamu memahami konsepnya dengan benar."
        3. Tanyakan apakah ada pertanyaan lain: "Apakah ada hal lain yang ingin kamu tanyakan tentang topik ini atau pertanyaan lainnya?"
        4. Bersikaplah hangat, mendorong, dan rayakan kesuksesan mereka
        5. Selalu akhiri dengan menanyakan apakah mereka membutuhkan bantuan dengan pertanyaan lain
        
        Ini adalah momen sukses - buat mereka merasa bangga dengan pemahaman mereka!
        
        WAJIB: Gunakan BAHASA INDONESIA dalam respons Anda.`;
    }

    // Generate AI response
    let aiResponseContent: string;
    try {
      aiResponseContent = await generateAIResponse(context, conversationHistory);
    } catch (aiError: any) {
      throw new Error(`Failed to generate AI response: ${aiError.message || 'Unknown error'}`);
    }

    // Store AI response
    const { data: aiMessage, error: aiMsgError } = await supabase
      .from('ai_chat_messages')
      .insert({
        session_id: params.sessionId,
        role: 'assistant',
        content: aiResponseContent
      })
      .select()
      .single();

    if (aiMsgError) {
      throw aiMsgError;
    }

    // Update session last_message_at
    await supabase
      .from('ai_chat_sessions')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', params.sessionId);

    return createSuccessResponse({
      message: 'Message sent successfully',
      userMessage,
      aiMessage
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
    return createErrorResponse(error.message || 'Failed to send message', 500);
  }
}
