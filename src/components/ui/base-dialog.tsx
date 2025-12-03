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
import { ReactNode } from 'react';

export interface BaseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: ReactNode;
  icon?: ReactNode;
  footer?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmDisabled?: boolean;
  cancelDisabled?: boolean;
  confirmVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  cancelVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  confirmClassName?: string;
  cancelClassName?: string;
  showFooter?: boolean;
  contentClassName?: string;
  headerClassName?: string;
  titleClassName?: string;
  maxWidth?: string;
}

export function BaseDialog({
  isOpen,
  onClose,
  title,
  description,
  children,
  icon,
  footer,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  confirmDisabled = false,
  cancelDisabled = false,
  confirmVariant = 'default',
  cancelVariant = 'outline',
  confirmClassName,
  cancelClassName,
  showFooter = true,
  contentClassName,
  headerClassName,
  titleClassName,
  maxWidth = 'sm:max-w-lg',
}: BaseDialogProps) {
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      onClose();
    }
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
  };

  const hasDefaultFooter = showFooter && (confirmText || cancelText);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`${maxWidth} ${contentClassName || ''}`}>
        <DialogHeader className={headerClassName}>
          <DialogTitle className={titleClassName || 'flex items-center gap-2'}>
            {icon && <span className="flex-shrink-0">{icon}</span>}
            <span>{title}</span>
          </DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children && <div className="py-4">{children}</div>}
        {(footer || hasDefaultFooter) && (
          <DialogFooter>
            {footer || (
              <>
                {cancelText && (
                  <Button
                    variant={cancelVariant}
                    onClick={handleCancel}
                    disabled={cancelDisabled}
                    className={cancelClassName}
                  >
                    {cancelText}
                  </Button>
                )}
                {confirmText && (
                  <Button
                    variant={confirmVariant}
                    onClick={handleConfirm}
                    disabled={confirmDisabled}
                    className={confirmClassName}
                  >
                    {confirmText}
                  </Button>
                )}
              </>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

