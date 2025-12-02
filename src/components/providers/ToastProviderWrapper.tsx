'use client';

import { useEffect } from 'react';
import { useToast } from '@/contexts/ToastContext';
import { useAuth } from '@/contexts/AuthContext';
import { setToastInstance as setApiToastInstance, setLogoutCallback } from '@/lib/api/api-client';
import { setToastInstance as setLibToastInstance } from '@/lib/toast';

/**
 * This component connects the ToastContext and AuthContext to the API client
 * so that API calls can show toasts and handle logout without React context issues
 */
export default function ToastProviderWrapper({ children }: { children: React.ReactNode }) {
  const toast = useToast();
  const { logout } = useAuth();

  useEffect(() => {
    // Make toast available to API client
    setApiToastInstance({
      success: toast.success,
      error: toast.error,
      warning: toast.warning,
      info: toast.info,
    });

    // Make toast available to toast utility (for react-hot-toast compatibility)
    setLibToastInstance(toast);

    // Make logout function available to API client for 401 handling
    setLogoutCallback(logout);

    return () => {
      setApiToastInstance(null);
      setLibToastInstance(null as any);
      setLogoutCallback(null);
    };
  }, [toast, logout]);

  return <>{children}</>;
}

