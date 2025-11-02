'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { apiService, Plan } from '@/lib/api';
import AppLayout from '@/components/layout/AppLayout';
import {
  MapPin,
  Clock,
  Users,
  Star,
  Calendar,
  Eye,
  Edit,
  Globe,
  Lock,
  ArrowLeft,
  Phone,
  Mail,
  DollarSign,
  TrendingUp,
  CheckCircle,
  X,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function GuiderPlanDetailPage() {
  const params = useParams();
  const planId = params?.id as string;
  const { user, isAuthenticated, isLoading: authLoading, token } = useAuth();
  const router = useRouter();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

      if (!user?.accountVerified) {
        router.push('/guider/verification');
        return;
      }

      if (token && planId) {
        fetchPlanDetails();
      }
    }
  }, [authLoading, isAuthenticated, user, router, token, planId]);

  const fetchPlanDetails = async () => {
    if (!token || !planId) return;

    setIsLoading(true);
    try {
      const response = await apiService.getPlanById(planId);
      if (response.success && response.data) {
        // Verify this plan belongs to the guider
        const userId = user?.id || (user as any)?._id;
        if (response.data.guiderId !== userId) {
          toast.error('You do not have permission to view this plan');
          router.push('/guider/my-plans');
          return;
        }
        setPlan(response.data);
      } else {
        toast.error('Plan not found');
        router.push('/guider/my-plans');
      }
    } catch (error) {
      console.error('Error fetching plan:', error);
      toast.error('Failed to load plan details');
      router.push('/guider/my-plans');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (action: 'publish' | 'pause' | 'archive') => {
    if (!token || !plan) return;

    try {
      let response;
      switch (action) {
        case 'publish':
          response = await apiService.publishPlan(plan._id, token);
          break;
        case 'pause':
          response = await apiService.pausePlan(plan._id, token);
          break;
        case 'archive':
          response = await apiService.archivePlan(plan._id, token);
          break;
      }

      if (response.success && response.data) {
        setPlan(response.data);
        toast.success(`Plan ${action === 'publish' ? 'published' : action === 'pause' ? 'paused' : 'archived'} successfully`);
      } else {
        toast.error(`Failed to ${action} plan`);
      }
    } catch (error) {
      console.error(`Error ${action}ing plan:`, error);
      toast.error(`Failed to ${action} plan`);
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

  if (!planId) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid Plan ID</h2>
            <p className="text-gray-600 mb-4">The plan ID is missing or invalid.</p>
            <Link
              href="/guider/my-plans"
              className="text-teal-600 hover:text-teal-700"
            >
              Back to My Plans
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!plan) {
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
      <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        <Icon className="w-4 h-4" />
        {config.label}
      </span>
    );
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}
          <Link
            href="/guider/my-plans"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to My Plans
          </Link>

          {/* Header Section */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  {getStatusBadge(plan.status)}
                  <span className="text-sm text-gray-500">
                    Created {new Date(plan.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{plan.title}</h1>
                <div className="flex items-center text-gray-600 mb-4">
                  <MapPin className="w-5 h-5 mr-2" />
                  <span className="text-lg">{plan.city}, {plan.state}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href={`/guider/create-plan?edit=${plan._id}`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Edit Plan
                </Link>
                <Link
                  href={`/plans/${plan._id}`}
                  target="_blank"
                  className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  View as Traveler
                </Link>
              </div>
            </div>

            {/* Status Actions */}
            <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
              {plan.status === 'draft' && (
                <button
                  onClick={() => handleStatusChange('publish')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                >
                  <Globe className="w-4 h-4" />
                  Publish Plan
                </button>
              )}
              {plan.status === 'published' && (
                <button
                  onClick={() => handleStatusChange('pause')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
                >
                  <Lock className="w-4 h-4" />
                  Pause Plan
                </button>
              )}
              {plan.status === 'paused' && (
                <button
                  onClick={() => handleStatusChange('publish')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                >
                  <Globe className="w-4 h-4" />
                  Resume Plan
                </button>
              )}
              {plan.status !== 'archived' && (
                <button
                  onClick={() => handleStatusChange('archive')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
                >
                  <X className="w-4 h-4" />
                  Archive Plan
                </button>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Eye className="w-5 h-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Total Views</p>
                  <p className="text-2xl font-bold text-gray-900">{plan.viewCount || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Calendar className="w-5 h-5 text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Total Bookings</p>
                  <p className="text-2xl font-bold text-gray-900">{plan.bookingCount || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Star className="w-5 h-5 text-yellow-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Rating</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {plan.rating > 0 ? plan.rating.toFixed(1) : 'N/A'}
                  </p>
                  <p className="text-xs text-gray-500">{plan.totalReviews || 0} reviews</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <DollarSign className="w-5 h-5 text-purple-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatPrice(plan.totalRevenue || 0, plan.pricing?.currency || 'INR')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Gallery */}
              {plan.gallery && plan.gallery.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Photos</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {plan.gallery.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`${plan.title} ${index + 1}`}
                        className="w-full h-40 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">About this tour</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{plan.description}</p>
              </div>

              {/* Highlights */}
              {plan.highlights && plan.highlights.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Highlights</h2>
                  <ul className="space-y-2">
                    {plan.highlights.map((highlight, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Inclusions & Exclusions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {plan.inclusions && plan.inclusions.length > 0 && (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">What's Included</h2>
                    <ul className="space-y-2">
                      {plan.inclusions.map((inclusion, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{inclusion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {plan.exclusions && plan.exclusions.length > 0 && (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">What's Not Included</h2>
                    <ul className="space-y-2">
                      {plan.exclusions.map((exclusion, index) => (
                        <li key={index} className="flex items-start">
                          <X className="w-5 h-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{exclusion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Itinerary */}
              {plan.itinerary && Object.keys(plan.itinerary).length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Itinerary</h2>
                  <div className="space-y-4">
                    {Object.entries(plan.itinerary).map(([day, activities], index) => (
                      <div key={index} className="border-l-4 border-teal-500 pl-4">
                        <h3 className="font-semibold text-gray-900 mb-2">{day}</h3>
                        <ul className="space-y-1">
                          {activities.map((activity, actIndex) => (
                            <li key={actIndex} className="text-gray-700 flex items-start">
                              <span className="w-2 h-2 bg-teal-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                              <span>{activity}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Policies */}
              {(plan.cancellationPolicy || plan.termsAndConditions || plan.specialInstructions) && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Policies & Information</h2>
                  
                  {plan.cancellationPolicy && (
                    <div className="mb-4">
                      <h3 className="font-semibold text-gray-900 mb-2">Cancellation Policy</h3>
                      <p className="text-gray-700 text-sm whitespace-pre-line">{plan.cancellationPolicy}</p>
                    </div>
                  )}

                  {plan.specialInstructions && (
                    <div className="mb-4">
                      <h3 className="font-semibold text-gray-900 mb-2">Special Instructions</h3>
                      <p className="text-gray-700 text-sm whitespace-pre-line">{plan.specialInstructions}</p>
                    </div>
                  )}

                  {plan.termsAndConditions && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Terms & Conditions</h3>
                      <p className="text-gray-700 text-sm whitespace-pre-line">{plan.termsAndConditions}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Pricing Card */}
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Pricing</h2>
                {plan.pricing ? (
                  <>
                    <div className="mb-4">
                      <div className="text-3xl font-bold text-teal-600 mb-1">
                        {formatPrice(plan.pricing.pricePerPerson, plan.pricing.currency)}
                      </div>
                      <div className="text-sm text-gray-500">per person</div>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-2" />
                        <span>Max participants: {plan.pricing.maxParticipants}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-gray-500">Pricing not set</p>
                )}
              </div>

              {/* Tour Details */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Tour Details</h2>
                <div className="space-y-3">
                  {plan.duration && (
                    <div className="flex items-start">
                      <Clock className="w-5 h-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Duration</p>
                        <p className="text-sm text-gray-600">
                          {typeof plan.duration === 'object'
                            ? `${plan.duration.value} ${plan.duration.unit === 'days' ? 'day(s)' : 'hour(s)'}`
                            : `${plan.duration} hour(s)`}
                        </p>
                      </div>
                    </div>
                  )}

                  {plan.startTime && (
                    <div className="flex items-start">
                      <Clock className="w-5 h-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Start Time</p>
                        <p className="text-sm text-gray-600">{plan.startTime}</p>
                      </div>
                    </div>
                  )}

                  {plan.endTime && (
                    <div className="flex items-start">
                      <Clock className="w-5 h-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">End Time</p>
                        <p className="text-sm text-gray-600">{plan.endTime}</p>
                      </div>
                    </div>
                  )}

                  {plan.tourTypes && plan.tourTypes.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-2">Tour Types</p>
                      <div className="flex flex-wrap gap-2">
                        {plan.tourTypes.map((type) => (
                          <span
                            key={type}
                            className="px-3 py-1 bg-teal-100 text-teal-800 text-sm rounded-full"
                          >
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Meeting Point */}
              {plan.meetingPoint && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Meeting Point</h2>
                  <div className="flex items-start">
                    <MapPin className="w-5 h-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-700">{plan.meetingPoint}</p>
                  </div>
                  {plan.contactPersonName && (
                    <div className="mt-4 space-y-2 text-sm">
                      <div className="flex items-center text-gray-600">
                        <Phone className="w-4 h-4 mr-2" />
                        {plan.contactPersonPhone || 'N/A'}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Mail className="w-4 h-4 mr-2" />
                        {plan.contactPersonEmail || 'N/A'}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Requirements */}
              {plan.requirements && plan.requirements.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Requirements</h2>
                  <ul className="space-y-2">
                    {plan.requirements.map((requirement, index) => (
                      <li key={index} className="flex items-start">
                        <AlertCircle className="w-4 h-4 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{requirement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Languages */}
              {plan.languages && plan.languages.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Languages</h2>
                  <div className="flex flex-wrap gap-2">
                    {plan.languages.map((lang) => (
                      <span
                        key={lang}
                        className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full"
                      >
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

