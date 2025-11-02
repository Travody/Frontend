'use client';

import { useState, useEffect } from 'react';
import { Calendar, Users, Clock, CheckCircle, XCircle, AlertCircle, Star, MapPin, Phone, Mail } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiService, Booking } from '@/lib/api';
import toast from 'react-hot-toast';
import AppLayout from '@/components/layout/AppLayout';
import { PromptDialog } from '@/components/ui/Dialog';

export default function TravelerBookingsPage() {
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
        toast.error('Failed to load bookings');
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      toast.error('Failed to load bookings');
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
        toast.success('Booking cancelled successfully');
        fetchBookings(); // Refresh data
      } else {
        toast.error(response.message || 'Failed to cancel booking');
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error('Failed to cancel booking');
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
        fetchBookings(); // Refresh data
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
    return `${symbol}${price}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-500"></div>
        </div>
      </AppLayout>
    );
  }
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
          <p className="mt-2 text-gray-600">Manage your tour bookings and experiences</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { key: 'all', label: 'All Bookings', count: bookings.length },
                { key: 'pending', label: 'Pending', count: bookings.filter(b => b.status.status === 'pending').length },
                { key: 'confirmed', label: 'Confirmed', count: bookings.filter(b => b.status.status === 'confirmed').length },
                { key: 'completed', label: 'Completed', count: bookings.filter(b => b.status.status === 'completed').length },
                { key: 'cancelled', label: 'Cancelled', count: bookings.filter(b => b.status.status === 'cancelled').length }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.key
                      ? 'border-teal-500 text-teal-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                  <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                    activeTab === tab.key
                      ? 'bg-teal-100 text-teal-600'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Bookings List */}
        <div className="space-y-4">
          {filteredBookings.length > 0 ? (
            filteredBookings.map((booking) => (
              <div key={booking._id} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        {getStatusIcon(booking.status.status)}
                        <div className="ml-3">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {typeof booking.planId === 'object' ? booking.planId.title : 'Plan Title'}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {typeof booking.planId === 'object' ? `${booking.planId.city}, ${booking.planId.state}` : 'Location'}
                          </p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status.status)}`}>
                        {booking.status.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
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
                        <span>{typeof booking.planId === 'object' ? booking.planId.meetingPoint : 'Meeting Point'}</span>
                      </div>
                    </div>

                    {/* Guide Information */}
                    {typeof booking.guiderId === 'object' && (
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Guide Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Name:</span>
                            <span className="ml-2 font-medium text-gray-900">{booking.guiderId.personalInfo?.showcaseName || booking.guiderId.showcaseName}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Email:</span>
                            <span className="ml-2 font-medium text-gray-900">{booking.guiderId.email}</span>
                          </div>
                          {booking.status.status === 'confirmed' && (
                            <div>
                              <span className="text-gray-600">Phone:</span>
                              <span className="ml-2 font-medium text-gray-900">{booking.guiderId.mobile}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Tour Details */}
                    {typeof booking.planId === 'object' && (
                      <div className="bg-blue-50 rounded-lg p-4 mb-4">
                        <h4 className="font-medium text-blue-900 mb-2">Tour Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-blue-700">Start Time:</span>
                            <span className="ml-2 font-medium text-blue-900">
                              {booking.bookingDetails.startTime || 
                               (typeof booking.planId === 'object' && booking.planId.availability?.recurring?.timeSlot?.startTime) ||
                               'TBD'}
                            </span>
                          </div>
                          <div>
                            <span className="text-blue-700">Duration:</span>
                            <span className="ml-2 font-medium text-blue-900">
                              {typeof booking.planId.duration === 'object' && booking.planId.duration
                                ? `${booking.planId.duration.value} ${booking.planId.duration.unit}`
                                : booking.planId.duration || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Special Requests */}
                    {booking.preferences?.specialRequests && (
                      <div className="bg-yellow-50 rounded-lg p-4 mb-4">
                        <h4 className="font-medium text-yellow-900 mb-1">Special Requests</h4>
                        <p className="text-yellow-800 text-sm">{booking.preferences.specialRequests}</p>
                      </div>
                    )}

                    {/* Guide Message */}
                    {booking.status.guiderConfirmationMessage && (
                      <div className="bg-green-50 rounded-lg p-4 mb-4">
                        <h4 className="font-medium text-green-900 mb-1">Message from Guide</h4>
                        <p className="text-green-800 text-sm">{booking.status.guiderConfirmationMessage}</p>
                      </div>
                    )}

                    {/* Cancellation Info */}
                    {booking.cancellation?.reason && (
                      <div className="bg-red-50 rounded-lg p-4 mb-4">
                        <h4 className="font-medium text-red-900 mb-1">Cancellation Reason</h4>
                        <p className="text-red-800 text-sm">{booking.cancellation.reason}</p>
                        {booking.financial.isPaid && booking.financial.refundAmount && booking.financial.refundAmount > 0 && (
                          <p className="text-red-800 text-sm mt-1">
                            Refund Amount: {formatPrice(booking.financial.refundAmount, booking.financial.currency)}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Review Section */}
                    {booking.status.status === 'completed' && (
                      <div className="bg-purple-50 rounded-lg p-4">
                        {booking.review?.isReviewed ? (
                          <div>
                            <h4 className="font-medium text-purple-900 mb-2">Your Review</h4>
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
                            <h4 className="font-medium text-purple-900 mb-2">How was your tour?</h4>
                            <p className="text-purple-800 text-sm mb-3">Share your experience to help other travelers!</p>
                            <button
                              onClick={() => handleAddReview(booking._id)}
                              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                            >
                              Write Review
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="ml-6 flex flex-col space-y-2">
                    {booking.status.status === 'pending' && (
                      <button
                        onClick={() => handleCancelBooking(booking._id)}
                        className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Cancel Booking
                      </button>
                    )}
                    
                    {booking.status.status === 'confirmed' && (
                      <button
                        onClick={() => handleCancelBooking(booking._id)}
                        className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Cancel Booking
                      </button>
                    )}

                    {booking.status.status === 'completed' && !booking.review?.isReviewed && (
                      <button
                        onClick={() => handleAddReview(booking._id)}
                        className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        <Star className="w-4 h-4 mr-2" />
                        Write Review
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
              <p className="text-gray-500 mb-4">
                {activeTab === 'all' 
                  ? "You haven't made any bookings yet. Start exploring amazing tours!"
                  : `No ${activeTab} bookings found.`
                }
              </p>
              {activeTab === 'all' && (
                <a
                  href="/traveler/search"
                  className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                >
                  Explore Tours
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Cancel Booking Dialog */}
      <PromptDialog
        isOpen={showCancelDialog}
        onClose={() => {
          setShowCancelDialog(false);
          setCurrentBookingId(null);
        }}
        onConfirm={confirmCancelBooking}
        title="Cancel Booking"
        message="Please provide a reason for cancellation:"
        placeholder="Enter cancellation reason..."
        confirmText="Cancel Booking"
        cancelText="Keep Booking"
        required={true}
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
      />
    </AppLayout>
  );
}
