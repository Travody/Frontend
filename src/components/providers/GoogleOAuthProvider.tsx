'use client';

import { GoogleOAuthProvider } from '@react-oauth/google';

export default function GoogleOAuthProviderWrapper({ children }: { children: React.ReactNode }) {
  // NEXT_PUBLIC_ variables are available at build time in client components
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

  // If no client ID, still render children (app works without Google OAuth)
  if (!googleClientId) {
    if (typeof window !== 'undefined') {
      console.warn('NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set. Google OAuth will not work.');
    }
    return <>{children}</>;
  }

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      {children}
    </GoogleOAuthProvider>
  );
}

