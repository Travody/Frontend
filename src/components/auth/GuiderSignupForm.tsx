'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Mail, Lock, Phone, MapPin, Eye, EyeOff, ChevronDown } from 'lucide-react';
import { apiService } from '@/lib/api';
import OtpVerification from './OtpVerification';

export default function GuiderSignupForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [formData, setFormData] = useState({
    showcaseName: '',
    email: '',
    password: '',
    guiderType: 'Professional',
    mobile: '',
    city: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await apiService.registerGuider(formData);
      if (response.success) {
        setShowOtpVerification(true);
      }
    } catch (error) {
      // Error handling is now done by the API service with toaster
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSuccess = () => {
    // Redirect to verification page after successful OTP verification
    router.push('/guider/verification');
  };

  if (showOtpVerification) {
    return (
      <OtpVerification
        email={formData.email}
        userType="guider"
        onVerificationSuccess={handleOtpSuccess}
        onBack={() => setShowOtpVerification(false)}
      />
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Guider Account</h1>
        <p className="text-gray-600 mb-8">
          Already have an account?{' '}
          <Link href="/auth/guider/login" className="text-primary-600 hover:text-primary-700 font-medium">
            Login
          </Link>
        </p>


        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Showcase Name*
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.showcaseName}
                onChange={(e) => setFormData({ ...formData, showcaseName: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                required
                suppressHydrationWarning
              />
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email address*
            </label>
            <div className="relative">
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                required
                suppressHydrationWarning
              />
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password*
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-10 pr-12 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                required
                suppressHydrationWarning
              />
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                suppressHydrationWarning
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5 text-gray-400" />
                ) : (
                  <Eye className="w-5 h-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Guider Type*
            </label>
            <div className="relative">
              <select
                value={formData.guiderType}
                onChange={(e) => setFormData({ ...formData, guiderType: e.target.value })}
                className="w-full pl-10 pr-10 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none text-gray-900"
                required
                suppressHydrationWarning
              >
                <option value="Professional">Professional</option>
                <option value="Agency">Agency</option>
              </select>
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mobile Number
            </label>
            <div className="relative">
              <input
                type="tel"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                suppressHydrationWarning
              />
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                suppressHydrationWarning
              />
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary-500 text-white py-3 px-6 rounded-lg hover:bg-primary-600 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            suppressHydrationWarning
          >
            {isLoading ? 'Creating Account...' : 'Sign up'}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or Continue with</span>
            </div>
          </div>

          <button
            type="button"
            className="w-full border border-primary-300 text-primary-600 py-3 px-6 rounded-lg hover:bg-primary-50 transition-colors font-semibold flex items-center justify-center"
            suppressHydrationWarning
          >
            <span className="mr-2">G</span>
            SignUp with Google
          </button>

          <p className="text-center text-gray-600">
            Want to travel?{' '}
            <Link href="/auth/traveler/signup" className="text-primary-600 hover:text-primary-700 font-medium">
              create traveler account
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

