'use client';

import { MapPinIcon, TruckIcon } from '@heroicons/react/24/outline';

interface TourPlan {
  meetingPoint: string;
  pickupDetails: string;
  vehicleType: string;
  [key: string]: any;
}

interface LogisticsStepProps {
  tourPlan: TourPlan;
  updateTourPlan: (updates: Partial<TourPlan>) => void;
}

const vehicleTypes = [
  'None',
  'Car',
  'Van',
  'Bus',
  'Boat',
  'Bicycle',
  'Walking'
];

export default function LogisticsStep({ tourPlan, updateTourPlan }: LogisticsStepProps) {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Logistics</h2>
        <p className="text-gray-600">Provide important details for tour coordination.</p>
      </div>

      <div className="space-y-6">
        {/* Meeting Point */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Meeting Point <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={tourPlan.meetingPoint}
              onChange={(e) => updateTourPlan({ meetingPoint: e.target.value })}
              placeholder="e.g., Main entrance of the Grand Museum."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">
            A clear address or location where the tour begins.
          </p>
          {!tourPlan.meetingPoint && (
            <p className="text-sm text-red-600 mt-1">Meeting point is required.</p>
          )}
        </div>

        {/* Pickup Details */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pickup Details (Optional)
          </label>
          <textarea
            value={tourPlan.pickupDetails}
            onChange={(e) => updateTourPlan({ pickupDetails: e.target.value })}
            placeholder="e.g., Pickup available from select hotels. Please provide your hotel name at checkout."
            className="w-full h-24 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          />
          <p className="text-sm text-gray-500 mt-2">
            Explain your pickup policy, if you offer one.
          </p>
        </div>

        {/* Vehicle Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Vehicle Type (Optional)
          </label>
          <div className="relative">
            <TruckIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={tourPlan.vehicleType}
              onChange={(e) => updateTourPlan({ vehicleType: e.target.value })}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
            >
              {vehicleTypes.map((type) => (
                <option key={type} value={type.toLowerCase()}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Transportation used during the tour, if any.
          </p>
        </div>
      </div>
    </div>
  );
}
