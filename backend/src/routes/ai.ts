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

      // Build AI context with all quiz questions
      const context = buildAIContext(
        allQuestions || [],
        question.question_text,
        answer.student_answer,
        question.correct_answer
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
      const aiResponse = await generateAIResponse(context, []);

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
        throw msgError;
      }

      res.status(201).json({
        message: 'Chat session started',
        session,
        messages: [aiMessage]
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation error',
          details: error.errors
        });
      }

      res.status(500).json({
        error: 'Failed to start chat session',
        message: error.message
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

      // Build context with all quiz questions
      const context = buildAIContext(
        allQuestions || [],
        question.question_text,
        answer?.student_answer || 'No answer',
        question.correct_answer
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

      // Generate AI response
      const aiResponseContent = await generateAIResponse(context, conversationHistory);

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
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation error',
          details: error.errors
        });
      }

      res.status(500).json({
        error: 'Failed to send message',
        message: error.message
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
