/**
 * Quiz Routes
 * 
 * Handles quiz creation, retrieval, submission, and grading
 */

import express from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import { supabase } from '../config/supabase';
import { z } from 'zod';

const router = express.Router();

/**
 * POST /api/quizzes
 * Create a new quiz (Admin/Dosen only)
 */
const createQuizSchema = z.object({
  moduleId: z.string().uuid(),
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
      correctAnswer: z.enum(['A', 'B', 'C', 'D']),
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
      const { moduleId, title, description, timeLimit, questions } = createQuizSchema.parse(req.body);

      // Verify module exists and belongs to lecturer
      const { data: module, error: moduleError } = await supabase
        .from('modules')
        .select('*, classes(*)')
        .eq('id', moduleId)
        .single();

      if (moduleError || !module) {
        return res.status(404).json({
          error: 'Not found',
          message: 'Module not found'
        });
      }

      // Check if admin owns the class
      const classData = module.classes as any;
      if (classData.admin_id !== req.user!.id) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'You can only create quizzes for your own classes'
        });
      }

      // Create quiz
      const { data: quiz, error: quizError } = await supabase
        .from('quizzes')
        .insert({
          module_id: moduleId,
          title,
          description: description || null,
          time_limit: timeLimit || null,
          created_by: req.user!.id
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
      modules (
        id,
        title,
        class_id,
        classes (
          id,
          name,
          code
        )
      )
    `);

    // Mahasiswa can see ALL quizzes (no enrollment required)
    // No filtering needed for mahasiswa
    
    // Admins can see quizzes in their classes
    if (req.user!.role === 'admin') {
      const { data: classes } = await supabase
        .from('classes')
        .select('id')
        .eq('admin_id', req.user!.id);

      if (classes && classes.length > 0) {
        const classIds = classes.map(c => c.id);

        const { data: modules } = await supabase
          .from('modules')
          .select('id')
          .in('class_id', classIds);

        if (modules && modules.length > 0) {
          const moduleIds = modules.map(m => m.id);
          query = query.in('module_id', moduleIds);
        } else {
          return res.json([]);
        }
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
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .select(`
        *,
        modules (
          id,
          title,
          class_id,
          classes (
            id,
            name,
            code
          )
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

    // Get questions
    const { data: questions, error: questionsError } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('quiz_id', req.params.id)
      .order('order_index', { ascending: true });

    if (questionsError) {
      throw questionsError;
    }

      // For mahasiswa, hide correct answers
      if (req.user!.role === 'mahasiswa') {
      const questionsWithoutAnswers = questions?.map(q => ({
        id: q.id,
        question_text: q.question_text,
        option_a: q.option_a,
        option_b: q.option_b,
        option_c: q.option_c,
        option_d: q.option_d,
        points: q.points,
        order_index: q.order_index
      }));

      res.json({
        ...quiz,
        questions: questionsWithoutAnswers
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
 * POST /api/quizzes/:id/submit
 * Submit quiz answers (Mahasiswa only)
 */
const submitQuizSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string().uuid(),
      answer: z.enum(['A', 'B', 'C', 'D'])
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
          incorrectQuestions: incorrectQuestions.length > 0 ? incorrectQuestions : undefined
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

export default router;
