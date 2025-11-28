import { apiClient } from './api-client';
import type { ApiResponse } from './api-client';
import type { User } from '@/types';

/**
 * User/Profile API Service
 * Handles user profile and account management
 */
export class UsersService {
  /**
   * Get current user (traveler or guider)
   */
  async getCurrentUser(userType?: 'traveler' | 'guider'): Promise<ApiResponse<User>> {
    const endpoint = userType === 'guider' ? '/guides/me' : '/users/me';
    return apiClient.get<User>(endpoint);
  }

  /**
   * Update traveler profile
   */
  async updateTravelerProfile(profileData: any): Promise<ApiResponse<any>> {
    return apiClient.patch('/users/me', profileData, { showToast: true });
  }

  /**
   * Update traveler profile image
   */
  async updateTravelerProfileImage(profileImageUrl: string): Promise<ApiResponse<any>> {
    return apiClient.patch('/users/me/profile-picture', { profileImageUrl }, { showToast: true });
  }

  /**
   * Update guider profile
   */
  async updateGuiderProfile(guiderId: string, profileData: any): Promise<ApiResponse<any>> {
    return apiClient.patch(`/guides/${guiderId}/profile`, profileData, { showToast: true });
  }

  /**
   * Send OTP for email update
   */
  async sendOtpForEmailUpdate(
    email: string,
    userType: 'traveler' | 'guider'
  ): Promise<ApiResponse<any>> {
    return apiClient.post(
      `/auth/${userType}/resend-otp`,
      { email, actionType: 'email_update' },
      { showToast: true }
    );
  }

  /**
   * Verify OTP and update email
   */
  async verifyOtpAndUpdateEmail(
    email: string,
    otp: string,
    userType: 'traveler' | 'guider'
  ): Promise<ApiResponse<any>> {
    // First verify OTP, then update email
    const verifyResponse = await apiClient.post(
      `/auth/${userType}/verify-otp`,
      { email, otp }
    );

    if (!verifyResponse.success) {
      return verifyResponse;
    }

    // Email is already updated in the backend during OTP verification when token is provided
    return verifyResponse;
  }
}

export const usersService = new UsersService();

