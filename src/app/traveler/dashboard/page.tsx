'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TravelerDashboard() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to profile page
    router.replace('/traveler/profile');
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-500"></div>
    </div>
  );
}
