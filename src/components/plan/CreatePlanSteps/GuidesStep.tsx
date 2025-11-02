'use client';

import { useState } from 'react';
import { UserGroupIcon, PlusIcon } from '@heroicons/react/24/outline';
import { PromptDialog } from '@/components/ui/Dialog';

interface TourPlan {
  guides: string[];
  [key: string]: any;
}

interface GuidesStepProps {
  tourPlan: TourPlan;
  updateTourPlan: (updates: Partial<TourPlan>) => void;
}

export default function GuidesStep({ tourPlan, updateTourPlan }: GuidesStepProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);

  const handleAddGuide = (guideName: string) => {
    if (guideName && guideName.trim()) {
      updateTourPlan({ guides: [...tourPlan.guides, guideName.trim()] });
    }
    setShowAddDialog(false);
  };

  const removeGuide = (index: number) => {
    const updatedGuides = tourPlan.guides.filter((_, i) => i !== index);
    updateTourPlan({ guides: updatedGuides });
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Guides</h2>
        <p className="text-gray-600">Assign guides to this tour plan.</p>
      </div>

      <div className="space-y-6">
        {/* Add Guide Button */}
        <div>
          <button
            onClick={() => setShowAddDialog(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Add Guide
          </button>
        </div>

        {/* Add Guide Dialog */}
        <PromptDialog
          isOpen={showAddDialog}
          onClose={() => setShowAddDialog(false)}
          onConfirm={handleAddGuide}
          title="Add Guide"
          message="Enter guide name:"
          placeholder="Enter guide name..."
          confirmText="Add"
          cancelText="Cancel"
          required={true}
        />

        {/* Guides List */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Assigned Guides</h3>
          {tourPlan.guides.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <UserGroupIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No guides assigned yet.</p>
              <p className="text-sm">Click "Add Guide" to assign guides to this tour.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tourPlan.guides.map((guide, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center">
                    <UserGroupIcon className="w-5 h-5 text-gray-400 mr-3" />
                    <span className="text-gray-900">{guide}</span>
                  </div>
                  <button
                    onClick={() => removeGuide(index)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Guide Information */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Guide Assignment Tips</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Assign experienced guides who know the area well</li>
            <li>• Ensure guides are available for the scheduled dates</li>
            <li>• Consider guide specialties and language capabilities</li>
            <li>• You can add or remove guides at any time</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
