/**
 * Jobsheet Routes
 * 
 * Handles jobsheet management for admins/dosen
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
    // Only accept PDF files
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

/**
 * GET /api/jobsheet
 * Get all jobsheets (filtered by role)
 */
router.get('/', authenticate, async (req, res) => {
  try {
    let query = supabase.from('classes').select('*');

    // Admins can only see their own jobsheets
    if (req.user!.role === 'admin') {
      query = query.eq('admin_id', req.user!.id);
    }
    // Mahasiswa can see ALL jobsheets (no enrollment required)

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching jobsheets:', error);
      throw error;
    }

    res.json(data || []);
  } catch (error: any) {
    console.error('Error in GET /api/jobsheet:', error);
    res.status(500).json({
      error: 'Failed to fetch jobsheets',
      message: error.message || 'An unexpected error occurred'
    });
  }
});

/**
 * POST /api/jobsheet
 * Create a new jobsheet with PDF upload (Admin/Dosen)
 */
const createJobsheetSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  description: z.string().optional(),
  adminId: z.string().uuid().optional()
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

      const { name, code, description, adminId } = createJobsheetSchema.parse(req.body);

      // Admins can create jobsheets for themselves or assign to other admin
      const finalAdminId = adminId || req.user!.id;

      // Upload file to Supabase Storage
      const fileName = `jobsheet-${Date.now()}-${req.file.originalname}`;
      const filePath = `jobsheets/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('jobsheets')
        .upload(filePath, req.file.buffer, {
          contentType: 'application/pdf',
          upsert: false
        });

      if (uploadError) {
        // Check if bucket doesn't exist
        if (uploadError.message?.includes('Bucket not found') || uploadError.message?.includes('not found')) {
          return res.status(400).json({
            error: 'Storage bucket not found',
            message: 'The "jobsheets" storage bucket does not exist. Please create it in Supabase Dashboard → Storage → New Bucket (name: "jobsheets", set to Public)'
          });
        }
        throw uploadError;
      }

      // Get public URL using the actual path from upload response
      // uploadData.path contains the actual path where file was stored
      const actualPath = uploadData.path;
      const { data: urlData } = supabase.storage
        .from('jobsheets')
        .getPublicUrl(actualPath);

      // Verify the file exists
      const { data: fileList, error: fileCheckError } = await supabase.storage
        .from('jobsheets')
        .list(actualPath.split('/').slice(0, -1).join('/') || '', {
          limit: 100
        });

      if (fileCheckError) {
        console.error('Error verifying uploaded file:', fileCheckError);
      } else {
        const fileName = actualPath.split('/').pop();
        const fileExists = fileList?.some(f => f.name === fileName);
        console.log('File verification:', {
          path: actualPath,
          fileName,
          exists: fileExists,
          fileListCount: fileList?.length || 0
        });
      }

      console.log('File upload details:', {
        requestedPath: filePath,
        actualPath: uploadData.path,
        publicUrl: urlData.publicUrl
      });

      // Create jobsheet record in database
      const { data, error } = await supabase
        .from('classes')
        .insert({
          name,
          code,
          description: description || null,
          admin_id: finalAdminId,
          file_url: urlData.publicUrl
        })
        .select()
        .single();

      if (error) {
        // Clean up uploaded file if database insert fails
        await supabase.storage.from('jobsheets').remove([filePath]);
        throw error;
      }

      res.status(201).json({
        message: 'Jobsheet created successfully',
        jobsheet: data
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation error',
          details: error.errors
        });
      }

      res.status(500).json({
        error: 'Failed to create jobsheet',
        message: error.message
      });
    }
  }
);

/**
 * GET /api/jobsheet/:id
 * Get a specific jobsheet
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch jobsheet
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Jobsheet not found'
      });
    }

    // Check access permissions
    if (req.user!.role === 'admin') {
      // Admin can only see their own jobsheets
      if (data.admin_id !== req.user!.id) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'You can only access your own jobsheets'
        });
      }
    }
    // Mahasiswa can access ALL jobsheets (no enrollment required)

    // If file_url exists, try to verify and fix it if needed
    if (data.file_url) {
      try {
        // Parse the URL to extract bucket and path
        const url = new URL(data.file_url);
        const pathParts = url.pathname.split('/').filter(p => p);
        
        // Find storage path (usually /storage/v1/object/public/bucket/path)
        const storageIndex = pathParts.findIndex(p => p === 'storage');
        if (storageIndex >= 0 && pathParts[storageIndex + 1] === 'v1') {
          const bucketName = pathParts[storageIndex + 3]; // After 'object/public'
          const filePath = pathParts.slice(storageIndex + 4).join('/');
          
          // Try to regenerate the URL with correct format
          const { data: urlData, error: urlError } = supabase.storage
            .from(bucketName)
            .getPublicUrl(filePath);
          
          if (urlError) {
            console.error('Error regenerating URL:', urlError);
          } else if (urlData.publicUrl) {
            // Always use the regenerated URL to ensure it's correct
            console.log('Regenerating file URL for jobsheet:', id);
            console.log('Old URL:', data.file_url);
            console.log('New URL:', urlData.publicUrl);
            data.file_url = urlData.publicUrl;
          }
        }
      } catch (urlError) {
        console.error('Error processing file URL for jobsheet:', id, urlError);
        // Continue with original URL - don't fail the request
      }
    }

    res.json(data);
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to fetch jobsheet',
      message: error.message
    });
  }
});

/**
 * DELETE /api/jobsheet/:id
 * Delete a jobsheet (Admin/Dosen only)
 */
router.delete(
  '/:id',
  authenticate,
  requireRole('admin'),
  async (req, res) => {
    try {
      const { id } = req.params;

      // Check if jobsheet exists and belongs to the admin
      const { data: jobsheet, error: fetchError } = await supabase
        .from('classes')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError || !jobsheet) {
        return res.status(404).json({
          error: 'Jobsheet not found'
        });
      }

      // Check if admin owns this jobsheet
      if (jobsheet.admin_id !== req.user!.id) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'You can only delete your own jobsheets'
        });
      }

      // Delete the jobsheet
      const { error: deleteError } = await supabase
        .from('classes')
        .delete()
        .eq('id', id);

      if (deleteError) {
        throw deleteError;
      }

      res.json({
        message: 'Jobsheet deleted successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'Failed to delete jobsheet',
        message: error.message
      });
    }
  }
);

export default router;
