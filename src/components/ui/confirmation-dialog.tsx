'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle, AlertTriangle, Info, XCircle } from 'lucide-react';
import { ReactNode } from 'react';

export interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive' | 'warning' | 'info';
  icon?: ReactNode;
  confirmButtonClassName?: string;
  disabled?: boolean;
}

const variantStyles = {
  default: {
    icon: AlertCircle,
    iconColor: 'text-gray-600',
    buttonClassName: 'bg-gray-900 hover:bg-gray-800 text-white',
  },
  destructive: {
    icon: XCircle,
    iconColor: 'text-red-600',
    buttonClassName: 'bg-red-600 hover:bg-red-700 text-white',
  },
  warning: {
    icon: AlertTriangle,
    iconColor: 'text-orange-600',
    buttonClassName: 'bg-orange-600 hover:bg-orange-700 text-white',
  },
  info: {
    icon: Info,
    iconColor: 'text-blue-600',
    buttonClassName: 'bg-blue-600 hover:bg-blue-700 text-white',
  },
};

export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  icon,
  confirmButtonClassName,
  disabled = false,
}: ConfirmationDialogProps) {
  const styles = variantStyles[variant];
  const Icon = styles.icon;
  const IconComponent = icon || <Icon className={`w-5 h-5 ${styles.iconColor}`} />;

  const handleConfirm = () => {
    if (!disabled) {
      onConfirm();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="space-y-3">
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className={`flex-shrink-0 ${styles.iconColor}`}>
              {IconComponent}
            </div>
            <span>{title}</span>
          </DialogTitle>
          <DialogDescription className="text-base text-gray-600 leading-relaxed pt-2">
            {message}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-2 mt-6">
          <Button 
            variant="outline" 
            onClick={onClose} 
            disabled={disabled}
            className="min-w-[80px]"
          >
            {cancelText}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={disabled}
            className={confirmButtonClassName || `${styles.buttonClassName} min-w-[80px]`}
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

