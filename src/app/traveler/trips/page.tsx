'use client';

import { useState, useEffect } from 'react';
import { Calendar, Users, Clock, CheckCircle, XCircle, AlertCircle, Star, MapPin, Phone, Mail } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiService, Booking } from '@/lib/api';
import toast from 'react-hot-toast';
import AppLayout from '@/components/layout/AppLayout';
import { PromptDialog } from '@/components/ui/prompt-dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { LoadingState } from '@/components/ui/loading-state';
import { Heading } from '@/components/ui/heading';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/page-header';

export default function TravelerTripsPage() {
  const { token } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'confirmed' | 'cancelled' | 'completed'>('all');
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [currentBookingId, setCurrentBookingId] = useState<string | null>(null);
  const [reviewText, setReviewText] = useState('');
  const [ratingValue, setRatingValue] = useState('');

  useEffect(() => {
    if (token) {
      fetchBookings();
    }
  }, [token]);

  const fetchBookings = async () => {
    try {
      const response = await apiService.getTravelerBookings(token!);
      if (response.success && response.data) {
        setBookings(response.data.bookings);
      } else {
        toast.error('Failed to load trips');
      }
    } catch (error) {
      console.error('Failed to fetch trips:', error);
      toast.error('Failed to load trips');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelBooking = (bookingId: string) => {
    setCurrentBookingId(bookingId);
    setShowCancelDialog(true);
  };

  const confirmCancelBooking = async (reason: string) => {
    if (!currentBookingId || !reason.trim()) return;
    
    try {
      const response = await apiService.cancelBooking(currentBookingId, reason, token!);
      if (response.success) {
        toast.success('Trip cancelled successfully');
        fetchBookings();
      } else {
        toast.error(response.message || 'Failed to cancel trip');
      }
    } catch (error) {
      console.error('Error cancelling trip:', error);
      toast.error('Failed to cancel trip');
    } finally {
      setShowCancelDialog(false);
      setCurrentBookingId(null);
    }
  };

  const handleAddReview = (bookingId: string) => {
    setCurrentBookingId(bookingId);
    setRatingValue('');
    setReviewText('');
    setShowRatingDialog(true);
  };

  const confirmRating = (rating: string) => {
    const ratingNum = parseInt(rating);
    if (ratingNum < 1 || ratingNum > 5) {
      toast.error('Rating must be between 1 and 5');
      return;
    }
    setRatingValue(rating);
    setShowRatingDialog(false);
    setShowReviewDialog(true);
  };

  const confirmReview = async (review: string) => {
    if (!currentBookingId || !ratingValue || !review.trim()) {
      setShowReviewDialog(false);
      setRatingValue('');
      return;
    }

    const ratingNum = parseInt(ratingValue);
    try {
      const response = await apiService.addReview(currentBookingId, ratingNum, review, token!);
      if (response.success) {
        toast.success('Review added successfully');
        fetchBookings();
      } else {
        toast.error(response.message || 'Failed to add review');
      }
    } catch (error) {
      console.error('Error adding review:', error);
      toast.error('Failed to add review');
    } finally {
      setShowReviewDialog(false);
      setRatingValue('');
      setCurrentBookingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatPrice = (price: number, currency: string) => {
    const symbol = currency === 'INR' ? '₹' : currency === 'USD' ? '$' : currency;
    return `${symbol}${price?.toLocaleString() || 0}`;
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'confirmed':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      case 'completed':
        return 'default';
      default:
        return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'pending':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'completed':
        return <Star className="w-5 h-5 text-blue-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const filteredBookings = bookings.filter(booking => {
    switch (activeTab) {
      case 'pending':
        return booking.status.status === 'pending';
      case 'confirmed':
        return booking.status.status === 'confirmed';
      case 'cancelled':
        return booking.status.status === 'cancelled';
      case 'completed':
        return booking.status.status === 'completed';
      default:
        return true;
    }
  });

  if (isLoading) {
    return (
      <AppLayout>
        <LoadingState message="Loading trips..." />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Section variant="muted" className="py-8">
        <Container>
          <PageHeader
            title="My Trips"
            description="Manage your tour trips and experiences"
          />

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="mb-8">
            <TabsList className="grid w-full max-w-2xl grid-cols-5">
              <TabsTrigger value="all">
                All ({bookings.length})
              </TabsTrigger>
              <TabsTrigger value="pending">
                Pending ({bookings.filter(b => b.status.status === 'pending').length})
              </TabsTrigger>
              <TabsTrigger value="confirmed">
                Confirmed ({bookings.filter(b => b.status.status === 'confirmed').length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed ({bookings.filter(b => b.status.status === 'completed').length})
              </TabsTrigger>
              <TabsTrigger value="cancelled">
                Cancelled ({bookings.filter(b => b.status.status === 'cancelled').length})
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Trips List */}
          <div className="space-y-4">
            {filteredBookings.length > 0 ? (
              filteredBookings.map((booking) => (
                <Card key={booking._id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                      <div className="flex-1 space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            {getStatusIcon(booking.status.status)}
                            <div>
                              <Heading as="h3" variant="subsection" className="mb-1">
                                {typeof booking.planId === 'object' ? booking.planId.title : 'Plan Title'}
                              </Heading>
                              <p className="text-sm text-gray-600 mb-2">
                                {typeof booking.planId === 'object' ? `${booking.planId.city}, ${booking.planId.state}` : 'Location'}
                              </p>
                              <Badge variant={getStatusVariant(booking.status.status)}>
                                {booking.status.status}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="w-4 h-4 mr-2" />
                            <span>{formatDate(booking.bookingDetails.date)}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Users className="w-4 h-4 mr-2" />
                            <span>{booking.bookingDetails.numberOfParticipants} people</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="w-4 h-4 mr-2" />
                            <span>{formatPrice(booking.financial.totalAmount, booking.financial.currency)}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="w-4 h-4 mr-2" />
                            <span className="truncate">{typeof booking.planId === 'object' ? booking.planId.meetingPoint : 'Meeting Point'}</span>
                          </div>
                        </div>

                        {/* Guide Information */}
                        {typeof booking.guiderId === 'object' && (
                          <Card className="bg-gray-50 border-gray-200">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-base">Guide Information</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                <div>
                                  <span className="text-gray-600">Name: </span>
                                  <span className="font-medium text-gray-900">{booking.guiderId.personalInfo?.showcaseName || booking.guiderId.showcaseName}</span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Email: </span>
                                  <span className="font-medium text-gray-900">{booking.guiderId.email}</span>
                                </div>
                                {booking.status.status === 'confirmed' && booking.guiderId.mobile && (
                                  <div>
                                    <span className="text-gray-600">Phone: </span>
                                    <span className="font-medium text-gray-900">{booking.guiderId.mobile}</span>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {/* Tour Details */}
                        {typeof booking.planId === 'object' && (
                          <Card className="bg-primary-50 border-primary-200">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-base text-primary-900">Tour Details</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                <div>
                                  <span className="text-primary-700">Start Time: </span>
                                  <span className="font-medium text-primary-900">
                                    {booking.bookingDetails.startTime || 
                                     booking.planId.availability?.recurring?.timeSlot?.startTime ||
                                     'TBD'}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-primary-700">Duration: </span>
                                  <span className="font-medium text-primary-900">
                                    {typeof booking.planId.duration === 'object' && booking.planId.duration
                                      ? `${booking.planId.duration.value} ${booking.planId.duration.unit}`
                                      : booking.planId.duration || 'N/A'}
                                  </span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {/* Special Requests */}
                        {booking.preferences?.specialRequests && (
                          <Card className="bg-yellow-50 border-yellow-200">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-base text-yellow-900">Special Requests</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0">
                              <p className="text-yellow-800 text-sm">{booking.preferences.specialRequests}</p>
                            </CardContent>
                          </Card>
                        )}

                        {/* Guide Message */}
                        {booking.status.guiderConfirmationMessage && (
                          <Card className="bg-green-50 border-green-200">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-base text-green-900">Message from Guide</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0">
                              <p className="text-green-800 text-sm">{booking.status.guiderConfirmationMessage}</p>
                            </CardContent>
                          </Card>
                        )}

                        {/* Review Section */}
                        {booking.status.status === 'completed' && (
                          <Card className="bg-purple-50 border-purple-200">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-base text-purple-900">
                                {booking.review?.isReviewed ? 'Your Review' : 'How was your trip?'}
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0">
                              {booking.review?.isReviewed ? (
                                <div>
                                  <div className="flex items-center mb-2">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`w-4 h-4 ${
                                          i < (booking.review?.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                        }`}
                                      />
                                    ))}
                                    <span className="ml-2 text-sm font-medium">{booking.review?.rating}/5</span>
                                  </div>
                                  <p className="text-purple-800 text-sm">{booking.review?.review}</p>
                                </div>
                              ) : (
                                <div>
                                  <p className="text-purple-800 text-sm mb-3">Share your experience to help other travelers!</p>
                                  <Button
                                    onClick={() => handleAddReview(booking._id)}
                                    variant="outline"
                                    size="sm"
                                  >
                                    <Star className="w-4 h-4 mr-2" />
                                    Write Review
                                  </Button>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-2 lg:min-w-[180px]">
                        {booking.status.status === 'pending' && (
                          <Button
                            onClick={() => handleCancelBooking(booking._id)}
                            variant="destructive"
                            className="w-full"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Cancel Trip
                          </Button>
                        )}
                        
                        {booking.status.status === 'confirmed' && (
                          <Button
                            onClick={() => handleCancelBooking(booking._id)}
                            variant="destructive"
                            className="w-full"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Cancel Trip
                          </Button>
                        )}

                        {booking.status.status === 'completed' && !booking.review?.isReviewed && (
                          <Button
                            onClick={() => handleAddReview(booking._id)}
                            className="w-full"
                          >
                            <Star className="w-4 h-4 mr-2" />
                            Write Review
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <EmptyState
                icon={Calendar}
                title="No trips found"
                description={
                  activeTab === 'all' 
                    ? "You haven't booked any trips yet. Start exploring amazing tours!"
                    : `No ${activeTab} trips found.`
                }
                action={
                  activeTab === 'all' ? (
                    <a href="/explore">
                      <Button>
                        Explore Tours
                      </Button>
                    </a>
                  ) : undefined
                }
              />
            )}
          </div>
        </Container>
      </Section>

      {/* Cancel Trip Dialog */}
      <PromptDialog
        isOpen={showCancelDialog}
        onClose={() => {
          setShowCancelDialog(false);
          setCurrentBookingId(null);
        }}
        onConfirm={confirmCancelBooking}
        title="Cancel Trip"
        message="Please provide a reason for cancellation:"
        placeholder="Enter cancellation reason..."
        confirmText="Cancel Trip"
        cancelText="Keep Trip"
        required={true}
        multiline={true}
      />

      {/* Rating Dialog */}
      <PromptDialog
        isOpen={showRatingDialog}
        onClose={() => {
          setShowRatingDialog(false);
          setCurrentBookingId(null);
        }}
        onConfirm={confirmRating}
        title="Rate Your Experience"
        message="Please rate your experience (1-5):"
        placeholder="Enter rating (1-5)..."
        confirmText="Next"
        cancelText="Cancel"
        required={true}
      />

      {/* Review Dialog */}
      <PromptDialog
        isOpen={showReviewDialog}
        onClose={() => {
          setShowReviewDialog(false);
          setRatingValue('');
          setCurrentBookingId(null);
        }}
        onConfirm={confirmReview}
        title="Write Your Review"
        message="Please write your review:"
        placeholder="Enter your review..."
        confirmText="Submit Review"
        cancelText="Cancel"
        required={true}
        multiline={true}
      />
    </AppLayout>
  );
}
