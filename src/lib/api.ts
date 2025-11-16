import toast from 'react-hot-toast';
import { User } from '@/contexts/AuthContext';

const API_BASE_URL = 'http://localhost:4000/api';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface TravelerRegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  mobile?: string;
  city?: string;
}

export interface GuiderRegisterData {
  showcaseName: string;
  email: string;
  password: string;
  guiderType: string;
  mobile?: string;
  city?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface OtpVerificationData {
  email: string;
  otp: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

// Verification Steps Config Interface (from backend)
export interface VerificationFieldConfig {
  fieldName: string;
  fieldLabel: string;
  fieldType: 'text' | 'file' | 'video' | 'select';
  required: boolean;
  placeholder?: string;
  accept?: string; // For file inputs (e.g., 'image/*,.pdf')
}

export interface VerificationStepConfig {
  stepNumber: number;
  stepName: string;
  description: string;
  fields: VerificationFieldConfig[];
}

export interface VerificationStepsConfig {
  _id?: string;
  configName: string;
  steps: VerificationStepConfig[];
  isActive: boolean;
  version?: string;
}

// Verification Data from user (what they've filled)
export interface VerificationStepData {
  stepNumber: number;
  stepName: string;
  data?: Record<string, any>; // Dynamic field values keyed by fieldName
  completedAt?: string;
  uploadedAt?: string;
}

export interface VerificationData {
  steps?: VerificationStepData[];
}

// Update Verification Step DTO
export interface UpdateVerificationStepDto {
  step: number;
  data?: Record<string, any>; // Field values keyed by fieldName from config
}

export interface Plan {
  _id: string;
  guiderId: string;
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

class ApiService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    showToast: boolean = true
  ): Promise<ApiResponse<T>> {
    try {
      // Extract headers from options to merge them properly
      const { headers: optionsHeaders, ...restOptions } = options;
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...restOptions,
        headers: {
          'Content-Type': 'application/json',
          ...(optionsHeaders as Record<string, string> || {}),
        },
      });

      let data: any;
      try {
        const text = await response.text();
        data = text ? JSON.parse(text) : {};
      } catch (parseError) {
        // If JSON parsing fails, create error response
        const errorMessage = response.statusText || 'An error occurred';
        if (showToast) {
          toast.error(errorMessage);
        }
        return {
          success: false,
          message: errorMessage,
          error: 'JSON Parse Error',
        };
      }

      // Check if the response indicates an error, even if status is 200/201
      if (data.success === false || !response.ok) {
        // Extract error message from various possible locations in the response
        let errorMessage = data.message || data.error || response.statusText || 'An error occurred';
        
        // Handle array of errors (e.g., validation errors)
        if (!errorMessage || (data.errors && typeof data.errors !== 'string')) {
          if (data.errors) {
            errorMessage = Array.isArray(data.errors) 
              ? data.errors.map((e: any) => e.message || e).join(', ')
              : JSON.stringify(data.errors);
          }
        }
        
        // Ensure we have a valid error message
        if (!errorMessage || errorMessage === 'An error occurred') {
          // Try to get more details from the response
          if (data.message) {
            errorMessage = data.message;
          } else if (typeof data === 'string') {
            errorMessage = data;
          }
        }
        
        if (showToast) {
          toast.error(errorMessage, {
            duration: 5000, // Show for 5 seconds to ensure user sees it
          });
        }
        return {
          success: false,
          message: errorMessage,
          error: data.error || 'Unknown error',
        };
      }

      const successMessage = data.message || 'Success';
      if (showToast) {
        toast.success(successMessage);
      }
      
      // Return response with all top-level properties preserved (for auth responses with requiresVerification, requiresGuiderType, etc.)
      const apiResponse: ApiResponse<T> = {
        success: true,
        message: successMessage,
        data: data.data,
      };
      
      // Preserve special auth response properties
      if ('requiresVerification' in data) {
        (apiResponse as any).requiresVerification = data.requiresVerification;
      }
      if ('requiresGuiderType' in data) {
        (apiResponse as any).requiresGuiderType = data.requiresGuiderType;
      }
      if ('otpSent' in data) {
        (apiResponse as any).otpSent = data.otpSent;
      }
      
      return apiResponse;
    } catch (error) {
      const errorMessage = 'Network error occurred';
      if (showToast) {
        toast.error(errorMessage);
      }
      return {
        success: false,
        message: errorMessage,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Traveler Auth APIs
  async registerTraveler(data: TravelerRegisterData): Promise<ApiResponse> {
    return this.makeRequest('/auth/traveler/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async verifyTravelerOtp(data: OtpVerificationData): Promise<ApiResponse> {
    return this.makeRequest('/auth/traveler/verify-otp', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async resendTravelerOtp(email: string): Promise<ApiResponse> {
    return this.makeRequest('/auth/traveler/resend-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async loginTraveler(data: LoginData): Promise<ApiResponse> {
    return this.makeRequest('/auth/traveler/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Guider Auth APIs
  async registerGuider(data: GuiderRegisterData): Promise<ApiResponse> {
    return this.makeRequest('/auth/guider/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async verifyGuiderOtp(data: OtpVerificationData): Promise<ApiResponse> {
    return this.makeRequest('/auth/guider/verify-otp', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async resendGuiderOtp(email: string): Promise<ApiResponse> {
    return this.makeRequest('/auth/guider/resend-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async loginGuider(data: LoginData): Promise<ApiResponse> {
    return this.makeRequest('/auth/guider/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Google OAuth APIs
  async googleAuthTraveler(token: string): Promise<ApiResponse> {
    return this.makeRequest('/auth/traveler/google', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  async googleAuthGuider(token: string): Promise<ApiResponse> {
    return this.makeRequest('/auth/guider/google', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  async completeGoogleGuiderAuth(
    email: string,
    firstName: string,
    lastName: string,
    picture: string,
    guiderType: 'Professional' | 'Agency'
  ): Promise<ApiResponse> {
    return this.makeRequest('/auth/guider/google/complete', {
      method: 'POST',
      body: JSON.stringify({ email, firstName, lastName, picture, guiderType }),
    });
  }

  // Change Password (Protected)
  async changePassword(data: ChangePasswordData, token: string): Promise<ApiResponse> {
    return this.makeRequest('/auth/change-password', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
  }

  // User APIs (Protected)
  async getCurrentUser(token: string, userType?: 'traveler' | 'guider'): Promise<ApiResponse<User>> {
    // Use guides/me for guiders, users/me for travelers
    const endpoint = userType === 'guider' ? '/guides/me' : '/users/me';
    return this.makeRequest(endpoint, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }, false); // Don't show toast for user fetch
  }

  async updateGuiderProfile(guiderId: string, profileData: any, token: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/guides/${guiderId}/profile`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    });
  }

  async updateTravelerProfile(profileData: any, token: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/users/me`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });
  }

  async updateTravelerProfileImage(profileImageUrl: string, token: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/users/me/profile-picture`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ profileImageUrl }),
    });
  }

  async sendOtpForEmailUpdate(email: string, userType: 'traveler' | 'guider', token: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/auth/${userType}/resend-otp`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, actionType: 'email_update' }),
    });
  }

  async verifyOtpAndUpdateEmail(email: string, otp: string, userType: 'traveler' | 'guider', token: string): Promise<ApiResponse<any>> {
    // First verify OTP, then update email
    const verifyResponse = await this.makeRequest(`/auth/${userType}/verify-otp`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, otp }),
    }, false);

    if (!verifyResponse.success) {
      return verifyResponse;
    }

    // Email is already updated in the backend during OTP verification when token is provided
    // Return the verify response directly since the email update is handled in the backend
    return verifyResponse;
  }

  // Verification APIs (Public & Protected)
  async getVerificationStepsConfig(): Promise<ApiResponse<VerificationStepsConfig>> {
    return this.makeRequest('/guides/verification-steps-config', {
      method: 'GET',
    }, false); // Don't show toast for config fetch
  }

  async updateVerificationStep(
    guiderId: string,
    data: UpdateVerificationStepDto,
    token: string
  ): Promise<ApiResponse> {
    // All steps including step 4 can be submitted through guides endpoint
    // Step 4 will be submitted for admin review
    const endpoint = `/guides/${guiderId}/verification-step`;
    
    return this.makeRequest(endpoint, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
  }

  // Plans APIs (Protected)
  async createPlan(data: CreatePlanData, token: string): Promise<ApiResponse<Plan>> {
    return this.makeRequest('/plans', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
  }

  async getGuiderPlans(token: string, status?: string): Promise<ApiResponse<Plan[]>> {
    const url = status ? `/plans/guider/my-plans?status=${status}` : '/plans/guider/my-plans';
    return this.makeRequest(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async getGuiderStats(token: string): Promise<ApiResponse<GuiderStats>> {
    return this.makeRequest('/plans/guider/stats', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async getPlanById(planId: string): Promise<ApiResponse<Plan>> {
    return this.makeRequest(`/plans/${planId}`, {
      method: 'GET',
    });
  }

  async updatePlan(planId: string, data: Partial<CreatePlanData>, token: string): Promise<ApiResponse<Plan>> {
    return this.makeRequest(`/plans/${planId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
  }

  async updatePlanStep(planId: string, step: number, data: any, token: string): Promise<ApiResponse<Plan>> {
    return this.makeRequest(`/plans/${planId}/step`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ step, data }),
    });
  }

  async publishPlan(planId: string, token: string): Promise<ApiResponse<Plan>> {
    return this.makeRequest(`/plans/${planId}/publish`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async pausePlan(planId: string, token: string): Promise<ApiResponse<Plan>> {
    return this.makeRequest(`/plans/${planId}/pause`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async archivePlan(planId: string, token: string): Promise<ApiResponse<Plan>> {
    return this.makeRequest(`/plans/${planId}/archive`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async deletePlan(planId: string, token: string): Promise<ApiResponse> {
    return this.makeRequest(`/plans/${planId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async searchPlans(searchData: SearchPlansData): Promise<ApiResponse<{ plans: Plan[]; total: number; page: number; limit: number }>> {
    const params = new URLSearchParams();
    Object.entries(searchData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          params.append(key, value.join(','));
        } else {
          params.append(key, value.toString());
        }
      }
    });

    return this.makeRequest(`/plans/search?${params.toString()}`, {
      method: 'GET',
    });
  }

  async searchGuides(searchData: SearchGuidesData): Promise<ApiResponse<Guide[]>> {
    const params = new URLSearchParams();
    Object.entries(searchData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    return this.makeRequest(`/guides?${params.toString()}`, {
      method: 'GET',
    });
  }

  async updatePlanAvailability(planId: string, availability: Array<{ date: string; availableSlots: number }>, token: string): Promise<ApiResponse<Plan>> {
    return this.makeRequest(`/plans/${planId}/availability`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(availability),
    });
  }

  // Bookings APIs (Protected)
  async createBooking(data: CreateBookingData, token: string): Promise<ApiResponse<Booking>> {
    return this.makeRequest('/bookings', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
  }

  async getTravelerBookings(token: string, searchData?: SearchBookingsData): Promise<ApiResponse<{ bookings: Booking[]; total: number; page: number; limit: number }>> {
    const params = new URLSearchParams();
    if (searchData) {
      Object.entries(searchData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    const url = searchData ? `/bookings/traveler/my-bookings?${params.toString()}` : '/bookings/traveler/my-bookings';
    return this.makeRequest(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async getGuiderBookings(token: string, searchData?: SearchBookingsData): Promise<ApiResponse<{ bookings: Booking[]; total: number; page: number; limit: number }>> {
    const params = new URLSearchParams();
    if (searchData) {
      Object.entries(searchData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    const url = searchData ? `/bookings/guider/my-bookings?${params.toString()}` : '/bookings/guider/my-bookings';
    return this.makeRequest(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async getPendingConfirmations(token: string): Promise<ApiResponse<Booking[]>> {
    return this.makeRequest('/bookings/guider/pending-confirmations', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async getBookingStats(token: string): Promise<ApiResponse<BookingStats>> {
    return this.makeRequest('/bookings/guider/stats', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async getExistingBookingForPlan(planId: string, token: string): Promise<ApiResponse<Booking | null>> {
    return this.makeRequest(`/bookings/plan/${planId}/existing`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }, false); // Don't show toast for this check
  }

  async getBookingById(bookingId: string, token: string): Promise<ApiResponse<Booking>> {
    return this.makeRequest(`/bookings/${bookingId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async updateBooking(bookingId: string, data: Partial<Booking>, token: string): Promise<ApiResponse<Booking>> {
    return this.makeRequest(`/bookings/${bookingId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
  }

  async confirmBooking(bookingId: string, data: BookingConfirmationData, token: string): Promise<ApiResponse<Booking>> {
    return this.makeRequest(`/bookings/${bookingId}/confirm`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
  }

  async cancelBooking(bookingId: string, cancellationReason: string, token: string): Promise<ApiResponse<Booking>> {
    return this.makeRequest(`/bookings/${bookingId}/cancel`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ cancellationReason }),
    });
  }

  async addReview(bookingId: string, rating: number, review: string, token: string): Promise<ApiResponse<Booking>> {
    return this.makeRequest(`/bookings/${bookingId}/review`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ rating, review }),
    });
  }
}

export const apiService = new ApiService();
