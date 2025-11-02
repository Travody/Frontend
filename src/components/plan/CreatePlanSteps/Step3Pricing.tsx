'use client';

import { useState, useEffect, useRef } from 'react';
import { DollarSign, Users } from 'lucide-react';

interface Step3PricingProps {
  data: any;
  onSubmit: (data: any) => void;
  isLoading: boolean;
  isValid: boolean;
}

const currencies = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' }
];

export default function Step3Pricing({ data, onSubmit, isLoading, isValid }: Step3PricingProps) {
  const [formData, setFormData] = useState({
    pricing: data.pricing || {
      pricePerPerson: 0,
      currency: 'INR',
      maxParticipants: 1
    }
  });
  const isInitialMount = useRef(true);

  useEffect(() => {
    setFormData({
      pricing: data.pricing || {
        pricePerPerson: data.pricePerPerson || 0,
        currency: data.currency || 'INR',
        maxParticipants: data.maxParticipants || 1
      }
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

  const handleInputChange = (field: 'pricePerPerson' | 'currency' | 'maxParticipants', value: any) => {
    setFormData(prev => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        [field]: field === 'maxParticipants' 
          ? parseInt(value) || 1 
          : field === 'pricePerPerson'
          ? (value === '' ? 0 : (typeof value === 'string' ? parseFloat(value) || 0 : value))
          : value
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const getCurrencySymbol = (code: string) => {
    return currencies.find(c => c.code === code)?.symbol || '₹';
  };

  const formatPrice = (price: number | string, currency: string) => {
    const symbol = getCurrencySymbol(currency);
    return `${symbol}${price || 0}`;
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Pricing</h2>
        <p className="text-gray-600">Set pricing and maximum group size</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Price and Currency */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="w-4 h-4 inline mr-1" />
              Price Per Person *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 text-sm">
                  {getCurrencySymbol(formData.pricing.currency)}
                </span>
              </div>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.pricing.pricePerPerson || 0}
                onChange={(e) => {
                  const value = parseFloat(e.target.value) || 0;
                  handleInputChange('pricePerPerson', value);
                }}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Currency *
            </label>
            <select
              value={formData.pricing.currency}
              onChange={(e) => handleInputChange('currency', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
              required
            >
              {currencies.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.symbol} {currency.name} ({currency.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Max Participants */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Users className="w-4 h-4 inline mr-1" />
            Maximum Participants *
          </label>
          <input
            type="number"
            min="1"
            max="50"
            value={formData.pricing.maxParticipants}
            onChange={(e) => handleInputChange('maxParticipants', parseInt(e.target.value) || 1)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            Maximum number of people that can participate in one booking
          </p>
        </div>

        {/* Price Preview */}
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600">
            <strong>Pricing:</strong> {formatPrice(formData.pricing.pricePerPerson, formData.pricing.currency)} 
            {' '}per person 
            {' '}(Max {formData.pricing.maxParticipants} participants)
          </p>
        </div>

      </form>
    </div>
  );
}

