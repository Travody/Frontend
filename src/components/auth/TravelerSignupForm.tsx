'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Mail, Lock, Phone, MapPin, Eye, EyeOff } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { apiService } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import OtpVerification from './OtpVerification';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function TravelerSignupForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    mobile: '',
    city: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await apiService.registerTraveler(formData);
      
      if (response.success) {
        setShowOtpVerification(true);
      }
    } catch (error) {
      // Error handling is done by the API service with toaster
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToSignup = () => {
    setShowOtpVerification(false);
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    if (!credentialResponse.credential) return;
    
    setIsLoading(true);
    try {
      const response = await apiService.googleAuthTraveler(credentialResponse.credential);
      
      if (response.success && response.data?.token && response.data) {
        const userData = {
          id: response.data.id,
          email: response.data.email,
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          userType: 'traveler' as const,
          city: response.data.city,
          mobile: response.data.mobile,
        };
        
        login(userData, response.data.token);
        router.push('/');
      }
    } catch (error) {
      // Error handling is done by API service
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    // Error handling is done by API service
  };

  if (showOtpVerification) {
    return (
      <OtpVerification
        email={formData.email}
        userType="traveler"
        onVerificationSuccess={() => {}}
        onBack={handleBackToSignup}
      />
    );
  }

  return (
    <div className="w-full max-w-md">
      <Card className="border-0 shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Create your account</CardTitle>
          <CardDescription>
            Already have an account?{' '}
            <Link href="/auth/traveler/login" className="text-primary-600 hover:text-primary-700 font-medium">
              Log in
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="John"
                    className="pl-10"
                    required
                    suppressHydrationWarning
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="Doe"
                    className="pl-10"
                    required
                    suppressHydrationWarning
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="you@example.com"
                  className="pl-10"
                  required
                  suppressHydrationWarning
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Create a password"
                  className="pl-10 pr-10"
                  required
                  suppressHydrationWarning
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  suppressHydrationWarning
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile Number (Optional)</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="mobile"
                  type="tel"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  placeholder="+91 1234567890"
                  className="pl-10"
                  suppressHydrationWarning
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City (Optional)</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="city"
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Mumbai"
                  className="pl-10"
                  suppressHydrationWarning
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full"
              suppressHydrationWarning
            >
              {isLoading ? 'Creating Account...' : 'Sign up'}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
              <div className="w-full [&>div]:w-full [&>div>div]:w-full [&>div>div]:min-h-[40px] [&>div>div]:rounded-md [&>div>div]:border [&>div>div]:border-input [&>div>div]:bg-background [&>div>div]:shadow-sm [&>div>div]:transition-colors [&>div>div:hover]:bg-accent [&>div>div:hover]:text-accent-foreground">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  useOneTap={false}
                  theme="outline"
                  size="large"
                  text="signup_with"
                  shape="rectangular"
                  logo_alignment="left"
                />
              </div>
            )}

            <p className="text-center text-sm text-muted-foreground">
              Looking to guide travelers?{' '}
              <Link href="/auth/guider/signup" className="text-primary-600 hover:text-primary-700 font-medium">
                Become a guide
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
