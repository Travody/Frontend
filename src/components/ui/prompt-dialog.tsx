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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';

interface PromptDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (value: string) => void;
  title: string;
  message: string;
  placeholder?: string;
  confirmText?: string;
  cancelText?: string;
  required?: boolean;
  multiline?: boolean;
}

export function PromptDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  placeholder = '',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  required = false,
  multiline = false,
}: PromptDialogProps) {
  const [value, setValue] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setValue('');
    }
  }, [isOpen]);

  const handleConfirm = () => {
    if (required && !value.trim()) {
      return;
    }
    onConfirm(value);
    setValue('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{message}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {multiline ? (
            <div className="space-y-2">
              <Label htmlFor="prompt-textarea">{message}</Label>
              <Textarea
                id="prompt-textarea"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={placeholder}
                rows={4}
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="prompt-input">{message}</Label>
              <Input
                id="prompt-input"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={placeholder}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (!required || value.trim())) {
                    handleConfirm();
                  }
                }}
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {cancelText}
          </Button>
          <Button onClick={handleConfirm} disabled={required && !value.trim()}>
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

