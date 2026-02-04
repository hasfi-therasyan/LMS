/**
 * Authentication Middleware for Next.js API Routes
 * 
 * This middleware validates JWT tokens from Supabase Auth
 * and returns user information for use in API routes.
 */

import { NextRequest } from 'next/server';
import { verifyUserToken, getUserProfile } from '../config/supabase';

// User type for API routes
export interface ApiUser {
  id: string;
  email: string;
  role: 'admin' | 'lecturer' | 'student';
}

/**
 * Authenticate request and get user info
 * Returns user info if authenticated, throws error otherwise
 */
export async function authenticate(request: NextRequest): Promise<ApiUser> {
  // Get token from Authorization header
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing or invalid authorization header');
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix

  // Verify token with Supabase
  const user = await verifyUserToken(token);

  // Get user profile to get role
  const profile = await getUserProfile(user.id);

  if (!profile) {
    throw new Error('User profile not found');
  }

  return {
    id: user.id,
    email: user.email || '',
    role: profile.role as 'admin' | 'lecturer' | 'student'
  };
}

/**
 * Check if user has required role
 * Throws error if user doesn't have the required role
 */
export function requireRole(user: ApiUser, allowedRoles: string | string[]) {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  
  if (!roles.includes(user.role)) {
    throw new Error(`This action requires one of these roles: ${roles.join(', ')}`);
  }
}

/**
 * Helper to create error response
 */
export function createErrorResponse(message: string, status: number = 400) {
  return Response.json(
    { error: message },
    { status }
  );
}

/**
 * Helper to create success response
 */
export function createSuccessResponse(data: any, status: number = 200) {
  return Response.json(data, { status });
}
