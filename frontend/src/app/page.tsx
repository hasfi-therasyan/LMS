'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { getCurrentUser } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export default function Home() {
  const router = useRouter();
  const { setUser, loadProfile } = useAuthStore();

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          setUser(user);
          try {
            await loadProfile();
            // Redirect based on role
            const profile = useAuthStore.getState().profile;
            if (profile) {
              if (profile.role === 'admin') {
                router.push('/admin');
              } else {
                router.push('/student');
              }
            } else {
              // If profile is null (e.g., due to rate limiting), redirect to login
              router.push('/login');
            }
          } catch (error: any) {
            // Handle errors from loadProfile
            if (error.response?.status === 429) {
              // Rate limiting - redirect to login with message
              console.warn('Rate limit exceeded. Redirecting to login...');
              router.push('/login?error=rate_limit');
            } else {
              // Other errors - redirect to login
              console.error('Failed to load profile:', error);
              router.push('/login');
            }
          }
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/login');
      }
    };

    checkAuth();
  }, [router, setUser, loadProfile]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Loading...</h1>
        <p className="text-gray-600">Please wait while we check your authentication.</p>
      </div>
    </div>
  );
}
