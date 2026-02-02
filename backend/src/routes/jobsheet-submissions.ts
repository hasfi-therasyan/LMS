/**
 * Jobsheet Submissions Routes
 * 
 * Handles student jobsheet submission uploads and grading by admins/dosen
 */

import express from 'express';
import multer from 'multer';
import { authenticate, requireRole } from '../middleware/auth';
import { supabase } from '../config/supabase';
import { validatePDF } from '../utils/pdfExtractor';
import { z } from 'zod';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760') // 10MB default
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

/**
 * POST /api/jobsheet-submissions
 * Submit jobsheet (Mahasiswa only)
 */
const submitJobsheetSchema = z.object({
  moduleId: z.string().uuid()
});

router.post(
  '/',
  authenticate,
  requireRole('mahasiswa'),
  upload.single('file'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          error: 'Missing file',
          message: 'PDF file is required'
        });
      }

      // Validate PDF
      if (!validatePDF(req.file.buffer)) {
        return res.status(400).json({
          error: 'Invalid file',
          message: 'File must be a valid PDF'
        });
      }

      const { moduleId } = submitJobsheetSchema.parse(req.body);

      // Check if module exists (no enrollment required)
      const { data: module, error: moduleError } = await supabase
        .from('modules')
        .select('*')
        .eq('id', moduleId)
        .single();

      if (moduleError || !module) {
        return res.status(404).json({
          error: 'Not found',
          message: 'Module not found'
        });
      }

      // Check if already submitted
      const { data: existing } = await supabase
        .from('jobsheet_submissions')
        .select('id')
        .eq('module_id', moduleId)
        .eq('student_id', req.user!.id)
        .single();

      if (existing) {
        return res.status(400).json({
          error: 'Already submitted',
          message: 'You have already submitted this jobsheet'
        });
      }

      // Upload file to Supabase Storage
      const fileName = `submission-${Date.now()}-${req.file.originalname}`;
      const filePath = `jobsheet-submissions/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('jobsheet-submissions')
        .upload(filePath, req.file.buffer, {
          contentType: 'application/pdf',
          upsert: false
        });

      if (uploadError) {
        // Check if bucket doesn't exist
        if (uploadError.message?.includes('Bucket not found') || uploadError.message?.includes('not found')) {
          return res.status(400).json({
            error: 'Storage bucket not found',
            message: 'The "jobsheet-submissions" storage bucket does not exist. Please create it in Supabase Dashboard → Storage → New Bucket (name: "jobsheet-submissions", set to Public)'
          });
        }
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('jobsheet-submissions')
        .getPublicUrl(filePath);

      // Create submission record
      const { data: submission, error: dbError } = await supabase
        .from('jobsheet_submissions')
        .insert({
          module_id: moduleId,
          student_id: req.user!.id,
          file_url: urlData.publicUrl
        })
        .select()
        .single();

      if (dbError) {
        // Clean up uploaded file if database insert fails
        await supabase.storage.from('jobsheet-submissions').remove([filePath]);
        throw dbError;
      }

      res.status(201).json({
        message: 'Jobsheet submitted successfully',
        submission
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation error',
          details: error.errors
        });
      }

      res.status(500).json({
        error: 'Failed to submit jobsheet',
        message: error.message
      });
    }
  }
);

/**
 * GET /api/jobsheet-submissions/module/:moduleId
 * Get all submissions for a module (Admin/Dosen only)
 */
router.get(
  '/module/:moduleId',
  authenticate,
  requireRole('admin'),
  async (req, res) => {
    try {
      const { moduleId } = req.params;

      // Verify module belongs to admin
      const { data: module } = await supabase
        .from('modules')
        .select('uploaded_by, classes!inner(admin_id)')
        .eq('id', moduleId)
        .single();

      if (!module || (module.uploaded_by !== req.user!.id && (module.classes as any).admin_id !== req.user!.id)) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'You can only view submissions for your own modules'
        });
      }

      // Get submissions with student info
      const { data: submissions, error } = await supabase
        .from('jobsheet_submissions')
        .select(`
          *,
          profiles!student_id (
            id,
            full_name,
            email
          )
        `)
        .eq('module_id', moduleId)
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

/**
 * GET /api/jobsheet-submissions/student
 * Get student's own submissions (Mahasiswa only)
 */
router.get(
  '/student',
  authenticate,
  requireRole('mahasiswa'),
  async (req, res) => {
    try {
      const { data: submissions, error } = await supabase
        .from('jobsheet_submissions')
        .select(`
          *,
          modules (
            id,
            title,
            description,
            classes (
              id,
              name,
              code
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

/**
 * PATCH /api/jobsheet-submissions/:id/grade
 * Grade a jobsheet submission (Admin/Dosen only)
 */
const gradeSchema = z.object({
  grade: z.number().min(0).max(100),
  feedback: z.string().optional()
});

router.patch(
  '/:id/grade',
  authenticate,
  requireRole('admin'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { grade, feedback } = gradeSchema.parse(req.body);

      // Get submission and verify access
      const { data: submission, error: fetchError } = await supabase
        .from('jobsheet_submissions')
        .select(`
          *,
          modules!inner (
            uploaded_by,
            classes!inner (
              admin_id
            )
          )
        `)
        .eq('id', id)
        .single();

      if (fetchError || !submission) {
        return res.status(404).json({
          error: 'Not found',
          message: 'Submission not found'
        });
      }

      const module = (submission.modules as any);
      if (module.uploaded_by !== req.user!.id && module.classes.admin_id !== req.user!.id) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'You can only grade submissions for your own modules'
        });
      }

      // Update submission with grade
      const { data: updated, error: updateError } = await supabase
        .from('jobsheet_submissions')
        .update({
          grade,
          feedback: feedback || null,
          graded_by: req.user!.id,
          graded_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      res.json({
        message: 'Submission graded successfully',
        submission: updated
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation error',
          details: error.errors
        });
      }

      res.status(500).json({
        error: 'Failed to grade submission',
        message: error.message
      });
    }
  }
);

export default router;
