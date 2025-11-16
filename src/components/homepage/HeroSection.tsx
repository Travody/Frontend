'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Play, Compass, MapPin } from 'lucide-react';
import Link from 'next/link';
import DateRangePicker from '@/components/ui/DateRangePicker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Container } from '@/components/ui/container';
import { Heading } from '@/components/ui/heading';

export default function HeroSection() {
  const router = useRouter();
  const [location, setLocation] = useState('');
  const [dateRange, setDateRange] = useState('');

  const parseDateRange = (dateRangeValue: string): { fromDate: string; toDate: string } => {
    if (!dateRangeValue) {
      const today = new Date().toISOString().split('T')[0];
      return { fromDate: today, toDate: '' };
    }
    
    const parts = dateRangeValue.split(' to ');
    if (parts.length === 2) {
      return { fromDate: parts[0].trim(), toDate: parts[1].trim() };
    }
    
    return { fromDate: dateRangeValue.trim(), toDate: '' };
  };

  const handleSearch = (e: React.FormEvent, type: 'guides' | 'tours' = 'tours') => {
    e.preventDefault();
    const { fromDate, toDate } = parseDateRange(dateRange);
    const params = new URLSearchParams();
    if (location) params.append('location', location);
    if (fromDate) params.append('fromDate', fromDate);
    if (toDate) params.append('toDate', toDate);
    params.append('type', type);
    router.push(`/explore?${params.toString()}`);
  };

  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')"
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/70 via-primary-800/60 to-primary-700/50"></div>
      </div>

      {/* Content */}
      <Container className="relative z-10 py-20">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          <Heading as="h1" variant="page" className="text-white mb-6 leading-tight text-4xl md:text-5xl lg:text-6xl">
            Discover India with Local Experts
          </Heading>
          <p className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl leading-relaxed">
            Connect, Explore, Experience - uncover places through those who truly know them.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-16">
            <Link href="/explore">
              <Button size="lg" className="h-12 px-8 text-base">
                <Compass className="w-5 h-5 mr-2" />
                Explore Tours
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="outline" 
              className="h-12 px-8 text-base bg-white/10 border-white/20 text-white hover:bg-white/20"
              suppressHydrationWarning
            >
              <Play className="w-5 h-5 mr-2" />
              Watch Demo
            </Button>
          </div>

          {/* Search Form */}
          <div className="w-full max-w-4xl">
            <form onSubmit={(e) => handleSearch(e, 'tours')} className="bg-white rounded-xl shadow-2xl p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-sm font-medium text-gray-700">
                    Where to?
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="location"
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Goa, Delhi, Bengaluru..."
                      className="pl-10 h-11"
                      suppressHydrationWarning
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dateRange" className="text-sm font-medium text-gray-700">
                    Date Range (Optional)
                  </Label>
                  <DateRangePicker
                    value={dateRange}
                    onChange={setDateRange}
                    placeholder="Select date range"
                  />
                </div>
                
                <div className="flex items-end">
                  <Button 
                    type="submit"
                    size="lg"
                    className="w-full h-11 text-base"
                    suppressHydrationWarning
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Find Tours
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </Container>
    </section>
  );
}
