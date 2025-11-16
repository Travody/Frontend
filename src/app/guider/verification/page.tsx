'use client';

import { useAuth, isGuiderUser } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import GuiderVerificationDashboard from '@/components/dashboard/GuiderVerificationDashboard';

export default function GuiderVerificationPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/auth/guider/login');
        return;
      }

      if (!user || !isGuiderUser(user)) {
        router.push('/');
        return;
      }
    }
  }, [isAuthenticated, isLoading, user, router]);

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
      <GuiderVerificationDashboard />
    </AppLayout>
  );
}