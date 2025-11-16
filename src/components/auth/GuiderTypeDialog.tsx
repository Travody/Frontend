'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { User, Building2 } from 'lucide-react';

interface GuiderTypeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (guiderType: 'Professional' | 'Agency') => void;
}

export default function GuiderTypeDialog({ isOpen, onClose, onSelect }: GuiderTypeDialogProps) {
  const [selectedType, setSelectedType] = useState<'Professional' | 'Agency' | null>(null);

  const handleConfirm = () => {
    if (selectedType) {
      onSelect(selectedType);
      setSelectedType(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select Your Guider Type</DialogTitle>
          <DialogDescription>
            Please select your guider type to complete your registration:
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <button
            onClick={() => setSelectedType('Professional')}
            className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
              selectedType === 'Professional'
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-primary-300'
            }`}
          >
            <div className="flex items-center">
              <User className={`w-6 h-6 mr-3 ${
                selectedType === 'Professional' ? 'text-primary-600' : 'text-gray-400'
              }`} />
              <div>
                <div className="font-semibold text-gray-900">Professional</div>
                <div className="text-sm text-gray-600">Individual guide offering personalized tours</div>
              </div>
            </div>
          </button>

          <button
            onClick={() => setSelectedType('Agency')}
            className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
              selectedType === 'Agency'
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-primary-300'
            }`}
          >
            <div className="flex items-center">
              <Building2 className={`w-6 h-6 mr-3 ${
                selectedType === 'Agency' ? 'text-primary-600' : 'text-gray-400'
              }`} />
              <div>
                <div className="font-semibold text-gray-900">Agency</div>
                <div className="text-sm text-gray-600">Tour agency with multiple guides and services</div>
              </div>
            </div>
          </button>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!selectedType}>
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
