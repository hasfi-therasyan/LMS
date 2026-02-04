/**
 * POST /api/jobsheet-submissions
 * Submit jobsheet (Mahasiswa only)
 */

import { NextRequest } from 'next/server';
import { authenticate, requireRole, createErrorResponse, createSuccessResponse } from '@/lib/api/middleware/auth';
import { supabase } from '@/lib/api/config/supabase';
import { validatePDF } from '@/lib/api/utils/pdfExtractor';
import { parseFormData, fileToBuffer, validateFileType, validateFileSize } from '@/lib/api/utils/fileUpload';
import { z } from 'zod';

const submitJobsheetSchema = z.object({
  moduleId: z.string().uuid()
});

export async function POST(request: NextRequest) {
  try {
    const user = await authenticate(request);
    requireRole(user, 'mahasiswa');

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

    const { moduleId } = submitJobsheetSchema.parse(fields);

    // Check if module exists
    const { data: module, error: moduleError } = await supabase
      .from('modules')
      .select('*')
      .eq('id', moduleId)
      .single();

    if (moduleError || !module) {
      return createErrorResponse('Module not found', 404);
    }

    // Check if already submitted
    const { data: existing } = await supabase
      .from('jobsheet_submissions')
      .select('id')
      .eq('module_id', moduleId)
      .eq('student_id', user.id)
      .single();

    if (existing) {
      return createErrorResponse('You have already submitted this jobsheet', 400);
    }

    // Convert file to buffer and validate PDF
    const buffer = await fileToBuffer(file);
    if (!validatePDF(buffer)) {
      return createErrorResponse('File must be a valid PDF', 400);
    }

    // Upload file to Supabase Storage
    const fileName = `submission-${Date.now()}-${file.name}`;
    const filePath = `jobsheet-submissions/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('jobsheet-submissions')
      .upload(filePath, buffer, {
        contentType: 'application/pdf',
        upsert: false
      });

    if (uploadError) {
      if (uploadError.message?.includes('Bucket not found') || uploadError.message?.includes('not found')) {
        return createErrorResponse('The "jobsheet-submissions" storage bucket does not exist. Please create it in Supabase Dashboard → Storage → New Bucket (name: "jobsheet-submissions", set to Public)', 400);
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
        student_id: user.id,
        file_url: urlData.publicUrl
      })
      .select()
      .single();

    if (dbError) {
      // Clean up uploaded file if database insert fails
      await supabase.storage.from('jobsheet-submissions').remove([filePath]);
      throw dbError;
    }

    return createSuccessResponse({
      message: 'Jobsheet submitted successfully',
      submission
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
    return createErrorResponse(error.message || 'Failed to submit jobsheet', 500);
  }
}
