'use client';

import { useState, useEffect, useRef } from 'react';
import { MapPin, Car, User, Phone, Mail } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';

interface Step6LogisticsProps {
  data: any;
  onSubmit: (data: any) => void;
  isLoading: boolean;
  isValid: boolean;
}

export default function Step6Logistics({ data, onSubmit, isLoading, isValid }: Step6LogisticsProps) {
  const [formData, setFormData] = useState({
    meetingPoint: data.meetingPoint || '',
    vehicleDetails: data.vehicleDetails || '',
    contactPersonName: data.contactPersonName || '',
    contactPersonPhone: data.contactPersonPhone || '',
    contactPersonEmail: data.contactPersonEmail || ''
  });
  const isInitialMount = useRef(true);

  useEffect(() => {
    setFormData({
      meetingPoint: data.meetingPoint || '',
      vehicleDetails: data.vehicleDetails || '',
      contactPersonName: data.contactPersonName || '',
      contactPersonPhone: data.contactPersonPhone || '',
      contactPersonEmail: data.contactPersonEmail || ''
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div>
      <div className="mb-6">
        <Heading as="h2" variant="section" className="mb-2">Meeting Point & Logistics</Heading>
        <p className="text-muted-foreground">Set meeting point, vehicle details, and contact information</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Meeting Point */}
        <div>
          <Label>
            <MapPin className="w-4 h-4 inline mr-1" />
            Meeting Point
          </Label>
          <Input
            type="text"
            value={formData.meetingPoint}
            onChange={(e) => handleInputChange('meetingPoint', e.target.value)}
            placeholder="e.g., Jaipur Railway Station, Platform 3"
          />
          <p className="mt-1 text-xs text-gray-500">
            Where participants should gather at the start of the tour
          </p>
        </div>

        {/* Vehicle Details */}
        <div>
          <Label>
            <Car className="w-4 h-4 inline mr-1" />
            Vehicle Details
          </Label>
          <Textarea
            value={formData.vehicleDetails}
            onChange={(e) => handleInputChange('vehicleDetails', e.target.value)}
            rows={3}
            placeholder="e.g., AC Bus with 40 seats, Toyota Innova, etc."
          />
          <p className="mt-1 text-xs text-gray-500">
            Information about transportation/vehicle (if applicable)
          </p>
        </div>

        {/* Contact Information */}
        <Card className="bg-blue-50 border-blue-200 mb-4">
          <CardContent className="p-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Contact details are useful for agencies or when you want to provide an alternative contact person for this specific tour.
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label>
              <User className="w-4 h-4 inline mr-1" />
              Contact Person Name
            </Label>
            <Input
              type="text"
              value={formData.contactPersonName}
              onChange={(e) => handleInputChange('contactPersonName', e.target.value)}
              placeholder="Name of contact person"
            />
          </div>

          <div>
            <Label>
              <Phone className="w-4 h-4 inline mr-1" />
              Contact Person Phone
            </Label>
            <Input
              type="tel"
              value={formData.contactPersonPhone}
              onChange={(e) => handleInputChange('contactPersonPhone', e.target.value)}
              placeholder="+91 9876543210"
            />
          </div>
        </div>

        <div>
          <Label>
            <Mail className="w-4 h-4 inline mr-1" />
            Contact Person Email
          </Label>
          <Input
            type="email"
            value={formData.contactPersonEmail}
            onChange={(e) => handleInputChange('contactPersonEmail', e.target.value)}
            placeholder="contact@example.com"
          />
        </div>

      </form>
    </div>
  );
}

