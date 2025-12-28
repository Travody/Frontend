/**
 * Authentication Types
 * Types related to user authentication and authorization
 */

export interface TravelerRegisterData {
  firstName: string;
  lastName?: string;
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
  oldPassword: string;
  newPassword: string;
}

export interface ForgotPasswordData {
  email: string;
  userType: 'traveler' | 'guider';
}

export interface ResetPasswordData {
  email: string;
  otp: string;
  newPassword: string;
  userType: 'traveler' | 'guider';
}

