'use client';

import { useState, useEffect, useRef } from 'react';
import { MapPin, Car, User, Phone, Mail } from 'lucide-react';

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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Meeting Point & Logistics</h2>
        <p className="text-gray-600">Set meeting point, vehicle details, and contact information</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Meeting Point */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="w-4 h-4 inline mr-1" />
            Meeting Point
          </label>
          <input
            type="text"
            value={formData.meetingPoint}
            onChange={(e) => handleInputChange('meetingPoint', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
            placeholder="e.g., Jaipur Railway Station, Platform 3"
          />
          <p className="mt-1 text-xs text-gray-500">
            Where participants should gather at the start of the tour
          </p>
        </div>

        {/* Vehicle Details */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Car className="w-4 h-4 inline mr-1" />
            Vehicle Details
          </label>
          <textarea
            value={formData.vehicleDetails}
            onChange={(e) => handleInputChange('vehicleDetails', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
            placeholder="e.g., AC Bus with 40 seats, Toyota Innova, etc."
          />
          <p className="mt-1 text-xs text-gray-500">
            Information about transportation/vehicle (if applicable)
          </p>
        </div>

        {/* Contact Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Contact details are useful for agencies or when you want to provide an alternative contact person for this specific tour.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-1" />
              Contact Person Name
            </label>
            <input
              type="text"
              value={formData.contactPersonName}
              onChange={(e) => handleInputChange('contactPersonName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
              placeholder="Name of contact person"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Phone className="w-4 h-4 inline mr-1" />
              Contact Person Phone
            </label>
            <input
              type="tel"
              value={formData.contactPersonPhone}
              onChange={(e) => handleInputChange('contactPersonPhone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
              placeholder="+91 9876543210"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Mail className="w-4 h-4 inline mr-1" />
            Contact Person Email
          </label>
          <input
            type="email"
            value={formData.contactPersonEmail}
            onChange={(e) => handleInputChange('contactPersonEmail', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
            placeholder="contact@example.com"
          />
        </div>

      </form>
    </div>
  );
}

