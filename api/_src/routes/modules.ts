/**
 * Module Routes
 * 
 * Handles module (jobsheet) upload, retrieval, and management
 */

import express from 'express';
import multer from 'multer';
import { authenticate, requireRole } from '../middleware/auth';
import { supabase } from '../config/supabase';
import { validatePDF } from '../utils/pdfExtractor';
import { z } from 'zod';

const router = express.Router();

// Configure multer for file uploads
// Store files in memory for processing
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760') // 10MB default
  },
  fileFilter: (req, file, cb) => {
    // Only accept PDF files
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

/**
 * POST /api/modules
 * Upload a new module (Admin/Dosen only)
 */
const createModuleSchema = z.object({
  classId: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().optional()
});

router.post(
  '/',
  authenticate,
  requireRole('admin'),
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

      // Parse request body
      const { classId, title, description } = createModuleSchema.parse(req.body);

      // Upload file to Supabase Storage
      const fileName = `${Date.now()}-${req.file.originalname}`;
      const filePath = `modules/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('modules')
        .upload(filePath, req.file.buffer, {
          contentType: 'application/pdf',
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('modules')
        .getPublicUrl(filePath);

      // Create module record in database
      const { data: moduleData, error: dbError } = await supabase
        .from('modules')
        .insert({
          class_id: classId,
          title,
          description: description || null,
          file_url: urlData.publicUrl,
          extracted_text: null, // No longer extracting text from PDF
          uploaded_by: req.user!.id
        })
        .select()
        .single();

      if (dbError) {
        // Clean up uploaded file if database insert fails
        await supabase.storage.from('modules').remove([filePath]);
        throw dbError;
      }

      res.status(201).json({
        message: 'Module uploaded successfully',
        module: moduleData
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation error',
          details: error.errors
        });
      }

      res.status(500).json({
        error: 'Failed to upload module',
        message: error.message
      });
    }
  }
);

/**
 * GET /api/modules
 * Get all modules (filtered by role)
 */
router.get('/', authenticate, async (req, res) => {
  try {
    let query = supabase.from('modules').select(`
      *,
      classes (
        id,
        name,
        code
      )
    `);

    // Mahasiswa can see ALL modules (no enrollment required)
    // No filtering needed for mahasiswa
    
    // Admins can see modules in their classes
    if (req.user!.role === 'admin') {
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
      error: 'Failed to fetch modules',
      message: error.message
    });
  }
});

/**
 * GET /api/modules/:id
 * Get a specific module
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('modules')
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

    if (error) {
      throw error;
    }

    if (!data) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Module not found'
      });
    }

    res.json(data);
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to fetch module',
      message: error.message
    });
  }
});

export default router;
