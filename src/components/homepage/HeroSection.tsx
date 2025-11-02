'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Play, Compass } from 'lucide-react';
import Link from 'next/link';
import DateRangePicker from '@/components/ui/DateRangePicker';

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
    <section className="relative h-[70vh] bg-gradient-to-r from-primary-600 to-primary-800">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')"
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
          Discover India with Local Experts
        </h1>
        <p className="text-xl md:text-2xl text-white mb-8 max-w-3xl">
          Connect, Explore, Experience - uncover places through those who truly know them.
        </p>
        
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-12">
          <Link 
            href="/explore"
            className="inline-flex items-center px-8 py-4 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-semibold"
          >
            <Compass className="w-5 h-5 mr-2" />
            Explore Tours
          </Link>
          <button 
            className="inline-flex items-center px-8 py-4 bg-white text-primary-600 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
            suppressHydrationWarning
          >
            <Play className="w-5 h-5 mr-2" />
            Watch Demo
          </button>
        </div>

        {/* Search Form */}
        <div className="w-full max-w-5xl">
          <form onSubmit={(e) => handleSearch(e, 'tours')} className="bg-white rounded-lg shadow-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">Where to?</label>
                <div className="relative">
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Goa, Delhi, Bengaluru..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder-gray-500 text-gray-900 bg-white"
                    suppressHydrationWarning
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </div>
              
              <div className="relative">
                 <label className="block text-sm font-medium text-gray-700 mb-2">Date Range (Optional)</label>
                 <DateRangePicker
                   value={dateRange}
                   onChange={setDateRange}
                   placeholder="Select date range"
                 />
              </div>
              
              <div className="flex items-end">
                <button 
                  type="submit"
                  className="w-full bg-primary-500 text-white py-3 px-6 rounded-lg hover:bg-primary-600 transition-colors font-semibold"
                  suppressHydrationWarning
                >
                  Find Tours
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

