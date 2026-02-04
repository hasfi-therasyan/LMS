/**
 * Authentication Store (Zustand)
 * 
 * Global state management for user authentication and profile.
 */

import { create } from 'zustand';
import { User } from '@supabase/supabase-js';
import { apiClient } from '@/lib/api';

interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'student';
}

interface AuthState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  loadProfile: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  loading: false,

  setUser: (user) => set({ user }),

  setProfile: (profile) => set({ profile }),

  loadProfile: async () => {
    set({ loading: true });
    try {
      console.log('Loading profile from API...');
      const response = await apiClient.getProfile();
      console.log('Profile loaded:', response.data);
      set({ profile: response.data, loading: false });
    } catch (error: any) {
      console.error('Failed to load profile:', error);
      
      // Handle rate limiting (429) gracefully
      if (error.response?.status === 429) {
        console.warn('Rate limit exceeded. Please wait a moment and try again.');
        set({ profile: null, loading: false });
        // Don't throw for rate limiting - just set profile to null
        // The user can retry or will be redirected to login
        return;
      }
      
      // Handle other errors
      console.error('Error details:', error.response?.data || error.message);
      set({ profile: null, loading: false });
      
      // Only throw non-429 errors
      if (error.response?.status !== 429) {
        throw error;
      }
    }
  },

  logout: async () => {
    const { supabase } = await import('@/lib/supabase');
    await supabase.auth.signOut();
    set({ user: null, profile: null });
  }
}));
