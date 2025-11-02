'use client';

interface TourPlan {
  itinerary: string;
  [key: string]: any;
}

interface ItineraryStepProps {
  tourPlan: TourPlan;
  updateTourPlan: (updates: Partial<TourPlan>) => void;
}

export default function ItineraryStep({ tourPlan, updateTourPlan }: ItineraryStepProps) {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Itinerary</h2>
        <p className="text-gray-600">Create a detailed itinerary for your tour.</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tour Itinerary
          </label>
          <textarea
            value={tourPlan.itinerary}
            onChange={(e) => updateTourPlan({ itinerary: e.target.value })}
            placeholder="Provide a detailed day-by-day itinerary of your tour..."
            className="w-full h-64 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          />
          <p className="text-sm text-gray-500 mt-2">
            Include specific activities, timings, and locations for each day.
          </p>
        </div>
      </div>
    </div>
  );
}
