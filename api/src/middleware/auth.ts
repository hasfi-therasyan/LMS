/**
 * Authentication Middleware
 * 
 * This middleware validates JWT tokens from Supabase Auth
 * and attaches user information to the request object.
 */

import { Request, Response, NextFunction } from 'express';
import { verifyUserToken, getUserProfile } from '../config/supabase';

// Extend Express Request type to include user info
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: 'admin' | 'lecturer' | 'student' | 'mahasiswa';
      };
    }
  }
}

/**
 * Middleware to authenticate requests
 * Extracts token from Authorization header and validates it
 */
export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Missing or invalid authorization header'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token with Supabase
    const user = await verifyUserToken(token);

    // Get user profile to get role
    const profile = await getUserProfile(user.id);

    if (!profile) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User profile not found'
      });
    }

    // Attach user info to request
      req.user = {
        id: user.id,
        email: user.email || '',
        role: profile.role as 'admin' | 'lecturer' | 'student' | 'mahasiswa'
      };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or expired token'
    });
  }
}

/**
 * Middleware to check if user has required role
 * Usage: requireRole('admin') or requireRole('mahasiswa')
 */
export function requireRole(allowedRoles: string | string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }

    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `This action requires one of these roles: ${roles.join(', ')}`
      });
    }

    next();
  };
}
