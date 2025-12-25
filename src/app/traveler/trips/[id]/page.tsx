'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Calendar, Users, Clock, CheckCircle, XCircle, AlertCircle, Star, MapPin, Phone, Mail, FileText, CreditCard, User, MessageSquare } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { bookingsService, reviewsService } from '@/lib/api';
import type { Booking, ReviewEligibility, Review } from '@/types';
import toast from '@/lib/toast';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { LoadingState } from '@/components/ui/loading-state';
import { PageHeader } from '@/components/ui/page-header';
import { Heading } from '@/components/ui/heading';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import ReviewDialog from '@/components/reviews/ReviewDialog';
import { PromptDialog } from '@/components/ui/prompt-dialog';
import Link from 'next/link';

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params?.id as string;
  const { token } = useAuth();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [currentReviewType, setCurrentReviewType] = useState<'booking' | 'guider'>('booking');
  const [reviewEligibility, setReviewEligibility] = useState<ReviewEligibility | null>(null);
  const [existingReviews, setExistingReviews] = useState<{ booking?: Review; guider?: Review }>({});

  useEffect(() => {
    if (token && bookingId) {
      fetchBooking();
    }
  }, [token, bookingId]);

  const fetchBooking = async () => {
    if (!bookingId) return;
    
    try {
      const response = await bookingsService.getBookingById(bookingId);
      if (response.success && response.data) {
        setBooking(response.data);
        
        // Fetch review eligibility if booking is completed
        if (response.data.status.status === 'completed') {
          await fetchReviewEligibility(bookingId);
        }
      } else {
        toast.error('Booking not found');
        router.push('/traveler/trips');
      }
    } catch (error) {
      console.error('Failed to fetch booking:', error);
      toast.error('Failed to load booking details');
      router.push('/traveler/trips');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchReviewEligibility = async (id: string) => {
    try {
      const response = await reviewsService.canUserReview(id);
      if (response.success && response.data) {
        setReviewEligibility(response.data);
        setExistingReviews({
          booking: response.data.bookingReview || undefined,
          guider: response.data.guiderReview || undefined,
        });
      }
    } catch (error) {
      console.error('Failed to fetch review eligibility:', error);
    }
  };

  const handleCancelBooking = () => {
    setShowCancelDialog(true);
  };

  const confirmCancelBooking = async (reason: string) => {
    if (!bookingId || !reason.trim()) return;
    
    try {
      const response = await bookingsService.cancelBooking(bookingId, reason);
      if (response.success) {
        fetchBooking();
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
    } finally {
      setShowCancelDialog(false);
    }
  };

  const handleAddReview = (reviewType: 'booking' | 'guider') => {
    setCurrentReviewType(reviewType);
    setShowReviewDialog(true);
  };

  const handleSubmitReview = async (rating: number, comment: string) => {
    if (!bookingId) return;

    const existingReview = existingReviews[currentReviewType];
    
    try {
      let response;
      if (existingReview) {
        response = await reviewsService.updateReview(existingReview._id, rating, comment);
      } else {
        response = await reviewsService.createReview({
          reviewType: currentReviewType,
          bookingId: bookingId,
          rating,
          comment,
        });
      }

      if (response.success) {
        await fetchReviewEligibility(bookingId);
        fetchBooking();
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

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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

  if (isLoading) {
    return (
      <AppLayout>
        <LoadingState message="Loading booking details..." />
      </AppLayout>
    );
  }

  if (!booking) {
    return (
      <AppLayout>
        <Section variant="muted" className="!pt-6 !pb-8">
          <Container>
            <div className="text-center py-12">
              <Heading as="h2" variant="section">Booking not found</Heading>
              <p className="text-gray-600 mt-2 mb-6">The booking you're looking for doesn't exist.</p>
              <Link href="/traveler/trips">
                <Button>
                  Back to My Trips
                </Button>
              </Link>
            </div>
          </Container>
        </Section>
      </AppLayout>
    );
  }

  const plan = typeof booking.planId === 'object' ? booking.planId : null;
  const guider = typeof booking.guiderId === 'object' ? booking.guiderId : null;

  return (
    <AppLayout>
      <Breadcrumb
        items={[
          { label: 'My Trips', href: '/traveler/trips' },
          { label: 'Booking Details' },
        ]}
        homeHref="/"
      />
      <Section variant="muted" className="!pt-6 !pb-8 md:!pt-6 md:!pb-8">
        <Container>
          <div className="mb-6">
            <PageHeader
              title="Booking Details"
              description={`Booking ID: ${booking._id}`}
            />
          </div>

          <div className="space-y-6">
            {/* Booking Status */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {getStatusIcon(booking.status.status)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      {plan ? (
                        <Link href={`/plans/${typeof booking.planId === 'object' ? booking.planId._id : booking.planId}`}>
                          <Heading as="h2" variant="subsection" className="hover:text-primary-600 transition-colors cursor-pointer">
                            {plan.title}
                          </Heading>
                        </Link>
                      ) : (
                        <Heading as="h2" variant="subsection">
                          Plan Title
                        </Heading>
                      )}
                      <div className="flex items-center gap-3">
                        <Badge variant={getStatusVariant(booking.status.status)}>
                          {booking.status.status}
                        </Badge>
                        {(booking.status.status === 'pending' || booking.status.status === 'confirmed') && (
                          <Button
                            onClick={handleCancelBooking}
                            variant="destructive"
                            size="sm"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Cancel Booking
                          </Button>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      {plan ? `${plan.city}, ${plan.state}` : 'Location'}
                    </p>
                    {plan?.description && (
                      <p className="text-sm text-gray-700">{plan.description}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

              {/* Booking Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Booking Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Booking Date</p>
                      <p className="font-medium">{formatDate(booking.bookingDetails.date)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Start Time</p>
                      <p className="font-medium">
                        {booking.bookingDetails.startTime || 
                         plan?.availability?.recurring?.timeSlot?.startTime ||
                         'TBD'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Number of Participants</p>
                      <p className="font-medium">{booking.bookingDetails.numberOfParticipants} people</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Duration</p>
                      <p className="font-medium">
                        {typeof plan?.duration === 'object' && plan.duration
                          ? `${plan.duration.value} ${plan.duration.unit}`
                          : plan?.duration || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Meeting Point</p>
                      <p className="font-medium">{plan?.meetingPoint || 'TBD'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Created At</p>
                      <p className="font-medium">{formatDateTime(booking.createdAt)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Guide Information */}
              {guider && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Guide Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Name</p>
                        <p className="font-medium">{guider.personalInfo?.showcaseName || guider.showcaseName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Email</p>
                        <p className="font-medium">{guider.email}</p>
                      </div>
                      {booking.status.status === 'confirmed' && guider.mobile && (
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Phone</p>
                          <p className="font-medium">{guider.mobile}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Financial Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Financial Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Amount</span>
                      <span className="font-bold text-lg">
                        {formatPrice(booking.financial.totalAmount, booking.financial.currency)}
                      </span>
                    </div>
                    {(booking.financial as any).discountAmount && (booking.financial as any).discountAmount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount</span>
                        <span>-{formatPrice((booking.financial as any).discountAmount, booking.financial.currency)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Status</span>
                      <Badge variant={booking.financial.isPaid ? 'default' : 'secondary'}>
                        {booking.financial.isPaid ? 'Paid' : 'Pending'}
                      </Badge>
                    </div>
                    {(booking.cancellation as any)?.refundAmount && (booking.cancellation as any).refundAmount > 0 && (
                      <div className="flex justify-between text-red-600">
                        <span>Refund Amount</span>
                        <span className="font-medium">
                          {formatPrice((booking.cancellation as any).refundAmount, booking.financial.currency)}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Preferences */}
              {(booking.preferences?.specialRequests || 
                booking.preferences?.dietaryRestrictions || 
                booking.preferences?.accessibilityNeeds) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Preferences & Special Requests
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {booking.preferences?.specialRequests && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Special Requests</p>
                        <p className="text-sm">{booking.preferences.specialRequests}</p>
                      </div>
                    )}
                    {booking.preferences?.dietaryRestrictions && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Dietary Restrictions</p>
                        <p className="text-sm">{booking.preferences.dietaryRestrictions}</p>
                      </div>
                    )}
                    {booking.preferences?.accessibilityNeeds && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Accessibility Needs</p>
                        <p className="text-sm">{booking.preferences.accessibilityNeeds}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Guide Message */}
              {booking.status.guiderConfirmationMessage && (
                <Card className="bg-green-50 border-green-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-900">
                      <MessageSquare className="w-5 h-5" />
                      Message from Guide
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-green-800">{booking.status.guiderConfirmationMessage}</p>
                  </CardContent>
                </Card>
              )}

              {/* Cancellation Info */}
              {booking.cancellation?.reason && (
                <Card className="bg-red-50 border-red-200">
                  <CardHeader>
                    <CardTitle className="text-red-900">Cancellation Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Reason</p>
                        <p className="text-red-800">{booking.cancellation.reason}</p>
                      </div>
                      {booking.cancellation.cancelledAt && (
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Cancelled At</p>
                          <p className="text-red-800">{formatDateTime(booking.cancellation.cancelledAt)}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Review Section */}
              {booking.status.status === 'completed' && reviewEligibility && (
                <Card className="bg-purple-50 border-purple-200">
                  <CardHeader>
                    <CardTitle className="text-purple-900">Share Your Experience</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {reviewEligibility.canReview ? (
                      <>
                        {/* Booking Review */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-purple-900">Tour/Plan Review</p>
                              <p className="text-xs text-purple-700">Rate your overall tour experience</p>
                            </div>
                            {existingReviews.booking && (
                              <Badge variant="secondary" className="text-xs">
                                Reviewed
                              </Badge>
                            )}
                          </div>
                          {existingReviews.booking ? (
                            <div className="bg-white p-3 rounded border border-purple-200">
                              <div className="flex items-center mb-2">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < existingReviews.booking!.rating
                                        ? 'text-yellow-400 fill-current'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                                <span className="ml-2 text-sm font-medium">{existingReviews.booking.rating}/5</span>
                              </div>
                              {existingReviews.booking.comment && (
                                <p className="text-purple-800 text-sm mb-2">{existingReviews.booking.comment}</p>
                              )}
                              <Button
                                onClick={() => handleAddReview('booking')}
                                variant="outline"
                                size="sm"
                                className="mt-2"
                              >
                                Update Review
                              </Button>
                            </div>
                          ) : (
                            <Button
                              onClick={() => handleAddReview('booking')}
                              variant="outline"
                              size="sm"
                              disabled={!reviewEligibility.canReviewBooking}
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
                            {existingReviews.guider && (
                              <Badge variant="secondary" className="text-xs">
                                Reviewed
                              </Badge>
                            )}
                          </div>
                          {existingReviews.guider ? (
                            <div className="bg-white p-3 rounded border border-purple-200">
                              <div className="flex items-center mb-2">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < existingReviews.guider!.rating
                                        ? 'text-yellow-400 fill-current'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                                <span className="ml-2 text-sm font-medium">{existingReviews.guider.rating}/5</span>
                              </div>
                              {existingReviews.guider.comment && (
                                <p className="text-purple-800 text-sm mb-2">{existingReviews.guider.comment}</p>
                              )}
                              <Button
                                onClick={() => handleAddReview('guider')}
                                variant="outline"
                                size="sm"
                                className="mt-2"
                              >
                                Update Review
                              </Button>
                            </div>
                          ) : (
                            <Button
                              onClick={() => handleAddReview('guider')}
                              variant="outline"
                              size="sm"
                              disabled={!reviewEligibility.canReviewGuider}
                            >
                              <Star className="w-4 h-4 mr-2" />
                              Review Guider
                            </Button>
                          )}
                        </div>
                      </>
                    ) : (
                      <p className="text-purple-800 text-sm">
                        {reviewEligibility.reason || 'You cannot review this booking.'}
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}
          </div>
        </Container>
      </Section>

      {/* Cancel Booking Dialog */}
      <PromptDialog
        isOpen={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        onConfirm={confirmCancelBooking}
        title="Cancel Booking"
        message="Please provide a reason for cancellation:"
        placeholder="Enter cancellation reason..."
        confirmText="Cancel Booking"
        cancelText="Keep Booking"
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
          existingReviews[currentReviewType] || null
        }
      />
    </AppLayout>
  );
}

