/**
 * GET /api/auth/me
 * Get current user profile
 */

import { NextRequest } from 'next/server';
import { authenticate, createErrorResponse, createSuccessResponse } from '@/lib/api/middleware/auth';
import { supabase } from '@/lib/api/config/supabase';

export async function GET(request: NextRequest) {
  try {
    const user = await authenticate(request);

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      throw error;
    }

    return createSuccessResponse(data);
  } catch (error: any) {
    if (error.message?.includes('authorization')) {
      return createErrorResponse('Missing or invalid authorization header', 401);
    }
    return createErrorResponse(error.message || 'Failed to fetch user profile', 500);
  }
}
