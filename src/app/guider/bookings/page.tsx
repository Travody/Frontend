'use client';

import { useState, useEffect } from 'react';
import { Calendar, Users, Clock, CheckCircle, XCircle, AlertCircle, Mail, Phone, MapPin, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiService, Booking, BookingStats } from '@/lib/api';
import toast from 'react-hot-toast';
import { PromptDialog } from '@/components/ui/Dialog';
import AppLayout from '@/components/layout/AppLayout';
import Link from 'next/link';

export default function GuiderBookingsDashboard() {
  const { token } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [pendingBookings, setPendingBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<BookingStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all');
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
        fetchDashboardData(); // Refresh data
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

  const filteredBookings = bookings.filter(booking => {
    switch (activeTab) {
      case 'pending':
        return booking.status.status === 'pending';
      case 'confirmed':
        return booking.status.status === 'confirmed';
      case 'cancelled':
        return booking.status.status === 'cancelled';
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
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Navigation */}
          <div className="mb-6">
            <Link
              href="/guider/dashboard"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Dashboard
            </Link>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Booking Management</h1>
            <p className="mt-2 text-gray-600">Manage your tour bookings and confirmations</p>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Bookings</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Confirmed</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.confirmedBookings}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <AlertCircle className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Pending</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.pendingBookings}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">₹{stats.totalRevenue}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Pending Confirmations Alert */}
          {pendingBookings.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
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
            </div>
          )}

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-sm border mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 px-6">
              {[
                { key: 'all', label: 'All Bookings', count: bookings.length },
                { key: 'pending', label: 'Pending', count: bookings.filter(b => b.status.status === 'pending').length },
                { key: 'confirmed', label: 'Confirmed', count: bookings.filter(b => b.status.status === 'confirmed').length },
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
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {typeof booking.planId === 'object' ? booking.planId.title : 'Plan Title'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {typeof booking.planId === 'object' ? `${booking.planId.city}, ${booking.planId.state}` : 'Location'}
                        </p>
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
                        <Mail className="w-4 h-4 mr-2" />
                        <span>{booking.traveler.email}</span>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">Traveler Details</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Name:</span>
                          <span className="ml-2 font-medium text-gray-900">{booking.traveler.name}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Email:</span>
                          <span className="ml-2 font-medium text-gray-900">{booking.traveler.email}</span>
                        </div>
                        {booking.preferences?.specialRequests && (
                          <div className="md:col-span-2">
                            <span className="text-gray-600">Special Requests:</span>
                            <span className="ml-2 text-gray-900">{booking.preferences.specialRequests}</span>
                          </div>
                        )}
                        {booking.traveler.emergencyContact && (
                          <div>
                            <span className="text-gray-600">Emergency Contact:</span>
                            <span className="ml-2 text-gray-900">{booking.traveler.emergencyContact}</span>
                          </div>
                        )}
                        {booking.preferences?.dietaryRestrictions && (
                          <div>
                            <span className="text-gray-600">Dietary Restrictions:</span>
                            <span className="ml-2 text-gray-900">{booking.preferences.dietaryRestrictions}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Phone Number - Only for Confirmed Bookings */}
                    {booking.status.status === 'confirmed' && (
                      <div className="mt-4 bg-teal-50 border-2 border-teal-200 rounded-lg p-4">
                        <h4 className="font-semibold text-teal-900 mb-3 flex items-center">
                          <Phone className="w-5 h-5 mr-2" />
                          Contact Details
                        </h4>
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 text-teal-600 mr-2" />
                          <div>
                            <span className="text-xs text-teal-700 font-medium block">Phone</span>
                            <a 
                              href={`tel:${booking.traveler.phone}`}
                              className="text-teal-900 font-semibold hover:text-teal-700 hover:underline"
                            >
                              {booking.traveler.phone}
                            </a>
                          </div>
                        </div>
                      </div>
                    )}

                    {booking.status.guiderConfirmationMessage && (
                      <div className="mt-4 bg-blue-50 rounded-lg p-4">
                        <h4 className="font-medium text-blue-900 mb-1">Your Message</h4>
                        <p className="text-blue-800 text-sm">{booking.status.guiderConfirmationMessage}</p>
                      </div>
                    )}

                    {booking.cancellation?.reason && (
                      <div className="mt-4 bg-red-50 rounded-lg p-4">
                        <h4 className="font-medium text-red-900 mb-1">Cancellation Reason</h4>
                        <p className="text-red-800 text-sm">{booking.cancellation.reason}</p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  {booking.status.status === 'pending' && (
                    <div className="ml-6 flex flex-col space-y-2">
                      <button
                        onClick={() => {
                          setCurrentBookingId(booking._id);
                          setCurrentDecision('confirmed');
                          setShowConfirmDialog(true);
                        }}
                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Confirm
                      </button>
                      <button
                        onClick={() => {
                          setCurrentBookingId(booking._id);
                          setCurrentDecision('cancelled');
                          setShowCancelDialog(true);
                        }}
                        className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
              <p className="text-gray-500">
                {activeTab === 'all' 
                  ? "You don't have any bookings yet. Create some amazing tours to start receiving bookings!"
                  : `No ${activeTab} bookings found.`
                }
              </p>
            </div>
          )}
          </div>
        </div>
      </div>

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
      />
    </AppLayout>
  );
}
