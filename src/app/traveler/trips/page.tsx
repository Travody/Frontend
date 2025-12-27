'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Users, Clock, CheckCircle, XCircle, AlertCircle, Star, MapPin, Phone, Mail } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { bookingsService, reviewsService } from '@/lib/api';
import type { Booking, ReviewEligibility, Review } from '@/types';
import toast from '@/lib/toast';
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
import { Breadcrumb } from '@/components/ui/breadcrumb';
import ReviewDialog from '@/components/reviews/ReviewDialog';

export default function TravelerTripsPage() {
  const router = useRouter();
  const { token } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'confirmed' | 'cancelled' | 'completed'>('all');
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [currentBookingId, setCurrentBookingId] = useState<string | null>(null);
  const [currentReviewType, setCurrentReviewType] = useState<'booking' | 'guider'>('booking');
  const [reviewEligibility, setReviewEligibility] = useState<Record<string, ReviewEligibility>>({});
  const [existingReviews, setExistingReviews] = useState<Record<string, { booking?: Review; guider?: Review }>>({});

  useEffect(() => {
    if (token) {
      fetchBookings();
    }
  }, [token]);

  const fetchBookings = async () => {
    try {
      const response = await bookingsService.getTravelerBookings();
      if (response.success && response.data) {
        setBookings(response.data.bookings);
        // Fetch review eligibility for completed bookings
        const completedBookings = response.data.bookings.filter(
          (b: Booking) => b.status.status === 'completed'
        );
        for (const booking of completedBookings) {
          await fetchReviewEligibility(booking._id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch trips:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchReviewEligibility = async (bookingId: string) => {
    try {
      const response = await reviewsService.canUserReview(bookingId);
      if (response.success && response.data) {
        setReviewEligibility((prev) => ({
          ...prev,
          [bookingId]: response.data!,
        }));
        // Store existing reviews
        if (response.data.bookingReview || response.data.guiderReview) {
          setExistingReviews((prev) => ({
            ...prev,
            [bookingId]: {
              booking: response.data!.bookingReview || undefined,
              guider: response.data!.guiderReview || undefined,
            },
          }));
        }
      }
    } catch (error) {
      console.error('Failed to fetch review eligibility:', error);
    }
  };

  const handleCancelBooking = (bookingId: string) => {
    setCurrentBookingId(bookingId);
    setShowCancelDialog(true);
  };

  const confirmCancelBooking = async (reason: string) => {
    if (!currentBookingId || !reason.trim()) return;
    
    try {
      const response = await bookingsService.cancelBooking(currentBookingId, reason);
      if (response.success) {
        fetchBookings();
      }
    } catch (error) {
      console.error('Error cancelling trip:', error);
    } finally {
      setShowCancelDialog(false);
      setCurrentBookingId(null);
    }
  };

  const handleAddReview = (bookingId: string, reviewType: 'booking' | 'guider') => {
    setCurrentBookingId(bookingId);
    setCurrentReviewType(reviewType);
    setShowReviewDialog(true);
  };

  const handleSubmitReview = async (rating: number, comment: string) => {
    if (!currentBookingId) return;

    const existingReview = existingReviews[currentBookingId]?.[currentReviewType];
    
    try {
      let response;
      if (existingReview) {
        // Update existing review
        response = await reviewsService.updateReview(existingReview._id, rating, comment);
      } else {
        // Create new review
        response = await reviewsService.createReview({
            reviewType: currentReviewType,
            bookingId: currentBookingId,
            rating,
            comment,
        });
      }

      if (response.success) {
        // Refresh eligibility and reviews
        await fetchReviewEligibility(currentBookingId);
        fetchBookings();
      } else {
        throw new Error(response.message || 'Failed to submit review');
      }
    } catch (error: any) {
      console.error('Error submitting review:', error);
      throw error;
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
      <Breadcrumb
        items={[
          { label: 'My Trips' },
        ]}
        homeHref="/"
      />
      <Section variant="muted" className="!pt-6 !pb-8 md:!pt-6 md:!pb-8">
        <Container>
          <PageHeader
            title="My Trips"
            description="Manage your tour trips and experiences"
          />

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="mb-8">
            <div className="w-full max-w-2xl overflow-x-auto scrollbar-hide">
              <TabsList className="flex sm:grid sm:grid-cols-5 min-w-max sm:min-w-0 w-full sm:w-auto">
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
            </div>
          </Tabs>

          {/* Trips List */}
          <div className="space-y-4">
            {filteredBookings.length > 0 ? (
              filteredBookings.map((booking) => {
                const plan = typeof booking.planId === 'object' ? booking.planId : null;
                const guider = typeof booking.guiderId === 'object' ? booking.guiderId : null;
                
                return (
                <Card key={booking._id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push(`/traveler/trips/${booking._id}`)}>
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                      <div className="flex-1 space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            {getStatusIcon(booking.status.status)}
                            <div>
                              <Heading as="h3" variant="subsection" className="mb-1">
                                {plan?.title || 'Plan Title'}
                              </Heading>
                              <p className="text-sm text-gray-600 mb-2">
                                {plan ? `${plan.city}, ${plan.state}` : 'Location'}
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
                            <span>{booking.bookingDetails?.date ? formatDate(booking.bookingDetails.date) : 'N/A'}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Users className="w-4 h-4 mr-2" />
                            <span>{booking.bookingDetails?.numberOfParticipants || 0} people</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="w-4 h-4 mr-2" />
                            <span>{booking.financial?.totalAmount && booking.financial?.currency ? formatPrice(booking.financial.totalAmount, booking.financial.currency) : 'N/A'}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="w-4 h-4 mr-2" />
                            <span className="truncate">{plan?.meetingPoint || 'Meeting Point'}</span>
                          </div>
                        </div>

                        {/* Guide Information */}
                        {guider && (
                          <Card className="bg-gray-50 border-gray-200">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-base">Guide Information</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                <div>
                                  <span className="text-gray-600">Name: </span>
                                  <span className="font-medium text-gray-900">{guider.personalInfo?.showcaseName || guider.showcaseName}</span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Email: </span>
                                  <span className="font-medium text-gray-900">{guider.email}</span>
                                </div>
                                {booking.status.status === 'confirmed' && guider.mobile && (
                                  <div>
                                    <span className="text-gray-600">Phone: </span>
                                    <span className="font-medium text-gray-900">{guider.mobile}</span>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {/* Tour Details */}
                        {plan && (
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
                                     plan.availability?.recurring?.timeSlot?.startTime ||
                                     'TBD'}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-primary-700">Duration: </span>
                                  <span className="font-medium text-primary-900">
                                    {typeof plan.duration === 'object' && plan.duration
                                      ? `${plan.duration.value} ${plan.duration.unit}`
                                      : plan.duration || 'N/A'}
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
                              <CardTitle className="text-base text-purple-900">Share Your Experience</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0 space-y-4">
                              {(() => {
                                const eligibility = reviewEligibility[booking._id];
                                const existing = existingReviews[booking._id];
                                
                                if (!eligibility) {
                                  return <p className="text-purple-800 text-sm">Loading review options...</p>;
                                }

                                if (!eligibility.canReview) {
                                  return (
                                    <p className="text-purple-800 text-sm">
                                      {eligibility.reason || 'You cannot review this booking.'}
                                    </p>
                                  );
                                }

                                return (
                                  <>
                                    {/* Tour/Plan Review */}
                                    <div className="space-y-2">
                                      <div className="flex items-center justify-between">
                                        <div>
                                          <p className="text-sm font-medium text-purple-900">Tour/Plan Review</p>
                                          <p className="text-xs text-purple-700">Rate your overall tour experience</p>
                                        </div>
                                        {existing?.booking && (
                                          <Badge variant="secondary" className="text-xs">
                                            Reviewed
                                          </Badge>
                                        )}
                                      </div>
                                      {existing?.booking ? (
                                        <div className="bg-white p-3 rounded border border-purple-200">
                                          <div className="flex items-center mb-2">
                                            {[...Array(5)].map((_, i) => (
                                              <Star
                                                key={i}
                                                className={`w-4 h-4 ${
                                                  i < existing.booking!.rating
                                                    ? 'text-yellow-400 fill-current'
                                                    : 'text-gray-300'
                                                }`}
                                              />
                                            ))}
                                            <span className="ml-2 text-sm font-medium">{existing.booking.rating}/5</span>
                                          </div>
                                          {existing.booking.comment && (
                                            <p className="text-purple-800 text-sm mb-2">{existing.booking.comment}</p>
                                          )}
                                          <Button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleAddReview(booking._id, 'booking');
                                            }}
                                            variant="outline"
                                            size="sm"
                                            className="mt-2"
                                          >
                                            Update Review
                                          </Button>
                                        </div>
                                      ) : (
                                        <Button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleAddReview(booking._id, 'booking');
                                          }}
                                          variant="outline"
                                          size="sm"
                                          disabled={!eligibility.canReviewBooking}
                                        >
                                          <Star className="w-4 h-4 mr-2" />
                                          Review Tour
                                        </Button>
                                      )}
                                    </div>

                                    {/* Guider Review */}
                                    <div className="space-y-2">
                                      <div className="flex items-center justify-between">
                                        <div>
                                          <p className="text-sm font-medium text-purple-900">Guider Review</p>
                                          <p className="text-xs text-purple-700">Rate your guide's service</p>
                                        </div>
                                        {existing?.guider && (
                                          <Badge variant="secondary" className="text-xs">
                                            Reviewed
                                          </Badge>
                                        )}
                                      </div>
                                      {existing?.guider ? (
                                        <div className="bg-white p-3 rounded border border-purple-200">
                                          <div className="flex items-center mb-2">
                                            {[...Array(5)].map((_, i) => (
                                              <Star
                                                key={i}
                                                className={`w-4 h-4 ${
                                                  i < existing.guider!.rating
                                                    ? 'text-yellow-400 fill-current'
                                                    : 'text-gray-300'
                                                }`}
                                              />
                                            ))}
                                            <span className="ml-2 text-sm font-medium">{existing.guider.rating}/5</span>
                                          </div>
                                          {existing.guider.comment && (
                                            <p className="text-purple-800 text-sm mb-2">{existing.guider.comment}</p>
                                          )}
                                          <Button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleAddReview(booking._id, 'guider');
                                            }}
                                            variant="outline"
                                            size="sm"
                                            className="mt-2"
                                          >
                                            Update Review
                                          </Button>
                                        </div>
                                      ) : (
                                        <Button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleAddReview(booking._id, 'guider');
                                          }}
                                          variant="outline"
                                          size="sm"
                                          disabled={!eligibility.canReviewGuider}
                                        >
                                          <Star className="w-4 h-4 mr-2" />
                                          Review Guider
                                        </Button>
                                      )}
                                    </div>
                                  </>
                                );
                              })()}
                            </CardContent>
                          </Card>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-2 lg:min-w-[180px]" onClick={(e) => e.stopPropagation()}>
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

                      </div>
                    </div>
                  </CardContent>
                </Card>
                );
              })
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

      {/* Review Dialog */}
      <ReviewDialog
        open={showReviewDialog}
        onOpenChange={setShowReviewDialog}
        reviewType={currentReviewType}
        onSubmit={handleSubmitReview}
        existingReview={
          currentBookingId && existingReviews[currentBookingId]
            ? existingReviews[currentBookingId][currentReviewType]
            : null
        }
      />
    </AppLayout>
  );
}
