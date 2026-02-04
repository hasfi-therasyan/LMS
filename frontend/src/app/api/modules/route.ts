/**
 * Modules API Routes
 * GET /api/modules - Get all modules
 * POST /api/modules - Upload a new module (Admin only)
 */

import { NextRequest } from 'next/server';
import { authenticate, requireRole, createErrorResponse, createSuccessResponse } from '@/lib/api/middleware/auth';
import { supabase } from '@/lib/api/config/supabase';
import { validatePDF } from '@/lib/api/utils/pdfExtractor';
import { parseFormData, fileToBuffer, validateFileType, validateFileSize } from '@/lib/api/utils/fileUpload';
import { z } from 'zod';

const createModuleSchema = z.object({
  classId: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().optional()
});

export async function GET(request: NextRequest) {
  try {
    const user = await authenticate(request);

    let query = supabase.from('modules').select(`
      *,
      classes (
        id,
        name,
        code
      )
    `);

    // Mahasiswa can see ALL modules (no enrollment required)
    // Admins can see modules in their classes
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
    return createErrorResponse(error.message || 'Failed to fetch modules', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await authenticate(request);
    requireRole(user, 'admin');

    const { file, fields } = await parseFormData(request);

    if (!file) {
      return createErrorResponse('PDF file is required', 400);
    }

    // Validate file type
    if (!validateFileType(file, ['application/pdf'])) {
      return createErrorResponse('Only PDF files are allowed', 400);
    }

    // Validate file size (10MB default)
    const maxSize = parseInt(process.env.MAX_FILE_SIZE || '10485760');
    if (!validateFileSize(file, maxSize)) {
      return createErrorResponse(`File size exceeds ${maxSize} bytes`, 400);
    }

    // Parse request body
    const { classId, title, description } = createModuleSchema.parse(fields);

    // Convert file to buffer and validate PDF
    const buffer = await fileToBuffer(file);
    if (!validatePDF(buffer)) {
      return createErrorResponse('File must be a valid PDF', 400);
    }

    // Upload file to Supabase Storage
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = `modules/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('modules')
      .upload(filePath, buffer, {
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
        extracted_text: null,
        uploaded_by: user.id
      })
      .select()
      .single();

    if (dbError) {
      // Clean up uploaded file if database insert fails
      await supabase.storage.from('modules').remove([filePath]);
      throw dbError;
    }

    return createSuccessResponse({
      message: 'Module uploaded successfully',
      module: moduleData
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
    return createErrorResponse(error.message || 'Failed to upload module', 500);
  }
}
