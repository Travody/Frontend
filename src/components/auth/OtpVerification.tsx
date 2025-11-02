'use client';

import { useState, useEffect } from 'react';
import { apiService, OtpVerificationData } from '@/lib/api';
import { Mail, ArrowLeft, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface OtpVerificationProps {
  email: string;
  userType: 'traveler' | 'guider';
  onVerificationSuccess: () => void;
  onBack: () => void;
}

export default function OtpVerification({
  email,
  userType,
  onVerificationSuccess,
  onBack,
}: OtpVerificationProps) {
  const { login } = useAuth();
  const router = useRouter();
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = userType === 'traveler'
        ? await apiService.verifyTravelerOtp({ email, otp })
        : await apiService.verifyGuiderOtp({ email, otp });

      if (response.success && response.data) {
        // Store authentication data
        const userData = {
          id: response.data.id,
          email: response.data.email,
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          showcaseName: response.data.showcaseName,
          userType: userType,
          city: response.data.city,
          guiderType: response.data.guiderType,
          overview: response.data.overview,
          isVerified: response.data.isVerified,
          tourPoints: response.data.tourPoints,
          badges: response.data.badges,
          verificationStep: response.data.verificationStep,
          currentVerificationStep: response.data.currentVerificationStep,
          verificationData: response.data.verificationData,
          emailVerified: response.data.emailVerified,
          accountVerified: response.data.accountVerified,
          approvalStatus: response.data.approvalStatus,
        };

        // Login the user with the token
        login(userData, response.data.token);

        setSuccess('Email verified successfully! Redirecting to dashboard...');
        
        // Redirect to appropriate dashboard after a short delay
        setTimeout(() => {
          if (userType === 'guider') {
            router.push('/guider/dashboard');
          } else {
            router.push('/');
          }
        }, 1500);
      } else {
        setError(response.message || 'Invalid OTP. Please try again.');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsResending(true);
    setError('');

    try {
      const response = userType === 'traveler'
        ? await apiService.resendTravelerOtp(email)
        : await apiService.resendGuiderOtp(email);

      if (response.success) {
        setSuccess('OTP sent successfully!');
        setCountdown(60);
      } else {
        setError(response.message || 'Failed to resend OTP');
      }
    } catch (error) {
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center mb-6">
          <button
            onClick={onBack}
            className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Verify Email</h1>
            <p className="text-gray-600">We've sent a verification code to</p>
            <p className="text-primary-600 font-medium">{email}</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
            {success}
          </div>
        )}

        <form onSubmit={handleVerifyOtp} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter 6-digit OTP*
            </label>
            <div className="relative">
              <input
                type="text"
                value={otp}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setOtp(value);
                }}
                className="w-full pl-10 pr-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 placeholder-gray-500 text-center text-2xl tracking-widest"
                placeholder="000000"
                maxLength={6}
                required
              />
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || otp.length !== 6}
            className="w-full bg-primary-500 text-white py-3 px-6 rounded-lg hover:bg-primary-600 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Verifying...' : 'Verify Email'}
          </button>

          <div className="text-center">
            <p className="text-gray-600 mb-2">
              Didn't receive the code?
            </p>
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={isResending || countdown > 0}
              className="text-primary-600 hover:text-primary-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto"
            >
              {isResending ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : countdown > 0 ? (
                `Resend in ${countdown}s`
              ) : (
                'Resend OTP'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
