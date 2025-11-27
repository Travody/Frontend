import { apiClient } from './client';
import type { ApiResponse } from './client';
import type {
  Review,
  CreateReviewData,
  ReviewEligibility,
} from '@/types';

/**
 * Reviews API Service
 * Handles all review-related operations
 */
export class ReviewsService {
  /**
   * Create a review
   */
  async createReview(data: CreateReviewData): Promise<ApiResponse<Review>> {
    return apiClient.post<Review>('/reviews', data, { showToast: true });
  }

  /**
   * Update a review
   */
  async updateReview(
    reviewId: string,
    rating: number,
    comment: string
  ): Promise<ApiResponse<Review>> {
    return apiClient.put<Review>(`/reviews/${reviewId}`, { rating, comment }, { showToast: true });
  }

  /**
   * Delete a review
   */
  async deleteReview(reviewId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/reviews/${reviewId}`, { showToast: true });
  }

  /**
   * Get reviews by plan
   */
  async getReviewsByPlan(
    planId: string,
    reviewType?: 'booking' | 'guider'
  ): Promise<ApiResponse<Review[]>> {
    const query = reviewType ? `?reviewType=${reviewType}` : '';
    return apiClient.get<Review[]>(`/reviews/plan/${planId}${query}`, { skipAuth: true });
  }

  /**
   * Get reviews by guider
   */
  async getReviewsByGuider(
    guiderId: string,
    reviewType?: 'booking' | 'guider'
  ): Promise<ApiResponse<Review[]>> {
    const query = reviewType ? `?reviewType=${reviewType}` : '';
    return apiClient.get<Review[]>(`/reviews/guider/${guiderId}${query}`, { skipAuth: true });
  }

  /**
   * Get traveler's reviews
   */
  async getMyReviews(reviewType?: 'booking' | 'guider'): Promise<ApiResponse<Review[]>> {
    const query = reviewType ? `?reviewType=${reviewType}` : '';
    return apiClient.get<Review[]>(`/reviews/traveler/my-reviews${query}`);
  }

  /**
   * Get reviews by booking
   */
  async getReviewsByBooking(
    bookingId: string,
    reviewType?: 'booking' | 'guider'
  ): Promise<ApiResponse<Review[]>> {
    const query = reviewType ? `?reviewType=${reviewType}` : '';
    return apiClient.get<Review[]>(`/reviews/booking/${bookingId}${query}`);
  }

  /**
   * Check if user can review a booking
   */
  async canUserReview(bookingId: string): Promise<ApiResponse<ReviewEligibility>> {
    return apiClient.get<ReviewEligibility>(`/reviews/can-review/${bookingId}`);
  }

  /**
   * Legacy method for backward compatibility
   * @deprecated Use createReview instead
   */
  async addReview(
    bookingId: string,
    rating: number,
    review: string
  ): Promise<ApiResponse<Review>> {
    return this.createReview({
      reviewType: 'booking',
      bookingId,
      rating,
      comment: review,
    });
  }
}

export const reviewsService = new ReviewsService();

