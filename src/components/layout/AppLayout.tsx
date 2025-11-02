'use client';

import { useAuth, isGuiderUser } from '@/contexts/AuthContext';
import Header from './Header';
import Footer from './Footer';
import ToasterProvider from '@/components/ui/ToasterProvider';
import { ReactNode } from 'react';

interface AppLayoutProps {
  children: ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
}

export default function AppLayout({ 
  children, 
  showHeader = true, 
  showFooter = true 
}: AppLayoutProps) {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {showHeader && (
        <Header 
          user={isAuthenticated && user ? {
            name: isGuiderUser(user)
              ? (user.personalInfo?.showcaseName || user.showcaseName || user.email || 'User')
              : (user.firstName || user.email || 'User'),
            type: user.userType,
            isVerified: isGuiderUser(user) ? user.accountVerified : user.isVerified
          } : undefined} 
        />
      )}
      
      <main className={`flex-1 ${showHeader ? 'pt-16' : ''}`}>
        {children}
      </main>
      
      {showFooter && <Footer />}
      
      <ToasterProvider />
    </div>
  );
}
