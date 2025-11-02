'use client';

import { useState, useEffect } from 'react';
import { Star, MapPin, Clock, User } from 'lucide-react';
import Link from 'next/link';
import { apiService, Plan } from '@/lib/api';

export default function FeaturedTours() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedPlans();
  }, []);

  const fetchFeaturedPlans = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.searchPlans({
        limit: 3,
        page: 1
      });
      if (response.success && response.data) {
        // Filter to only published plans and take top 3
        const publishedPlans = response.data.plans
          .filter((plan: Plan) => plan.status === 'published')
          .slice(0, 3);
        setPlans(publishedPlans);
      }
    } catch (error) {
      console.error('Failed to fetch featured plans:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDuration = (duration?: { value: number; unit: 'hours' | 'days' }) => {
    if (!duration) return '';
    if (duration.unit === 'hours') {
      return duration.value === 1 ? '1 Hour' : `${duration.value} Hours`;
    }
    return duration.value === 1 ? '1 Day' : `${duration.value} Days`;
  };

  const getImageUrl = (plan: Plan) => {
    if (plan.gallery && plan.gallery.length > 0) {
      return plan.gallery[0];
    }
    // Fallback placeholder image
    return "https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80";
  };

  const getBadgeInfo = (plan: Plan) => {
    if (plan.tourTypes && plan.tourTypes.length > 0) {
      const firstType = plan.tourTypes[0];
      const badgeColors: { [key: string]: string } = {
        'Adventure': 'bg-red-500',
        'Cultural': 'bg-purple-500',
        'Nature': 'bg-green-500',
        'Beach': 'bg-blue-500',
        'Heritage': 'bg-orange-500',
      };
      return {
        text: firstType,
        color: badgeColors[firstType] || 'bg-gray-500'
      };
    }
    return { text: 'Featured', color: 'bg-teal-500' };
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Featured Tours & Experiences
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
                <div className="w-full h-48 bg-gray-200"></div>
                <div className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (plans.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Featured Tours & Experiences
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {plans.map((plan) => {
            const badgeInfo = getBadgeInfo(plan);
            return (
              <div key={plan._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="relative">
                  <img
                    src={getImageUrl(plan)}
                    alt={plan.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-white text-sm font-medium ${badgeInfo.color}`}>
                    {badgeInfo.text}
                  </div>
                  {plan.rating && (
                    <div className="absolute top-4 right-4 bg-white bg-opacity-90 rounded-lg px-2 py-1 flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="ml-1 text-sm font-medium">{plan.rating.toFixed(1)}</span>
                      {plan.totalReviews && (
                        <span className="ml-1 text-sm text-gray-500">({plan.totalReviews})</span>
                      )}
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{plan.title}</h3>
                    {plan.duration && (
                      <div className="flex items-center text-gray-500 ml-2">
                        <Clock className="w-4 h-4 mr-1" />
                        <span className="text-sm whitespace-nowrap">{formatDuration(plan.duration)}</span>
                      </div>
                    )}
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {plan.description}
                  </p>

                  {plan.city && (
                    <div className="flex items-center mb-4 text-gray-500">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span className="text-sm">{plan.city}{plan.state && `, ${plan.state}`}</span>
                    </div>
                  )}

                  {plan.pricing && (
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <span className="text-2xl font-bold text-gray-900">₹{plan.pricing.pricePerPerson.toLocaleString()}</span>
                        <span className="text-sm text-gray-500 ml-2">per person</span>
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <Link
                      href={`/plans/${plan._id}`}
                      className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-center font-medium"
                    >
                      View Details
                    </Link>
                    <Link
                      href={`/plans/${plan._id}`}
                      className="flex-1 bg-secondary-500 text-white py-2 px-4 rounded-lg hover:bg-secondary-600 transition-colors text-center font-medium"
                    >
                      Book Now
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

