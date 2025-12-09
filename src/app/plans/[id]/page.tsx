'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { MapPin, Clock, Users, Star, Calendar, Phone, Mail, CheckCircle, AlertCircle, ArrowLeft, Info, Minus, Plus, X } from 'lucide-react';
import DatePicker from '@/components/ui/DatePicker';
import { plansService, bookingsService, reviewsService, usersService } from '@/lib/api';
import type { Plan, CreateBookingData, Booking, Review } from '@/types';
import Link from 'next/link';
import { useAuth, isGuiderUser, isTravelerUser } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import toast from '@/lib/toast';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heading } from '@/components/ui/heading';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { BaseDialog } from '@/components/ui/base-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { LoadingState } from '@/components/ui/loading-state';
import { Separator } from '@/components/ui/separator';
import { Breadcrumb } from '@/components/ui/breadcrumb';

export default function PlanDetailsPage() {
  const params = useParams();
  const planId = params?.id as string;
  const { user, isAuthenticated, token, refreshUser } = useAuth();
  const router = useRouter();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [existingBooking, setExistingBooking] = useState<Booking | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showPhoneDialog, setShowPhoneDialog] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isUpdatingPhone, setIsUpdatingPhone] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [bookingData, setBookingData] = useState<CreateBookingData>({
    planId: planId || '',
    travelerName: (user && user.userType === 'traveler' ? user.firstName : '') || '',
    travelerEmail: user?.email || '',
    travelerPhone: user?.mobile || '',
    bookingDate: '',
    startTime: '',
    numberOfParticipants: 1,
    specialRequests: '',
    emergencyContact: '',
    dietaryRestrictions: '',
    accessibilityNeeds: '',
    preferredLanguages: [],
    experienceLevel: 'beginner',
    travelStyle: 'comfort',
    isGroupBooking: false,
    groupName: '',
    bookingSource: 'web'
  });

  useEffect(() => {
    // Redirect guiders to their own plan detail page
    if (user && isGuiderUser(user)) {
      router.push(`/guider/my-plans/${planId}`);
      return;
    }
    
    if (planId) {
      fetchPlanDetails();
      checkExistingBooking();
      setBookingData(prev => ({ ...prev, planId }));
    }
  }, [planId, isAuthenticated, token, user, router]);

  useEffect(() => {
    if (user) {
      setBookingData(prev => ({
        ...prev,
        travelerName: (user.userType === 'traveler' ? user.firstName : '') || '',
        travelerEmail: user.email || '',
        travelerPhone: user.mobile || ''
      }));
    }
  }, [user]);

  const fetchPlanDetails = async () => {
    if (!planId) return;

    setIsLoading(true);
    try {
      const response = await plansService.getPlanById(planId);
      if (response.success && response.data) {
        setPlan(response.data);
        // If reviews are included in the response, use them
        if (response.data.reviews && Array.isArray(response.data.reviews) && response.data.reviews.length > 0) {
          setReviews(response.data.reviews);
        } else if (response.data.reviews && Array.isArray(response.data.reviews)) {
          // Empty array - no reviews yet
          setReviews([]);
        } else {
          // Reviews not included, fetch separately
          fetchReviews();
        }
      } else {
        router.push('/explore');
      }
    } catch (error) {
      console.error('Error fetching plan:', error);
      router.push('/explore');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchReviews = async () => {
    if (!planId) return;

    setIsLoadingReviews(true);
    try {
      const response = await reviewsService.getReviewsByPlan(planId, 'booking');
      if (response.success && response.data) {
        setReviews(response.data);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setIsLoadingReviews(false);
    }
  };

  const checkExistingBooking = async () => {
    if (!planId || !isAuthenticated || !token) return;
    try {
      const response = await bookingsService.getExistingBookingForPlan(planId);
      if (response.success && response.data) {
        setExistingBooking(response.data);
      }
    } catch (error) {
      console.error('Error checking existing booking:', error);
    }
  };

  const getAvailableTimeSlots = (date: string): string[] => {
    if (!plan?.availability) return [];
    
    if (plan.availability.type === 'specific') {
      const spec = plan.availability.specific?.find((s: { date: string }) => s.date === date);
      if (spec?.timeSlot?.startTime) {
        return [spec.timeSlot.startTime];
      }
    }
    
    if (plan.availability.type === 'recurring' && plan.availability.recurring?.timeSlot?.startTime) {
      return [plan.availability.recurring.timeSlot.startTime];
    }
    
    return ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];
  };

  const handleRequestBooking = () => {
    if (!isAuthenticated) {
      toast.error('Please login to make a booking');
      router.push('/auth/traveler/login');
      return;
    }

    // Check if user has phone number
    if (!user?.mobile || user.mobile.trim() === '') {
      setShowPhoneDialog(true);
      return;
    }

    if (!bookingData.bookingDate) {
      toast.error('Please select a date');
      return;
    }

    const availableSlots = getAvailableTimeSlots(bookingData.bookingDate);
    if (availableSlots.length > 0 && !bookingData.startTime) {
      setBookingData(prev => ({ ...prev, startTime: availableSlots[0] }));
    }

    if (!bookingData.startTime) {
      toast.error('Please select a start time');
      return;
    }

    setShowConfirmDialog(true);
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numeric input and limit to 10 digits
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhoneNumber(value);
  };

  const handleAddPhoneNumber = async () => {
    if (!phoneNumber || phoneNumber.length !== 10) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    setIsUpdatingPhone(true);
    try {
      // Format phone number with +91 prefix
      const formattedPhone = `+91 ${phoneNumber}`;
      const response = await usersService.updateTravelerProfile({ mobile: formattedPhone });
      if (response.success) {
        // Fetch updated user data
        const userResponse = await usersService.getCurrentUser('traveler');
        if (userResponse.success && userResponse.data) {
          // Refresh user data in context
          refreshUser(userResponse.data);
          // Update booking data with new phone
          setBookingData(prev => ({ ...prev, travelerPhone: formattedPhone }));
        }
        setShowPhoneDialog(false);
        setPhoneNumber('');
        toast.success('Phone number added successfully');
        // Proceed with booking
        if (bookingData.bookingDate && bookingData.startTime) {
          setShowConfirmDialog(true);
        }
      }
    } catch (error: any) {
      console.error('Error updating phone:', error);
      toast.error(error?.response?.data?.message || 'Failed to update phone number');
    } finally {
      setIsUpdatingPhone(false);
    }
  };

  const handleConfirmBooking = async () => {
    if (!token) {
      toast.error('Authentication required');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await bookingsService.createBooking(bookingData);
      
      if (response.success && response.data) {
        setExistingBooking(response.data);
        setShowConfirmDialog(false);
      }
    } catch (error: any) {
      console.error('Booking error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof CreateBookingData, value: any) => {
    setBookingData(prev => ({ ...prev, [field]: value }));
    
    if (field === 'bookingDate') {
      const availableSlots = getAvailableTimeSlots(value);
      setBookingData(prev => ({ 
        ...prev, 
        bookingDate: value,
        startTime: availableSlots.length > 0 ? availableSlots[0] : ''
      }));
    }
  };

  const formatPrice = (price: number, currency: string) => {
    const symbol = currency === 'INR' ? '₹' : currency === 'USD' ? '$' : currency;
    return `${symbol}${price?.toLocaleString() || 0}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };


  if (isLoading) {
    return (
      <AppLayout>
        <LoadingState message="Loading plan details..." />
      </AppLayout>
    );
  }

  if (!plan) {
    return (
      <AppLayout>
        <Section variant="muted" className="py-12">
          <Container>
            <div className="text-center">
              <Heading as="h2" variant="section" className="mb-2">Plan not found</Heading>
              <p className="text-gray-600 mb-4">The plan you're looking for doesn't exist.</p>
              <Link href="/explore">
                <Button variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Explore
                </Button>
              </Link>
            </div>
          </Container>
        </Section>
      </AppLayout>
    );
  }

  const isBookingRequested = existingBooking && (existingBooking.status.status === 'pending' || existingBooking.status.status === 'confirmed');
  const totalPrice = plan.pricing ? plan.pricing.pricePerPerson * bookingData.numberOfParticipants : 0;

  // Determine home href based on user type
  let homeHref = '/';
  if (user) {
    if (isGuiderUser(user)) {
      homeHref = '/guider/dashboard';
    }
    // For travelers and unauthenticated users, home is '/'
  }

  return (
    <AppLayout>
      <Breadcrumb
        items={[
          { label: 'Explore', href: '/explore' },
          { label: plan.title || 'Plan Details' },
        ]}
        homeHref={homeHref}
      />
      <Section variant="muted" className="!pt-6 !pb-8 md:!pt-6 md:!pb-8">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Plan Header */}
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Heading as="h1" variant="page" className="mb-2">{plan.title}</Heading>
                      <div className="flex items-center text-gray-600 mb-3">
                        <MapPin className="w-5 h-5 mr-2" />
                        <span>{plan.city}, {plan.state}</span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          <span>{plan.duration?.value || 0} {plan.duration?.unit || 'hours'}</span>
                        </div>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          <span>Up to {plan.pricing?.maxParticipants || 0} people</span>
                        </div>
                        {plan.totalReviews && plan.totalReviews > 0 && plan.rating && plan.rating > 0 && (
                          <div className="flex items-center">
                            <Star className="w-4 h-4 mr-1 text-yellow-500 fill-current" />
                            <span>{plan.rating.toFixed(1)} ({plan.totalReviews} {plan.totalReviews === 1 ? 'review' : 'reviews'})</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-primary-600">
                        {plan.pricing ? formatPrice(plan.pricing.pricePerPerson, plan.pricing.currency) : 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">per person</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {plan.tourTypes && plan.tourTypes.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {plan.tourTypes.map((type) => (
                        <Badge key={type} variant="secondary">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Guider Information */}
              {plan.guiderId && (() => {
                const guider = typeof plan.guiderId === 'object' ? plan.guiderId : null;
                if (!guider) return null;
                
                return (
                  <Card>
                    <CardHeader>
                      <CardTitle>About Your Guide</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-start gap-4">
                          {guider.personalInfo?.profileImageUrl ? (
                            <img
                              src={guider.personalInfo.profileImageUrl}
                              alt={guider.personalInfo.showcaseName || 'Guide'}
                              className="w-16 h-16 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
                              <Users className="w-8 h-8 text-primary-600" />
                            </div>
                          )}
                          <div className="flex-1">
                            <Heading as="h3" variant="subsection" className="mb-1">
                              {guider.personalInfo?.showcaseName || 'Professional Guide'}
                            </Heading>
                            {((guider.tourGuideInfo?.rating !== undefined && guider.tourGuideInfo.rating > 0) || 
                              (guider.tourGuideInfo?.totalReviews !== undefined && guider.tourGuideInfo.totalReviews > 0)) && (
                              <div className="flex items-center gap-2 mb-2">
                                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                <span className="font-semibold text-gray-900">
                                  {guider.tourGuideInfo?.rating ? guider.tourGuideInfo.rating.toFixed(1) : '0.0'}
                                </span>
                                <span className="text-sm text-gray-600">
                                  ({guider.tourGuideInfo?.totalReviews || 0} {guider.tourGuideInfo?.totalReviews === 1 ? 'review' : 'reviews'})
                                </span>
                              </div>
                            )}
                            {guider.tourGuideInfo?.aboutMe && (
                              <p className="text-sm text-gray-700 line-clamp-3">
                                {guider.tourGuideInfo.aboutMe}
                              </p>
                            )}
                          </div>
                        </div>
                        {guider.tourGuideInfo?.languagesSpoken && guider.tourGuideInfo.languagesSpoken.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-gray-600 mb-2">Languages Spoken:</p>
                            <div className="flex flex-wrap gap-2">
                              {guider.tourGuideInfo.languagesSpoken.map((lang, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {lang}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })()}

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
                          className="w-full h-32 object-cover rounded-lg"
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
                  <p className="text-gray-700 leading-relaxed">{plan.description}</p>
                </CardContent>
              </Card>

              {/* Itinerary */}
              {plan.itinerary && Object.keys(plan.itinerary).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Itinerary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(plan.itinerary).map(([day, activities], index) => {
                        const dayLabel = day === '0' ? 'Hourly Schedule' : `Day ${day}`;
                        return (
                          <div key={index} className="border-l-4 border-primary-500 pl-4">
                            <Heading as="h3" variant="subsection" className="mb-2">{dayLabel}</Heading>
                            <ul className="space-y-1">
                              {Array.isArray(activities) && activities.map((activity, actIndex) => (
                                <li key={actIndex} className="text-gray-700 flex items-start">
                                  <span className="w-2 h-2 bg-primary-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                                  <span>{activity}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

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
                            <AlertCircle className="w-5 h-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{exclusion}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Meeting Point */}
              {plan.meetingPoint && (
                <Card>
                  <CardHeader>
                    <CardTitle>Meeting Point</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-start">
                      <MapPin className="w-5 h-5 text-gray-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{plan.meetingPoint}</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Reviews Section */}
              {(isLoadingReviews || (reviews && Array.isArray(reviews) && reviews.length > 0)) && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Reviews</CardTitle>
                      {plan.totalReviews && plan.totalReviews > 0 && plan.rating && plan.rating > 0 && (
                        <div className="flex items-center gap-2">
                          <Star className="w-5 h-5 text-yellow-500 fill-current" />
                          <span className="text-lg font-semibold">
                            {plan.rating.toFixed(1)}
                          </span>
                          <span className="text-sm text-gray-600">
                            ({plan.totalReviews} {plan.totalReviews === 1 ? 'review' : 'reviews'})
                          </span>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isLoadingReviews ? (
                      <div className="text-center py-8 text-gray-500">Loading reviews...</div>
                    ) : (reviews && Array.isArray(reviews) && reviews.length > 0) ? (
                      <div className="space-y-4">
                        {reviews.map((review) => {
                          const traveler = typeof review.travelerId === 'object' 
                            ? review.travelerId 
                            : null;
                          const travelerName = traveler 
                            ? `${traveler.firstName || ''} ${traveler.lastName || ''}`.trim() || 'Anonymous'
                            : 'Anonymous';
                          const travelerEmail = traveler?.email || '';
                          const travelerImage = traveler?.profileImageUrl;
                          
                          const booking = typeof review.bookingId === 'object' ? review.bookingId : null;
                          const bookingDate = booking?.bookingDetails?.date 
                            ? new Date(booking.bookingDetails.date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })
                            : null;

                          return (
                            <div key={review._id} className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                              <div className="flex items-start gap-3 mb-2">
                                {travelerImage ? (
                                  <img
                                    src={travelerImage}
                                    alt={travelerName}
                                    className="w-10 h-10 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                                    <span className="text-primary-600 font-semibold text-sm">
                                      {travelerName.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                )}
                                <div className="flex-1">
                                  <div className="flex items-start justify-between mb-1">
                                    <div>
                                      <p className="font-medium text-gray-900">{travelerName}</p>
                                      {travelerEmail && (
                                        <p className="text-xs text-gray-500">{travelerEmail}</p>
                                      )}
                                      {bookingDate && (
                                        <p className="text-xs text-gray-400 mt-1">
                                          Tour Date: {bookingDate}
                                        </p>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      {[...Array(5)].map((_, i) => (
                                        <Star
                                          key={i}
                                          className={`w-4 h-4 ${
                                            i < review.rating
                                              ? 'text-yellow-400 fill-current'
                                              : 'text-gray-300'
                                          }`}
                                        />
                                      ))}
                                      <span className="ml-1 text-sm font-medium text-gray-700">
                                        {review.rating}
                                      </span>
                                    </div>
                                  </div>
                                  <p className="text-xs text-gray-500 mb-2">
                                    {new Date(review.createdAt).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric',
                                    })}
                                  </p>
                                  {review.comment && (
                                    <p className="text-gray-700 text-sm mt-2 leading-relaxed">{review.comment}</p>
                                  )}
                                  <div className="flex items-center gap-2 mt-2">
                                    {review.isVerified && (
                                      <Badge variant="secondary" className="text-xs">
                                        <CheckCircle className="w-3 h-3 mr-1" />
                                        Verified Booking
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : null}
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
                        <p className="text-gray-700 text-sm">{plan.cancellationPolicy}</p>
                      </div>
                    )}

                    {plan.specialInstructions && (
                      <div>
                        <Heading as="h3" variant="subsection" className="mb-2">Special Instructions</Heading>
                        <p className="text-gray-700 text-sm">{plan.specialInstructions}</p>
                      </div>
                    )}

                    {plan.termsAndConditions && (
                      <div>
                        <Heading as="h3" variant="subsection" className="mb-2">Terms & Conditions</Heading>
                        <p className="text-gray-700 text-sm">{plan.termsAndConditions}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Booking Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl font-bold text-gray-900">
                      {plan.pricing ? formatPrice(plan.pricing.pricePerPerson, plan.pricing.currency) : 'N/A'}
                    </span>
                    {plan.pricing && (
                      <span className="text-sm text-gray-600">{plan.pricing.currency || 'INR'}</span>
                    )}
                    <div className="relative group">
                      <Info className="w-3 h-3 text-blue-500 cursor-help" />
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                        Includes all services provided by the guider.
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                      </div>
                    </div>
                  </div>
                  <CardDescription className="text-xs">Includes all fees</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Separator />
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-gray-600" />
                        <span className="text-xs font-medium text-gray-700">Size:</span>
                      </div>
                      <span className="text-xs text-gray-900 font-medium">Up to {plan.pricing?.maxParticipants || 0} people</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-gray-600" />
                        <span className="text-xs font-medium text-gray-700">Duration:</span>
                      </div>
                      <span className="text-xs text-gray-900 font-medium">{plan.duration?.value || 0} {plan.duration?.unit || 'hours'}</span>
                    </div>
                  </div>

                  {!isBookingRequested ? (
                    <>
                      <Separator />
                      
                      {/* Party Size */}
                      <div className="space-y-2">
                        <Label className="text-xs">Party size:</Label>
                        <div className="flex items-center border rounded-lg">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleInputChange('numberOfParticipants', Math.max(1, bookingData.numberOfParticipants - 1))}
                            disabled={bookingData.numberOfParticipants <= 1}
                            className="h-8 w-8 p-0"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </Button>
                          <span className="flex-1 text-center font-medium text-sm text-gray-900">
                            {bookingData.numberOfParticipants}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleInputChange('numberOfParticipants', Math.min(plan.pricing?.maxParticipants || 10, bookingData.numberOfParticipants + 1))}
                            disabled={bookingData.numberOfParticipants >= (plan.pricing?.maxParticipants || 10)}
                            className="h-8 w-8 p-0"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>

                      {/* Select Tour Date */}
                      <div className="space-y-2">
                        <Label className="text-xs">Select tour date:</Label>
                        <DatePicker
                          value={bookingData.bookingDate}
                          onChange={(date) => handleInputChange('bookingDate', date)}
                          placeholder="Select tour date"
                          minDate={new Date().toISOString().split('T')[0]}
                        />
                      </div>

                      {/* Select Tour Start Time */}
                      {bookingData.bookingDate && (
                        <div className="space-y-2">
                          <Label className="text-xs">Select tour start time:</Label>
                          <Select
                            value={bookingData.startTime || ''}
                            onValueChange={(value) => handleInputChange('startTime', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select tour start time" />
                            </SelectTrigger>
                            <SelectContent>
                              {getAvailableTimeSlots(bookingData.bookingDate).map((time) => (
                                <SelectItem key={time} value={time}>
                                  {time}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {/* Request Booking Button */}
                      <Button
                        onClick={handleRequestBooking}
                        disabled={!bookingData.bookingDate || !bookingData.startTime || isSubmitting}
                        className="w-full"
                      >
                        {isSubmitting ? 'Sending...' : 'Request Booking'}
                      </Button>
                    </>
                  ) : (
                    <div className="text-center py-3">
                      <div className="mb-3">
                        <CheckCircle className="w-10 h-10 text-primary-600 mx-auto mb-1.5" />
                        <p className="text-base font-semibold text-gray-900">Booking Requested</p>
                        <p className="text-xs text-gray-600 mt-1">
                          {existingBooking?.status.status === 'confirmed' 
                            ? 'Your booking has been confirmed by the guide!'
                            : 'Your booking request has been sent. Waiting for guide confirmation.'}
                        </p>
                      </div>
                      {existingBooking && (
                        <Link href="/traveler/bookings">
                          <Button variant="outline" size="sm" className="text-xs">
                            View booking details
                          </Button>
                        </Link>
                      )}
                    </div>
                  )}

                  {plan.cancellationPolicy && (
                    <>
                      <Separator />
                      <Link href="#cancellation-policy" className="text-xs text-gray-900 underline hover:text-gray-700">
                        View our cancellation policy
                      </Link>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </Container>
      </Section>

      {/* Phone Number Dialog */}
      <BaseDialog
        isOpen={showPhoneDialog}
        onClose={() => {
          setShowPhoneDialog(false);
          setPhoneNumber('');
        }}
        title="Add Phone Number"
        description="A phone number is required to complete your booking. Please add your phone number to continue."
        icon={<Phone className="w-5 h-5 text-primary-600" />}
        confirmText={isUpdatingPhone ? 'Saving...' : 'Save & Continue'}
        cancelText="Cancel"
        onConfirm={handleAddPhoneNumber}
        confirmDisabled={isUpdatingPhone || !phoneNumber || phoneNumber.length !== 10}
        cancelDisabled={isUpdatingPhone}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 font-medium">
                +91
              </div>
              <Input
                id="phone"
                type="tel"
                placeholder="9876543210"
                value={phoneNumber}
                onChange={handlePhoneNumberChange}
                disabled={isUpdatingPhone}
                className="pl-12"
                maxLength={10}
              />
            </div>
            {phoneNumber && phoneNumber.length !== 10 ? (
              <p className="text-xs text-red-500">
                Please enter exactly 10 digits
              </p>
            ) : (
              <p className="text-xs text-gray-500">
                This will be saved to your profile and used for booking communications.
              </p>
            )}
          </div>
        </div>
      </BaseDialog>

      {/* Confirmation Dialog */}
      <BaseDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        title="Confirm Booking Request"
        description="Please review your booking details before confirming"
        confirmText={isSubmitting ? 'Sending...' : 'Confirm & Send Request'}
        cancelText="Cancel"
        onConfirm={handleConfirmBooking}
        confirmDisabled={isSubmitting}
        cancelDisabled={isSubmitting}
      >
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">Tour</p>
            <p className="font-medium text-gray-900">{plan.title}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Date</p>
              <p className="font-medium text-gray-900">
                {bookingData.bookingDate ? formatDate(bookingData.bookingDate) : 'Not selected'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Time</p>
              <p className="font-medium text-gray-900">{bookingData.startTime || 'Not selected'}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Participants</p>
              <p className="font-medium text-gray-900">{bookingData.numberOfParticipants} {bookingData.numberOfParticipants === 1 ? 'person' : 'people'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Price</p>
              <p className="font-medium text-gray-900">
                {plan.pricing ? formatPrice(totalPrice, plan.pricing.currency) : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </BaseDialog>
    </AppLayout>
  );
}
