'use client';

import { useState, FormEvent } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Search, User, Menu, LogOut, Settings } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface HeaderProps {
  user?: {
    name: string;
    type: 'traveler' | 'guider';
    isVerified?: boolean;
  };
}

export default function Header({ user }: HeaderProps) {
  const { logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileSearchQuery, setMobileSearchQuery] = useState('');

  const handleSearch = (e: FormEvent, isMobile = false) => {
    e.preventDefault();
    const query = isMobile ? mobileSearchQuery : searchQuery;
    if (query.trim()) {
      router.push(`/explore?location=${encodeURIComponent(query.trim())}`);
      if (isMobile) {
        setMobileSearchQuery('');
      } else {
        setSearchQuery('');
      }
    } else {
      router.push('/explore');
    }
  };

  if (user) {
    // Authenticated user header
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link 
              href={user.type === 'guider' ? '/guider/dashboard' : '/'} 
              className="flex items-center space-x-2.5 transition-opacity hover:opacity-80"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 shadow-sm">
                <span className="text-base font-bold text-white">T</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Travody</span>
            </Link>
          </div>

          {/* Search Bar - Tablet & Desktop */}
          <form onSubmit={(e) => handleSearch(e, false)} className="hidden flex-1 max-w-lg mx-4 md:flex lg:mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search for destination, guides or tour..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 h-9 bg-gray-50 border-gray-200 focus-visible:ring-primary-500"
                suppressHydrationWarning
              />
            </div>
          </form>

          {/* Navigation - Desktop Only (lg+) */}
          <div className="hidden items-center gap-6 lg:flex">
            {user.type === 'guider' ? (
              <>
                <Link 
                  href="/guider/my-plans" 
                  className={`text-sm font-medium transition-colors relative group pb-1 ${
                    pathname?.startsWith('/guider/my-plans')
                      ? 'text-primary-600 font-semibold'
                      : 'text-gray-700 hover:text-primary-600'
                  }`}
                >
                  My Plans
                  <span className="absolute bottom-0 left-0 h-0.5 bg-primary-600 transition-all duration-300 ease-out w-0 group-hover:w-full"></span>
                </Link>
                <Link 
                  href="/guider/bookings" 
                  className={`text-sm font-medium transition-colors relative group pb-1 ${
                    pathname?.startsWith('/guider/bookings')
                      ? 'text-primary-600 font-semibold'
                      : 'text-gray-700 hover:text-primary-600'
                  }`}
                >
                  My Bookings
                  <span className="absolute bottom-0 left-0 h-0.5 bg-primary-600 transition-all duration-300 ease-out w-0 group-hover:w-full"></span>
                </Link>
              </>
            ) : (
              <>
                <Link 
                  href="/explore" 
                  className={`text-sm font-medium transition-colors relative group pb-1 ${
                    pathname === '/explore' || pathname?.startsWith('/plans/')
                      ? 'text-primary-600 font-semibold'
                      : 'text-gray-700 hover:text-primary-600'
                  }`}
                >
                  Explore
                  <span className="absolute bottom-0 left-0 h-0.5 bg-primary-600 transition-all duration-300 ease-out w-0 group-hover:w-full"></span>
                </Link>
                <Link 
                  href="/traveler/trips" 
                  className={`text-sm font-medium transition-colors relative group pb-1 ${
                    pathname?.startsWith('/traveler/trips')
                      ? 'text-primary-600 font-semibold'
                      : 'text-gray-700 hover:text-primary-600'
                  }`}
                >
                  My Trips
                  <span className="absolute bottom-0 left-0 h-0.5 bg-primary-600 transition-all duration-300 ease-out w-0 group-hover:w-full"></span>
                </Link>
              </>
            )}

            {/* Notifications */}
            <NotificationBell />

            {/* User Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className={`h-9 w-9 transition-all ${
                    (user.type === 'guider' && pathname?.startsWith('/guider/profile')) ||
                    (user.type === 'traveler' && pathname?.startsWith('/traveler/profile'))
                      ? 'ring-2 ring-primary-600 ring-offset-2'
                      : ''
                  }`}>
                    <AvatarFallback className={`transition-colors ${
                      (user.type === 'guider' && pathname?.startsWith('/guider/profile')) ||
                      (user.type === 'traveler' && pathname?.startsWith('/traveler/profile'))
                        ? 'bg-primary-600 text-white'
                        : 'bg-primary-100 text-primary-700'
                    }`}>
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium text-sm">{user.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {user.type === 'guider' ? 'Guide' : 'Traveler'}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link 
                    href={user.type === 'guider' ? '/guider/profile' : '/traveler/profile'}
                    className={`cursor-pointer ${
                      (user.type === 'guider' && pathname?.startsWith('/guider/profile')) ||
                      (user.type === 'traveler' && pathname?.startsWith('/traveler/profile'))
                        ? 'bg-primary-50 text-primary-600 font-semibold'
                        : ''
                    }`}
                  >
                    <User className="mr-2 h-4 w-4" />
                    <span>My Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-red-600 focus:text-red-600"
                  onClick={() => logout()}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile & Tablet - Notifications and Menu */}
          <div className="flex items-center gap-2 lg:hidden">
            {/* Notifications */}
            <NotificationBell />
            
            {/* Menu button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
            <SheetContent side="left" className="w-[280px] sm:w-[320px]">
              <SheetHeader className="mb-6">
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              {/* Mobile & Tablet Navigation */}
              <div className="space-y-2">
                  {user.type === 'guider' ? (
                    <>
                      <Link 
                        href="/guider/my-plans" 
                        className={`block px-3 py-2.5 text-base font-medium rounded-md transition-colors ${
                          pathname?.startsWith('/guider/my-plans')
                            ? 'bg-primary-50 text-primary-600 font-semibold'
                            : 'text-gray-900 hover:bg-gray-100'
                        }`}
                      >
                        My Plans
                      </Link>
                      <Link 
                        href="/guider/bookings" 
                        className={`block px-3 py-2.5 text-base font-medium rounded-md transition-colors ${
                          pathname?.startsWith('/guider/bookings')
                            ? 'bg-primary-50 text-primary-600 font-semibold'
                            : 'text-gray-900 hover:bg-gray-100'
                        }`}
                      >
                        My Bookings
                      </Link>
                      <Link 
                        href="/guider/profile" 
                        className={`block px-3 py-2.5 text-base font-medium rounded-md transition-colors ${
                          pathname?.startsWith('/guider/profile')
                            ? 'bg-primary-50 text-primary-600 font-semibold'
                            : 'text-gray-900 hover:bg-gray-100'
                        }`}
                      >
                        My Profile
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link 
                        href="/explore" 
                        className={`block px-3 py-2.5 text-base font-medium rounded-md transition-colors ${
                          pathname === '/explore' || pathname?.startsWith('/plans/')
                            ? 'bg-primary-50 text-primary-600 font-semibold'
                            : 'text-gray-900 hover:bg-gray-100'
                        }`}
                      >
                        Explore
                      </Link>
                      <Link 
                        href="/traveler/trips" 
                        className={`block px-3 py-2.5 text-base font-medium rounded-md transition-colors ${
                          pathname?.startsWith('/traveler/trips')
                            ? 'bg-primary-50 text-primary-600 font-semibold'
                            : 'text-gray-900 hover:bg-gray-100'
                        }`}
                      >
                        My Trips
                      </Link>
                      <Link 
                        href="/traveler/profile" 
                        className={`block px-3 py-2.5 text-base font-medium rounded-md transition-colors ${
                          pathname?.startsWith('/traveler/profile')
                            ? 'bg-primary-50 text-primary-600 font-semibold'
                            : 'text-gray-900 hover:bg-gray-100'
                        }`}
                      >
                        My Profile
                      </Link>
                    </>
                  )}
                </div>
                
                <div className="pt-6 mt-6 border-t">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => logout()}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </div>
            </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
    );
  }

  // Unauthenticated header
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <Link 
            href="/" 
            className="flex items-center space-x-2.5 transition-opacity hover:opacity-80"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 shadow-sm">
              <span className="text-base font-bold text-white">T</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Travody</span>
          </Link>
        </div>

        {/* Search Bar - Tablet & Desktop */}
        <form onSubmit={(e) => handleSearch(e, false)} className="hidden flex-1 max-w-lg mx-4 md:flex lg:mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search for destination, guides or tour..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 h-9 bg-gray-50 border-gray-200 focus-visible:ring-primary-500"
              suppressHydrationWarning
            />
          </div>
        </form>

        {/* Navigation - Desktop Only (lg+) */}
        <div className="hidden items-center gap-4 lg:flex">
          <Link 
            href="/explore" 
            className={`text-sm font-medium transition-colors relative group pb-1 ${
              pathname === '/explore' || pathname?.startsWith('/plans/')
                ? 'text-primary-600 font-semibold'
                : 'text-gray-700 hover:text-primary-600'
            }`}
          >
            Explore
            <span className="absolute bottom-0 left-0 h-0.5 bg-primary-600 transition-all duration-300 ease-out w-0 group-hover:w-full"></span>
          </Link>
          <Link 
            href="/become-guide" 
            className={`text-sm font-medium transition-colors relative group pb-1 ${
              pathname?.startsWith('/become-guide')
                ? 'text-primary-600 font-semibold'
                : 'text-gray-700 hover:text-primary-600'
            }`}
          >
            Become a Guide
            <span className="absolute bottom-0 left-0 h-0.5 bg-primary-600 transition-all duration-300 ease-out w-0 group-hover:w-full"></span>
          </Link>
          <Link href="/auth/traveler/login">
            <Button variant="outline" size="sm">
              Login
            </Button>
          </Link>
          <Link href="/auth/traveler/signup">
            <Button size="sm">
              Sign Up
            </Button>
          </Link>
        </div>

        {/* Mobile & Tablet menu button */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] sm:w-[320px]">
            <SheetHeader className="mb-6">
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            {/* Mobile & Tablet Navigation */}
            <div className="space-y-2">
              <Link 
                href="/explore" 
                className={`block px-3 py-2.5 text-base font-medium rounded-md transition-colors ${
                  pathname === '/explore' || pathname?.startsWith('/plans/')
                    ? 'bg-primary-50 text-primary-600 font-semibold'
                    : 'text-gray-900 hover:bg-gray-100'
                }`}
              >
                Explore
              </Link>
              <Link 
                href="/become-guide" 
                className={`block px-3 py-2.5 text-base font-medium rounded-md transition-colors ${
                  pathname?.startsWith('/become-guide')
                    ? 'bg-primary-50 text-primary-600 font-semibold'
                    : 'text-gray-900 hover:bg-gray-100'
                }`}
              >
                Become a Guide
              </Link>
            </div>
            
            <div className="pt-6 mt-6 border-t space-y-2">
              <Link href="/auth/traveler/login" className="block">
                <Button variant="outline" className="w-full">
                  Login
                </Button>
              </Link>
              <Link href="/auth/traveler/signup" className="block">
                <Button className="w-full">
                  Sign Up
                </Button>
              </Link>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
