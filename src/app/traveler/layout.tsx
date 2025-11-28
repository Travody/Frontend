'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, isTravelerUser } from '@/contexts/AuthContext';

export default function TravelerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      // Redirect guiders to their homepage
      if (user && !isTravelerUser(user)) {
        router.push('/guider/dashboard');
        return;
      }
      
      // Redirect unauthenticated users to login
      if (!isAuthenticated) {
        router.push('/auth/traveler/login');
        return;
      }
    }
  }, [user, isAuthenticated, isLoading, router]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // Don't render if user is not a traveler or not authenticated
  if (!isAuthenticated || !user || !isTravelerUser(user)) {
    return null;
  }

  return <>{children}</>;
}

