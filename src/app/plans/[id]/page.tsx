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
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

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
      // Silently fail - this is just a check
      console.error('Error checking existing booking:', error);
    }
  };

  const getAvailableTimeSlots = (date: string): string[] => {
    if (!plan?.availability) return [];
    
    if (plan.availability.type === 'specific') {
      const spec = plan.availability.specific?.find((s: { date: string }) => s.date === date);
      if (spec?.timeSlot?.startTime) {
        // If specific time, return that time only
        return [spec.timeSlot.startTime];
      }
    }
    
    if (plan.availability.type === 'recurring' && plan.availability.recurring?.timeSlot?.startTime) {
      return [plan.availability.recurring.timeSlot.startTime];
    }
    
    // Default time slots
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

    // Get available time slots for selected date
    const availableSlots = getAvailableTimeSlots(bookingData.bookingDate);
    if (availableSlots.length > 0 && !bookingData.startTime) {
      // Auto-select first available time
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
        // Explicitly handle error response
        const errorMessage = response.message || response.error || 'Failed to create booking';
        toast.error(errorMessage, {
          duration: 5000,
        });
      }
    } catch (error: any) {
      console.error('Booking error:', error);
      const errorMessage = error?.message || error?.error || 'Failed to create booking';
      toast.error(errorMessage, {
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof CreateBookingData, value: any) => {
    setBookingData(prev => ({ ...prev, [field]: value }));
    
    // If date changes, reset start time
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
    return `${symbol}${price}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getAvailableDates = () => {
    if (!plan?.availability) return [];
    
    if (plan.availability.type === 'specific' && plan.availability.specific) {
      return plan.availability.specific
        .map((spec: { date: string; timeSlot?: { startTime?: string; endTime?: string } }) => ({
          date: spec.date,
          availableSlots: 1
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }
    
    return [];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header 
          user={isAuthenticated && user ? {
            name: (user.userType === 'guider' ? user.showcaseName : user.userType === 'traveler' ? user.firstName : undefined) || user.email || 'User',
            type: user.userType || 'traveler',
            isVerified: user.userType === 'guider' ? user.accountVerified : user.userType === 'traveler' ? user.isVerified : false
          } : undefined}
        />
        <main className="pt-16 min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-500"></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-white">
        <Header 
          user={isAuthenticated && user ? {
            name: (user.userType === 'guider' ? user.showcaseName : user.userType === 'traveler' ? user.firstName : undefined) || user.email || 'User',
            type: user.userType || 'traveler',
            isVerified: user.userType === 'guider' ? user.accountVerified : user.userType === 'traveler' ? user.isVerified : false
          } : undefined}
        />
        <main className="pt-16 min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Plan not found</h2>
            <p className="text-gray-600 mb-4">The plan you're looking for doesn't exist.</p>
            <Link href="/explore" className="text-teal-600 hover:text-teal-700">
              Back to Explore
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const isBookingRequested = existingBooking && (existingBooking.status.status === 'pending' || existingBooking.status.status === 'confirmed');
  const totalPrice = plan.pricing ? plan.pricing.pricePerPerson * bookingData.numberOfParticipants : 0;

  return (
    <div className="min-h-screen bg-white">
      <Header 
        user={isAuthenticated && user ? {
          name: (user.userType === 'guider' ? user.showcaseName : user.userType === 'traveler' ? user.firstName : undefined) || user.email || 'User',
          type: user.userType || 'traveler',
          isVerified: user.userType === 'guider' ? user.accountVerified : user.userType === 'traveler' ? user.isVerified : false
        } : undefined}
      />
      <main className="pt-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button - Subnavigation */}
          <div className="mb-6">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Plan Header */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{plan.title}</h1>
                    <div className="flex items-center text-gray-600 mb-2">
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
                        <Star className="w-4 h-4 mr-1 text-yellow-500" />
                        <span>{plan.rating?.toFixed(1) || 'New'} ({plan.totalReviews || 0} reviews)</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-teal-600">
                      {plan.pricing ? formatPrice(plan.pricing.pricePerPerson, plan.pricing.currency) : 'N/A'}
                    </div>
                    <div className="text-sm text-gray-500">per person</div>
                  </div>
                </div>

                {/* Tour Types */}
                {plan.tourTypes && plan.tourTypes.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {plan.tourTypes.map((type) => (
                      <span key={type} className="px-3 py-1 bg-teal-100 text-teal-800 text-sm rounded-full">
                        {type}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Gallery */}
              {plan.gallery && plan.gallery.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Photos</h2>
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
                </div>
              )}

              {/* Description */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">About this tour</h2>
                <p className="text-gray-700 leading-relaxed">{plan.description}</p>
              </div>

              {/* Itinerary */}
              {plan.itinerary && Object.keys(plan.itinerary).length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Itinerary</h2>
                  <div className="space-y-4">
                    {Object.entries(plan.itinerary).map(([day, activities], index) => {
                      const dayLabel = day === '0' ? 'Hourly Schedule' : `Day ${day}`;
                      return (
                        <div key={index} className="border-l-4 border-teal-500 pl-4">
                          <h3 className="font-semibold text-gray-900 mb-2">{dayLabel}</h3>
                          <ul className="space-y-1">
                            {Array.isArray(activities) && activities.map((activity, actIndex) => (
                              <li key={actIndex} className="text-gray-700 flex items-start">
                                <span className="w-2 h-2 bg-teal-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                                <span>{activity}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Highlights */}
              {plan.highlights && plan.highlights.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border p-6">
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
                  <div className="bg-white rounded-lg shadow-sm border p-6">
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
                  <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">What's Not Included</h2>
                    <ul className="space-y-2">
                      {plan.exclusions.map((exclusion, index) => (
                        <li key={index} className="flex items-start">
                          <AlertCircle className="w-5 h-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{exclusion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Meeting Point */}
              {plan.meetingPoint && (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Meeting Point</h2>
                  <div className="flex items-start">
                    <MapPin className="w-5 h-5 text-gray-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{plan.meetingPoint}</span>
                  </div>
                </div>
              )}

              {/* Policies */}
              {(plan.cancellationPolicy || plan.termsAndConditions || plan.specialInstructions) && (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Policies & Information</h2>
                  
                  {plan.cancellationPolicy && (
                    <div className="mb-4">
                      <h3 className="font-semibold text-gray-900 mb-2">Cancellation Policy</h3>
                      <p className="text-gray-700 text-sm">{plan.cancellationPolicy}</p>
                    </div>
                  )}

                  {plan.specialInstructions && (
                    <div className="mb-4">
                      <h3 className="font-semibold text-gray-900 mb-2">Special Instructions</h3>
                      <p className="text-gray-700 text-sm">{plan.specialInstructions}</p>
                    </div>
                  )}

                  {plan.termsAndConditions && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Terms & Conditions</h3>
                      <p className="text-gray-700 text-sm">{plan.termsAndConditions}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Booking Sidebar - Fixed */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border p-4 sticky top-24">
                {/* Price */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl font-bold text-gray-900">
                      {plan.pricing ? formatPrice(plan.pricing.pricePerPerson, plan.pricing.currency) : 'N/A'}
                    </span>
                    {plan.pricing && (
                      <span className="text-sm text-gray-600">{plan.pricing.currency === 'USD' ? 'USD' : 'INR'}</span>
                    )}
                    <Info className="w-3 h-3 text-blue-500" />
                  </div>
                  <p className="text-xs text-gray-600 mb-1">Includes all fees</p>
                  <Link href="#" className="text-xs text-blue-600 hover:text-blue-700 underline">
                    Book with a 20% deposit
                  </Link>
                </div>

                <div className="border-t border-gray-200 pt-3 pb-3 mb-4 space-y-2">
                  {/* Size */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-gray-600" />
                      <span className="text-xs font-medium text-gray-700">Size:</span>
                    </div>
                    <span className="text-xs text-gray-900 font-medium">Up to {plan.pricing?.maxParticipants || 0} people</span>
                  </div>

                  {/* Duration */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-gray-600" />
                      <span className="text-xs font-medium text-gray-700">Duration:</span>
                    </div>
                    <span className="text-xs text-gray-900 font-medium">{plan.duration?.value || 0} {plan.duration?.unit || 'hours'}</span>
                  </div>

                  {/* Transportation */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-gray-600" />
                      <span className="text-xs font-medium text-gray-700">Transportation:</span>
                    </div>
                    <span className="text-xs text-gray-900 font-medium">Walking</span>
                  </div>
                </div>

                {!isBookingRequested ? (
                  <>
                    {/* Party Size */}
                    <div className="mb-3">
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">
                        Party size:
                      </label>
                      <div className="flex items-center border border-gray-300 rounded-lg">
                        <button
                          type="button"
                          onClick={() => handleInputChange('numberOfParticipants', Math.max(1, bookingData.numberOfParticipants - 1))}
                          className="p-1.5 hover:bg-gray-100 transition-colors"
                          disabled={bookingData.numberOfParticipants <= 1}
                        >
                          <Minus className="w-3.5 h-3.5 text-gray-600" />
                        </button>
                        <span className="flex-1 text-center font-medium text-sm text-gray-900">
                          {bookingData.numberOfParticipants}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleInputChange('numberOfParticipants', Math.min(plan.pricing?.maxParticipants || 10, bookingData.numberOfParticipants + 1))}
                          className="p-1.5 hover:bg-gray-100 transition-colors"
                          disabled={bookingData.numberOfParticipants >= (plan.pricing?.maxParticipants || 10)}
                        >
                          <Plus className="w-3.5 h-3.5 text-gray-600" />
                        </button>
                      </div>
                    </div>

                    {/* Select Tour Date */}
                    <div className="mb-3">
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">
                        Select tour date:
                      </label>
                      <DatePicker
                        value={bookingData.bookingDate}
                        onChange={(date) => handleInputChange('bookingDate', date)}
                        placeholder="Select tour date"
                        minDate={new Date().toISOString().split('T')[0]}
                      />
                    </div>

                    {/* Select Tour Start Time */}
                    {bookingData.bookingDate && (
                      <div className="mb-4">
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">
                          Select tour start time:
                        </label>
                        <div className="relative">
                          <select
                            value={bookingData.startTime || ''}
                            onChange={(e) => handleInputChange('startTime', e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900 appearance-none bg-white"
                            required
                          >
                            <option value="">Select tour start time</option>
                            {getAvailableTimeSlots(bookingData.bookingDate).map((time) => (
                              <option key={time} value={time}>
                                {time}
                              </option>
                            ))}
                          </select>
                          <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                      </div>
                    )}

                    {/* Request Booking Button */}
                    <button
                      onClick={handleRequestBooking}
                      disabled={!bookingData.bookingDate || !bookingData.startTime || isSubmitting}
                      className="w-full bg-teal-600 text-white py-2.5 px-4 rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Sending...' : 'Request Booking'}
                    </button>
                  </>
                ) : (
                  <div className="text-center py-3">
                    <div className="mb-3">
                      <CheckCircle className="w-10 h-10 text-teal-600 mx-auto mb-1.5" />
                      <p className="text-base font-semibold text-gray-900">Booking Requested</p>
                      <p className="text-xs text-gray-600 mt-1">
                        {existingBooking?.status.status === 'confirmed' 
                          ? 'Your booking has been confirmed by the guide!'
                          : 'Your booking request has been sent. Waiting for guide confirmation.'}
                      </p>
                    </div>
                    {existingBooking && (
                      <Link
                        href="/traveler/profile?tab=upcoming"
                        className="text-xs text-teal-600 hover:text-teal-700 underline"
                      >
                        View booking details
                      </Link>
                    )}
                  </div>
                )}

                {/* Cancellation Policy Link */}
                {plan.cancellationPolicy && (
                  <div className="mt-4 pt-3 border-t border-gray-200">
                    <Link href="#cancellation-policy" className="text-xs text-gray-900 underline hover:text-gray-700">
                      View our cancellation policy
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Confirm Booking Request</h3>
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
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

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmBooking}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Sending...' : 'Confirm & Send Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
