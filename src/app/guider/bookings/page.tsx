'use client';

import { useState, useEffect } from 'react';
import { Calendar, Users, Clock, CheckCircle, XCircle, AlertCircle, Mail, Phone, MapPin, ArrowLeft, Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiService, Booking, BookingStats } from '@/lib/api';
import toast from 'react-hot-toast';
import { PromptDialog } from '@/components/ui/prompt-dialog';
import AppLayout from '@/components/layout/AppLayout';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { LoadingState } from '@/components/ui/loading-state';
import { Heading } from '@/components/ui/heading';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/page-header';
import { Separator } from '@/components/ui/separator';

export default function GuiderBookingsDashboard() {
  const { token } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [pendingBookings, setPendingBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<BookingStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'confirmed' | 'cancelled' | 'completed'>('all');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [currentBookingId, setCurrentBookingId] = useState<string | null>(null);
  const [currentDecision, setCurrentDecision] = useState<'confirmed' | 'cancelled' | null>(null);

  useEffect(() => {
    if (token) {
      fetchDashboardData();
    }
  }, [token]);

  const fetchDashboardData = async () => {
    try {
      const [bookingsResponse, pendingResponse, statsResponse] = await Promise.all([
        apiService.getGuiderBookings(token!),
        apiService.getPendingConfirmations(token!),
        apiService.getBookingStats(token!)
      ]);

      if (bookingsResponse.success && bookingsResponse.data) {
        setBookings(bookingsResponse.data.bookings);
      }

      if (pendingResponse.success && pendingResponse.data) {
        setPendingBookings(pendingResponse.data);
      }

      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const confirmBookingAction = async (message: string) => {
    if (!currentBookingId || !currentDecision) return;
    
    try {
      const response = await apiService.confirmBooking(currentBookingId, {
        decision: currentDecision,
        message: currentDecision === 'confirmed' ? message || undefined : undefined,
        cancellationReason: currentDecision === 'cancelled' ? message : undefined
      }, token!);

      if (response.success) {
        toast.success(`Booking ${currentDecision} successfully!`);
        fetchDashboardData();
      } else {
        toast.error(response.message || `Failed to ${currentDecision} booking`);
      }
    } catch (error) {
      console.error(`Error ${currentDecision} booking:`, error);
      toast.error(`Failed to ${currentDecision} booking`);
    } finally {
      setShowConfirmDialog(false);
      setShowCancelDialog(false);
      setCurrentBookingId(null);
      setCurrentDecision(null);
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
        return <CheckCircle className="w-5 h-5 text-blue-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const filteredBookings = bookings.filter(booking => {
    switch (activeTab) {
      case 'pending':
        return booking.status?.status === 'pending';
      case 'confirmed':
        return booking.status?.status === 'confirmed';
      case 'cancelled':
        return booking.status?.status === 'cancelled';
      case 'completed':
        return booking.status?.status === 'completed';
      default:
        return true;
    }
  });

  if (isLoading) {
    return (
      <AppLayout>
        <LoadingState message="Loading bookings..." />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Section variant="muted" className="py-8">
        <Container>
          {/* Back Navigation */}
          <div className="mb-6">
            <Link href="/guider/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>

          <PageHeader
            title="Booking Management"
            description="Manage your tour bookings and confirmations"
          />

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Calendar className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Total Bookings</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Confirmed</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.confirmedBookings}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-yellow-100 rounded-lg">
                      <AlertCircle className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Pending</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.pendingBookings}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <Users className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                      <p className="text-2xl font-bold text-gray-900">₹{stats.totalRevenue?.toLocaleString() || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Pending Confirmations Alert */}
          {pendingBookings.length > 0 && (
            <Card className="mb-8 bg-yellow-50 border-yellow-200">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                  <div>
                    <h3 className="text-sm font-medium text-yellow-800">
                      {pendingBookings.length} booking{pendingBookings.length > 1 ? 's' : ''} awaiting your confirmation
                    </h3>
                    <p className="text-sm text-yellow-700">
                      Please review and confirm these bookings within 48 hours
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="mb-6">
            <TabsList className="grid w-full max-w-3xl grid-cols-5">
              <TabsTrigger value="all">
                All ({bookings.length})
              </TabsTrigger>
              <TabsTrigger value="pending">
                Pending ({bookings.filter(b => b.status?.status === 'pending').length})
              </TabsTrigger>
              <TabsTrigger value="confirmed">
                Confirmed ({bookings.filter(b => b.status?.status === 'confirmed').length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed ({bookings.filter(b => b.status?.status === 'completed').length})
              </TabsTrigger>
              <TabsTrigger value="cancelled">
                Cancelled ({bookings.filter(b => b.status?.status === 'cancelled').length})
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Bookings List */}
          <div className="space-y-4">
            {filteredBookings.length > 0 ? (
              filteredBookings.map((booking) => {
                const plan = typeof booking.planId === 'object' ? booking.planId : null;
                
                return (
                <Card key={booking._id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                      <div className="flex-1 space-y-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <Heading as="h3" variant="subsection" className="mb-1">
                              {plan?.title || 'Plan Title'}
                            </Heading>
                            <p className="text-sm text-gray-600 mb-2">
                              {plan ? `${plan.city}, ${plan.state}` : 'Location'}
                            </p>
                            <Badge variant={getStatusVariant(booking.status?.status || 'unknown')}>
                              {booking.status?.status || 'unknown'}
                            </Badge>
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
                            <Mail className="w-4 h-4 mr-2" />
                            <span className="truncate">{booking.traveler?.email || 'N/A'}</span>
                          </div>
                        </div>

                        <Card className="bg-gray-50 border-gray-200">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-base">Traveler Details</CardTitle>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                              <div>
                                <span className="text-gray-600">Name: </span>
                                <span className="font-medium text-gray-900">{booking.traveler?.name || 'N/A'}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Email: </span>
                                <span className="font-medium text-gray-900">{booking.traveler?.email || 'N/A'}</span>
                              </div>
                              {booking.preferences?.specialRequests && (
                                <div className="md:col-span-2">
                                  <span className="text-gray-600">Special Requests: </span>
                                  <span className="text-gray-900">{booking.preferences.specialRequests}</span>
                                </div>
                              )}
                              {booking.traveler?.emergencyContact && (
                                <div>
                                  <span className="text-gray-600">Emergency Contact: </span>
                                  <span className="text-gray-900">{booking.traveler.emergencyContact}</span>
                                </div>
                              )}
                              {booking.preferences?.dietaryRestrictions && (
                                <div>
                                  <span className="text-gray-600">Dietary Restrictions: </span>
                                  <span className="text-gray-900">{booking.preferences.dietaryRestrictions}</span>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>

                        {/* Phone Number - Only for Confirmed Bookings */}
                        {booking.status?.status === 'confirmed' && booking.traveler?.phone && (
                          <Card className="bg-primary-50 border-primary-200">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-base text-primary-900 flex items-center">
                                <Phone className="w-5 h-5 mr-2" />
                                Contact Details
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0">
                              <div className="flex items-center">
                                <Phone className="w-4 h-4 text-primary-600 mr-2" />
                                <div>
                                  <span className="text-xs text-primary-700 font-medium block">Phone</span>
                                  <a 
                                    href={`tel:${booking.traveler.phone}`}
                                    className="text-primary-900 font-semibold hover:text-primary-700 hover:underline"
                                  >
                                    {booking.traveler.phone}
                                  </a>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {booking.status?.guiderConfirmationMessage && (
                          <Card className="bg-blue-50 border-blue-200">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-base text-blue-900">Your Message</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0">
                              <p className="text-blue-800 text-sm">{booking.status?.guiderConfirmationMessage}</p>
                            </CardContent>
                          </Card>
                        )}

                        {booking.cancellation?.reason && (
                          <Card className="bg-red-50 border-red-200">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-base text-red-900">Cancellation Reason</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0">
                              <p className="text-red-800 text-sm">{booking.cancellation?.reason}</p>
                            </CardContent>
                          </Card>
                        )}

                        {/* Review Section - Show if booking has a review */}
                        {booking.review?.isReviewed && booking.review?.rating && (
                          <Card className="bg-purple-50 border-purple-200">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-base text-purple-900 flex items-center">
                                <Star className="w-5 h-5 mr-2 fill-current text-purple-600" />
                                Traveler Review
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0">
                              <div className="flex items-center gap-2 mb-3">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < (booking.review?.rating || 0)
                                        ? 'text-yellow-400 fill-current'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                                <span className="ml-1 text-sm font-medium text-purple-900">
                                  {booking.review.rating}/5
                                </span>
                                {booking.review.reviewedAt && (
                                  <span className="text-xs text-purple-700 ml-auto">
                                    {new Date(booking.review.reviewedAt).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric'
                                    })}
                                  </span>
                                )}
                              </div>
                              {booking.review.review && (
                                <p className="text-purple-800 text-sm leading-relaxed">
                                  "{booking.review.review}"
                                </p>
                              )}
                            </CardContent>
                          </Card>
                        )}
                      </div>

                      {/* Action Buttons */}
                      {booking.status?.status === 'pending' && (
                        <div className="flex flex-col gap-2 lg:min-w-[180px]">
                          <Button
                            onClick={() => {
                              setCurrentBookingId(booking._id);
                              setCurrentDecision('confirmed');
                              setShowConfirmDialog(true);
                            }}
                            className="w-full"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Confirm
                          </Button>
                          <Button
                            onClick={() => {
                              setCurrentBookingId(booking._id);
                              setCurrentDecision('cancelled');
                              setShowCancelDialog(true);
                            }}
                            variant="destructive"
                            className="w-full"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Cancel
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                );
              })
            ) : (
              <EmptyState
                icon={Calendar}
                title="No bookings found"
                description={
                  activeTab === 'all' 
                    ? "You don't have any bookings yet. Create some amazing tours to start receiving bookings!"
                    : `No ${activeTab} bookings found.`
                }
              />
            )}
          </div>
        </Container>
      </Section>

      {/* Confirm Booking Dialog */}
      <PromptDialog
        isOpen={showConfirmDialog}
        onClose={() => {
          setShowConfirmDialog(false);
          setCurrentBookingId(null);
          setCurrentDecision(null);
        }}
        onConfirm={confirmBookingAction}
        title="Confirm Booking"
        message="Add a confirmation message (optional):"
        placeholder="Enter confirmation message..."
        confirmText="Confirm Booking"
        cancelText="Cancel"
        required={false}
        multiline={true}
      />

      {/* Cancel Booking Dialog */}
      <PromptDialog
        isOpen={showCancelDialog}
        onClose={() => {
          setShowCancelDialog(false);
          setCurrentBookingId(null);
          setCurrentDecision(null);
        }}
        onConfirm={confirmBookingAction}
        title="Cancel Booking"
        message="Please provide a cancellation reason:"
        placeholder="Enter cancellation reason..."
        confirmText="Cancel Booking"
        cancelText="Keep Booking"
        required={true}
        multiline={true}
      />
    </AppLayout>
  );
}
