'use client';

import { Suspense } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import CreatePlanForm from '@/components/plan/CreatePlanForm';
import { useAuth, isGuiderUser } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function CreatePlanPage() {
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

      // Check if guider is verified
      if (!user.accountVerified) {
        router.push('/guider/verification');
        return;
      }
    }
  }, [isAuthenticated, isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user || !isGuiderUser(user) || !user.accountVerified) {
    return null;
  }

  return (
    <AppLayout>
      <Suspense fallback={
        <div className="h-[calc(100vh-4rem)] bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
        </div>
      }>
        <CreatePlanForm />
      </Suspense>
    </AppLayout>
  );
}