/**
 * API Services Index
 * 
 * Centralized export for all API services
 * 
 * Usage:
 *   import { authService, plansService, ApiResponse } from '@/lib/api';
 *   import type { Plan, Booking } from '@/types';
 */

// Export API client
export { apiClient, ApiClient, getApiBaseUrl } from './api-client';
export type { ApiResponse, RequestOptions } from './api-client';

// Export all services
export { authService, AuthService } from './auth';
export { usersService, UsersService } from './users';
export { guidesService, GuidesService } from './guides';
export { plansService, PlansService } from './plans';
export { bookingsService, BookingsService } from './bookings';
export { reviewsService, ReviewsService } from './reviews';
export { uploadService, UploadService } from './upload';

