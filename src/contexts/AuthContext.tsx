'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface VerificationStep {
  id: string;
  name: string;
  status: 'completed' | 'current' | 'pending';
  description?: string;
}

export interface VerificationStepData {
  stepNumber: number;
  stepName: string;
  data?: Record<string, any>;
  completedAt?: string;
  uploadedAt?: string;
}

export interface VerificationData {
  steps?: VerificationStepData[];
}

// Base user interface with common fields
interface BaseUser {
  id: string;
  email: string;
  mobile?: string;
  tourPoints?: number;
  badges?: string[];
}

// Traveler-specific user interface
export interface TravelerUser extends BaseUser {
  userType: 'traveler';
  firstName: string;
  lastName?: string;
  city?: string;
  isVerified?: boolean;
  // Travel preferences
  travelStyle?: 'Adventure' | 'Cultural' | 'Relaxation' | 'Wildlife';
  preferredCategories?: string[];
  travelPreferences?: string;
  profileImageUrl?: string;
}

// Guider-specific user interface
export interface GuiderUser extends BaseUser {
  userType: 'guider';
  showcaseName: string;
  guiderType: 'Professional' | 'Agency';
  city?: string;
  overview?: string;
  emailVerified?: boolean;
  accountVerified?: boolean;
  // Verification structure
  currentVerificationStep?: number;
  verificationData?: VerificationData;
  // Personal info (when fetched from API)
  personalInfo?: {
    showcaseName: string;
    fullName?: string;
    city?: string;
    overview?: string;
    languagesKnown?: string[];
    education?: string;
    awards?: string[];
  };
}

// Union type for user
export type User = TravelerUser | GuiderUser;

// Type guard functions for better type safety
export function isTravelerUser(user: User): user is TravelerUser {
  return user.userType === 'traveler';
}

export function isGuiderUser(user: User): user is GuiderUser {
  return user.userType === 'guider';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  refreshUser: (userData: User) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for stored auth data on mount
    const storedToken = localStorage.getItem('authToken');
    const storedUserType = localStorage.getItem('userType');
    const storedUserData = localStorage.getItem('userData');

    if (storedToken && storedUserType && storedUserData) {
      try {
        const userData = JSON.parse(storedUserData);
        setUser(userData);
        setToken(storedToken);
      } catch (error) {
        // Clear invalid data
        localStorage.removeItem('authToken');
        localStorage.removeItem('userType');
        localStorage.removeItem('userData');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (userData: User, authToken: string) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('authToken', authToken);
    localStorage.setItem('userType', userData.userType);
    localStorage.setItem('userData', JSON.stringify(userData));
  };

  const logout = () => {
    // Get userType before clearing to determine redirect path
    const userType = localStorage.getItem('userType');
    
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('userType');
    localStorage.removeItem('userData');
    
    // Redirect to respective login page based on user type
    if (userType === 'traveler') {
      router.push('/auth/traveler/login');
    } else if (userType === 'guider') {
      router.push('/auth/guider/login');
    } else {
      // Fallback to home page if userType is unknown
      router.push('/');
    }
  };

  const refreshUser = useCallback((userData: any) => {
    // Normalize user data: ensure id field exists (convert _id to id if needed)
    const normalizedUser: any = {
      ...userData,
      id: userData._id || userData.id,
    };
    
    // Remove _id if it exists to avoid confusion
    if ('_id' in normalizedUser) {
      delete normalizedUser._id;
    }
    
    // Preserve userType from existing user if not in new data
    // The backend doesn't return userType, so we need to preserve it
    setUser((currentUser) => {
      if (!normalizedUser.userType && currentUser?.userType) {
        normalizedUser.userType = currentUser.userType;
      }
      // If still no userType, determine from stored localStorage
      if (!normalizedUser.userType) {
        const storedUserType = localStorage.getItem('userType');
        if (storedUserType === 'guider' || storedUserType === 'traveler') {
          normalizedUser.userType = storedUserType as 'guider' | 'traveler';
        }
      }
      localStorage.setItem('userData', JSON.stringify(normalizedUser));
      return normalizedUser as User;
    });
  }, []);

  const isAuthenticated = !!user && !!token;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        refreshUser,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
