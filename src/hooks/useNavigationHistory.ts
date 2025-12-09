'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';

interface NavigationHistory {
  path: string;
  timestamp: number;
}

const MAX_HISTORY_LENGTH = 10;

export function useNavigationHistory() {
  const pathname = usePathname();
  const router = useRouter();
  const historyRef = useRef<NavigationHistory[]>([]);
  const isInitialMountRef = useRef(true);

  useEffect(() => {
    // Skip adding the initial page load
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      // Add current path as the first entry
      historyRef.current = [{ path: pathname, timestamp: Date.now() }];
      return;
    }

    // Don't add duplicate consecutive paths
    const lastPath = historyRef.current[historyRef.current.length - 1]?.path;
    if (lastPath === pathname) {
      return;
    }

    // Add new path to history
    historyRef.current.push({ path: pathname, timestamp: Date.now() });

    // Limit history size
    if (historyRef.current.length > MAX_HISTORY_LENGTH) {
      historyRef.current = historyRef.current.slice(-MAX_HISTORY_LENGTH);
    }
  }, [pathname]);

  const goBack = (fallbackPath: string = '/guider/dashboard') => {
    if (historyRef.current.length > 1) {
      // Remove current path
      historyRef.current.pop();
      // Get previous path
      const previousPath = historyRef.current[historyRef.current.length - 1]?.path;
      if (previousPath && previousPath !== pathname) {
        router.push(previousPath);
        return;
      }
    }
    // Fallback to dashboard if no history
    router.push(fallbackPath);
  };

  const getPreviousPath = (fallbackPath: string = '/guider/dashboard'): string => {
    if (historyRef.current.length > 1) {
      const previousPath = historyRef.current[historyRef.current.length - 2]?.path;
      if (previousPath && previousPath !== pathname) {
        return previousPath;
      }
    }
    return fallbackPath;
  };

  const clearHistory = () => {
    historyRef.current = [{ path: pathname, timestamp: Date.now() }];
  };

  return {
    goBack,
    getPreviousPath,
    clearHistory,
    history: historyRef.current,
  };
}
