'use client';

import { useState, useEffect, useRef } from 'react';
import { Clock, Calendar, Plus, X, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heading } from '@/components/ui/heading';

interface Step4ScheduleProps {
  data: any;
  onSubmit: (data: any) => void;
  isLoading: boolean;
  isValid: boolean;
}

const DAYS_OF_WEEK = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' }
];

export default function Step4Schedule({ data, onSubmit, isLoading, isValid }: Step4ScheduleProps) {
  // Initialize availability with default structure
  const getInitialAvailability = () => {
    if (data.availability && data.availability.type) {
      return data.availability;
    }
    return {
      type: 'all_days' as const
    };
  };

  const [formData, setFormData] = useState({
    availability: getInitialAvailability()
  });

  const [newSpecificDate, setNewSpecificDate] = useState('');
  const [newSpecificTimeSlot, setNewSpecificTimeSlot] = useState({ startTime: '', endTime: '' });
  const isInitialMount = useRef(true);

  useEffect(() => {
    setFormData({
      availability: getInitialAvailability()
    });
    isInitialMount.current = true; // Reset on data change from parent
  }, [data]);

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

  const handleAvailabilityTypeChange = (type: 'all_days' | 'recurring' | 'specific') => {
    let newAvailability: any = { type };

    // Preserve existing data when switching types
    if (type === 'recurring' && formData.availability.recurring) {
      newAvailability.recurring = formData.availability.recurring;
    } else if (type === 'recurring') {
      newAvailability.recurring = {
        daysOfWeek: [],
        timeSlot: { startTime: '', endTime: '' }
      };
    }

    if (type === 'specific' && formData.availability.specific) {
      newAvailability.specific = formData.availability.specific;
    } else if (type === 'specific') {
      newAvailability.specific = [];
    }

    handleInputChange('availability', newAvailability);
  };

  const toggleDayOfWeek = (day: string) => {
    const currentDays = formData.availability.recurring?.daysOfWeek || [];
    const newDays = currentDays.includes(day)
      ? currentDays.filter((d: string) => d !== day)
      : [...currentDays, day];
    
    handleInputChange('availability', {
      ...formData.availability,
      recurring: {
        ...formData.availability.recurring,
        daysOfWeek: newDays,
        timeSlot: formData.availability.recurring?.timeSlot || { startTime: '', endTime: '' }
      }
    });
  };

  const updateRecurringTimeSlot = (field: 'startTime' | 'endTime', value: string) => {
    handleInputChange('availability', {
      ...formData.availability,
      recurring: {
        ...formData.availability.recurring,
        daysOfWeek: formData.availability.recurring?.daysOfWeek || [],
        timeSlot: {
          ...formData.availability.recurring?.timeSlot,
          [field]: value
        }
      }
    });
  };

  const addSpecificDate = () => {
    if (!newSpecificDate) return;

    // Check if date already exists
    const exists = formData.availability.specific?.some(
      (item: any) => item.date === newSpecificDate
    );
    if (exists) {
      toast.error('This date already exists in availability');
      return;
    }

    const newDateItem: any = { date: newSpecificDate };
    if (newSpecificTimeSlot.startTime || newSpecificTimeSlot.endTime) {
      newDateItem.timeSlot = { ...newSpecificTimeSlot };
    }

    const currentSpecific = formData.availability.specific || [];
    handleInputChange('availability', {
      ...formData.availability,
      specific: [...currentSpecific, newDateItem]
    });

    setNewSpecificDate('');
    setNewSpecificTimeSlot({ startTime: '', endTime: '' });
  };

  const removeSpecificDate = (index: number) => {
    const currentSpecific = formData.availability.specific || [];
    handleInputChange('availability', {
      ...formData.availability,
      specific: currentSpecific.filter((_: any, i: number) => i !== index)
    });
  };

  const updateSpecificDateTimeSlot = (index: number, field: 'startTime' | 'endTime', value: string) => {
    const currentSpecific = formData.availability.specific || [];
    const updatedSpecific = currentSpecific.map((item: any, i: number) => {
      if (i === index) {
        return {
          ...item,
          timeSlot: {
            ...item.timeSlot,
            [field]: value
          }
        };
      }
      return item;
    });
    handleInputChange('availability', {
      ...formData.availability,
      specific: updatedSpecific
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div>
      <div className="mb-6">
        <Heading as="h2" variant="section" className="mb-2">Schedule & Availability</Heading>
        <p className="text-muted-foreground">Set when your tour is available for booking</p>
      </div>

      <div className="space-y-6">
        {/* Availability Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            <Calendar className="w-4 h-4 inline mr-1" />
            Availability Type *
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button
              type="button"
              onClick={() => handleAvailabilityTypeChange('all_days')}
              variant={formData.availability.type === 'all_days' ? 'default' : 'outline'}
              className={`p-4 h-auto justify-start text-left ${
                formData.availability.type === 'all_days'
                  ? 'border-primary-600 bg-primary-50 text-primary-900'
                  : ''
              }`}
            >
              <div className="font-medium">All Days</div>
              <div className="text-xs text-gray-600 mt-1">Available every day</div>
            </Button>

            <Button
              type="button"
              onClick={() => handleAvailabilityTypeChange('recurring')}
              variant={formData.availability.type === 'recurring' ? 'default' : 'outline'}
              className={`p-4 h-auto justify-start text-left ${
                formData.availability.type === 'recurring'
                  ? 'border-primary-600 bg-primary-50 text-primary-900'
                  : ''
              }`}
            >
              <div className="font-medium">Recurring</div>
              <div className="text-xs text-gray-600 mt-1">Weekly schedule</div>
            </Button>

            <Button
              type="button"
              onClick={() => handleAvailabilityTypeChange('specific')}
              variant={formData.availability.type === 'specific' ? 'default' : 'outline'}
              className={`p-4 h-auto justify-start text-left ${
                formData.availability.type === 'specific'
                  ? 'border-primary-600 bg-primary-50 text-primary-900'
                  : ''
              }`}
            >
              <div className="font-medium">Specific Dates</div>
              <div className="text-xs text-gray-600 mt-1">One-time dates</div>
            </Button>
          </div>
        </div>

        {/* Recurring Availability */}
        {formData.availability.type === 'recurring' && (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Days of Week *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
              {DAYS_OF_WEEK.map(day => {
                const isSelected = formData.availability.recurring?.daysOfWeek?.includes(day.value);
                return (
                  <Button
                    key={day.value}
                    type="button"
                    onClick={() => toggleDayOfWeek(day.value)}
                    variant={isSelected ? "default" : "outline"}
                    className={`p-3 h-auto ${
                      isSelected
                        ? 'border-primary-600 bg-primary-100 text-primary-900'
                        : ''
                    }`}
                  >
                    {isSelected && <CheckCircle className="w-4 h-4 inline mr-1" />}
                    {day.label}
                  </Button>
                );
              })}
            </div>

            {/* Optional Time Slot for Recurring */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Slot (Optional)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Start Time</label>
                  <Input
                    type="time"
                    value={formData.availability.recurring?.timeSlot?.startTime || ''}
                    onChange={(e) => updateRecurringTimeSlot('startTime', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">End Time</label>
                  <Input
                    type="time"
                    value={formData.availability.recurring?.timeSlot?.endTime || ''}
                    onChange={(e) => updateRecurringTimeSlot('endTime', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {formData.availability.recurring?.daysOfWeek?.length === 0 && (
              <p className="mt-2 text-sm text-amber-600">
                Please select at least one day of the week
              </p>
            )}
          </div>
        )}

        {/* Specific Dates Availability */}
        {formData.availability.type === 'specific' && (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Specific Dates *
            </label>

            {/* List of Added Dates */}
            <div className="space-y-2 mb-4">
              {formData.availability.specific?.map((item: any, index: number) => (
                <div key={index} className="bg-white p-3 rounded-lg border border-gray-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{formatDate(item.date)}</div>
                      {item.timeSlot && (item.timeSlot.startTime || item.timeSlot.endTime) && (
                        <div className="text-sm text-gray-600 mt-1">
                          <Clock className="w-3 h-3 inline mr-1" />
                          {item.timeSlot.startTime || '--:--'} - {item.timeSlot.endTime || '--:--'}
                        </div>
                      )}
                      {item.timeSlot && !item.timeSlot.startTime && !item.timeSlot.endTime && (
                        <div className="text-xs text-gray-500 mt-1">No time slot set</div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Edit Time Slot for this date */}
                      <div className="flex gap-1">
                        <Input
                          type="time"
                          value={item.timeSlot?.startTime || ''}
                          onChange={(e) => updateSpecificDateTimeSlot(index, 'startTime', e.target.value)}
                          className="w-24 text-xs"
                          placeholder="Start"
                        />
                        <Input
                          type="time"
                          value={item.timeSlot?.endTime || ''}
                          onChange={(e) => updateSpecificDateTimeSlot(index, 'endTime', e.target.value)}
                          className="w-24 text-xs"
                          placeholder="End"
                        />
                      </div>
                      <Button
                        type="button"
                        onClick={() => removeSpecificDate(index)}
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add New Specific Date */}
            <div className="border-t border-gray-200 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Date</label>
                  <Input
                    type="date"
                    value={newSpecificDate}
                    onChange={(e) => setNewSpecificDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Start Time (Optional)</label>
                  <Input
                    type="time"
                    value={newSpecificTimeSlot.startTime}
                    onChange={(e) => setNewSpecificTimeSlot(prev => ({ ...prev, startTime: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">End Time (Optional)</label>
                  <Input
                    type="time"
                    value={newSpecificTimeSlot.endTime}
                    onChange={(e) => setNewSpecificTimeSlot(prev => ({ ...prev, endTime: e.target.value }))}
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    type="button"
                    onClick={addSpecificDate}
                    disabled={!newSpecificDate}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Date
                  </Button>
                </div>
              </div>
            </div>

            {(!formData.availability.specific || formData.availability.specific.length === 0) && (
              <p className="mt-2 text-sm text-amber-600">
                Please add at least one specific date
              </p>
            )}
          </div>
        )}

        {/* All Days - No additional configuration needed */}
        {formData.availability.type === 'all_days' && (
          <Card className="bg-primary-50 border-primary-200">
            <CardContent className="p-4">
              <p className="text-sm text-primary-800">
                <strong>All Days:</strong> Your tour is available for booking on all days. 
                Travelers can book for any date.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
