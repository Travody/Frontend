'use client';

import { useState, useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';
import { getIndianStateNames, getCityNamesByState } from '@/lib/india-states-cities';
import { tourTypes } from '@/lib/tour-types';

interface Step1BasicDetailsProps {
  data: any;
  onSubmit: (data: any) => void;
  isLoading: boolean;
  isValid: boolean;
}

export default function Step1BasicDetails({ data, onSubmit, isLoading, isValid }: Step1BasicDetailsProps) {
  const [formData, setFormData] = useState({
    title: data.title || '',
    description: data.description || '',
    city: data.city || '',
    state: data.state || '',
    tourTypes: data.tourTypes || []
  });

  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [allStates] = useState<string[]>(getIndianStateNames());
  const isInitialMount = useRef(true);

  useEffect(() => {
    setFormData({
      title: data.title || '',
      description: data.description || '',
      city: data.city || '',
      state: data.state || '',
      tourTypes: data.tourTypes || []
    });
    isInitialMount.current = true; // Reset on data change from parent
  }, [data]);

  useEffect(() => {
    if (formData.state) {
      const cities = getCityNamesByState(formData.state);
      setAvailableCities(cities);
      // Reset city if state changed
      if (formData.city && !cities.includes(formData.city)) {
        setFormData(prev => ({ ...prev, city: '' }));
      }
    } else {
      setAvailableCities([]);
    }
  }, [formData.state]);

  // Sync formData to parent on change (but not on initial mount)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    // Debounce the update to avoid too many calls
    const timeoutId = setTimeout(() => {
      onSubmit(formData);
    }, 100);
    return () => clearTimeout(timeoutId);
  }, [formData, onSubmit]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleTourType = (typeName: string) => {
    setFormData(prev => ({
      ...prev,
      tourTypes: prev.tourTypes.includes(typeName)
        ? prev.tourTypes.filter(t => t !== typeName)
        : [...prev.tourTypes, typeName]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Basic Details</h2>
        <p className="text-gray-600">Tell us about your amazing tour experience</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title and Description */}
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tour Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
              placeholder="e.g., Amazing Jaipur Heritage Walk"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
              placeholder="Describe your tour in detail..."
              required
            />
          </div>
        </div>

        {/* Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              State *
            </label>
            <select
              value={formData.state}
              onChange={(e) => handleInputChange('state', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
              required
            >
              <option value="">Select State</option>
              {allStates.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              City *
            </label>
            <select
              value={formData.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              disabled={!formData.state}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
              required
            >
              <option value="">{formData.state ? 'Select City' : 'Select State First'}</option>
              {availableCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tour Types - Optional with Icons */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Tour Types <span className="text-gray-400 font-normal">(Optional)</span>
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {tourTypes.map((tourType) => {
              const Icon = tourType.icon;
              const isSelected = formData.tourTypes.includes(tourType.name);
              return (
                <button
                  key={tourType.name}
                  type="button"
                  onClick={() => toggleTourType(tourType.name)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    isSelected
                      ? `${tourType.color} border-current`
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className={`w-5 h-5 ${isSelected ? '' : 'text-gray-400'}`} />
                    <span className={`text-sm font-medium ${isSelected ? '' : 'text-gray-600'}`}>
                      {tourType.name}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

      </form>
    </div>
  );
}
