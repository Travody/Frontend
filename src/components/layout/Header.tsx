'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, User, Menu, X, LogOut, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

interface HeaderProps {
  user?: {
    name: string;
    type: 'traveler' | 'guider';
    isVerified?: boolean;
  };
}

export default function Header({ user }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { logout } = useAuth();
  const profileRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (user) {
    // Authenticated user header
    return (
      <header className="bg-teal-600 fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href={user.type === 'guider' ? '/guider/dashboard' : '/'} className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-pink-400 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">T</span>
                </div>
                <span className="text-xl font-bold text-white">Travody</span>
              </Link>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-lg mx-8 hidden md:block">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for destination, guides or tour..."
                  className="w-full pl-4 pr-12 py-2 border border-teal-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent placeholder-gray-500 text-gray-900 bg-white"
                  suppressHydrationWarning
                />
                <button 
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 bg-teal-500 rounded-r-lg"
                  suppressHydrationWarning
                >
                  <Search className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center space-x-6">
              {user.type === 'guider' ? (
                <>
                  <Link href="/guider/my-plans" className="text-white hover:text-teal-200 font-medium">
                    My Plans
                  </Link>
                  <Link href="/guider/bookings" className="text-white hover:text-teal-200 font-medium">
                    My Bookings
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/explore" className="text-white hover:text-teal-200 font-medium">
                    Explore
                  </Link>
                  <Link href="/traveler/trips" className="text-white hover:text-teal-200 font-medium">
                    My Trips
                  </Link>
                </>
              )}

              {/* User Profile Dropdown */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 text-white hover:text-teal-200"
                >
                  <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-medium">{user.name}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {/* Profile Dropdown */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                    <Link
                      href={user.type === 'guider' ? '/guider/profile' : '/traveler/profile'}
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center space-x-2 w-full px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      <User className="w-4 h-4" />
                      <span>My Profile</span>
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setIsProfileOpen(false);
                      }}
                      className="flex items-center space-x-2 w-full px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile menu */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t">
              <div className="space-y-4">
                {user.type === 'traveler' && (
                <Link href="/explore" className="block text-gray-700 hover:text-primary-600">
                  Explore
                </Link>
                )}
                {user.type === 'guider' ? (
                  <>
                    <Link href="/guider/my-plans" className="block text-gray-700 hover:text-primary-600">
                      My Plans
                    </Link>
                    <Link href="/guider/bookings" className="block text-gray-700 hover:text-primary-600">
                      My Bookings
                    </Link>
                    <Link href="/guider/profile" className="block text-gray-700 hover:text-primary-600">
                      My Profile
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/traveler/trips" className="block text-gray-700 hover:text-primary-600">
                      My Trips
                    </Link>
                    <Link href="/traveler/profile" className="block text-gray-700 hover:text-primary-600">
                      My Profile
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </header>
    );
  }

  // Unauthenticated header
  return (
    <header className="bg-gray-50 fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">T</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Travody</span>
            </Link>
          </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-lg mx-8 hidden md:block">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for destination, guides or tour..."
                  className="w-full pl-4 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder-gray-500 text-gray-900 bg-white"
                  suppressHydrationWarning
                />
                <button 
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1"
                  suppressHydrationWarning
                >
                  <Search className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>

          {/* Navigation */}
          <div className="flex items-center space-x-4">
            <Link href="/explore" className="text-gray-700 hover:text-primary-600 font-medium">
              Explore
            </Link>
            <Link href="/become-guide" className="text-gray-700 hover:text-primary-600 font-medium">
              Become a Guide
            </Link>
            <Link 
              href="/auth/traveler/login" 
              className="px-4 py-2 border border-primary-500 text-primary-500 rounded-lg hover:bg-primary-50 font-medium"
            >
              Login
            </Link>
            <Link 
              href="/auth/traveler/signup" 
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 font-medium"
            >
              SignUp
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="space-y-4">
              <Link href="/explore" className="block text-gray-700 hover:text-primary-600">
                Explore
              </Link>
              <Link href="/become-guide" className="block text-gray-700 hover:text-primary-600">
                Become a Guide
              </Link>
              <div className="flex space-x-2">
                <Link 
                  href="/auth/traveler/login" 
                  className="flex-1 px-4 py-2 border border-primary-500 text-primary-500 rounded-lg hover:bg-primary-50 text-center"
                >
                  Login
                </Link>
                <Link 
                  href="/auth/traveler/signup" 
                  className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 text-center"
                >
                  SignUp
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

