import { apiClient } from './client';
import type { ApiResponse } from './client';
import type {
  TravelerRegisterData,
  GuiderRegisterData,
  LoginData,
  OtpVerificationData,
  ChangePasswordData,
  ForgotPasswordData,
  ResetPasswordData,
} from '@/types';

/**
 * Authentication API Service
 * Handles all authentication-related API calls
 */
export class AuthService {
  // ==================== Traveler Auth ====================
  
  /**
   * Register a new traveler
   */
  async registerTraveler(data: TravelerRegisterData): Promise<ApiResponse> {
    return apiClient.post('/auth/traveler/register', data, { skipAuth: true, showToast: true });
  }

  /**
   * Verify traveler OTP
   */
  async verifyTravelerOtp(data: OtpVerificationData): Promise<ApiResponse> {
    return apiClient.post('/auth/traveler/verify-otp', data, { skipAuth: true });
  }

  /**
   * Resend traveler OTP
   */
  async resendTravelerOtp(email: string): Promise<ApiResponse> {
    return apiClient.post('/auth/traveler/resend-otp', { email }, { skipAuth: true, showToast: true });
  }

  /**
   * Login traveler
   */
  async loginTraveler(data: LoginData): Promise<ApiResponse> {
    return apiClient.post('/auth/traveler/login', data, { skipAuth: true });
  }

  // ==================== Guider Auth ====================
  
  /**
   * Register a new guider
   */
  async registerGuider(data: GuiderRegisterData): Promise<ApiResponse> {
    return apiClient.post('/auth/guider/register', data, { skipAuth: true, showToast: true });
  }

  /**
   * Verify guider OTP
   */
  async verifyGuiderOtp(data: OtpVerificationData): Promise<ApiResponse> {
    return apiClient.post('/auth/guider/verify-otp', data, { skipAuth: true });
  }

  /**
   * Resend guider OTP
   */
  async resendGuiderOtp(email: string): Promise<ApiResponse> {
    return apiClient.post('/auth/guider/resend-otp', { email }, { skipAuth: true, showToast: true });
  }

  /**
   * Login guider
   */
  async loginGuider(data: LoginData): Promise<ApiResponse> {
    return apiClient.post('/auth/guider/login', data, { skipAuth: true });
  }

  // ==================== Google OAuth ====================
  
  /**
   * Google OAuth for traveler
   */
  async googleAuthTraveler(token: string): Promise<ApiResponse> {
    return apiClient.post('/auth/traveler/google', { token }, { skipAuth: true });
  }

  /**
   * Google OAuth for guider
   */
  async googleAuthGuider(token: string): Promise<ApiResponse> {
    return apiClient.post('/auth/guider/google', { token }, { skipAuth: true });
  }

  /**
   * Complete Google OAuth for guider (when guider type is required)
   */
  async completeGoogleGuiderAuth(
    email: string,
    firstName: string,
    lastName: string,
    picture: string,
    guiderType: 'Professional' | 'Agency'
  ): Promise<ApiResponse> {
    return apiClient.post(
      '/auth/guider/google/complete',
      { email, firstName, lastName, picture, guiderType },
      { skipAuth: true }
    );
  }

  // ==================== Password Management ====================
  
  /**
   * Change password (requires authentication)
   */
  async changePassword(data: ChangePasswordData): Promise<ApiResponse> {
    return apiClient.post('/auth/change-password', data, { showToast: true });
  }

  /**
   * Request password reset (forgot password)
   */
  async forgotPassword(data: ForgotPasswordData): Promise<ApiResponse> {
    return apiClient.post('/auth/forgot-password', data, { skipAuth: true, showToast: true });
  }

  /**
   * Reset password with OTP
   */
  async resetPassword(data: ResetPasswordData): Promise<ApiResponse> {
    return apiClient.post('/auth/reset-password', data, { skipAuth: true, showToast: true });
  }
}

export const authService = new AuthService();

