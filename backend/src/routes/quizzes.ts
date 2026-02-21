/**
 * Quiz Routes
 * 
 * Handles quiz creation, retrieval, submission, and grading
 */

import express from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import { supabase } from '../config/supabase';
import { extractTextFromPDF } from '../utils/pdfExtractor';
import { z } from 'zod';
import https from 'https';
import http from 'http';

const router = express.Router();

/**
 * Helper function to download PDF from URL and extract text
 */
async function downloadAndExtractText(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download PDF: ${response.statusText}`);
    }
    const buffer = Buffer.from(await response.arrayBuffer());
    return await extractTextFromPDF(buffer);
  } catch (error) {
    console.error('Error downloading/extracting PDF:', error);
    return null;
  }
}

/**
 * POST /api/quizzes
 * Create a new quiz (Admin/Dosen only)
 * Now based on classes instead of modules
 */
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

router.post(
  '/',
  authenticate,
  requireRole('admin'),
  async (req, res) => {
    try {
      const { classId, title, description, timeLimit, questions } = createQuizSchema.parse(req.body);

      // Verify class exists and belongs to admin
      const { data: classData, error: classError } = await supabase
        .from('classes')
        .select('*')
        .eq('id', classId)
        .single();

      if (classError || !classData) {
        return res.status(404).json({
          error: 'Not found',
          message: 'Class not found'
        });
      }

      // Check if admin owns the class
      if (classData.admin_id !== req.user!.id) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'You can only create quizzes for your own classes'
        });
      }

      // Extract text from class file_url if available
      // This extracted text will be stored in classes.extracted_text and used by AI chatbot
      // IMPORTANT: Only extract if extracted_text doesn't exist yet (avoid re-extraction)
      if (classData.file_url) {
        if (!classData.extracted_text) {
          // Only extract if extracted_text is null/empty
          console.log(`📄 Extracting text from class PDF (file_url): ${classData.file_url}`);
          const extractedText = await downloadAndExtractText(classData.file_url);
          if (extractedText) {
            console.log(`✓ Successfully extracted ${extractedText.length} characters from PDF`);
            // Store extracted text in classes.extracted_text for AI chatbot to use as context
            const { error: updateError } = await supabase
              .from('classes')
              .update({ extracted_text: extractedText })
              .eq('id', classId);
            
            if (updateError) {
              console.error('Failed to save extracted text to database:', updateError);
            } else {
              console.log(`✓ Saved extracted text to classes.extracted_text for class_id: ${classId}`);
            }
          } else {
            console.warn('⚠ Failed to extract text from PDF, continuing without extracted text');
          }
        } else {
          // Extracted text already exists, reuse it
          console.log(`✓ Using existing extracted_text (${classData.extracted_text.length} characters) from classes table. No re-extraction needed.`);
        }
      } else {
        console.warn('⚠ Class has no file_url, quiz created without extracted text. AI chatbot will work without module context.');
      }

      // Create quiz (draft by default; admin uses Upload to publish to mahasiswa)
      const { data: quiz, error: quizError } = await supabase
        .from('quizzes')
        .insert({
          class_id: classId,
          title,
          description: description || null,
          time_limit: timeLimit || null,
          created_by: req.user!.id,
          is_published: false
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

      res.status(201).json({
        message: 'Quiz created successfully',
        quiz: {
          ...quiz,
          questions: createdQuestions
        }
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation error',
          details: error.errors
        });
      }

      res.status(500).json({
        error: 'Failed to create quiz',
        message: error.message
      });
    }
  }
);

/**
 * GET /api/quizzes
 * Get all quizzes (filtered by role)
 */
router.get('/', authenticate, async (req, res) => {
  try {
    let query = supabase.from('quizzes').select(`
      *,
      classes (
        id,
        name,
        code
      )
    `);

    if (req.user!.role === 'mahasiswa') {
      // Mahasiswa only see published (online) quizzes
      query = query.eq('is_published', true);
    } else if (req.user!.role === 'admin') {
      // Admins see all their quizzes (published and archived)
      const { data: classes } = await supabase
        .from('classes')
        .select('id')
        .eq('admin_id', req.user!.id);

      if (classes && classes.length > 0) {
        const classIds = classes.map(c => c.id);
        query = query.in('class_id', classIds);
      } else {
        return res.json([]);
      }
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    res.json(data);
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to fetch quizzes',
      message: error.message
    });
  }
});

/**
 * GET /api/quizzes/:id
 * Get a specific quiz with questions
 * For mahasiswa: Also checks if they already submitted and returns submission if exists
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
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
      .eq('id', req.params.id)
      .single();

    if (quizError || !quiz) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Quiz not found'
      });
    }

    // Mahasiswa can only access published quizzes
    if (req.user!.role === 'mahasiswa' && !quiz.is_published) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Quiz not found'
      });
    }

    // Get questions
    const { data: questions, error: questionsError } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('quiz_id', req.params.id)
      .order('order_index', { ascending: true });

    if (questionsError) {
      throw questionsError;
    }

    // For mahasiswa, check if already submitted
    if (req.user!.role === 'mahasiswa') {
      // Check if student already submitted this quiz
      const { data: existingSubmission } = await supabase
        .from('quiz_submissions')
        .select('id, score, total_points, submitted_at')
        .eq('quiz_id', req.params.id)
        .eq('student_id', req.user!.id)
        .single();

      if (existingSubmission) {
        // Get detailed answers for the submission
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
        
        // Sort answers by order_index manually since Supabase doesn't support nested ordering
        const sortedAnswers = (answers || []).sort((a: any, b: any) => {
          const orderA = a.quiz_questions?.order_index || 0;
          const orderB = b.quiz_questions?.order_index || 0;
          return orderA - orderB;
        });

        // Build incorrect questions list
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

        return res.json({
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

      // Not submitted yet - return quiz without answers
      const questionsWithoutAnswers = questions?.map(q => ({
        id: q.id,
        question_text: q.question_text,
        option_a: q.option_a,
        option_b: q.option_b,
        option_c: q.option_c,
        option_d: q.option_d,
        option_e: q.option_e,
        points: q.points,
        order_index: q.order_index
      }));

      return res.json({
        ...quiz,
        questions: questionsWithoutAnswers,
        alreadySubmitted: false
      });
    } else {
      // Admins see correct answers
      res.json({
        ...quiz,
        questions
      });
    }
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to fetch quiz',
      message: error.message
    });
  }
});

/**
 * PUT /api/quizzes/:id
 * Update a quiz (Admin only)
 */
router.put(
  '/:id',
  authenticate,
  requireRole('admin'),
  async (req, res) => {
    try {
      const quizId = req.params.id;
      const { title, description, timeLimit, questions } = createQuizSchema.omit({ classId: true }).parse(req.body);

      const { data: quiz, error: fetchError } = await supabase
        .from('quizzes')
        .select('id, created_by, class_id')
        .eq('id', quizId)
        .single();

      if (fetchError || !quiz) {
        return res.status(404).json({
          error: 'Not found',
          message: 'Quiz not found'
        });
      }

      if (quiz.created_by !== req.user!.id) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'You can only edit your own quizzes'
        });
      }

      const { error: updateError } = await supabase
        .from('quizzes')
        .update({
          title,
          description: description || null,
          time_limit: timeLimit || null
        })
        .eq('id', quizId);

      if (updateError) throw updateError;

      await supabase.from('quiz_questions').delete().eq('quiz_id', quizId);

      const questionsData = questions.map(q => ({
        quiz_id: quizId,
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
        .eq('id', quizId)
        .single();

      res.json({
        message: 'Quiz updated successfully',
        quiz: {
          ...updatedQuiz,
          questions: createdQuestions
        }
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation error',
          details: error.errors
        });
      }
      res.status(500).json({
        error: 'Failed to update quiz',
        message: error.message
      });
    }
  }
);

/**
 * POST /api/quizzes/:id/submit
 * Submit quiz answers (Mahasiswa only)
 */
const submitQuizSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string().uuid(),
      answer: z.enum(['A', 'B', 'C', 'D', 'E'])
    })
  )
});

router.post(
  '/:id/submit',
  authenticate,
  requireRole('mahasiswa'),
  async (req, res) => {
    try {
      const quizId = req.params.id;
      const { answers } = submitQuizSchema.parse(req.body);

      // Get quiz and questions
      const { data: quiz, error: quizError } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', quizId)
        .single();

      if (quizError || !quiz) {
        return res.status(404).json({
          error: 'Not found',
          message: 'Quiz not found'
        });
      }

      // Check if already submitted
      const { data: existingSubmission } = await supabase
        .from('quiz_submissions')
        .select('id')
        .eq('quiz_id', quizId)
        .eq('student_id', req.user!.id)
        .single();

      if (existingSubmission) {
        return res.status(400).json({
          error: 'Already submitted',
          message: 'You have already submitted this quiz'
        });
      }

      // Get all questions for this quiz
      const { data: questions, error: questionsError } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('quiz_id', quizId);

      if (questionsError) {
        throw questionsError;
      }

      if (!questions || questions.length === 0) {
        return res.status(400).json({
          error: 'Invalid quiz',
          message: 'Quiz has no questions'
        });
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

        // Track incorrect questions for AI chatbot
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
          quiz_id: quizId,
          student_id: req.user!.id,
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

      res.status(201).json({
        message: 'Quiz submitted successfully',
        submission: {
          ...submission,
          incorrectQuestions: incorrectQuestions.length > 0 ? incorrectQuestions : undefined,
          extractedText: classData?.extracted_text || null // Include extracted text for AI chatbot
        }
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation error',
          details: error.errors
        });
      }

      res.status(500).json({
        error: 'Failed to submit quiz',
        message: error.message
      });
    }
  }
);

/**
 * DELETE /api/quizzes/:id
 * Delete a quiz (Admin/Dosen only)
 */
router.delete(
  '/:id',
  authenticate,
  requireRole('admin'),
  async (req, res) => {
    try {
      const { id } = req.params;

      // Check if quiz exists and belongs to admin
      const { data: quiz, error: fetchError } = await supabase
        .from('quizzes')
        .select('created_by')
        .eq('id', id)
        .single();

      if (fetchError || !quiz) {
        return res.status(404).json({
          error: 'Not found',
          message: 'Quiz not found'
        });
      }

      // Check if admin owns this quiz
      if (quiz.created_by !== req.user!.id) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'You can only delete your own quizzes'
        });
      }

      // Delete the quiz (cascade will delete questions and submissions)
      const { error: deleteError } = await supabase
        .from('quizzes')
        .delete()
        .eq('id', id);

      if (deleteError) {
        throw deleteError;
      }

      res.json({
        message: 'Quiz deleted successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'Failed to delete quiz',
        message: error.message
      });
    }
  }
);

/**
 * PATCH /api/quizzes/:id/publish
 * Set quiz visibility to mahasiswa (Upload = publish, Archive = unpublish). Admin only.
 * Only updates quizzes.is_published. Does NOT touch quiz_submissions or quiz_answers:
 * nilai mahasiswa yang sudah mengerjakan tetap tersimpan saat quiz di-arsip lalu di-upload lagi.
 */
router.patch(
  '/:id/publish',
  authenticate,
  requireRole('admin'),
  async (req, res) => {
    try {
      const quizId = req.params.id;
      const { is_published } = req.body;
      if (typeof is_published !== 'boolean') {
        return res.status(400).json({
          error: 'Validation error',
          message: 'is_published must be a boolean'
        });
      }

      const { data: quiz, error: fetchError } = await supabase
        .from('quizzes')
        .select('id, created_by')
        .eq('id', quizId)
        .single();

      if (fetchError || !quiz) {
        return res.status(404).json({
          error: 'Not found',
          message: 'Quiz not found'
        });
      }

      if (quiz.created_by !== req.user!.id) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'You can only update your own quizzes'
        });
      }

      // Only update visibility; never delete or modify quiz_submissions / quiz_answers
      const { error: updateError } = await supabase
        .from('quizzes')
        .update({ is_published })
        .eq('id', quizId);

      if (updateError) throw updateError;

      res.json({
        message: is_published ? 'Quiz published (visible to mahasiswa)' : 'Quiz archived (hidden from mahasiswa)',
        is_published
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'Failed to update quiz visibility',
        message: error.message
      });
    }
  }
);

export default router;
