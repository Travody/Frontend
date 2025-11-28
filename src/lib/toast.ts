/**
 * Toast utility that provides a react-hot-toast compatible API
 * This allows easy migration from react-hot-toast to our custom toast system
 */

import type { ToastContextType } from '@/contexts/ToastContext';

// This will be set by the ToastProviderWrapper
let toastInstance: Pick<ToastContextType, 'success' | 'error' | 'warning' | 'info'> | null = null;

export function setToastInstance(instance: Pick<ToastContextType, 'success' | 'error' | 'warning' | 'info'>) {
  toastInstance = instance;
}

function toastFunction(message: string, options?: { duration?: number; icon?: string }) {
  if (toastInstance) {
    return toastInstance.info(message, options?.duration);
  }
  console.log(message);
  return '';
}

const toast = Object.assign(toastFunction, {
  success: (message: string, options?: { duration?: number }) => {
    if (toastInstance) {
      return toastInstance.success(message, options?.duration);
    }
    console.log('Success:', message);
    return '';
  },
  error: (message: string, options?: { duration?: number }) => {
    if (toastInstance) {
      return toastInstance.error(message, options?.duration);
    }
    console.error('Error:', message);
    return '';
  },
  warning: (message: string, options?: { duration?: number }) => {
    if (toastInstance) {
      return toastInstance.warning(message, options?.duration);
    }
    console.warn('Warning:', message);
    return '';
  },
  info: (message: string, options?: { duration?: number }) => {
    if (toastInstance) {
      return toastInstance.info(message, options?.duration);
    }
    console.info('Info:', message);
    return '';
  },
});

export default toast;

