/**
 * Jobsheet Assignments Routes
 * 
 * Handles mahasiswa assignment uploads and admin grading
 */

import express from 'express';
import multer from 'multer';
import { authenticate, requireRole } from '../middleware/auth';
import { supabase } from '../config/supabase';
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
 * POST /api/jobsheet-assignments
 * Upload assignment (Mahasiswa only)
 */
const uploadAssignmentSchema = z.object({
  jobsheetId: z.string().uuid(),
  nim: z.string().min(1)
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

      const { jobsheetId, nim } = uploadAssignmentSchema.parse(req.body);

      // Check if jobsheet exists
      const { data: jobsheet, error: jobsheetError } = await supabase
        .from('classes')
        .select('id, name')
        .eq('id', jobsheetId)
        .single();

      if (jobsheetError || !jobsheet) {
        return res.status(404).json({
          error: 'Not found',
          message: 'Jobsheet not found'
        });
      }

      // Check if student already uploaded 4 files for this jobsheet
      const { data: existingAssignments, error: countError } = await supabase
        .from('jobsheet_assignments')
        .select('id')
        .eq('jobsheet_id', jobsheetId)
        .eq('student_id', req.user!.id);

      if (countError) {
        throw countError;
      }

      if (existingAssignments && existingAssignments.length >= 4) {
        return res.status(400).json({
          error: 'Upload limit reached',
          message: 'You can only upload maximum 4 files per jobsheet'
        });
      }

      // Upload file to Supabase Storage
      const fileName = `assignment-${Date.now()}-${req.file.originalname}`;
      const filePath = `jobsheet-assignments/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('jobsheet-assignments')
        .upload(filePath, req.file.buffer, {
          contentType: 'application/pdf',
          upsert: false
        });

      if (uploadError) {
        if (uploadError.message?.includes('Bucket not found')) {
          return res.status(400).json({
            error: 'Storage bucket not found',
            message: 'The "jobsheet-assignments" storage bucket does not exist. Please create it in Supabase Dashboard → Storage → New Bucket (name: "jobsheet-assignments", set to Public)'
          });
        }
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('jobsheet-assignments')
        .getPublicUrl(filePath);

      // Create assignment record
      const { data: assignment, error: dbError } = await supabase
        .from('jobsheet_assignments')
        .insert({
          jobsheet_id: jobsheetId,
          student_id: req.user!.id,
          nim: nim,
          file_url: urlData.publicUrl,
          file_name: req.file.originalname
        })
        .select()
        .single();

      if (dbError) {
        // Clean up uploaded file if database insert fails
        await supabase.storage.from('jobsheet-assignments').remove([filePath]);
        throw dbError;
      }

      res.status(201).json({
        message: 'Assignment uploaded successfully',
        assignment
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation error',
          details: error.errors
        });
      }

      res.status(500).json({
        error: 'Failed to upload assignment',
        message: error.message
      });
    }
  }
);

/**
 * GET /api/jobsheet-assignments/student
 * Get student's own assignments (Mahasiswa only)
 */
router.get(
  '/student',
  authenticate,
  requireRole('mahasiswa'),
  async (req, res) => {
    try {
      const { data: assignments, error } = await supabase
        .from('jobsheet_assignments')
        .select(`
          *,
          classes (
            id,
            name,
            code
          )
        `)
        .eq('student_id', req.user!.id)
        .order('uploaded_at', { ascending: false });

      if (error) {
        throw error;
      }

      res.json(assignments || []);
    } catch (error: any) {
      res.status(500).json({
        error: 'Failed to fetch assignments',
        message: error.message
      });
    }
  }
);

/**
 * GET /api/jobsheet-assignments/all
 * Get all assignments grouped by student (Admin only)
 */
router.get(
  '/all',
  authenticate,
  requireRole('admin'),
  async (req, res) => {
    try {
      // Get all assignments from admin's jobsheets
      const { data: adminJobsheets, error: jobsheetError } = await supabase
        .from('classes')
        .select('id')
        .eq('admin_id', req.user!.id);

      if (jobsheetError) {
        throw jobsheetError;
      }

      const jobsheetIds = adminJobsheets?.map(j => j.id) || [];

      if (jobsheetIds.length === 0) {
        return res.json({ assignments: [], groupedByStudent: [] });
      }

      // Get all assignments with explicit foreign keys
      const { data: assignments, error } = await supabase
        .from('jobsheet_assignments')
        .select(`
          *,
          profiles!jobsheet_assignments_student_id_fkey (
            id,
            full_name,
            email
          ),
          classes!jobsheet_assignments_jobsheet_id_fkey (
            id,
            name,
            code
          )
        `)
        .in('jobsheet_id', jobsheetIds)
        .order('uploaded_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Group by student (student_id + nim)
      const groupedByStudent: Record<string, any> = {};
      assignments?.forEach((assignment: any) => {
        const student = assignment.profiles;
        const key = `${assignment.student_id}_${assignment.nim}`;
        
        if (!groupedByStudent[key]) {
          groupedByStudent[key] = {
            student_id: assignment.student_id,
            student_name: student?.full_name || 'Unknown',
            student_email: student?.email || '',
            nim: assignment.nim,
            assignments: []
          };
        }
        groupedByStudent[key].assignments.push(assignment);
      });

      res.json({
        assignments: assignments || [],
        groupedByStudent: Object.values(groupedByStudent)
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'Failed to fetch assignments',
        message: error.message
      });
    }
  }
);

/**
 * GET /api/jobsheet-assignments/jobsheet/:jobsheetId
 * Get all assignments for a jobsheet (Admin only)
 */
router.get(
  '/jobsheet/:jobsheetId',
  authenticate,
  requireRole('admin'),
  async (req, res) => {
    try {
      const { jobsheetId } = req.params;

      // Verify jobsheet exists and belongs to admin
      const { data: jobsheet, error: jobsheetError } = await supabase
        .from('classes')
        .select('id, admin_id')
        .eq('id', jobsheetId)
        .single();

      if (jobsheetError || !jobsheet) {
        return res.status(404).json({
          error: 'Not found',
          message: 'Jobsheet not found'
        });
      }

      if (jobsheet.admin_id !== req.user!.id) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'You can only view assignments for your own jobsheets'
        });
      }

      // Get all assignments - use explicit foreign key to avoid relationship ambiguity
      const { data: assignments, error } = await supabase
        .from('jobsheet_assignments')
        .select(`
          *,
          profiles!jobsheet_assignments_student_id_fkey (
            id,
            full_name,
            email
          ),
          classes!jobsheet_assignments_jobsheet_id_fkey (
            id,
            name,
            code
          )
        `)
        .eq('jobsheet_id', jobsheetId)
        .order('uploaded_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Group assignments by student (NIM)
      const groupedByStudent: Record<string, any[]> = {};
      assignments?.forEach((assignment: any) => {
        const key = `${assignment.student_id}_${assignment.nim}`;
        if (!groupedByStudent[key]) {
          groupedByStudent[key] = [];
        }
        groupedByStudent[key].push(assignment);
      });

      res.json({
        assignments: assignments || [],
        groupedByStudent: Object.values(groupedByStudent)
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'Failed to fetch assignments',
        message: error.message
      });
    }
  }
);

/**
 * PUT /api/jobsheet-assignments/:assignmentId/grade
 * Grade an assignment (Admin only)
 */
const gradeAssignmentSchema = z.object({
  grade: z.number().min(0).max(100),
  feedback: z.string().optional()
});

router.put(
  '/:assignmentId/grade',
  authenticate,
  requireRole('admin'),
  async (req, res) => {
    try {
      const { assignmentId } = req.params;
      const { grade, feedback } = gradeAssignmentSchema.parse(req.body);

      // Verify assignment exists and belongs to admin's jobsheet
      const { data: assignment, error: assignmentError } = await supabase
        .from('jobsheet_assignments')
        .select(`
          *,
          classes (
            id,
            admin_id
          )
        `)
        .eq('id', assignmentId)
        .single();

      if (assignmentError || !assignment) {
        return res.status(404).json({
          error: 'Not found',
          message: 'Assignment not found'
        });
      }

      const jobsheet = assignment.classes as any;
      if (jobsheet.admin_id !== req.user!.id) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'You can only grade assignments for your own jobsheets'
        });
      }

      // Update assignment with grade
      const { data: updatedAssignment, error: updateError } = await supabase
        .from('jobsheet_assignments')
        .update({
          grade,
          feedback: feedback || null,
          graded_by: req.user!.id,
          graded_at: new Date().toISOString()
        })
        .eq('id', assignmentId)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      res.json({
        message: 'Assignment graded successfully',
        assignment: updatedAssignment
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation error',
          details: error.errors
        });
      }

      res.status(500).json({
        error: 'Failed to grade assignment',
        message: error.message
      });
    }
  }
);

/**
 * DELETE /api/jobsheet-assignments/:assignmentId
 * Delete an assignment (Admin or Student - only their own)
 */
router.delete(
  '/:assignmentId',
  authenticate,
  async (req, res) => {
    try {
      const { assignmentId } = req.params;

      // Verify assignment exists
      const { data: assignment, error: assignmentError } = await supabase
        .from('jobsheet_assignments')
        .select(`
          *,
          classes (
            id,
            admin_id
          )
        `)
        .eq('id', assignmentId)
        .single();

      if (assignmentError || !assignment) {
        return res.status(404).json({
          error: 'Not found',
          message: 'Assignment not found'
        });
      }

      // Check permissions
      const jobsheet = assignment.classes as any;
      const isAdmin = req.user!.role === 'admin';
      const isOwner = assignment.student_id === req.user!.id;

      if (!isAdmin && !isOwner) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'You can only delete your own assignments'
        });
      }

      // Admin can only delete from their own jobsheets
      if (isAdmin && jobsheet.admin_id !== req.user!.id) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'You can only delete assignments from your own jobsheets'
        });
      }

      // Students cannot delete if already graded
      if (isOwner && assignment.grade !== null) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Cannot delete assignment that has already been graded'
        });
      }

      // Extract file path from URL
      const fileUrl = assignment.file_url;
      const filePath = fileUrl.split('/jobsheet-assignments/')[1];
      
      if (filePath) {
        // Delete file from storage
        await supabase.storage
          .from('jobsheet-assignments')
          .remove([`jobsheet-assignments/${filePath}`]);
      }

      // Delete assignment record
      const { error: deleteError } = await supabase
        .from('jobsheet_assignments')
        .delete()
        .eq('id', assignmentId);

      if (deleteError) {
        throw deleteError;
      }

      res.json({
        message: 'Assignment deleted successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'Failed to delete assignment',
        message: error.message
      });
    }
  }
);

export default router;
