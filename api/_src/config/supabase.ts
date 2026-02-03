/**
 * Supabase Client Configuration
 * 
 * This file sets up the Supabase client for database operations.
 * We use the service role key for backend operations to bypass RLS
 * when necessary, but we still validate user permissions in our code.
 */

// IMPORTANT: Load environment variables FIRST
import './env';

import { createClient } from '@supabase/supabase-js';

if (!process.env.SUPABASE_URL) {
  throw new Error('SUPABASE_URL environment variable is required');
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is required');
}

// Create Supabase client with service role key
// This gives us admin access to the database
// IMPORTANT: Never expose this key to the frontend!
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Create a client for user-specific operations
// This uses the anon key and respects RLS policies
export const supabaseAnon = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY || ''
);

/**
 * Get user profile by ID
 * This function fetches user profile information including role
 */
export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    throw new Error(`Failed to fetch user profile: ${error.message}`);
  }

  return data;
}

/**
 * Verify user token and get user info
 * This validates the JWT token from Supabase Auth
 */
export async function verifyUserToken(token: string) {
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    throw new Error('Invalid or expired token');
  }

  return data.user;
}
