'use client';

interface TourPlan {
  inclusions: string;
  exclusions: string;
  cancellationPolicy: string;
  additionalInfo: string;
  [key: string]: any;
}

interface PoliciesStepProps {
  tourPlan: TourPlan;
  updateTourPlan: (updates: Partial<TourPlan>) => void;
}

export default function PoliciesStep({ tourPlan, updateTourPlan }: PoliciesStepProps) {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Policies & Information</h2>
        <p className="text-gray-600">Provide clear policies to build trust with travelers.</p>
      </div>

      <div className="space-y-6">
        {/* Inclusions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Inclusions (Optional)
          </label>
          <textarea
            value={tourPlan.inclusions}
            onChange={(e) => updateTourPlan({ inclusions: e.target.value })}
            placeholder="e.g., - Bottled water&#10;- Professional Guide&#10;- Admission tickets"
            className="w-full h-24 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          />
          <p className="text-sm text-gray-500 mt-2">
            List everything that is included in the tour price. Use a new line for each item.
          </p>
        </div>

        {/* Exclusions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Exclusions (Optional)
          </label>
          <textarea
            value={tourPlan.exclusions}
            onChange={(e) => updateTourPlan({ exclusions: e.target.value })}
            placeholder="e.g., - Gratuities (10-20% recommended)&#10;- Lunch&#10;- Souvenirs"
            className="w-full h-24 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          />
          <p className="text-sm text-gray-500 mt-2">
            List what is not included in the tour price.
          </p>
        </div>

        {/* Cancellation Policy */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cancellation Policy (Optional)
          </label>
          <textarea
            value={tourPlan.cancellationPolicy}
            onChange={(e) => updateTourPlan({ cancellationPolicy: e.target.value })}
            placeholder="e.g., Free cancellation up to 24 hours before the experience starts."
            className="w-full h-24 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          />
          <p className="text-sm text-gray-500 mt-2">
            Clearly state your cancellation and refund policy.
          </p>
        </div>

        {/* Additional Info */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Info (Optional)
          </label>
          <textarea
            value={tourPlan.additionalInfo}
            onChange={(e) => updateTourPlan({ additionalInfo: e.target.value })}
            placeholder="Any additional information travelers should know..."
            className="w-full h-24 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          />
          <p className="text-sm text-gray-500 mt-2">
            Any other important information for travelers.
          </p>
        </div>
      </div>
    </div>
  );
}
