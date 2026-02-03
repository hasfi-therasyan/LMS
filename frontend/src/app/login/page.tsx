'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';

export const dynamic = 'force-dynamic';

// Component to handle search params (wrapped in Suspense)
function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser, loadProfile } = useAuthStore();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

  // Check for error query parameter
  useEffect(() => {
    const error = searchParams.get('error');
    if (error === 'rate_limit') {
      toast.error('Too many requests. Please wait a moment before trying again.', {
        duration: 5000
      });
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        // Sign up (students can self-register) - No email verification needed
        // Email is stored as string only, no verification required
        const response = await apiClient.signup({
          email,
          password,
          full_name: fullName,
        });

        // After successful signup, automatically sign in
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (signInError) throw signInError;

        if (signInData.user) {
          setUser(signInData.user);
          try {
            await loadProfile();
            const profile = useAuthStore.getState().profile;
            
            if (profile) {
              toast.success('Account created successfully! Welcome!');
              router.push('/student');
            } else {
              toast.success('Account created! Please sign in.');
            }
          } catch (error: any) {
            if (error.response?.status === 429) {
              toast.error('Too many requests. Please wait a moment and try again.');
            } else {
              toast.success('Account created! Please sign in.');
            }
          }
        }
      } else {
        // Sign in
        console.log('Attempting login for:', email);
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) {
          console.error('Login error:', error);
          throw error;
        }
        
        console.log('Login successful, user:', data.user?.id);

        if (data.user) {
          setUser(data.user);
          
          // Try to load profile from backend
          try {
            await loadProfile();
            const profile = useAuthStore.getState().profile;
            
            if (profile) {
              if (profile.role === 'admin') {
                router.push('/admin');
              } else {
                router.push('/student');
              }
            } else {
              // If profile not found, redirect anyway (will be handled by page)
              router.push('/');
            }
          } catch (profileError: any) {
            console.error('Profile load error:', profileError);
            if (profileError.response?.status === 429) {
              toast.error('Too many requests. Please wait a moment and try again.');
            } else {
              // Still redirect, let the page handle it
              router.push('/');
            }
          }
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 p-4">
      <div className="max-w-md w-full">
        {/* Logo/Header Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl shadow-elevation-3 mb-6">
            <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">
            Learning Management System
          </h1>
          <p className="text-gray-600 text-base">
            {isSignUp ? 'Create your account to get started' : 'Welcome back! Please sign in to continue'}
          </p>
        </div>

        {/* Login Card */}
        <div className="card shadow-elevation-3 border-gray-200">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {isSignUp && (
              <div>
                <label htmlFor="fullName" className="block text-sm font-semibold text-gray-900 mb-2.5">
                  Full Name
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  className="input-field"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2.5">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="input-field"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-900 mb-2.5">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="input-field"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                isSignUp ? 'Create Account' : 'Sign In'
              )}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">or</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="w-full text-center text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
            >
              {isSignUp
                ? 'Already have an account? Sign in instead'
                : "Don't have an account? Sign up here"}
            </button>
          </form>
        </div>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-gray-400 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs text-gray-600 leading-relaxed">
              {isSignUp 
                ? 'Mahasiswa can self-register. Admin/Dosen accounts are created by administrators.'
                : 'Secure login with Supabase Authentication. Your data is protected.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
