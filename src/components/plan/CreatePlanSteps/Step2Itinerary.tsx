'use client';

import { useState, useEffect, useRef } from 'react';
import { Clock, Plus, X, Upload, Image } from 'lucide-react';
import toast from '@/lib/toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heading } from '@/components/ui/heading';

interface Step2ItineraryProps {
  data: any;
  onSubmit: (data: any) => void;
  isLoading: boolean;
  isValid: boolean;
}

export default function Step2Itinerary({ data, onSubmit, isLoading, isValid }: Step2ItineraryProps) {
  const [formData, setFormData] = useState({
    duration: data.duration || { value: 1, unit: 'hours' },
    itinerary: data.itinerary || {} as Record<string, string[]>, // For days: { "1": [...], "2": [...] }, For hours: { "0": [...] }
    gallery: data.gallery || []
  });

  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const isInitialMount = useRef(true);

  // Input fields for adding new items
  const [newItemInputs, setNewItemInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    const duration = data.duration || { value: 1, unit: 'hours' };
    setFormData({
      duration: duration,
      itinerary: data.itinerary || {},
      gallery: data.gallery || []
    });

    // Initialize inputs for each day
    if (duration.unit === 'days') {
      const inputs: Record<string, string> = {};
      for (let i = 1; i <= (duration.value || 1); i++) {
        inputs[i.toString()] = '';
      }
      setNewItemInputs(inputs);
    } else {
      setNewItemInputs({ '0': '' });
    }
    isInitialMount.current = true; // Reset on data change from parent
  }, [data]);

  // Update inputs when duration changes
  useEffect(() => {
    if (formData.duration.unit === 'days') {
      const inputs: Record<string, string> = {};
      for (let i = 1; i <= formData.duration.value; i++) {
        inputs[i.toString()] = newItemInputs[i.toString()] || '';
      }
      setNewItemInputs(inputs);
    } else {
      setNewItemInputs({ '0': '' });
    }
  }, [formData.duration.value, formData.duration.unit]);

  // Sync formData to parent on change
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    onSubmit(formData);
  }, [formData]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addItineraryItem = (key: string) => {
    const inputValue = newItemInputs[key]?.trim();
    if (!inputValue) return;

    setFormData(prev => ({
      ...prev,
      itinerary: {
        ...prev.itinerary,
        [key]: [...(prev.itinerary[key] || []), inputValue]
      }
    }));

    setNewItemInputs(prev => ({ ...prev, [key]: '' }));
  };

  const removeItineraryItem = (key: string, index: number) => {
    setFormData(prev => ({
      ...prev,
      itinerary: {
        ...prev.itinerary,
        [key]: prev.itinerary[key]?.filter((_: string, i: number) => i !== index) || []
      }
    }));
  };

  const handleDurationChange = (field: 'value' | 'unit', value: any) => {
    setFormData(prev => ({
      ...prev,
      duration: {
        ...prev.duration,
        [field]: value
      },
      // Reset itinerary when switching between hours and days
      itinerary: field === 'unit' ? {} : prev.itinerary
    }));
  };

  const handleFileUpload = async (files: FileList) => {
    setUploading(true);
    try {
      const uploadedUrls: any[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
          toast.error(`File ${file.name} is not a valid image or video`);
          continue;
        }

        if (file.size > 10 * 1024 * 1024) {
          toast.error(`File ${file.name} is too large. Maximum size is 10MB`);
          continue;
        }

        await new Promise(resolve => setTimeout(resolve, 500));
        
        const mockUrl = URL.createObjectURL(file);
        uploadedUrls.push(mockUrl);
      }

      handleInputChange('gallery', [...formData.gallery, ...uploadedUrls]);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload files');
    } finally {
      setUploading(false);
    }
  };

  const removeMedia = (index: number) => {
    handleInputChange('gallery', formData.gallery.filter((_: any, i: number) => i !== index));
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
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const renderItineraryList = () => {
    if (formData.duration.unit === 'days') {
      // Render day-by-day lists
      return Array.from({ length: formData.duration.value }, (_, dayIndex) => {
        const day = dayIndex + 1;
        const dayKey = day.toString();
        const items = formData.itinerary[dayKey] || [];
        
        return (
          <div key={day} className="border border-gray-200 rounded-lg p-4 mb-4">
            <Heading as="h3" variant="subsection" className="mb-3">Day {day}</Heading>
            
            {/* Existing items list */}
            {items.length > 0 && (
              <div className="space-y-2 mb-3">
                {items.map((item: string, index: number) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <span className="text-sm text-gray-900">{item}</span>
                  <Button
                    type="button"
                    onClick={() => removeItineraryItem(dayKey, index)}
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Add new item */}
            <div className="flex gap-2">
              <Input
                type="text"
                value={newItemInputs[dayKey] || ''}
                onChange={(e) => setNewItemInputs(prev => ({ ...prev, [dayKey]: e.target.value }))}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addItineraryItem(dayKey);
                  }
                }}
                placeholder="Add itinerary item (e.g., Visit Amber Fort, Explore City Palace)"
                className="flex-1"
              />
              <Button
                type="button"
                onClick={() => addItineraryItem(dayKey)}
                size="icon"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        );
      });
    } else {
      // Render hours-based (single list)
      const hourKey = '0';
      const items = formData.itinerary[hourKey] || [];
      
      return (
        <div className="border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-3">
            Add the places and activities for this {formData.duration.value}-hour tour
          </p>
          
          {/* Existing items list */}
          {items.length > 0 && (
            <div className="space-y-2 mb-3">
              {items.map((item: string, index: number) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <span className="text-sm text-gray-900">{item}</span>
                  <Button
                    type="button"
                    onClick={() => removeItineraryItem(hourKey, index)}
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Add new item */}
          <div className="flex gap-2">
            <Input
              type="text"
              value={newItemInputs[hourKey] || ''}
              onChange={(e) => setNewItemInputs(prev => ({ ...prev, [hourKey]: e.target.value }))}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addItineraryItem(hourKey);
                }
              }}
              placeholder="Add itinerary item (e.g., Visit Amber Fort, Explore City Palace)"
              className="flex-1"
            />
            <Button
              type="button"
              onClick={() => addItineraryItem(hourKey)}
              size="icon"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      );
    }
  };

  return (
    <div>
      <div className="mb-6">
        <Heading as="h2" variant="section" className="mb-2">Itinerary & Media</Heading>
        <p className="text-muted-foreground">
          Set tour duration and create your itinerary list with places and activities
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Duration */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> {formData.duration.unit === 'hours' 
              ? 'Add a list of places and activities that will be visited during this tour.'
              : 'Create a day-by-day itinerary. Add places and activities for each day of your tour.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="w-4 h-4 inline mr-1" />
              Duration Value *
            </label>
            <Input
              type="number"
              min="1"
              max={formData.duration.unit === 'hours' ? 168 : 365}
              value={formData.duration.value}
              onChange={(e) => handleDurationChange('value', parseInt(e.target.value) || 1)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration Unit *
            </label>
            <Select
              value={formData.duration.unit}
              onValueChange={(value) => handleDurationChange('unit', value)}
              required
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hours">Hours</SelectItem>
                <SelectItem value="days">Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Itinerary Lists */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Itinerary *
          </label>
          {renderItineraryList()}
        </div>

        {/* Media Gallery */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Image className="w-4 h-4 inline mr-1" />
            Media Gallery <span className="text-gray-400 font-normal">(Optional)</span>
          </label>
          
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${
              dragActive
                ? 'border-teal-500 bg-teal-50'
                : 'border-gray-300 bg-gray-50 hover:border-gray-400'
            }`}
          >
            <Upload className={`w-8 h-8 mx-auto mb-2 ${dragActive ? 'text-teal-500' : 'text-gray-400'}`} />
            <p className="text-sm text-gray-600 mb-1">
              Drag and drop images/videos here, or click to browse
            </p>
            <p className="text-xs text-gray-500 mb-3">
              Supports images and videos (max 10MB per file)
            </p>
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
              className="hidden"
              id="media-upload"
            />
            <Button
              asChild
              type="button"
            >
              <label
                htmlFor="media-upload"
                className="cursor-pointer"
              >
                {uploading ? 'Uploading...' : 'Select Files'}
              </label>
            </Button>
          </div>

          {formData.gallery.length > 0 && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {formData.gallery.map((media: string, index: number) => (
                <div key={index} className="relative group">
                  <div className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                    <img
                      src={media}
                      alt={`Gallery ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={() => removeMedia(index)}
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

      </form>
    </div>
  );
}
