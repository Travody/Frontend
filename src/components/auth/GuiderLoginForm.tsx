'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { apiService } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import OtpVerification from './OtpVerification';
import GuiderTypeDialog from './GuiderTypeDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function GuiderLoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [showGuiderTypeDialog, setShowGuiderTypeDialog] = useState(false);
  const [pendingGoogleAuth, setPendingGoogleAuth] = useState<{
    email: string;
    firstName: string;
    lastName: string;
    picture: string;
  } | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await apiService.loginGuider(formData);
      
      if (response.success) {
        // Check if verification is required
        if ((response as any).requiresVerification && response.data) {
          setShowOtpVerification(true);
          return;
        }

        if (response.data?.token && response.data) {
          const userData = {
            id: response.data.id,
            email: response.data.email,
            showcaseName: response.data.showcaseName,
            userType: 'guider' as const,
            city: response.data.city,
            guiderType: response.data.guiderType,
            overview: response.data.overview,
            isVerified: response.data.isVerified,
            tourPoints: response.data.tourPoints,
            badges: response.data.badges,
            currentVerificationStep: response.data.currentVerificationStep,
            verificationData: response.data.verificationData,
            emailVerified: response.data.emailVerified,
            accountVerified: response.data.accountVerified
          };
          
          login(userData, response.data.token);
          router.push('/guider/dashboard');
        }
      }
    } catch (error) {
      // Error handling is done by the API service with toaster
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setShowOtpVerification(false);
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    if (!credentialResponse.credential) return;
    
    setIsLoading(true);
    try {
      const response = await apiService.googleAuthGuider(credentialResponse.credential);
      
      if (response.success) {
        if ((response as any).requiresGuiderType && response.data) {
          setPendingGoogleAuth({
            email: response.data.email,
            firstName: response.data.firstName,
            lastName: response.data.lastName,
            picture: response.data.picture || '',
          });
          setShowGuiderTypeDialog(true);
          setIsLoading(false);
          return;
        }

        if (response.data?.token && response.data) {
          const userData = {
            id: response.data.id,
            email: response.data.email,
            showcaseName: response.data.showcaseName,
            userType: 'guider' as const,
            city: response.data.city,
            guiderType: response.data.guiderType,
            overview: response.data.overview,
            isVerified: response.data.emailVerified,
            tourPoints: response.data.tourPoints,
            badges: response.data.badges,
            currentVerificationStep: response.data.currentVerificationStep,
            verificationData: response.data.verificationData,
            emailVerified: response.data.emailVerified,
            accountVerified: response.data.accountVerified
          };
          
          login(userData, response.data.token);
          router.push('/guider/dashboard');
        }
      }
    } catch (error) {
      // Error handling is done by API service
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuiderTypeSelect = async (guiderType: 'Professional' | 'Agency') => {
    if (!pendingGoogleAuth) return;

    setIsLoading(true);
    setShowGuiderTypeDialog(false);

    try {
      const response = await apiService.completeGoogleGuiderAuth(
        pendingGoogleAuth.email,
        pendingGoogleAuth.firstName,
        pendingGoogleAuth.lastName,
        pendingGoogleAuth.picture,
        guiderType
      );

      if (response.success && response.data?.token && response.data) {
        const userData = {
          id: response.data.id,
          email: response.data.email,
          showcaseName: response.data.showcaseName,
          userType: 'guider' as const,
          city: response.data.city,
          guiderType: response.data.guiderType,
          overview: response.data.overview,
          isVerified: response.data.emailVerified,
          tourPoints: response.data.tourPoints,
          badges: response.data.badges,
          currentVerificationStep: response.data.currentVerificationStep,
          verificationData: response.data.verificationData,
          emailVerified: response.data.emailVerified,
          accountVerified: response.data.accountVerified
        };
        
        login(userData, response.data.token);
        router.push('/guider/verification');
      }
    } catch (error) {
      // Error handling is done by API service
    } finally {
      setIsLoading(false);
      setPendingGoogleAuth(null);
    }
  };

  const handleGuiderTypeCancel = () => {
    setShowGuiderTypeDialog(false);
    setPendingGoogleAuth(null);
    setIsLoading(false);
  };

  const handleGoogleError = () => {
    // Error handling is done by API service
  };

  if (showOtpVerification) {
    return (
      <OtpVerification
        email={formData.email}
        userType="guider"
        onVerificationSuccess={() => {}}
        onBack={handleBackToLogin}
      />
    );
  }

  return (
    <>
      <GuiderTypeDialog
        isOpen={showGuiderTypeDialog}
        onClose={handleGuiderTypeCancel}
        onSelect={handleGuiderTypeSelect}
      />
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Welcome back, Guide</CardTitle>
            <CardDescription>
              Don't have an account?{' '}
              <Link href="/auth/guider/signup" className="text-primary-600 hover:text-primary-700 font-medium">
                Sign up
              </Link>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter your email"
                    className="pl-10"
                    required
                    suppressHydrationWarning
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/auth/guider/forgot-password"
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Enter your password"
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

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full"
                suppressHydrationWarning
              >
                {isLoading ? 'Logging in...' : 'Log In'}
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
                    text="signin_with"
                    shape="rectangular"
                    logo_alignment="left"
                  />
                </div>
              )}

              <p className="text-center text-sm text-muted-foreground">
                Not a guider?{' '}
                <Link href="/auth/traveler/login" className="text-primary-600 hover:text-primary-700 font-medium">
                  Login as Traveler
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
