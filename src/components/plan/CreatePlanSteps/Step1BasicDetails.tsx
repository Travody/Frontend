'use client';

import { useState, useEffect, useRef } from 'react';
import { MapPin, Search, ChevronDown, X, Plus } from 'lucide-react';
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

  // Tour type dropdown state
  const [tourTypeSearch, setTourTypeSearch] = useState('');
  const [isTourTypeDropdownOpen, setIsTourTypeDropdownOpen] = useState(false);
  const [availableTourTypes, setAvailableTourTypes] = useState(tourTypes.map(tt => tt.name));
  const tourTypeDropdownRef = useRef<HTMLDivElement>(null);
  const tourTypeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFormData({
      title: data.title || '',
      description: data.description || '',
      city: data.city || '',
      state: data.state || '',
      tourTypes: data.tourTypes || []
    });

    // Update available tour types to include any custom tour types already selected
    if (data.tourTypes && Array.isArray(data.tourTypes)) {
      const defaultTourTypeNames = tourTypes.map(tt => tt.name);
      const customTourTypes = data.tourTypes.filter((tt: string) => !defaultTourTypeNames.includes(tt));
      if (customTourTypes.length > 0) {
        setAvailableTourTypes([...defaultTourTypeNames, ...customTourTypes]);
      }
    }
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

  // Close tour type dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tourTypeDropdownRef.current && !tourTypeDropdownRef.current.contains(event.target as Node)) {
        setIsTourTypeDropdownOpen(false);
        setTourTypeSearch('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

  const addTourType = (typeName: string) => {
    const trimmedType = typeName.trim();
    if (trimmedType && !formData.tourTypes.includes(trimmedType)) {
      // Add to available tour types if not already there
      if (!availableTourTypes.includes(trimmedType)) {
        setAvailableTourTypes([...availableTourTypes, trimmedType]);
      }
      handleInputChange('tourTypes', [...formData.tourTypes, trimmedType]);
      setTourTypeSearch('');
      setIsTourTypeDropdownOpen(false);
    }
  };

  const removeTourType = (typeName: string) => {
    handleInputChange('tourTypes', formData.tourTypes.filter((t: string) => t !== typeName));
  };

  const filteredTourTypes = availableTourTypes.filter(type => 
    !formData.tourTypes.includes(type) &&
    type.toLowerCase().includes(tourTypeSearch.toLowerCase())
  );

  const searchTermExists = tourTypeSearch.trim() && 
    !availableTourTypes.some(type => type.toLowerCase() === tourTypeSearch.toLowerCase().trim());

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

        {/* Tour Types */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tour Types <span className="text-gray-400 font-normal">(Optional)</span>
          </label>
          
          {/* Selected Tour Types List */}
          {formData.tourTypes.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.tourTypes.map((type: string) => {
                const tourType = tourTypes.find(tt => tt.name === type);
                const Icon = tourType?.icon;
                return (
                  <Badge
                    key={type}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {Icon && <Icon className="w-3 h-3" />}
                    <span>{type}</span>
                    <Button
                      type="button"
                      onClick={() => removeTourType(type)}
                      variant="ghost"
                      size="icon"
                      className="h-auto w-auto p-0 text-primary-700 hover:text-primary-900"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                );
              })}
            </div>
          )}

          {/* Tour Type Search Dropdown */}
          <div className="relative" ref={tourTypeDropdownRef}>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                ref={tourTypeInputRef}
                type="text"
                value={tourTypeSearch}
                onChange={(e) => {
                  setTourTypeSearch(e.target.value);
                  setIsTourTypeDropdownOpen(true);
                }}
                onFocus={() => setIsTourTypeDropdownOpen(true)}
                placeholder="Search and select tour types..."
                className="pl-10 pr-10"
              />
              <button
                type="button"
                onClick={() => setIsTourTypeDropdownOpen(!isTourTypeDropdownOpen)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"
              >
                <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isTourTypeDropdownOpen ? 'transform rotate-180' : ''}`} />
              </button>
            </div>

            {/* Dropdown Menu */}
            {isTourTypeDropdownOpen && (
              <div className="absolute z-50 w-full bottom-full mb-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {filteredTourTypes.length > 0 ? (
                  <div className="py-1">
                    {filteredTourTypes.map((type) => {
                      const tourType = tourTypes.find(tt => tt.name === type);
                      const Icon = tourType?.icon;
                      return (
                        <Button
                          key={type}
                          type="button"
                          onClick={() => addTourType(type)}
                          variant="ghost"
                          className="w-full justify-start text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-900"
                        >
                          {Icon && <Icon className="w-4 h-4 mr-2" />}
                          {type}
                        </Button>
                      );
                    })}
                  </div>
                ) : searchTermExists ? (
                  <div className="py-1">
                    <Button
                      type="button"
                      onClick={() => addTourType(tourTypeSearch.trim())}
                      variant="ghost"
                      className="w-full justify-start text-sm text-primary-600 hover:bg-primary-50 flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add '{tourTypeSearch.trim()}'
                    </Button>
                  </div>
                ) : (
                  <div className="px-4 py-3 text-sm text-gray-500 text-center">
                    {tourTypeSearch ? 'No tour types found' : 'Start typing to search tour types'}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      </form>
    </div>
  );
}
