'use client';

import { useEffect } from 'react';
import { useToast } from '@/contexts/ToastContext';
import { setToastInstance as setApiToastInstance } from '@/lib/api/api-client';
import { setToastInstance as setLibToastInstance } from '@/lib/toast';

/**
 * This component connects the ToastContext to the API client and toast utility
 * so that API calls and components can show toasts without React context issues
 */
export default function ToastProviderWrapper({ children }: { children: React.ReactNode }) {
  const toast = useToast();

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

    return () => {
      setApiToastInstance(null);
      setLibToastInstance(null as any);
    };
  }, [toast]);

  return <>{children}</>;
}

