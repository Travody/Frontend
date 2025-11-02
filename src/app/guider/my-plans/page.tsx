'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { apiService, Plan } from '@/lib/api';
import Header from '@/components/layout/Header';
import { MapPin, Clock, Users, Star, Calendar, Eye, Edit, Globe, Lock, Plus } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import AppLayout from '@/components/layout/AppLayout';

export default function MyPlansPage() {
  const { user, isAuthenticated, isLoading: authLoading, token } = useAuth();
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all'); // 'all', 'published', 'draft', 'paused', 'archived'

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/auth/guider/login');
        return;
      }

      if (user?.userType !== 'guider') {
        router.push('/');
        return;
      }

      // Check if guider is verified
      if (!user?.accountVerified) {
        router.push('/guider/verification');
        return;
      }

      if (token) {
        fetchPlans();
      }
    }
  }, [authLoading, isAuthenticated, user, router, token, statusFilter]);

  const fetchPlans = async () => {
    if (!token) return;
    
    setIsLoading(true);
    try {
      const status = statusFilter === 'all' ? undefined : statusFilter;
      const response = await apiService.getGuiderPlans(token, status);
      if (response.success && response.data) {
        setPlans(response.data);
      } else {
        toast.error('Failed to load plans');
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast.error('Failed to load plans');
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!isAuthenticated || user?.userType !== 'guider' || !user?.accountVerified) {
    return null;
  }

  const formatPrice = (price: number, currency: string) => {
    const symbol = currency === 'INR' ? '₹' : currency === 'USD' ? '$' : currency;
    return `${symbol}${price || 0}`;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      published: { bg: 'bg-green-100', text: 'text-green-800', icon: Globe, label: 'Published' },
      draft: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Lock, label: 'Draft' },
      paused: { bg: 'bg-orange-100', text: 'text-orange-800', icon: Lock, label: 'Paused' },
      archived: { bg: 'bg-gray-100', text: 'text-gray-800', icon: Lock, label: 'Archived' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Tour Plans</h1>
                <p className="text-gray-600 mt-1">Manage all your tour plans</p>
              </div>
              <Link
                href="/guider/create-plan"
                className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
              >
                <Plus className="w-5 h-5" />
                Create New Plan
              </Link>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 border-b border-gray-200">
              {['all', 'published', 'draft', 'paused', 'archived'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    statusFilter === status
                      ? 'text-teal-600 border-b-2 border-teal-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Plans Grid */}
          {plans.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <div
                  key={plan._id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Plan Image */}
                  {plan.gallery && plan.gallery.length > 0 ? (
                    <div className="relative h-48 w-full">
                      <img
                        src={plan.gallery[0]}
                        alt={plan.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2">
                        {getStatusBadge(plan.status)}
                      </div>
                    </div>
                  ) : (
                    <div className="relative h-48 w-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
                      <div className="absolute top-2 right-2">
                        {getStatusBadge(plan.status)}
                      </div>
                      <Calendar className="w-16 h-16 text-white opacity-50" />
                    </div>
                  )}

                  {/* Plan Details */}
                  <div className="p-5">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                      {plan.title}
                    </h3>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {plan.description}
                    </p>

                    {/* Location */}
                    <div className="flex items-center text-gray-600 text-sm mb-3">
                      <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="truncate">
                        {plan.city}, {plan.state}
                      </span>
                    </div>

                    {/* Plan Stats */}
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                      {plan.duration && (
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          <span>
                            {typeof plan.duration === 'object' 
                              ? `${plan.duration.value} ${plan.duration.unit === 'days' ? 'day(s)' : 'hour(s)'}`
                              : `${plan.duration} hour(s)`}
                          </span>
                        </div>
                      )}
                      {plan.pricing?.maxParticipants && (
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          <span>Up to {plan.pricing.maxParticipants}</span>
                        </div>
                      )}
                      {plan.rating > 0 && (
                        <div className="flex items-center">
                          <Star className="w-4 h-4 mr-1 text-yellow-500 fill-yellow-500" />
                          <span>{plan.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>

                    {/* Price */}
                    {plan.pricing?.pricePerPerson && (
                      <div className="mb-4">
                        <div className="text-2xl font-bold text-teal-600">
                          {formatPrice(plan.pricing.pricePerPerson, plan.pricing.currency)}
                        </div>
                        <div className="text-xs text-gray-500">per person</div>
                      </div>
                    )}

                    {/* Plan Metrics */}
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4 pb-4 border-b border-gray-200">
                      <div>
                        <span className="font-medium">Views:</span> {plan.viewCount || 0}
                      </div>
                      <div>
                        <span className="font-medium">Bookings:</span> {plan.bookingCount || 0}
                      </div>
                      <div>
                        <span className="font-medium">Reviews:</span> {plan.totalReviews || 0}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/guider/my-plans/${plan._id}`}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </Link>
                      <Link
                        href={`/guider/create-plan?edit=${plan._id}`}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-lg shadow-sm">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {statusFilter === 'all' ? 'No plans created yet' : `No ${statusFilter} plans`}
              </h3>
              <p className="text-gray-600 mb-6">
                {statusFilter === 'all' 
                  ? 'Start by creating your first tour plan!'
                  : `You don't have any ${statusFilter} plans yet.`}
              </p>
              {statusFilter === 'all' && (
                <Link
                  href="/guider/create-plan"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
                >
                  <Plus className="w-5 h-5" />
                  Create Your First Plan
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

