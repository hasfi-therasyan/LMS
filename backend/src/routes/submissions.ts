/**
 * Submissions Routes
 * 
 * Handles quiz submission viewing for lecturers
 */

import express from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import { supabase } from '../config/supabase';

const router = express.Router();

/**
 * GET /api/submissions/quiz/:quizId
 * Get all submissions for a specific quiz (Admin/Dosen only)
 */
router.get(
  '/quiz/:quizId',
  authenticate,
  requireRole('admin'),
  async (req, res) => {
    try {
      const quizId = req.params.quizId;

      // Verify quiz belongs to admin
      const { data: quiz } = await supabase
        .from('quizzes')
        .select('created_by')
        .eq('id', quizId)
        .single();

      if (!quiz || quiz.created_by !== req.user!.id) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'You can only view submissions for your own quizzes'
        });
      }

      // Get submissions with student info
      const { data: submissions, error } = await supabase
        .from('quiz_submissions')
        .select(`
          *,
          profiles (
            id,
            full_name,
            email
          )
        `)
        .eq('quiz_id', quizId)
        .order('submitted_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Get detailed answers for each submission
      const submissionsWithAnswers = await Promise.all(
        (submissions || []).map(async (submission: any) => {
          const { data: answers } = await supabase
            .from('quiz_answers')
            .select(`
              *,
              quiz_questions (
                id,
                question_text,
                correct_answer,
                points
              )
            `)
            .eq('submission_id', submission.id);

          return {
            ...submission,
            answers: answers || []
          };
        })
      );

      res.json(submissionsWithAnswers);
    } catch (error: any) {
      res.status(500).json({
        error: 'Failed to fetch submissions',
        message: error.message
      });
    }
  }
);

/**
 * GET /api/submissions/analytics/:quizId
 * Get analytics for a quiz (Admin/Dosen only)
 */
router.get(
  '/analytics/:quizId',
  authenticate,
  requireRole('admin'),
  async (req, res) => {
    try {
      const quizId = req.params.quizId;

      // Verify quiz belongs to admin
      const { data: quiz } = await supabase
        .from('quizzes')
        .select('created_by')
        .eq('id', quizId)
        .single();

      if (!quiz || quiz.created_by !== req.user!.id) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'You can only view analytics for your own quizzes'
        });
      }

      // Get all submissions
      const { data: submissions } = await supabase
        .from('quiz_submissions')
        .select('score, total_points')
        .eq('quiz_id', quizId);

      if (!submissions || submissions.length === 0) {
        return res.json({
          totalSubmissions: 0,
          averageScore: 0,
          averagePercentage: 0,
          correctnessRatio: 0
        });
      }

      // Calculate analytics
      const totalSubmissions = submissions.length;
      const totalScore = submissions.reduce((sum, s) => sum + s.score, 0);
      const totalPoints = submissions.reduce((sum, s) => sum + s.total_points, 0);
      const averageScore = totalScore / totalSubmissions;
      const averagePercentage = (totalScore / totalPoints) * 100;

      // Get all answers to calculate correctness ratio
      const { data: allAnswers } = await supabase
        .from('quiz_answers')
        .select('is_correct')
        .in('submission_id', submissions.map(s => s.id));

      const totalAnswers = allAnswers?.length || 0;
      const correctAnswers = allAnswers?.filter(a => a.is_correct).length || 0;
      const correctnessRatio = totalAnswers > 0 ? (correctAnswers / totalAnswers) * 100 : 0;

      res.json({
        totalSubmissions,
        averageScore: Math.round(averageScore * 100) / 100,
        averagePercentage: Math.round(averagePercentage * 100) / 100,
        correctnessRatio: Math.round(correctnessRatio * 100) / 100
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'Failed to fetch analytics',
        message: error.message
      });
    }
  }
);

/**
 * GET /api/submissions/student
 * Get all submissions for the current mahasiswa
 */
router.get(
  '/student',
  authenticate,
  requireRole('mahasiswa'),
  async (req, res) => {
    try {
      // Get all submissions for the student with quiz info
      const { data: submissions, error } = await supabase
        .from('quiz_submissions')
        .select(`
          *,
          quizzes (
            id,
            title,
            description,
            modules (
              id,
              title,
              classes (
                code,
                name
              )
            )
          )
        `)
        .eq('student_id', req.user!.id)
        .order('submitted_at', { ascending: false });

      if (error) {
        throw error;
      }

      res.json(submissions || []);
    } catch (error: any) {
      res.status(500).json({
        error: 'Failed to fetch submissions',
        message: error.message
      });
    }
  }
);

export default router;
