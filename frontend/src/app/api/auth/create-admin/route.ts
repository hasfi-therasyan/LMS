/**
 * POST /api/auth/create-admin
 * Create an admin/dosen account (Admin only)
 */

import { NextRequest } from 'next/server';
import { authenticate, requireRole, createErrorResponse, createSuccessResponse } from '@/lib/api/middleware/auth';
import { supabase } from '@/lib/api/config/supabase';
import { z } from 'zod';

const createAdminSchema = z.object({
  userId: z.string().uuid(),
  email: z.string().email(),
  fullName: z.string().min(1)
});

export async function POST(request: NextRequest) {
  try {
    const user = await authenticate(request);
    requireRole(user, 'admin');

    const body = await request.json();
    const { userId, email, fullName } = createAdminSchema.parse(body);

    // Check if user exists in auth
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId);

    if (authError || !authUser) {
      return createErrorResponse('User must be created in Supabase Auth first', 404);
    }

    // Create or update profile with admin role
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        email,
        full_name: fullName,
        role: 'admin'
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return createSuccessResponse({
      message: 'Admin/Dosen account created successfully',
      profile: data
    });
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
    return createErrorResponse(error.message || 'Failed to create admin account', 500);
  }
}
