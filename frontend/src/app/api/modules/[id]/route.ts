/**
 * GET /api/modules/:id
 * Get a specific module
 */

import { NextRequest } from 'next/server';
import { authenticate, createErrorResponse, createSuccessResponse } from '@/lib/api/middleware/auth';
import { supabase } from '@/lib/api/config/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await authenticate(request);

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
      .eq('id', params.id)
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      return createErrorResponse('Module not found', 404);
    }

    return createSuccessResponse(data);
  } catch (error: any) {
    if (error.message?.includes('authorization')) {
      return createErrorResponse('Missing or invalid authorization header', 401);
    }
    return createErrorResponse(error.message || 'Failed to fetch module', 500);
  }
}
