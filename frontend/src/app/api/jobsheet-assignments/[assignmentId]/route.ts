/**
 * DELETE /api/jobsheet-assignments/:assignmentId
 * Delete an assignment (Admin or Student - only their own)
 */

import { NextRequest } from 'next/server';
import { authenticate, createErrorResponse, createSuccessResponse } from '@/lib/api/middleware/auth';
import { supabase } from '@/lib/api/config/supabase';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { assignmentId: string } }
) {
  try {
    const user = await authenticate(request);

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
      .eq('id', params.assignmentId)
      .single();

    if (assignmentError || !assignment) {
      return createErrorResponse('Assignment not found', 404);
    }

    // Check permissions
    const jobsheet = assignment.classes as any;
    const isAdmin = user.role === 'admin';
    const isOwner = assignment.student_id === user.id;

    if (!isAdmin && !isOwner) {
      return createErrorResponse('You can only delete your own assignments', 403);
    }

    // Admin can only delete from their own jobsheets
    if (isAdmin && jobsheet.admin_id !== user.id) {
      return createErrorResponse('You can only delete assignments from your own jobsheets', 403);
    }

    // Extract bucket name and file path from URL
    const fileUrl = assignment.file_url;
    let bucketName: string | null = null;
    let fileName: string | null = null;
    
    const patterns = [
      /\/storage\/v1\/object\/public\/([^\/]+)\/(.+)$/,
      /\/storage\/v1\/object\/sign\/([^\/]+)\/(.+?)(\?|$)/,
      /\/storage\/v1\/object\/authenticated\/([^\/]+)\/(.+?)(\?|$)/
    ];
    
    for (const pattern of patterns) {
      const match = fileUrl.match(pattern);
      if (match) {
        bucketName = match[1];
        fileName = match[2];
        break;
      }
    }
    
    let storageDeleted = false;
    if (bucketName && fileName) {
      try {
        const { error: storageError } = await supabase.storage
          .from(bucketName)
          .remove([fileName]);
        
        if (!storageError) {
          storageDeleted = true;
        }
      } catch (storageException: any) {
        console.error('Exception while deleting from storage:', storageException);
      }
    }

    // Delete assignment record from database
    const { data: deleteData, error: deleteError } = await supabase
      .from('jobsheet_assignments')
      .delete()
      .eq('id', params.assignmentId)
      .select();

    if (deleteError) {
      throw deleteError;
    }

    if (!deleteData || deleteData.length === 0) {
      return createErrorResponse('Assignment not found or could not be deleted. Please check RLS policies.', 404);
    }

    return createSuccessResponse({
      message: 'Assignment deleted successfully',
      deleted: {
        assignmentId: params.assignmentId,
        storageDeleted,
        databaseDeleted: true
      }
    });
  } catch (error: any) {
    if (error.message?.includes('authorization')) {
      return createErrorResponse('Missing or invalid authorization header', 401);
    }
    return createErrorResponse(error.message || 'Failed to delete assignment', 500);
  }
}
