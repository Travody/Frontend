'use client';

import { useState } from 'react';
import { 
  BuildingOfficeIcon, 
  MapIcon, 
  BuildingLibraryIcon, 
  SunIcon, 
  GlobeAltIcon,
  CloudArrowUpIcon
} from '@heroicons/react/24/outline';

interface TourPlan {
  title: string;
  category: string;
  description: string;
  images: File[];
  languages: string[];
  [key: string]: any;
}

interface PlanDetailsStepProps {
  tourPlan: TourPlan;
  updateTourPlan: (updates: Partial<TourPlan>) => void;
}

const categories = [
  { id: 'city-tour', name: 'City Tour', icon: BuildingOfficeIcon },
  { id: 'adventure', name: 'Adventure', icon: MapIcon },
  { id: 'cultural', name: 'Cultural', icon: BuildingLibraryIcon },
  { id: 'beach', name: 'Beach', icon: SunIcon },
  { id: 'mountain', name: 'Mountain', icon: MapIcon },
  { id: 'other', name: 'Other', icon: GlobeAltIcon },
];

const languages = [
  'English', 'Mandarin', 'Spanish', 'Japanese', 
  'French', 'Hindi', 'German', 'Arabic'
];

export default function PlanDetailsStep({ tourPlan, updateTourPlan }: PlanDetailsStepProps) {
  const [dragActive, setDragActive] = useState(false);

  const handleImageUpload = (files: FileList | null) => {
    if (files) {
      const newImages = Array.from(files);
      updateTourPlan({ images: [...tourPlan.images, ...newImages] });
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleImageUpload(e.dataTransfer.files);
  };

  const toggleLanguage = (language: string) => {
    const updatedLanguages = tourPlan.languages.includes(language)
      ? tourPlan.languages.filter(l => l !== language)
      : [...tourPlan.languages, language];
    updateTourPlan({ languages: updatedLanguages });
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Plan Details</h2>
        <p className="text-gray-600">Create the foundation of your tour plan.</p>
      </div>

      <div className="space-y-8">
        {/* Plan Category */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Plan Category</h3>
          <div className="grid grid-cols-3 gap-4">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => updateTourPlan({ category: category.id })}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    tourPlan.category === category.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                  <p className="text-sm font-medium text-gray-900">{category.name}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Plan Images */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Plan Images</h3>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <CloudArrowUpIcon className="w-12 h-12 mx-auto mb-4 text-blue-500" />
            <p className="text-lg font-medium text-gray-900 mb-2">
              Click to upload or drag and drop
            </p>
            <p className="text-sm text-gray-500 mb-4">PNG, JPG up to 5MB</p>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleImageUpload(e.target.files)}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
            >
              Choose Files
            </label>
          </div>
          {tourPlan.images.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">Uploaded images:</p>
              <div className="flex flex-wrap gap-2">
                {tourPlan.images.map((image, index) => (
                  <div key={index} className="text-sm text-gray-500">
                    {image.name}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Languages Offered */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Languages Offered</h3>
          <p className="text-gray-600 mb-4">Select all languages you can conduct this tour in.</p>
          <div className="grid grid-cols-4 gap-3">
            {languages.map((language) => (
              <label key={language} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={tourPlan.languages.includes(language)}
                  onChange={() => toggleLanguage(language)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{language}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
