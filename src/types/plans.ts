/**
 * Plans Types
 * Types related to tour plans and itineraries
 */

import type { Review } from './reviews';

export interface Plan {
  _id: string;
  guiderId: string | {
    _id: string;
    personalInfo?: {
      showcaseName?: string;
      profileImageUrl?: string;
    };
    tourGuideInfo?: {
      rating?: number;
      totalReviews?: number;
      aboutMe?: string;
      languagesSpoken?: string[];
    };
  };
  title: string;
  description: string;
  city: string;
  state: string;
  duration?: {
    value: number;
    unit: 'hours' | 'days';
  };
  itinerary?: Record<string, string[]>;
  pricing?: {
    pricePerPerson: number;
    currency: string;
    maxParticipants: number;
  };
  tourTypes?: string[];
  highlights?: string[];
  inclusions?: string[];
  exclusions?: string[];
  requirements?: string[];
  languages?: string[];
  gallery?: string[];
  meetingPoint?: string;
  meetingPointCoordinates?: {
    lat: number;
    lng: number;
  };
  vehicleDetails?: string;
  contactPersonName?: string;
  contactPersonPhone?: string;
  contactPersonEmail?: string;
  availability: {
    type: 'all_days' | 'recurring' | 'specific';
    recurring?: {
      daysOfWeek: string[];
      timeSlot?: {
        startTime?: string;
        endTime?: string;
      };
    };
    specific?: Array<{
      date: string;
      timeSlot?: {
        startTime?: string;
        endTime?: string;
      };
    }>;
  };
  status: 'draft' | 'published' | 'paused' | 'archived';
  totalBookings: number;
  totalRevenue: number;
  rating: number;
  totalReviews: number;
  isActive: boolean;
  cancellationPolicy?: string;
  termsAndConditions?: string;
  specialInstructions?: string;
  viewCount: number;
  bookingCount: number;
  reviews?: Review[];
  createdAt: string;
  updatedAt: string;
}

export interface CreatePlanData {
  title: string;
  description: string;
  city: string;
  state: string;
  duration?: {
    value: number;
    unit: 'hours' | 'days';
  };
  itinerary?: Record<string, string[]>;
  pricing?: {
    pricePerPerson: number;
    currency: string;
    maxParticipants: number;
  };
  availability?: {
    type: 'all_days' | 'recurring' | 'specific';
    recurring?: {
      daysOfWeek: string[];
      timeSlot?: {
        startTime?: string;
        endTime?: string;
      };
    };
    specific?: Array<{
      date: string;
      timeSlot?: {
        startTime?: string;
        endTime?: string;
      };
    }>;
  };
  tourTypes?: string[];
  highlights?: string[];
  inclusions?: string[];
  exclusions?: string[];
  requirements?: string[];
  languages?: string[];
  gallery?: string[];
  meetingPoint?: string;
  vehicleDetails?: string;
  contactPersonName?: string;
  contactPersonPhone?: string;
  contactPersonEmail?: string;
  cancellationPolicy?: string;
  termsAndConditions?: string;
  specialInstructions?: string;
}

export interface SearchPlansData {
  location?: string;
  fromDate?: string;
  toDate?: string;
  participants?: number;
  maxPrice?: number;
  tourTypes?: string[];
  page?: number;
  limit?: number;
}

