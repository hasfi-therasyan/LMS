/**
 * Admin Routes
 * 
 * Handles admin-only operations: user management, class management
 */

import express from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import { supabase } from '../config/supabase';
import { z } from 'zod';

const router = express.Router();

/**
 * GET /api/admin/users
 * Get all users (Admin only)
 */
router.get(
  '/users',
  authenticate,
  requireRole('admin'),
  async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      res.json(data || []);
    } catch (error: any) {
      res.status(500).json({
        error: 'Failed to fetch users',
        message: error.message
      });
    }
  }
);

// Enrollment routes removed - all mahasiswa can access all features without enrollment

export default router;
