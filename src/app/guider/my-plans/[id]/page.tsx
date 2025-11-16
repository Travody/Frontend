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
  CheckCircle,
  X,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heading } from '@/components/ui/heading';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { LoadingState } from '@/components/ui/loading-state';
import { Separator } from '@/components/ui/separator';

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
      <AppLayout>
        <LoadingState message="Loading plan details..." />
      </AppLayout>
    );
  }

  if (!isAuthenticated || user?.userType !== 'guider' || !user?.accountVerified) {
    return null;
  }

  if (!planId) {
    return (
      <AppLayout>
        <Section variant="muted" className="py-12">
          <Container>
            <div className="text-center">
              <Heading as="h2" variant="section" className="mb-2">Invalid Plan ID</Heading>
              <p className="text-gray-600 mb-4">The plan ID is missing or invalid.</p>
              <Link href="/guider/my-plans">
                <Button variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to My Plans
                </Button>
              </Link>
            </div>
          </Container>
        </Section>
      </AppLayout>
    );
  }

  if (!plan) {
    return null;
  }

  const formatPrice = (price: number, currency: string) => {
    const symbol = currency === 'INR' ? '₹' : currency === 'USD' ? '$' : currency;
    return `${symbol}${price?.toLocaleString() || 0}`;
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'published':
        return 'default';
      case 'draft':
        return 'secondary';
      case 'paused':
        return 'outline';
      case 'archived':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  return (
    <AppLayout>
      <Section variant="muted" className="py-8">
        <Container>
          {/* Back Button */}
          <div className="mb-6">
            <Link href="/guider/my-plans">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to My Plans
              </Button>
            </Link>
          </div>

          {/* Header Section */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <Badge variant={getStatusVariant(plan.status)} className="flex items-center gap-1">
                      {plan.status === 'published' ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                      {plan.status}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      Created {new Date(plan.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <Heading as="h1" variant="page" className="mb-2">{plan.title}</Heading>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-5 h-5 mr-2" />
                    <span className="text-lg">{plan.city}, {plan.state}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Link href={`/guider/create-plan?edit=${plan._id}`}>
                    <Button>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Plan
                    </Button>
                  </Link>
                  <Link href={`/plans/${plan._id}`} target="_blank">
                    <Button variant="outline">
                      <Eye className="w-4 h-4 mr-2" />
                      View as Traveler
                    </Button>
                  </Link>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Separator className="mb-4" />
              {/* Status Actions */}
              <div className="flex items-center gap-3">
                {plan.status === 'draft' && (
                  <Button
                    onClick={() => handleStatusChange('publish')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    Publish Plan
                  </Button>
                )}
                {plan.status === 'published' && (
                  <Button
                    onClick={() => handleStatusChange('pause')}
                    variant="outline"
                    className="border-orange-600 text-orange-600 hover:bg-orange-50"
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Pause Plan
                  </Button>
                )}
                {plan.status === 'paused' && (
                  <Button
                    onClick={() => handleStatusChange('publish')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    Resume Plan
                  </Button>
                )}
                {plan.status !== 'archived' && (
                  <Button
                    onClick={() => handleStatusChange('archive')}
                    variant="outline"
                    className="border-gray-600 text-gray-600 hover:bg-gray-50"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Archive Plan
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Eye className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Total Views</p>
                    <p className="text-2xl font-bold text-gray-900">{plan.viewCount || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Calendar className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Total Bookings</p>
                    <p className="text-2xl font-bold text-gray-900">{plan.bookingCount || plan.totalBookings || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Star className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Rating</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {plan.rating && plan.rating > 0 ? plan.rating.toFixed(1) : 'N/A'}
                    </p>
                    <p className="text-xs text-gray-500">{plan.totalReviews || 0} reviews</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
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
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Gallery */}
              {plan.gallery && plan.gallery.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Photos</CardTitle>
                  </CardHeader>
                  <CardContent>
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
                  </CardContent>
                </Card>
              )}

              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle>About this tour</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">{plan.description}</p>
                </CardContent>
              </Card>

              {/* Highlights */}
              {plan.highlights && plan.highlights.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Highlights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {plan.highlights.map((highlight, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Inclusions & Exclusions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {plan.inclusions && plan.inclusions.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>What's Included</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {plan.inclusions.map((inclusion, index) => (
                          <li key={index} className="flex items-start">
                            <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{inclusion}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {plan.exclusions && plan.exclusions.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>What's Not Included</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {plan.exclusions.map((exclusion, index) => (
                          <li key={index} className="flex items-start">
                            <X className="w-5 h-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{exclusion}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Itinerary */}
              {plan.itinerary && Object.keys(plan.itinerary).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Itinerary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(plan.itinerary).map(([day, activities], index) => (
                        <div key={index} className="border-l-4 border-primary-500 pl-4">
                          <Heading as="h3" variant="subsection" className="mb-2">{day}</Heading>
                          <ul className="space-y-1">
                            {Array.isArray(activities) && activities.map((activity, actIndex) => (
                              <li key={actIndex} className="text-gray-700 flex items-start">
                                <span className="w-2 h-2 bg-primary-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                                <span>{activity}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Policies */}
              {(plan.cancellationPolicy || plan.termsAndConditions || plan.specialInstructions) && (
                <Card>
                  <CardHeader>
                    <CardTitle>Policies & Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {plan.cancellationPolicy && (
                      <div>
                        <Heading as="h3" variant="subsection" className="mb-2">Cancellation Policy</Heading>
                        <p className="text-gray-700 text-sm whitespace-pre-line">{plan.cancellationPolicy}</p>
                      </div>
                    )}

                    {plan.specialInstructions && (
                      <div>
                        <Heading as="h3" variant="subsection" className="mb-2">Special Instructions</Heading>
                        <p className="text-gray-700 text-sm whitespace-pre-line">{plan.specialInstructions}</p>
                      </div>
                    )}

                    {plan.termsAndConditions && (
                      <div>
                        <Heading as="h3" variant="subsection" className="mb-2">Terms & Conditions</Heading>
                        <p className="text-gray-700 text-sm whitespace-pre-line">{plan.termsAndConditions}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Pricing Card */}
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Pricing</CardTitle>
                </CardHeader>
                <CardContent>
                  {plan.pricing ? (
                    <>
                      <div className="mb-4">
                        <div className="text-3xl font-bold text-primary-600 mb-1">
                          {formatPrice(plan.pricing.pricePerPerson, plan.pricing.currency)}
                        </div>
                        <CardDescription>per person</CardDescription>
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
                </CardContent>
              </Card>

              {/* Tour Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Tour Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
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

                  {plan.availability?.recurring?.timeSlot?.startTime && (
                    <div className="flex items-start">
                      <Clock className="w-5 h-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Start Time</p>
                        <p className="text-sm text-gray-600">{plan.availability.recurring.timeSlot.startTime}</p>
                      </div>
                    </div>
                  )}

                  {plan.availability?.recurring?.timeSlot?.endTime && (
                    <div className="flex items-start">
                      <Clock className="w-5 h-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">End Time</p>
                        <p className="text-sm text-gray-600">{plan.availability.recurring.timeSlot.endTime}</p>
                      </div>
                    </div>
                  )}

                  {plan.tourTypes && plan.tourTypes.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-2">Tour Types</p>
                      <div className="flex flex-wrap gap-2">
                        {plan.tourTypes.map((type) => (
                          <Badge key={type} variant="secondary">
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Meeting Point */}
              {plan.meetingPoint && (
                <Card>
                  <CardHeader>
                    <CardTitle>Meeting Point</CardTitle>
                  </CardHeader>
                  <CardContent>
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
                  </CardContent>
                </Card>
              )}

              {/* Requirements */}
              {plan.requirements && plan.requirements.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Requirements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {plan.requirements.map((requirement, index) => (
                        <li key={index} className="flex items-start">
                          <AlertCircle className="w-4 h-4 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{requirement}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Languages */}
              {plan.languages && plan.languages.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Languages</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {plan.languages.map((lang) => (
                        <Badge key={lang} variant="outline">
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </Container>
      </Section>
    </AppLayout>
  );
}
