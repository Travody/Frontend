'use client';

import { useState, useEffect, Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import { guidesService, plansService } from '@/lib/api';
import type { Guide, Plan } from '@/types';
import { Search, MapPin, Star, Calendar, User, CheckCircle, Award, Clock, Users, ArrowRight, Languages } from 'lucide-react';
import Link from 'next/link';
import toast from '@/lib/toast';
import DateRangePicker from '@/components/ui/DateRangePicker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { LoadingState } from '@/components/ui/loading-state';
import { EmptyState } from '@/components/ui/empty-state';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

type SearchType = 'guides' | 'tours';

function ExploreContent() {
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
    const locationParam = searchParams.get('location') || '';
    const fromDateParam = searchParams.get('fromDate') || '';
    const toDateParam = searchParams.get('toDate') || '';
    const typeParam = searchParams.get('type') as SearchType;
    
    setLocation(locationParam);
    
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
    
    if (locationParam || fromDateParam || toDateParam) {
      performSearch(locationParam, fromDateParam, toDateParam, typeParam || 'tours');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const performSearch = async (locationValue: string, fromDateValue: string, toDateValue: string, type: SearchType) => {
    setIsLoading(true);
    try {
      const defaultFromDate = fromDateValue || new Date().toISOString().split('T')[0];
      
      if (type === 'guides') {
        const searchData: any = {};
        if (locationValue) searchData.location = locationValue;
        if (defaultFromDate) searchData.fromDate = defaultFromDate;
        if (toDateValue) searchData.toDate = toDateValue;

        const response = await guidesService.searchGuides(searchData);
        if (response.success && response.data) {
          setGuides(response.data);
          setPlans([]);
        } else {
          toast.error('Failed to search guides');
        }
      } else {
        const searchData: any = {};
        if (locationValue) searchData.location = locationValue;
        if (defaultFromDate) searchData.fromDate = defaultFromDate;
        if (toDateValue) searchData.toDate = toDateValue;

        const response = await plansService.searchPlans(searchData);
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
    if (!currency || !price) return '';
    const symbol = currency === 'INR' ? '₹' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency;
    return `${symbol}${price.toLocaleString()}`;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Search Header */}
      <Section variant="primary" className="py-12 md:py-16">
        <Container>
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Find Your Perfect Guide or Tour
            </h1>
            <p className="text-lg text-white/90 max-w-3xl mx-auto">
              Discover verified local guides or explore amazing tour plans
            </p>
          </div>

          {/* Search Type Toggle */}
          <div className="flex justify-center mb-6">
            <Tabs value={searchType} onValueChange={(v) => handleSearchTypeChange(v as SearchType)}>
              <TabsList className="bg-white/20">
                <TabsTrigger value="tours" className="data-[state=active]:bg-white data-[state=active]:text-primary-600">
                  Find Tours
                </TabsTrigger>
                <TabsTrigger value="guides" className="data-[state=active]:bg-white data-[state=active]:text-primary-600">
                  Find Guides
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="max-w-4xl mx-auto">
            <Card className="border-0 shadow-xl">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2 flex flex-col">
                    <Label htmlFor="location" className="text-sm font-medium text-gray-700">Location</Label>
                    <div className="relative flex-1 flex items-end">
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
                  
                  <div className="space-y-2 flex flex-col">
                    <Label htmlFor="dateRange" className="text-sm font-medium text-gray-700">Date Range (Optional)</Label>
                    <div className="flex-1 flex items-end">
                      <DateRangePicker
                        value={dateRange}
                        onChange={setDateRange}
                        placeholder="Select date range"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2 flex flex-col">
                    <Label className="text-sm font-medium text-gray-700 opacity-0 pointer-events-none">
                      {searchType === 'guides' ? 'Find Guides' : 'Find Tours'}
                    </Label>
                    <div className="flex-1 flex items-end">
                      <Button type="submit" className="w-full h-11" suppressHydrationWarning>
                        <Search className="w-4 h-4 mr-2" />
                        {searchType === 'guides' ? 'Find Guides' : 'Find Tours'}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </form>
        </Container>
      </Section>

      {/* Results Section */}
      <Section>
        <Container>
          {isLoading ? (
            <LoadingState message="Searching..." />
          ) : searchType === 'guides' ? (
            guides.length > 0 ? (
              <>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Found {guides.length} {guides.length === 1 ? 'Guide' : 'Guides'}
                    {location && ` in ${location}`}
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {guides.map((guide) => {
                    const guideName = guide.personalInfo?.showcaseName || guide.showcaseName || 'Guide';
                    const city = guide.personalInfo?.city || guide.city || '';
                    const fullName = guide.personalInfo?.fullName;
                    const languages = guide.tourGuideInfo?.languagesSpoken || [];
                    const rating = guide.tourGuideInfo?.rating || guide.rating || 0;
                    const totalReviews = guide.tourGuideInfo?.totalReviews || guide.totalReviews || 0;
                    const aboutMe = guide.personalInfo?.aboutMe || guide.overview || '';
                    
                    return (
                      <Card key={guide._id} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                              {guide.personalInfo?.profileImageUrl ? (
                                <img
                                  src={guide.personalInfo.profileImageUrl}
                                  alt={guideName}
                                  className="h-14 w-14 rounded-full object-cover flex-shrink-0"
                                />
                              ) : (
                                <Avatar className="h-14 w-14 flex-shrink-0">
                                  <AvatarFallback className="bg-primary-100 text-primary-700">
                                    {guideName.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                              )}
                              <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-semibold text-gray-900 truncate">
                                  {guideName}
                                </h3>
                                {fullName && fullName !== guideName && (
                                  <p className="text-sm text-gray-500 truncate">{fullName}</p>
                                )}
                                {guide.accountVerified && (
                                  <div className="flex items-center text-sm text-primary-600 mt-1">
                                    <CheckCircle className="w-4 h-4 mr-1 flex-shrink-0" />
                                    <span>Verified</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            {rating > 0 && (
                              <div className="flex items-center flex-shrink-0 ml-2">
                                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                                <span className="ml-1 text-sm font-medium text-gray-700">
                                  {rating.toFixed(1)}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="space-y-2 mb-4">
                            {city && (
                              <div className="flex items-center text-sm text-gray-600">
                                <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                                <span className="truncate">{city}</span>
                              </div>
                            )}
                            {languages.length > 0 && (
                              <div className="flex items-center text-sm text-gray-600">
                                <Languages className="w-4 h-4 mr-2 flex-shrink-0" />
                                <span className="truncate">
                                  {languages.slice(0, 2).join(', ')}{languages.length > 2 ? ` +${languages.length - 2}` : ''}
                                </span>
                              </div>
                            )}
                            {totalReviews > 0 && (
                              <div className="flex items-center text-sm text-gray-600">
                                <Star className="w-4 h-4 mr-2 text-yellow-400 flex-shrink-0" />
                                <span>{totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}</span>
                              </div>
                            )}
                          </div>

                          {aboutMe && (
                            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                              {aboutMe}
                            </p>
                          )}

                          <Link href={`/guides/${guide._id}`}>
                            <Button className="w-full">
                              View Profile
                            </Button>
                          </Link>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </>
            ) : (
              <EmptyState
                icon={User}
                title="No guides found"
                description={location || dateRange 
                  ? 'Try adjusting your search criteria'
                  : 'Start searching for guides by entering a location'
                }
              />
            )
          ) : (
            plans.length > 0 ? (
              <>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Found {plans.length} {plans.length === 1 ? 'Tour' : 'Tours'}
                    {location && ` in ${location}`}
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {plans.map((plan) => (
                    <Card key={plan._id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                      {plan.gallery && plan.gallery.length > 0 && (
                        <div className="aspect-[4/3] overflow-hidden">
                          <img 
                            src={plan.gallery[0]} 
                            alt={plan.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <CardContent className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
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

                        {plan.pricing && plan.pricing.pricePerPerson && (
                          <div className="mb-4">
                            <span className="text-2xl font-bold text-primary-600">
                              {formatPrice(plan.pricing.pricePerPerson, plan.pricing.currency || 'INR')}
                            </span>
                            <span className="text-sm text-gray-600 ml-1">per person</span>
                          </div>
                        )}

                        {plan.tourTypes && plan.tourTypes.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {plan.tourTypes.slice(0, 3).map((type, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {type}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {plan.totalReviews !== undefined && plan.totalReviews !== null && plan.totalReviews > 0 && plan.rating !== undefined && plan.rating !== null && (
                          <div className="flex items-center mb-4">
                            <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                            <span className="text-sm font-medium text-gray-700">
                              {plan.rating.toFixed(1)}
                            </span>
                            <span className="text-sm text-gray-600 ml-1">({plan.totalReviews} {plan.totalReviews === 1 ? 'review' : 'reviews'})</span>
                          </div>
                        )}

                        <Link href={`/plans/${plan._id}`}>
                          <Button className="w-full">
                            View Details
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            ) : (
              <EmptyState
                icon={Calendar}
                title="No tours found"
                description={location || dateRange 
                  ? 'Try adjusting your search criteria'
                  : 'Start searching for tours by entering a location'
                }
              />
            )
          )}
        </Container>
      </Section>
    </div>
  );
}

export default function ExplorePage() {
  return (
    <AppLayout>
      <Suspense fallback={<LoadingState message="Loading..." />}>
        <ExploreContent />
      </Suspense>
    </AppLayout>
  );
}
