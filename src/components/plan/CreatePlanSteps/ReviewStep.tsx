'use client';

import { 
  DocumentTextIcon, 
  MapIcon, 
  CalendarIcon, 
  CurrencyDollarIcon, 
  UserGroupIcon, 
  MapPinIcon,
  TruckIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

interface TourPlan {
  title: string;
  category: string;
  description: string;
  languages: string[];
  itinerary: string;
  planType: 'one-time' | 'recurring';
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  duration: number;
  pricingType: 'per-person' | 'per-group';
  price: number;
  discount: number;
  maxGroupSize: number;
  meetingPoint: string;
  pickupDetails: string;
  vehicleType: string;
  inclusions: string;
  exclusions: string;
  cancellationPolicy: string;
  additionalInfo: string;
  guides: string[];
  [key: string]: any;
}

interface ReviewStepProps {
  tourPlan: TourPlan;
  updateTourPlan: (updates: Partial<TourPlan>) => void;
}

export default function ReviewStep({ tourPlan, updateTourPlan }: ReviewStepProps) {
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return 'Not set';
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getCategoryName = (category: string) => {
    const categories: { [key: string]: string } = {
      'city-tour': 'City Tour',
      'adventure': 'Adventure',
      'cultural': 'Cultural',
      'beach': 'Beach',
      'mountain': 'Mountain',
      'other': 'Other'
    };
    return categories[category] || category;
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Review & Publish</h2>
        <p className="text-gray-600">One final look. Please review all the details of your plan before publishing.</p>
      </div>

      <div className="space-y-8">
        {/* Basic Info */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Basic Info</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Tour Name</label>
              <p className="text-lg text-blue-600 font-medium">{tourPlan.title || 'Your Awesome Tour'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Tour Type</label>
              <p className="text-lg text-gray-900">{getCategoryName(tourPlan.category)}</p>
            </div>
          </div>
        </div>

        {/* Overview */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center mb-4">
            <DocumentTextIcon className="w-5 h-5 text-gray-400 mr-2" />
            <h3 className="text-xl font-semibold text-gray-900">Overview</h3>
          </div>
          <p className="text-gray-700">{tourPlan.description || 'A brief summary of your tour will appear here...'}</p>
        </div>

        {/* Schedule */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center mb-4">
            <CalendarIcon className="w-5 h-5 text-gray-400 mr-2" />
            <h3 className="text-xl font-semibold text-gray-900">Schedule</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Date</label>
              <p className="text-gray-900">
                {formatDate(tourPlan.startDate)} - {formatDate(tourPlan.endDate)}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Time</label>
              <p className="text-gray-900">
                {formatTime(tourPlan.startTime)} to {formatTime(tourPlan.endTime)} ({tourPlan.duration} hrs/days)
              </p>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center mb-4">
            <CurrencyDollarIcon className="w-5 h-5 text-gray-400 mr-2" />
            <h3 className="text-xl font-semibold text-gray-900">Pricing</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Price</label>
              <p className="text-lg text-gray-900">
                ${tourPlan.price} / {tourPlan.pricingType === 'per-person' ? 'Per Person' : 'Per Group'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Group Size</label>
              <p className="text-lg text-gray-900">Up to {tourPlan.maxGroupSize} participants</p>
            </div>
          </div>
        </div>

        {/* Languages */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center mb-4">
            <UserGroupIcon className="w-5 h-5 text-gray-400 mr-2" />
            <h3 className="text-xl font-semibold text-gray-900">Languages</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {tourPlan.languages.length > 0 ? (
              tourPlan.languages.map((language, index) => (
                <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {language}
                </span>
              ))
            ) : (
              <span className="text-gray-500">No languages selected</span>
            )}
          </div>
        </div>

        {/* Logistics */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center mb-4">
            <MapPinIcon className="w-5 h-5 text-gray-400 mr-2" />
            <h3 className="text-xl font-semibold text-gray-900">Logistics</h3>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500">Meeting Point</label>
              <p className="text-gray-900">{tourPlan.meetingPoint || 'Not specified'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Vehicle</label>
              <p className="text-gray-900 capitalize">{tourPlan.vehicleType || 'None'}</p>
            </div>
          </div>
        </div>

        {/* Policies */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center mb-4">
            <ShieldCheckIcon className="w-5 h-5 text-gray-400 mr-2" />
            <h3 className="text-xl font-semibold text-gray-900">Policies</h3>
          </div>
          <div className="space-y-3">
            {tourPlan.inclusions && (
              <div>
                <label className="text-sm font-medium text-gray-500">Inclusions</label>
                <p className="text-gray-900 whitespace-pre-line">{tourPlan.inclusions}</p>
              </div>
            )}
            {tourPlan.exclusions && (
              <div>
                <label className="text-sm font-medium text-gray-500">Exclusions</label>
                <p className="text-gray-900 whitespace-pre-line">{tourPlan.exclusions}</p>
              </div>
            )}
            {tourPlan.cancellationPolicy && (
              <div>
                <label className="text-sm font-medium text-gray-500">Cancellation Policy</label>
                <p className="text-gray-900">{tourPlan.cancellationPolicy}</p>
              </div>
            )}
          </div>
        </div>

        {/* Publish Button */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Ready to Publish?</h3>
            <p className="text-gray-600 mb-6">
              Once published, your tour will be visible to travelers and available for booking.
            </p>
            <button className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
              Publish Tour
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
