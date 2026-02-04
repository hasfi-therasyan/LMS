/**
 * POST /api/jobsheet-assignments
 * Upload assignment (Mahasiswa only)
 */

import { NextRequest } from 'next/server';
import { authenticate, requireRole, createErrorResponse, createSuccessResponse } from '@/lib/api/middleware/auth';
import { supabase } from '@/lib/api/config/supabase';
import { parseFormData, fileToBuffer, validateFileType, validateFileSize } from '@/lib/api/utils/fileUpload';
import { z } from 'zod';

const uploadAssignmentSchema = z.object({
  jobsheetId: z.string().uuid(),
  nim: z.string().min(1)
});

export async function POST(request: NextRequest) {
  try {
    const user = await authenticate(request);
    requireRole(user, 'student');

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

    const { jobsheetId, nim } = uploadAssignmentSchema.parse(fields);

    // Check if jobsheet exists
    const { data: jobsheet, error: jobsheetError } = await supabase
      .from('classes')
      .select('id, name')
      .eq('id', jobsheetId)
      .single();

    if (jobsheetError || !jobsheet) {
      return createErrorResponse('Jobsheet not found', 404);
    }

    // Check if student already uploaded 4 files for this jobsheet
    const { data: existingAssignments, error: countError } = await supabase
      .from('jobsheet_assignments')
      .select('id')
      .eq('jobsheet_id', jobsheetId)
      .eq('student_id', user.id);

    if (countError) {
      throw countError;
    }

    if (existingAssignments && existingAssignments.length >= 4) {
      return createErrorResponse('You can only upload maximum 4 files per jobsheet', 400);
    }

    // Determine bucket name based on upload number
    const uploadNumber = (existingAssignments?.length || 0) + 1;
    const bucketName = uploadNumber === 1 
      ? 'jobsheet-assignments' 
      : `jobsheet-assignments-${uploadNumber}`;

    // Convert file to buffer
    const buffer = await fileToBuffer(file);

    // Upload file to Supabase Storage
    const fileName = `assignment-${Date.now()}-${file.name}`;
    const filePath = fileName;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, buffer, {
        contentType: 'application/pdf',
        upsert: false
      });

    if (uploadError) {
      if (uploadError.message?.includes('Bucket not found')) {
        return createErrorResponse(`The "${bucketName}" storage bucket does not exist. Please create it in Supabase Dashboard → Storage → New Bucket (name: "${bucketName}", set to Public)`, 400);
      }
      throw uploadError;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    // Create assignment record
    const { data: assignment, error: dbError } = await supabase
      .from('jobsheet_assignments')
      .insert({
        jobsheet_id: jobsheetId,
        student_id: user.id,
        nim: nim,
        file_url: urlData.publicUrl,
        file_name: file.name
      })
      .select()
      .single();

    if (dbError) {
      // Clean up uploaded file if database insert fails
      await supabase.storage.from(bucketName).remove([filePath]);
      throw dbError;
    }

    return createSuccessResponse({
      message: 'Assignment uploaded successfully',
      assignment
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
    return createErrorResponse(error.message || 'Failed to upload assignment', 500);
  }
}
