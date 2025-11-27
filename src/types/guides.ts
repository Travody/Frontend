/**
 * Guides Types
 * Types related to guides and guider information
 */

export interface Guide {
  _id: string;
  showcaseName: string;
  email: string;
  mobile?: string;
  city?: string;
  guiderType?: string;
  overview?: string;
  isVerified?: boolean;
  accountVerified?: boolean;
  tourPoints?: number;
  badges?: string[];
  rating?: number;
  totalReviews?: number;
  personalInfo?: {
    city?: string;
    state?: string;
  };
}

export interface SearchGuidesData {
  location?: string;
  guiderType?: string;
  isVerified?: boolean;
  accountVerified?: boolean;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
}

export interface GuiderStats {
  totalPlans: number;
  publishedPlans: number;
  totalBookings: number;
  totalRevenue: number;
  averageRating: number;
}

