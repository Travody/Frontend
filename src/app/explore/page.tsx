'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { apiService, Guide, Plan } from '@/lib/api';
import { Search, MapPin, Star, Calendar, User, CheckCircle, Award, Clock, Users, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import DateRangePicker from '@/components/ui/DateRangePicker';

type SearchType = 'guides' | 'tours';

function ExploreContent() {
  const { isAuthenticated, user } = useAuth();
  const searchParams = useSearchParams();
  const [location, setLocation] = useState('');
  const [dateRange, setDateRange] = useState('');
  const [searchType, setSearchType] = useState<SearchType>('tours');
  const [guides, setGuides] = useState<Guide[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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

  useEffect(() => {
    // If URL has search params, update state and search
    const locationParam = searchParams.get('location') || '';
    const fromDateParam = searchParams.get('fromDate') || '';
    const toDateParam = searchParams.get('toDate') || '';
    const typeParam = searchParams.get('type') as SearchType;
    
    setLocation(locationParam);
    
    // Combine dates into date range string
    if (fromDateParam && toDateParam) {
      setDateRange(`${fromDateParam} to ${toDateParam}`);
    } else if (fromDateParam) {
      setDateRange(fromDateParam);
    } else {
      setDateRange('');
    }
    
    if (typeParam === 'tours' || typeParam === 'guides') {
      setSearchType(typeParam);
    }
    
    // Search with URL params if we have location or dates
    if (locationParam || fromDateParam || toDateParam) {
      performSearch(locationParam, fromDateParam, toDateParam, typeParam || 'tours');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const performSearch = async (locationValue: string, fromDateValue: string, toDateValue: string, type: SearchType) => {
    setIsLoading(true);
    try {
      // Default to today if no date provided
      const defaultFromDate = fromDateValue || new Date().toISOString().split('T')[0];
      
      if (type === 'guides') {
        const searchData: any = {};
        
        if (locationValue) {
          searchData.location = locationValue;
        }

        if (defaultFromDate) {
          searchData.fromDate = defaultFromDate;
        }

        if (toDateValue) {
          searchData.toDate = toDateValue;
        }

        const response = await apiService.searchGuides(searchData);
        if (response.success && response.data) {
          setGuides(response.data);
          setPlans([]);
        } else {
          toast.error('Failed to search guides');
        }
      } else {
        const searchData: any = {};
        
        if (locationValue) {
          searchData.location = locationValue;
        }
        
        if (defaultFromDate) {
          searchData.fromDate = defaultFromDate;
        }

        if (toDateValue) {
          searchData.toDate = toDateValue;
        }

        const response = await apiService.searchPlans(searchData);
        if (response.success && response.data) {
          setPlans(response.data.plans || []);
          setGuides([]);
        } else {
          toast.error('Failed to search tours');
        }
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error(`Failed to search ${searchType === 'guides' ? 'guides' : 'tours'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const { fromDate, toDate } = parseDateRange(dateRange);
    performSearch(location, fromDate, toDate, searchType);
  };

  const handleSearchTypeChange = (type: SearchType) => {
    setSearchType(type);
    if (location || dateRange) {
      const { fromDate, toDate } = parseDateRange(dateRange);
      performSearch(location, fromDate, toDate, type);
    }
  };

  const formatPrice = (price: number, currency: string) => {
    const symbol = currency === 'INR' ? '₹' : currency === 'USD' ? '$' : currency;
    return `${symbol}${price}`;
  };

  return (
    <div className="min-h-screen bg-white">
      <Header 
        user={isAuthenticated && user ? {
          name: user.showcaseName || user.firstName || user.email || 'User',
          type: user.userType || 'traveler',
          isVerified: user.userType === 'guider' ? user.accountVerified : user.isVerified
        } : undefined}
      />
      <main className="pt-16">
        {/* Search Header */}
        <div className="bg-gradient-to-r from-teal-600 to-blue-600 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Find Your Perfect Guide or Tour
              </h1>
              <p className="text-xl text-teal-100 max-w-3xl mx-auto">
                Discover verified local guides or explore amazing tour plans
              </p>
            </div>

            {/* Search Type Toggle */}
             <div className="flex justify-center mb-6">
               <div className="inline-flex rounded-lg bg-white/20 p-1">
                 <button
                   type="button"
                   onClick={() => handleSearchTypeChange('tours')}
                   className={`px-6 py-2 rounded-md font-medium transition-colors ${
                     searchType === 'tours'
                       ? 'bg-white text-teal-600'
                       : 'text-white hover:bg-white/10'
                   }`}
                   suppressHydrationWarning
                 >
                   Find Tours
                 </button>
                 <button
                   type="button"
                   onClick={() => handleSearchTypeChange('guides')}
                   className={`px-6 py-2 rounded-md font-medium transition-colors ${
                     searchType === 'guides'
                       ? 'bg-white text-teal-600'
                       : 'text-white hover:bg-white/10'
                   }`}
                   suppressHydrationWarning
                 >
                   Find Guides
                 </button>
               </div>
             </div>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="max-w-5xl mx-auto">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Goa, Delhi, Bengaluru..."
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent placeholder-gray-500 text-gray-900 bg-white"
                        suppressHydrationWarning
                      />
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
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
                      className="w-full bg-teal-600 text-white py-3 px-6 rounded-lg hover:bg-teal-700 transition-colors font-semibold"
                      suppressHydrationWarning
                    >
                      <Search className="w-5 h-5 inline mr-2" />
                      {searchType === 'guides' ? 'Find Guides' : 'Find Tours'}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Results Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Searching...</p>
            </div>
          ) : searchType === 'guides' ? (
            guides.length > 0 ? (
              <>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Found {guides.length} {guides.length === 1 ? 'Guide' : 'Guides'}
                    {location && ` in ${location}`}
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {guides.map((guide) => (
                    <div key={guide._id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center">
                              <User className="w-8 h-8 text-teal-600" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {guide.showcaseName}
                              </h3>
                              {guide.accountVerified && (
                                <div className="flex items-center text-sm text-teal-600">
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  <span>Verified</span>
                                </div>
                              )}
                            </div>
                          </div>
                          {guide.rating && (
                            <div className="flex items-center">
                              <Star className="w-5 h-5 text-yellow-400 fill-current" />
                              <span className="ml-1 text-sm font-medium text-gray-700">
                                {guide.rating.toFixed(1)}
                              </span>
                            </div>
                          )}
                        </div>

                        {guide.guiderType && (
                          <div className="mb-3">
                            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                              {guide.guiderType}
                            </span>
                          </div>
                        )}

                        <div className="space-y-2 mb-4">
                          {(guide.city || guide.personalInfo?.city) && (
                            <div className="flex items-center text-sm text-gray-600">
                              <MapPin className="w-4 h-4 mr-2" />
                              <span>{guide.city || guide.personalInfo?.city}</span>
                            </div>
                          )}
                          {guide.totalReviews && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Star className="w-4 h-4 mr-2 text-yellow-400" />
                              <span>{guide.totalReviews} reviews</span>
                            </div>
                          )}
                        </div>

                        {guide.overview && (
                          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                            {guide.overview}
                          </p>
                        )}

                        {guide.badges && guide.badges.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {guide.badges.slice(0, 3).map((badge, idx) => (
                              <span key={idx} className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                                <Award className="w-3 h-3 mr-1" />
                                {badge}
                              </span>
                            ))}
                          </div>
                        )}

                        <Link
                          href={`/guides/${guide._id}`}
                          className="block w-full mt-4 text-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
                        >
                          View Profile
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                 <h3 className="text-lg font-medium text-gray-900 mb-2">No guides found</h3>
                 <p className="text-gray-500 mb-4">
                   {location || dateRange 
                     ? 'Try adjusting your search criteria'
                     : 'Start searching for guides by entering a location'
                   }
              </p>
            </div>
            )
          ) : (
            plans.length > 0 ? (
              <>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Found {plans.length} {plans.length === 1 ? 'Tour' : 'Tours'}
                    {location && ` in ${location}`}
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {plans.map((plan) => (
                    <div key={plan._id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                      {plan.gallery && plan.gallery.length > 0 && (
                        <div className="h-48 bg-gray-200 relative overflow-hidden">
                          <img 
                            src={plan.gallery[0]} 
                            alt={plan.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {plan.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          {plan.description}
                        </p>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="w-4 h-4 mr-2" />
                            <span>{plan.city}, {plan.state}</span>
                          </div>
                          {plan.duration && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Clock className="w-4 h-4 mr-2" />
                              <span>{plan.duration.value} {plan.duration.unit}</span>
                            </div>
                          )}
                          {plan.pricing && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Users className="w-4 h-4 mr-2" />
                              <span>Up to {plan.pricing.maxParticipants} people</span>
                            </div>
                          )}
                        </div>

                        {plan.pricing && (
                          <div className="mb-4">
                            <span className="text-2xl font-bold text-teal-600">
                              {formatPrice(plan.pricing.pricePerPerson, plan.pricing.currency)}
                            </span>
                            <span className="text-sm text-gray-600 ml-1">per person</span>
                          </div>
                        )}

                        {plan.tourTypes && plan.tourTypes.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {plan.tourTypes.slice(0, 3).map((type, idx) => (
                              <span key={idx} className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                {type}
                              </span>
                            ))}
                          </div>
                        )}

                        {plan.rating && (
                          <div className="flex items-center mb-4">
                            <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                            <span className="text-sm font-medium text-gray-700">{plan.rating.toFixed(1)}</span>
                            {plan.totalReviews && (
                              <span className="text-sm text-gray-600 ml-1">({plan.totalReviews} reviews)</span>
                            )}
                          </div>
                        )}

                        <Link
                          href={`/plans/${plan._id}`}
                          className="block w-full mt-4 text-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium flex items-center justify-center"
                        >
                          View Details
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
          </div>
        </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                 <h3 className="text-lg font-medium text-gray-900 mb-2">No tours found</h3>
                 <p className="text-gray-500 mb-4">
                   {location || dateRange 
                     ? 'Try adjusting your search criteria'
                     : 'Start searching for tours by entering a location'
                   }
                 </p>
              </div>
            )
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white">
        <Header />
        <main className="pt-16">
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-500"></div>
          </div>
        </main>
        <Footer />
      </div>
    }>
      <ExploreContent />
    </Suspense>
  );
}
