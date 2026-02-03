/**
 * Authentication Routes
 * 
 * Note: Most authentication is handled by Supabase Auth on the frontend.
 * These routes are for backend operations that require user management.
 */

import express from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import { supabase } from '../config/supabase';
import { z } from 'zod';

const router = express.Router();

/**
 * GET /api/auth/me
 * Get current user profile
 */
router.get('/me', authenticate, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', req.user!.id)
      .single();

    if (error) {
      throw error;
    }

    res.json(data);
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to fetch user profile',
      message: error.message
    });
  }
});

/**
 * POST /api/auth/signup
 * Sign up new mahasiswa (student) - No email verification required
 * 
 * Creates user in Supabase Auth with email_confirm: true
 * and automatically creates profile with 'mahasiswa' role
 */
const signupSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  full_name: z.string().min(1, 'Full name is required')
});

router.post('/signup', async (req, res) => {
  try {
    const { email, password, full_name } = signupSchema.parse(req.body);

    // Check if email already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers.users.find(u => u.email === email);

    if (existingUser) {
      return res.status(400).json({
        error: 'Email already registered',
        message: 'This email is already in use. Please sign in instead.'
      });
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

    res.json({
      message: 'Account created successfully',
      user: {
        id: authData.user.id,
        email: authData.user.email
      },
      profile: profileData
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors
      });
    }

    // Handle duplicate email error
    if (error.message?.includes('already registered') || error.message?.includes('already exists')) {
      return res.status(400).json({
        error: 'Email already registered',
        message: 'This email is already in use. Please sign in instead.'
      });
    }

    res.status(500).json({
      error: 'Failed to create account',
      message: error.message || 'An unexpected error occurred'
    });
  }
});

/**
 * POST /api/auth/create-admin
 * Create an admin/dosen account (Admin only)
 * 
 * Note: The user must already be created in Supabase Auth.
 * This endpoint only creates/updates the profile with admin role.
 */
const createAdminSchema = z.object({
  userId: z.string().uuid(),
  email: z.string().email(),
  fullName: z.string().min(1)
});

router.post(
  '/create-admin',
  authenticate,
  requireRole('admin'),
  async (req, res) => {
    try {
      const { userId, email, fullName } = createAdminSchema.parse(req.body);

      // Check if user exists in auth
      const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId);

      if (authError || !authUser) {
        return res.status(404).json({
          error: 'User not found',
          message: 'User must be created in Supabase Auth first'
        });
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

      res.json({
        message: 'Admin/Dosen account created successfully',
        profile: data
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation error',
          details: error.errors
        });
      }

      res.status(500).json({
        error: 'Failed to create admin account',
        message: error.message
      });
    }
  }
);

export default router;
