/**
 * AI Chatbot Routes
 * 
 * Handles AI chatbot interactions for post-quiz learning discussions
 */

import express from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import { supabase } from '../config/supabase';
import { generateAIResponse, buildAIContext } from '../config/gemini';
import { z } from 'zod';

const router = express.Router();

/**
 * POST /api/ai/chat/start
 * Start a new AI chat session for an incorrect question
 * This is called automatically after quiz submission if there are incorrect answers
 */
const startChatSchema = z.object({
  submissionId: z.string().uuid(),
  questionId: z.string().uuid()
});

router.post(
  '/chat/start',
  authenticate,
  requireRole('mahasiswa'),
  async (req, res) => {
    try {
      const { submissionId, questionId } = startChatSchema.parse(req.body);

      // Verify submission belongs to student
      const { data: submission, error: subError } = await supabase
        .from('quiz_submissions')
        .select('*, quizzes(*)')
        .eq('id', submissionId)
        .eq('student_id', req.user!.id)
        .single();

      if (subError || !submission) {
        return res.status(404).json({
          error: 'Not found',
          message: 'Submission not found'
        });
      }

      // Verify question belongs to the quiz
      const { data: question, error: qError } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('id', questionId)
        .eq('quiz_id', (submission.quizzes as any).id)
        .single();

      if (qError || !question) {
        return res.status(404).json({
          error: 'Not found',
          message: 'Question not found'
        });
      }

      // Verify the answer was incorrect
      const { data: answer, error: aError } = await supabase
        .from('quiz_answers')
        .select('*')
        .eq('submission_id', submissionId)
        .eq('question_id', questionId)
        .single();

      if (aError || !answer || answer.is_correct) {
        return res.status(400).json({
          error: 'Invalid request',
          message: 'Chat is only available for incorrect answers'
        });
      }

      // Check if session already exists
      const { data: existingSession } = await supabase
        .from('ai_chat_sessions')
        .select('*')
        .eq('submission_id', submissionId)
        .eq('question_id', questionId)
        .single();

      if (existingSession) {
        // Return existing session with messages
        const { data: messages } = await supabase
          .from('ai_chat_messages')
          .select('*')
          .eq('session_id', existingSession.id)
          .order('created_at', { ascending: true });

        return res.json({
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
      // This text was extracted from classes.file_url (PDF) when quiz was created
      const quiz = submission.quizzes as any;
      let classData = null;
      
      if (quiz?.class_id) {
        console.log(`Fetching extracted text from classes table for class_id: ${quiz.class_id}`);
        const { data, error: classError } = await supabase
          .from('classes')
          .select('extracted_text, file_url')
          .eq('id', quiz.class_id)
          .single();
        
        if (classError) {
          console.error('Error fetching class data:', classError);
          // Continue without extracted text if class not found
        } else {
          classData = data;
          if (classData?.extracted_text) {
            console.log(`✓ Found extracted text (${classData.extracted_text.length} characters) from classes.file_url: ${classData.file_url}`);
          } else {
            console.warn(`⚠ No extracted_text found for class_id: ${quiz.class_id}. The PDF may not have been processed yet.`);
          }
        }
      } else {
        console.warn('Quiz has no class_id, continuing without extracted text');
      }

      // Find question number
      const questionIndex = allQuestions?.findIndex(q => q.question_text === question.question_text) ?? -1;
      const questionNumber = questionIndex >= 0 ? questionIndex + 1 : 1;

      // Build AI context with all quiz questions and extracted module text
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
          student_id: req.user!.id,
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
        console.log('Generating AI response with context length:', context.length);
        aiResponse = await generateAIResponse(context, []);
        console.log('AI response generated successfully, length:', aiResponse.length);
      } catch (aiError: any) {
        console.error('Error generating AI response:', aiError);
        // Delete the session if AI generation fails
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
        // Clean up session if message storage fails
        await supabase.from('ai_chat_sessions').delete().eq('id', session.id);
        throw msgError;
      }

      res.status(201).json({
        message: 'Chat session started',
        session,
        messages: [aiMessage]
      });
    } catch (error: any) {
      console.error('Error in /chat/start:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation error',
          details: error.errors
        });
      }

      res.status(500).json({
        error: 'Failed to start chat session',
        message: error.message || 'An unexpected error occurred',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }
);

/**
 * POST /api/ai/chat/:sessionId/message
 * Send a message in an existing chat session
 */
const sendMessageSchema = z.object({
  content: z.string().min(1).max(1000)
});

router.post(
  '/chat/:sessionId/message',
  authenticate,
  requireRole('mahasiswa'),
  async (req, res) => {
    try {
      const sessionId = req.params.sessionId;
      const { content } = sendMessageSchema.parse(req.body);

      // Verify session belongs to student
      const { data: session, error: sessionError } = await supabase
        .from('ai_chat_sessions')
        .select('*, quiz_questions(*), quiz_submissions(*, quizzes(*))')
        .eq('id', sessionId)
        .eq('student_id', req.user!.id)
        .single();

      if (sessionError || !session) {
        return res.status(404).json({
          error: 'Not found',
          message: 'Chat session not found'
        });
      }

      // Get conversation history
      const { data: messages, error: msgError } = await supabase
        .from('ai_chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (msgError) {
        throw msgError;
      }

      // Store user message
      const { data: userMessage, error: userMsgError } = await supabase
        .from('ai_chat_messages')
        .insert({
          session_id: sessionId,
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

      // Get class extracted text for module context
      // This text was extracted from classes.file_url (PDF) when quiz was created
      let classData = null;
      
      if (quiz?.class_id) {
        console.log(`Fetching extracted text from classes table for class_id: ${quiz.class_id}`);
        const { data, error: classError } = await supabase
          .from('classes')
          .select('extracted_text, file_url')
          .eq('id', quiz.class_id)
          .single();
        
        if (classError) {
          console.error('Error fetching class data:', classError);
          // Continue without extracted text if class not found
        } else {
          classData = data;
          if (classData?.extracted_text) {
            console.log(`✓ Found extracted text (${classData.extracted_text.length} characters) from classes.file_url: ${classData.file_url}`);
          } else {
            console.warn(`⚠ No extracted_text found for class_id: ${quiz.class_id}. The PDF may not have been processed yet.`);
          }
        }
      } else {
        console.warn('Quiz has no class_id, continuing without extracted text');
      }

      // Find question number
      const questionIndex = allQuestions?.findIndex(q => q.question_text === question.question_text) ?? -1;
      const questionNumber = questionIndex >= 0 ? questionIndex + 1 : 1;

      // Check if user's message contains the correct answer
      // This helps the AI detect when student has understood
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

      // Build context with all quiz questions and extracted module text
      let context = buildAIContext(
        allQuestions || [],
        question.question_text,
        answer?.student_answer || 'No answer',
        question.correct_answer,
        classData?.extracted_text || null,
        questionNumber
      );

      // Build conversation history for AI
      const conversationHistory = (messages || []).map((m: any) => ({
        role: m.role,
        content: m.content
      }));

      // Add user's new message to history
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
        console.log(`✓ Detected correct answer (${correctAnswer}) in user message`);
      }

      // Generate AI response
      let aiResponseContent: string;
      try {
        console.log('Generating AI response for session:', sessionId);
        aiResponseContent = await generateAIResponse(context, conversationHistory);
        console.log('AI response generated successfully');
      } catch (aiError: any) {
        console.error('Error generating AI response:', aiError);
        throw new Error(`Failed to generate AI response: ${aiError.message || 'Unknown error'}`);
      }

      // Store AI response
      const { data: aiMessage, error: aiMsgError } = await supabase
        .from('ai_chat_messages')
        .insert({
          session_id: sessionId,
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
        .eq('id', sessionId);

      res.json({
        message: 'Message sent successfully',
        userMessage,
        aiMessage
      });
    } catch (error: any) {
      console.error('Error in /chat/:sessionId/message:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation error',
          details: error.errors
        });
      }

      res.status(500).json({
        error: 'Failed to send message',
        message: error.message || 'An unexpected error occurred',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }
);

/**
 * GET /api/ai/chat/:sessionId
 * Get chat session with all messages
 */
router.get(
  '/chat/:sessionId',
  authenticate,
  requireRole('mahasiswa'),
  async (req, res) => {
    try {
      const sessionId = req.params.sessionId;

      // Verify session belongs to student
      const { data: session, error: sessionError } = await supabase
        .from('ai_chat_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('student_id', req.user!.id)
        .single();

      if (sessionError || !session) {
        return res.status(404).json({
          error: 'Not found',
          message: 'Chat session not found'
        });
      }

      // Get messages
      const { data: messages, error: msgError } = await supabase
        .from('ai_chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (msgError) {
        throw msgError;
      }

      res.json({
        session,
        messages: messages || []
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'Failed to fetch chat session',
        message: error.message
      });
    }
  }
);

export default router;
