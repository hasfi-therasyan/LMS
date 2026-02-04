/**
 * Quizzes API Routes
 * GET /api/quizzes - Get all quizzes
 * POST /api/quizzes - Create a new quiz (Admin only)
 */

import { NextRequest } from 'next/server';
import { authenticate, requireRole, createErrorResponse, createSuccessResponse } from '@/lib/api/middleware/auth';
import { supabase } from '@/lib/api/config/supabase';
import { downloadAndExtractText } from '@/lib/api/utils/quizHelpers';
import { z } from 'zod';

const createQuizSchema = z.object({
  classId: z.string().uuid(),
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

export async function GET(request: NextRequest) {
  try {
    const user = await authenticate(request);

    let query = supabase.from('quizzes').select(`
      *,
      classes (
        id,
        name,
        code
      )
    `);

    // Mahasiswa can see ALL quizzes
    // Admins can see quizzes in their classes
    if (user.role === 'admin') {
      const { data: classes } = await supabase
        .from('classes')
        .select('id')
        .eq('admin_id', user.id);

      if (classes && classes.length > 0) {
        const classIds = classes.map(c => c.id);
        query = query.in('class_id', classIds);
      } else {
        return createSuccessResponse([]);
      }
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return createSuccessResponse(data);
  } catch (error: any) {
    if (error.message?.includes('authorization')) {
      return createErrorResponse('Missing or invalid authorization header', 401);
    }
    return createErrorResponse(error.message || 'Failed to fetch quizzes', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await authenticate(request);
    requireRole(user, 'admin');

    const body = await request.json();
    const { classId, title, description, timeLimit, questions } = createQuizSchema.parse(body);

    // Verify class exists and belongs to admin
    const { data: classData, error: classError } = await supabase
      .from('classes')
      .select('*')
      .eq('id', classId)
      .single();

    if (classError || !classData) {
      return createErrorResponse('Class not found', 404);
    }

    // Check if admin owns the class
    if (classData.admin_id !== user.id) {
      return createErrorResponse('You can only create quizzes for your own classes', 403);
    }

    // Extract text from class file_url if available
    if (classData.file_url) {
      if (!classData.extracted_text) {
        console.log(`📄 Extracting text from class PDF: ${classData.file_url}`);
        const extractedText = await downloadAndExtractText(classData.file_url);
        if (extractedText) {
          console.log(`✓ Successfully extracted ${extractedText.length} characters from PDF`);
          const { error: updateError } = await supabase
            .from('classes')
            .update({ extracted_text: extractedText })
            .eq('id', classId);
          
          if (updateError) {
            console.error('Failed to save extracted text:', updateError);
          } else {
            console.log(`✓ Saved extracted text for class_id: ${classId}`);
          }
        }
      }
    }

    // Create quiz
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .insert({
        class_id: classId,
        title,
        description: description || null,
        time_limit: timeLimit || null,
        created_by: user.id
      })
      .select()
      .single();

    if (quizError) {
      throw quizError;
    }

    // Create questions
    const questionsData = questions.map(q => ({
      quiz_id: quiz.id,
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

    if (questionsError) {
      // Rollback: delete quiz if questions creation fails
      await supabase.from('quizzes').delete().eq('id', quiz.id);
      throw questionsError;
    }

    return createSuccessResponse({
      message: 'Quiz created successfully',
      quiz: {
        ...quiz,
        questions: createdQuestions
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
    return createErrorResponse(error.message || 'Failed to create quiz', 500);
  }
}
