'use client';

interface TourPlan {
  pricingType: 'per-person' | 'per-group';
  price: number;
  discount: number;
  maxGroupSize: number;
  [key: string]: any;
}

interface PricingStepProps {
  tourPlan: TourPlan;
  updateTourPlan: (updates: Partial<TourPlan>) => void;
}

export default function PricingStep({ tourPlan, updateTourPlan }: PricingStepProps) {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Pricing & Group Size</h2>
        <p className="text-gray-600">Set your price and how many people can join.</p>
      </div>

      <div className="space-y-6">
        {/* Pricing Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Pricing Type</label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="pricingType"
                value="per-person"
                checked={tourPlan.pricingType === 'per-person'}
                onChange={(e) => updateTourPlan({ pricingType: e.target.value as 'per-person' | 'per-group' })}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Per Person</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="pricingType"
                value="per-group"
                checked={tourPlan.pricingType === 'per-group'}
                onChange={(e) => updateTourPlan({ pricingType: e.target.value as 'per-person' | 'per-group' })}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Per Group</span>
            </label>
          </div>
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Price ($)</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
            <input
              type="number"
              value={tourPlan.price}
              onChange={(e) => updateTourPlan({ price: parseFloat(e.target.value) || 0 })}
              className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="100.00"
              step="0.01"
              min="0"
            />
          </div>
          {tourPlan.price <= 0 && (
            <p className="text-sm text-red-600 mt-1">Price must be a number.</p>
          )}
        </div>

        {/* Discount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Discount (%) (Optional)
          </label>
          <div className="relative">
            <input
              type="number"
              value={tourPlan.discount}
              onChange={(e) => updateTourPlan({ discount: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="10"
              min="0"
              max="100"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
          </div>
        </div>

        {/* Maximum Group Size */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Group Size</label>
          <input
            type="number"
            value={tourPlan.maxGroupSize}
            onChange={(e) => updateTourPlan({ maxGroupSize: parseInt(e.target.value) || 10 })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="10"
            min="1"
          />
          <p className="text-sm text-gray-500 mt-2">
            The maximum number of participants for this tour.
          </p>
        </div>
      </div>
    </div>
  );
}
