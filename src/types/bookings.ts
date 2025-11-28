/**
 * Bookings Types
 * Types related to bookings and reservations
 */

import type { Plan } from './plans';

export interface TravelerInfo {
  id: string;
  name: string;
  email: string;
  phone: string;
  emergencyContact?: string;
}

export interface BookingDetails {
  date: string;
  startTime?: string;
  numberOfParticipants: number;
  isGroupBooking: boolean;
  groupName?: string;
  groupSize?: number;
}

export interface FinancialInfo {
  totalAmount: number;
  currency: string;
  isPaid: boolean;
  paymentId?: string;
  paymentMethod?: string;
  paidAt?: string;
  isRefunded: boolean;
  refundAmount?: number;
  refundStatus?: 'pending' | 'processed' | 'failed';
  refundProcessedAt?: string;
  refundedAt?: string;
}

export interface StatusInfo {
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'rejected';
  guiderConfirmation: 'pending' | 'confirmed' | 'cancelled';
  guiderConfirmationAt?: string;
  guiderConfirmationMessage?: string;
}

export interface CancellationInfo {
  reason?: string;
  cancelledAt?: string;
  cancelledBy?: string;
}

export interface TravelerPreferences {
  specialRequests?: string;
  dietaryRestrictions?: string;
  accessibilityNeeds?: string;
  additionalNotes?: string[];
  preferredLanguages?: string[];
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced';
  travelStyle?: 'budget' | 'comfort' | 'luxury';
}

export interface ReviewInfo {
  isReviewed: boolean;
  rating?: number;
  review?: string;
  reviewedAt?: string;
}

export interface TimelineInfo {
  bookingExpiresAt?: string;
  bookingExpiryHours: number;
  confirmationDeadline?: string;
  confirmationDeadlineHours: number;
  completedAt?: string;
}

export interface CommunicationInfo {
  emailNotificationsSent: number;
  lastNotificationSent?: string;
  reminderSentAt?: string;
}

export interface BookingMetadata {
  bookingSource?: string;
  userAgent?: string;
  ipAddress?: string;
}

export interface Booking {
  _id: string;
  planId: string | Plan;
  guiderId: string | any;
  traveler: TravelerInfo;
  bookingDetails: BookingDetails;
  financial: FinancialInfo;
  status: StatusInfo;
  cancellation?: CancellationInfo;
  preferences?: TravelerPreferences;
  review?: ReviewInfo;
  timeline?: TimelineInfo;
  communication?: CommunicationInfo;
  metadata?: BookingMetadata;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingData {
  planId: string;
  travelerName: string;
  travelerEmail: string;
  travelerPhone: string;
  bookingDate: string;
  startTime?: string;
  numberOfParticipants: number;
  specialRequests?: string;
  emergencyContact?: string;
  dietaryRestrictions?: string;
  accessibilityNeeds?: string;
  preferredLanguages?: string[];
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced';
  travelStyle?: 'budget' | 'comfort' | 'luxury';
  isGroupBooking?: boolean;
  groupName?: string;
  bookingSource?: string;
}

export interface SearchBookingsData {
  bookingDate?: string;
  status?: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'rejected';
  guiderConfirmation?: 'pending' | 'confirmed' | 'cancelled';
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface BookingConfirmationData {
  decision: 'confirmed' | 'cancelled';
  message?: string;
  cancellationReason?: string;
}

export interface BookingStats {
  totalBookings: number;
  confirmedBookings: number;
  pendingBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  averageRating: number;
  totalReviews: number;
}

