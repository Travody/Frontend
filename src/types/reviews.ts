/**
 * Reviews Types
 * Types related to reviews and ratings
 */

import type { Plan } from './plans';

export interface Review {
  _id: string;
  reviewType: 'booking' | 'guider';
  bookingId: string | {
    _id: string;
    bookingDetails?: {
      date?: string;
      startTime?: string;
      numberOfParticipants?: number;
    };
  };
  planId: string | Plan | {
    _id: string;
    title?: string;
    city?: string;
    state?: string;
    gallery?: string[];
  };
  travelerId: string | {
    _id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    profileImageUrl?: string;
  };
  guiderId: string | {
    _id: string;
    personalInfo?: {
      showcaseName?: string;
      profileImageUrl?: string;
    };
  };
  rating: number;
  comment?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewData {
  reviewType: 'booking' | 'guider';
  bookingId: string;
  rating: number;
  comment?: string;
}

export interface ReviewEligibility {
  canReview: boolean;
  canReviewBooking: boolean;
  canReviewGuider: boolean;
  bookingReview: Review | null;
  guiderReview: Review | null;
  reason?: string;
}

