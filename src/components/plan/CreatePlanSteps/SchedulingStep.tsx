'use client';

import { CalendarIcon, ClockIcon } from '@heroicons/react/24/outline';

interface TourPlan {
  planType: 'one-time' | 'recurring';
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  duration: number;
  [key: string]: any;
}

interface SchedulingStepProps {
  tourPlan: TourPlan;
  updateTourPlan: (updates: Partial<TourPlan>) => void;
}

export default function SchedulingStep({ tourPlan, updateTourPlan }: SchedulingStepProps) {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Scheduling</h2>
        <p className="text-gray-600">Define when your tour is available.</p>
      </div>

      <div className="space-y-6">
        {/* Plan Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Plan Type</label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="planType"
                value="one-time"
                checked={tourPlan.planType === 'one-time'}
                onChange={(e) => updateTourPlan({ planType: e.target.value as 'one-time' | 'recurring' })}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">One-Time</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="planType"
                value="recurring"
                checked={tourPlan.planType === 'recurring'}
                onChange={(e) => updateTourPlan({ planType: e.target.value as 'one-time' | 'recurring' })}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Recurring</span>
            </label>
          </div>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="date"
                value={tourPlan.startDate}
                onChange={(e) => updateTourPlan({ startDate: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="date"
                value={tourPlan.endDate}
                onChange={(e) => updateTourPlan({ endDate: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Time Range */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
            <div className="relative">
              <ClockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="time"
                value={tourPlan.startTime}
                onChange={(e) => updateTourPlan({ startTime: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
            <div className="relative">
              <ClockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="time"
                value={tourPlan.endTime}
                onChange={(e) => updateTourPlan({ endTime: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Duration */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
          <input
            type="number"
            value={tourPlan.duration}
            onChange={(e) => updateTourPlan({ duration: parseInt(e.target.value) || 0 })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="8"
          />
          <p className="text-sm text-gray-500 mt-2">
            Duration in hours (for single-day tours) or days (for multi-day tours).
          </p>
        </div>
      </div>
    </div>
  );
}
