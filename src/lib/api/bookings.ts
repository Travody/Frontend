import { apiClient } from './api-client';
import type { ApiResponse } from './api-client';
import type {
  Booking,
  CreateBookingData,
  SearchBookingsData,
  BookingConfirmationData,
  BookingStats,
} from '@/types';

/**
 * Bookings API Service
 * Handles all booking-related operations
 */
export class BookingsService {
  /**
   * Create a new booking
   */
  async createBooking(data: CreateBookingData): Promise<ApiResponse<Booking>> {
    return apiClient.post<Booking>('/bookings', data, { showToast: true });
  }

  /**
   * Get booking by ID
   */
  async getBookingById(bookingId: string): Promise<ApiResponse<Booking>> {
    return apiClient.get<Booking>(`/bookings/${bookingId}`);
  }

  /**
   * Get traveler's bookings
   */
  async getTravelerBookings(
    searchData?: SearchBookingsData
  ): Promise<ApiResponse<{ bookings: Booking[]; total: number; page: number; limit: number }>> {
    const queryString = searchData ? apiClient.buildQueryString(searchData) : '';
    const url = searchData 
      ? `/bookings/traveler/my-bookings?${queryString}` 
      : '/bookings/traveler/my-bookings';
    return apiClient.get<{ bookings: Booking[]; total: number; page: number; limit: number }>(url);
  }

  /**
   * Get guider's bookings
   */
  async getGuiderBookings(
    searchData?: SearchBookingsData
  ): Promise<ApiResponse<{ bookings: Booking[]; total: number; page: number; limit: number }>> {
    const queryString = searchData ? apiClient.buildQueryString(searchData) : '';
    const url = searchData 
      ? `/bookings/guider/my-bookings?${queryString}` 
      : '/bookings/guider/my-bookings';
    return apiClient.get<{ bookings: Booking[]; total: number; page: number; limit: number }>(url);
  }

  /**
   * Get pending confirmations for guider
   */
  async getPendingConfirmations(): Promise<ApiResponse<Booking[]>> {
    return apiClient.get<Booking[]>('/bookings/guider/pending-confirmations');
  }

  /**
   * Get booking statistics for guider
   */
  async getBookingStats(): Promise<ApiResponse<BookingStats>> {
    return apiClient.get<BookingStats>('/bookings/guider/stats');
  }

  /**
   * Get existing booking for a plan
   */
  async getExistingBookingForPlan(planId: string): Promise<ApiResponse<Booking | null>> {
    return apiClient.get<Booking | null>(
      `/bookings/plan/${planId}/existing`
    );
  }

  /**
   * Update booking
   */
  async updateBooking(bookingId: string, data: Partial<Booking>): Promise<ApiResponse<Booking>> {
    return apiClient.patch<Booking>(`/bookings/${bookingId}`, data, { showToast: true });
  }

  /**
   * Confirm or cancel booking (guider action)
   */
  async confirmBooking(
    bookingId: string,
    data: BookingConfirmationData
  ): Promise<ApiResponse<Booking>> {
    return apiClient.patch<Booking>(`/bookings/${bookingId}/confirm`, data, { showToast: true });
  }

  /**
   * Cancel booking
   */
  async cancelBooking(bookingId: string, cancellationReason: string): Promise<ApiResponse<Booking>> {
    return apiClient.patch<Booking>(`/bookings/${bookingId}/cancel`, { cancellationReason }, { showToast: true });
  }
}

export const bookingsService = new BookingsService();

