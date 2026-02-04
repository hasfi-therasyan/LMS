/**
 * POST /api/auth/signup
 * Sign up new mahasiswa (student) - No email verification required
 */

import { NextRequest } from 'next/server';
import { supabase } from '@/lib/api/config/supabase';
import { z } from 'zod';
import { createErrorResponse, createSuccessResponse } from '@/lib/api/middleware/auth';

const signupSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  full_name: z.string().min(1, 'Full name is required')
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, full_name } = signupSchema.parse(body);

    // Check if email already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers.users.find(u => u.email === email);

    if (existingUser) {
      return createErrorResponse('Email already registered', 400);
    }

    // Create user in Supabase Auth with email confirmed (no verification needed)
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Auto confirm - no email verification needed
      user_metadata: {
        full_name: full_name
      }
    });

    if (authError) {
      throw authError;
    }

    if (!authData.user) {
      throw new Error('Failed to create user in Auth');
    }

    // Create profile with mahasiswa role
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        email: email,
        full_name: full_name,
        role: 'mahasiswa'
      })
      .select()
      .single();

    if (profileError) {
      // If profile creation fails, try to delete the auth user
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw profileError;
    }

    return createSuccessResponse({
      message: 'Account created successfully',
      user: {
        id: authData.user.id,
        email: authData.user.email
      },
      profile: profileData
    }, 201);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return createErrorResponse('Validation error', 400);
    }

    // Handle duplicate email error
    if (error.message?.includes('already registered') || error.message?.includes('already exists')) {
      return createErrorResponse('Email already registered', 400);
    }

    return createErrorResponse(error.message || 'Failed to create account', 500);
  }
}
