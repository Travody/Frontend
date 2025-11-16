'use client';

import { useState, useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';
import { getIndianStateNames, getCityNamesByState } from '@/lib/india-states-cities';
import { tourTypes } from '@/lib/tour-types';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heading } from '@/components/ui/heading';

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
        ? prev.tourTypes.filter((t: string) => t !== typeName)
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
        <Heading as="h2" variant="section" className="mb-2">Basic Details</Heading>
        <p className="text-muted-foreground">Tell us about your amazing tour experience</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title and Description */}
        <div className="grid grid-cols-1 gap-6">
          <div>
          <Label htmlFor="title">
            Tour Title *
          </Label>
            <Input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="e.g., Amazing Jaipur Heritage Walk"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">
              Description *
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              placeholder="Describe your tour in detail..."
              required
            />
          </div>
        </div>

        {/* Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label>
              <MapPin className="w-4 h-4 inline mr-1" />
              State *
            </Label>
            <Select
              value={formData.state}
              onValueChange={(value) => handleInputChange('state', value)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select State" />
              </SelectTrigger>
              <SelectContent>
                {allStates.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>
              <MapPin className="w-4 h-4 inline mr-1" />
              City *
            </Label>
            <Select
              value={formData.city}
              onValueChange={(value) => handleInputChange('city', value)}
              disabled={!formData.state}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder={formData.state ? 'Select City' : 'Select State First'} />
              </SelectTrigger>
              <SelectContent>
                {availableCities.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                <Button
                  key={tourType.name}
                  type="button"
                  onClick={() => toggleTourType(tourType.name)}
                  variant={isSelected ? "default" : "outline"}
                  className={`p-4 h-auto justify-start ${
                    isSelected
                      ? `${tourType.color} border-current`
                      : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className={`w-5 h-5 ${isSelected ? '' : 'text-gray-400'}`} />
                    <span className={`text-sm font-medium ${isSelected ? '' : 'text-gray-600'}`}>
                      {tourType.name}
                    </span>
                  </div>
                </Button>
              );
            })}
          </div>
        </div>

      </form>
    </div>
  );
}
