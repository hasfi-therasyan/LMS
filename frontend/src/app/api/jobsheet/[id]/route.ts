/**
 * GET /api/jobsheet/:id - Get a specific jobsheet
 * DELETE /api/jobsheet/:id - Delete a jobsheet (Admin only)
 */

import { NextRequest } from 'next/server';
import { authenticate, requireRole, createErrorResponse, createSuccessResponse } from '@/lib/api/middleware/auth';
import { supabase } from '@/lib/api/config/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await authenticate(request);

    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .eq('id', params.id)
      .is('deleted_at', null)
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      return createErrorResponse('Jobsheet not found', 404);
    }

    // Check access permissions
    if (user.role === 'admin') {
      if (data.admin_id !== user.id) {
        return createErrorResponse('You can only access your own jobsheets', 403);
      }
    }
    // Mahasiswa can access ALL jobsheets

    return createSuccessResponse(data);
  } catch (error: any) {
    if (error.message?.includes('authorization')) {
      return createErrorResponse('Missing or invalid authorization header', 401);
    }
    return createErrorResponse(error.message || 'Failed to fetch jobsheet', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await authenticate(request);
    requireRole(user, 'admin');

    // Check if jobsheet exists and belongs to the admin
    const { data: jobsheet, error: fetchError } = await supabase
      .from('classes')
      .select('*')
      .eq('id', params.id)
      .single();

    if (fetchError || !jobsheet) {
      return createErrorResponse('Jobsheet not found', 404);
    }

    // Check if admin owns this jobsheet
    if (jobsheet.admin_id !== user.id) {
      return createErrorResponse('You can only delete your own jobsheets', 403);
    }

    // Soft delete: set deleted_at instead of removing row (quizzes and AI context remain)
    const { error: updateError } = await supabase
      .from('classes')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', params.id);

    if (updateError) {
      throw updateError;
    }

    return createSuccessResponse({ message: 'Jobsheet deleted successfully' });
  } catch (error: any) {
    if (error.message?.includes('authorization')) {
      return createErrorResponse('Missing or invalid authorization header', 401);
    }
    if (error.message?.includes('requires')) {
      return createErrorResponse(error.message, 403);
    }
    return createErrorResponse(error.message || 'Failed to delete jobsheet', 500);
  }
}
