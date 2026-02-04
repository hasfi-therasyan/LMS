/**
 * Jobsheet API Routes
 * GET /api/jobsheet - Get all jobsheets
 * POST /api/jobsheet - Create a new jobsheet (Admin only)
 */

import { NextRequest } from 'next/server';
import { authenticate, requireRole, createErrorResponse, createSuccessResponse } from '@/lib/api/middleware/auth';
import { supabase } from '@/lib/api/config/supabase';
import { validatePDF } from '@/lib/api/utils/pdfExtractor';
import { parseFormData, fileToBuffer, validateFileType, validateFileSize } from '@/lib/api/utils/fileUpload';
import { z } from 'zod';

const createJobsheetSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  description: z.string().optional(),
  adminId: z.string().uuid().optional()
});

export async function GET(request: NextRequest) {
  try {
    const user = await authenticate(request);

    let query = supabase.from('classes').select('*');

    // Admins can only see their own jobsheets
    if (user.role === 'admin') {
      query = query.eq('admin_id', user.id);
    }
    // Mahasiswa can see ALL jobsheets

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return createSuccessResponse(data || []);
  } catch (error: any) {
    if (error.message?.includes('authorization')) {
      return createErrorResponse('Missing or invalid authorization header', 401);
    }
    return createErrorResponse(error.message || 'Failed to fetch jobsheets', 500);
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

    // Validate file size
    const maxSize = parseInt(process.env.MAX_FILE_SIZE || '10485760');
    if (!validateFileSize(file, maxSize)) {
      return createErrorResponse(`File size exceeds ${maxSize} bytes`, 400);
    }

    const { name, code, description, adminId } = createJobsheetSchema.parse(fields);

    // Admins can create jobsheets for themselves or assign to other admin
    const finalAdminId = adminId || user.id;

    // Convert file to buffer and validate PDF
    const buffer = await fileToBuffer(file);
    if (!validatePDF(buffer)) {
      return createErrorResponse('File must be a valid PDF', 400);
    }

    // Upload file to Supabase Storage
    const fileName = `jobsheet-${Date.now()}-${file.name}`;
    const filePath = `jobsheets/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('jobsheets')
      .upload(filePath, buffer, {
        contentType: 'application/pdf',
        upsert: false
      });

    if (uploadError) {
      if (uploadError.message?.includes('Bucket not found') || uploadError.message?.includes('not found')) {
        return createErrorResponse('The "jobsheets" storage bucket does not exist. Please create it in Supabase Dashboard → Storage → New Bucket (name: "jobsheets", set to Public)', 400);
      }
      throw uploadError;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('jobsheets')
      .getPublicUrl(filePath);

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

    return createSuccessResponse({
      message: 'Jobsheet created successfully',
      jobsheet: data
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
    return createErrorResponse(error.message || 'Failed to create jobsheet', 500);
  }
}
