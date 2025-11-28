'use client';

import React, { useEffect } from 'react';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastProps {
  toast: Toast;
  onClose: (id: string) => void;
}

const toastConfig = {
  success: {
    icon: CheckCircle2,
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-800',
    iconColor: 'text-green-600',
    iconBg: 'bg-green-100',
    title: 'Success',
  },
  error: {
    icon: AlertCircle,
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-800',
    iconColor: 'text-red-600',
    iconBg: 'bg-red-100',
    title: 'Error',
  },
  warning: {
    icon: AlertTriangle,
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    textColor: 'text-yellow-800',
    iconColor: 'text-yellow-600',
    iconBg: 'bg-yellow-100',
    title: 'Warning',
  },
  info: {
    icon: Info,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-800',
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-100',
    title: 'Info',
  },
};

export function ToastComponent({ toast, onClose }: ToastProps) {
  const config = toastConfig[toast.type];
  const Icon = config.icon;
  const duration = toast.duration || (toast.type === 'error' ? 5000 : toast.type === 'success' ? 3000 : 4000);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(toast.id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, toast.id, onClose]);

  return (
    <div
      className={cn(
        'relative flex items-start gap-3 p-4 rounded-lg border shadow-lg min-w-[320px] max-w-[420px]',
        'animate-in slide-in-from-top-5 fade-in-0',
        config.bgColor,
        config.borderColor,
        'transition-all duration-300 ease-in-out'
      )}
      role="alert"
    >
      {/* Icon */}
      <div className={cn('flex-shrink-0 p-2 rounded-full', config.iconBg)}>
        <Icon className={cn('w-5 h-5', config.iconColor)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className={cn('font-semibold text-sm mb-1', config.textColor)}>
          {config.title}
        </div>
        <p className={cn('text-sm leading-relaxed', config.textColor)}>
          {toast.message}
        </p>
      </div>

      {/* Close Button */}
      <button
        onClick={() => onClose(toast.id)}
        className={cn(
          'flex-shrink-0 p-1 rounded-md transition-colors',
          'hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-offset-2',
          config.textColor,
          toast.type === 'success' 
            ? 'focus:ring-green-500' 
            : toast.type === 'error' 
            ? 'focus:ring-red-500' 
            : toast.type === 'warning' 
            ? 'focus:ring-yellow-500' 
            : 'focus:ring-blue-500'
        )}
        aria-label="Close toast"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

