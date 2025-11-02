'use client';

import { useAuth, isGuiderUser } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import GuiderVerificationDashboard from '@/components/dashboard/GuiderVerificationDashboard';
import GuiderVerifiedDashboard from '@/components/dashboard/GuiderVerifiedDashboard';
import { apiService } from '@/lib/api';

export default function GuiderDashboard() {
  const { user, token, refreshUser, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/guider/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Fetch fresh user data on mount/reload (only once)
  useEffect(() => {
    // Reset the ref when token or isAuthenticated changes (new login)
    if (!token || !isAuthenticated) {
      hasFetchedRef.current = false;
      return;
    }

    // Only fetch once per mount/reload
    if (hasFetchedRef.current) return;

    const fetchUserData = async () => {
      try {
        const response = await apiService.getCurrentUser(token, 'guider');
        if (response.success && response.data) {
          // refreshUser will normalize the data (convert _id to id)
          refreshUser(response.data);
        }
        hasFetchedRef.current = true;
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }
    };

    fetchUserData();
  }, [token, isAuthenticated, refreshUser]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user || !isGuiderUser(user)) {
    return null;
  }

  return (
    <AppLayout>
      {user.accountVerified ? (
        <GuiderVerifiedDashboard user={user} />
      ) : (
        <GuiderVerificationDashboard />
      )}
    </AppLayout>
  );
}