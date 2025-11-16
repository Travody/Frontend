'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { MapPin, Clock, Users, Star, Calendar, Phone, Mail, CheckCircle, AlertCircle, ArrowLeft, Info, Minus, Plus, X } from 'lucide-react';
import DatePicker from '@/components/ui/DatePicker';
import { apiService, Plan, CreateBookingData, Booking } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
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

export default function PlanDetailsPage() {
  const params = useParams();
  const planId = params?.id as string;
  const { user, isAuthenticated, token } = useAuth();
  const router = useRouter();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [existingBooking, setExistingBooking] = useState<Booking | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    if (planId) {
      fetchPlanDetails();
      checkExistingBooking();
      setBookingData(prev => ({ ...prev, planId }));
    }
  }, [planId, isAuthenticated, token]);

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
    try {
      const response = await apiService.getPlanById(planId);
      if (response.success && response.data) {
        setPlan(response.data);
      } else {
        toast.error('Plan not found');
        router.push('/explore');
      }
    } catch (error) {
      console.error('Error fetching plan:', error);
      toast.error('Failed to load plan details');
      router.push('/explore');
    } finally {
      setIsLoading(false);
    }
  };

  const checkExistingBooking = async () => {
    if (!planId || !isAuthenticated || !token) return;
    try {
      const response = await apiService.getExistingBookingForPlan(planId, token);
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

  const handleConfirmBooking = async () => {
    if (!token) {
      toast.error('Authentication required');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await apiService.createBooking(bookingData, token);
      
      if (response.success && response.data) {
        toast.success('Booking request sent successfully!');
        setExistingBooking(response.data);
        setShowConfirmDialog(false);
      } else {
        const errorMessage = response.message || response.error || 'Failed to create booking';
        toast.error(errorMessage, { duration: 5000 });
      }
    } catch (error: any) {
      console.error('Booking error:', error);
      const errorMessage = error?.message || error?.error || 'Failed to create booking';
      toast.error(errorMessage, { duration: 5000 });
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

  return (
    <AppLayout>
      <Section variant="muted" className="py-8">
        <Container>
          {/* Back Button */}
          <div className="mb-6">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
          
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
                        <div className="flex items-center">
                          <Star className="w-4 h-4 mr-1 text-yellow-500 fill-current" />
                          <span>{plan.rating?.toFixed(1) || 'New'} ({plan.totalReviews || 0} reviews)</span>
                        </div>
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
                      <span className="text-sm text-gray-600">{plan.pricing.currency === 'USD' ? 'USD' : 'INR'}</span>
                    )}
                    <Info className="w-3 h-3 text-blue-500" />
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

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Booking Request</DialogTitle>
            <DialogDescription>
              Please review your booking details before confirming
            </DialogDescription>
          </DialogHeader>
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleConfirmBooking} disabled={isSubmitting}>
              {isSubmitting ? 'Sending...' : 'Confirm & Send Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
