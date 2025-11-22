'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Search, User, Menu, LogOut, Settings } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
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
                  className="text-sm font-medium text-gray-700 transition-colors hover:text-primary-600"
                >
                  My Plans
                </Link>
                <Link 
                  href="/guider/bookings" 
                  className="text-sm font-medium text-gray-700 transition-colors hover:text-primary-600"
                >
                  My Bookings
                </Link>
              </>
            ) : (
              <>
                <Link 
                  href="/explore" 
                  className="text-sm font-medium text-gray-700 transition-colors hover:text-primary-600"
                >
                  Explore
                </Link>
                <Link 
                  href="/traveler/trips" 
                  className="text-sm font-medium text-gray-700 transition-colors hover:text-primary-600"
                >
                  My Trips
                </Link>
              </>
            )}

            {/* User Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary-100 text-primary-700">
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
                    className="cursor-pointer"
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
                  {user.type === 'guider' ? (
                    <>
                      <Link 
                        href="/guider/my-plans" 
                        className="block px-3 py-2.5 text-base font-medium text-gray-900 rounded-md hover:bg-gray-100 transition-colors"
                      >
                        My Plans
                      </Link>
                      <Link 
                        href="/guider/bookings" 
                        className="block px-3 py-2.5 text-base font-medium text-gray-900 rounded-md hover:bg-gray-100 transition-colors"
                      >
                        My Bookings
                      </Link>
                      <Link 
                        href="/guider/profile" 
                        className="block px-3 py-2.5 text-base font-medium text-gray-900 rounded-md hover:bg-gray-100 transition-colors"
                      >
                        My Profile
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link 
                        href="/explore" 
                        className="block px-3 py-2.5 text-base font-medium text-gray-900 rounded-md hover:bg-gray-100 transition-colors"
                      >
                        Explore
                      </Link>
                      <Link 
                        href="/traveler/trips" 
                        className="block px-3 py-2.5 text-base font-medium text-gray-900 rounded-md hover:bg-gray-100 transition-colors"
                      >
                        My Trips
                      </Link>
                      <Link 
                        href="/traveler/profile" 
                        className="block px-3 py-2.5 text-base font-medium text-gray-900 rounded-md hover:bg-gray-100 transition-colors"
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
            className="text-sm font-medium text-gray-700 transition-colors hover:text-primary-600"
          >
            Explore
          </Link>
          <Link 
            href="/become-guide" 
            className="text-sm font-medium text-gray-700 transition-colors hover:text-primary-600"
          >
            Become a Guide
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
                className="block px-3 py-2.5 text-base font-medium text-gray-900 rounded-md hover:bg-gray-100 transition-colors"
              >
                Explore
              </Link>
              <Link 
                href="/become-guide" 
                className="block px-3 py-2.5 text-base font-medium text-gray-900 rounded-md hover:bg-gray-100 transition-colors"
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
