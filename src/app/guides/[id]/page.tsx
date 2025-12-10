'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MapPin, Star, Phone, Mail, CheckCircle, ArrowLeft, Award, Clock, Users, Globe, Calendar, Languages } from 'lucide-react';
import { guidesService, plansService, reviewsService } from '@/lib/api';
import type { Guide, Plan, Review } from '@/types';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import { useAuth, isGuiderUser } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heading } from '@/components/ui/heading';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { LoadingState } from '@/components/ui/loading-state';
import { Separator } from '@/components/ui/separator';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default function GuideDetailPage() {
  const params = useParams();
  const guideId = params?.id as string;
  const router = useRouter();
  const { user } = useAuth();
  const [guide, setGuide] = useState<any>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPlans, setIsLoadingPlans] = useState(false);

  useEffect(() => {
    if (guideId) {
      fetchGuideDetails();
      fetchPlans();
    }
  }, [guideId]);

  const fetchGuideDetails = async () => {
    if (!guideId) return;

    setIsLoading(true);
    try {
      const response = await guidesService.getGuideById(guideId);
      if (response.success && response.data) {
        setGuide(response.data);
        // Reviews are already included in the response from backend
        if ((response.data as any).reviews && Array.isArray((response.data as any).reviews)) {
          setReviews((response.data as any).reviews);
        } else {
          // If no reviews in response, set empty array
          setReviews([]);
        }
      } else {
        router.push('/explore?type=guides');
      }
    } catch (error) {
      console.error('Error fetching guide:', error);
      router.push('/explore?type=guides');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPlans = async () => {
    if (!guideId) return;

    setIsLoadingPlans(true);
    try {
      // Search for published plans by this guide
      const response = await plansService.searchPlans({
        page: 1,
        limit: 20
      });
      
      if (response.success && response.data?.plans) {
        // Filter plans by guiderId
        const guidePlans = response.data.plans.filter((plan: Plan) => {
          const planGuiderId = typeof plan.guiderId === 'object' && plan.guiderId !== null
            ? (plan.guiderId as any)._id?.toString() || (plan.guiderId as any).toString()
            : plan.guiderId?.toString();
          return planGuiderId === guideId && plan.status === 'published' && plan.isActive;
        });
        setPlans(guidePlans);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setIsLoadingPlans(false);
    }
  };


  if (isLoading) {
    return (
      <AppLayout>
        <LoadingState message="Loading guide profile..." />
      </AppLayout>
    );
  }

  if (!guide) {
    return (
      <AppLayout>
        <Container>
          <Section>
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Guide not found</h2>
              <p className="text-gray-600 mb-6">The guide you're looking for doesn't exist or has been removed.</p>
              <Button onClick={() => router.push('/explore?type=guides')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Explore
              </Button>
            </div>
          </Section>
        </Container>
      </AppLayout>
    );
  }

  const showcaseName = guide.personalInfo?.showcaseName || guide.showcaseName || 'Guide';
  const city = guide.personalInfo?.city || guide.city || '';
  const aboutMe = guide.personalInfo?.aboutMe || guide.overview || '';
  const rating = guide.tourGuideInfo?.rating || guide.rating || 0;
  const totalReviews = guide.tourGuideInfo?.totalReviews || guide.totalReviews || reviews.length || 0;
  const languagesSpoken = guide.tourGuideInfo?.languagesSpoken || [];
  const certifications = guide.personalInfo?.certifications || [];
  const awards = guide.personalInfo?.awards || [];

  // Determine home href based on user type (same as plan page)
  let homeHref = '/';
  if (user) {
    if (isGuiderUser(user)) {
      homeHref = '/guider/dashboard';
    }
  }

  return (
    <AppLayout>
      <Breadcrumb
        items={[
          { label: 'Explore', href: '/explore?type=guides' },
          { label: showcaseName, href: '#' }
        ]}
        homeHref={homeHref}
      />
      <Section variant="muted" className="!pt-6 !pb-8 md:!pt-6 md:!pb-8">
        <Container>
          {/* Header Section */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0">
                  {guide.personalInfo?.profileImageUrl ? (
                    <img
                      src={guide.personalInfo.profileImageUrl}
                      alt={showcaseName}
                      className="h-24 w-24 rounded-full object-cover"
                    />
                  ) : (
                    <Avatar className="h-24 w-24">
                      <AvatarFallback className="bg-primary-100 text-primary-700 text-2xl">
                        {showcaseName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl font-bold text-gray-900">{showcaseName}</h1>
                        {guide.accountVerified && (
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                      {guide.personalInfo?.fullName && guide.personalInfo.fullName !== showcaseName && (
                        <p className="text-gray-600 text-sm">{guide.personalInfo.fullName}</p>
                      )}
                    </div>
                    
                    {rating > 0 && (
                      <div className="flex items-center gap-1">
                        <Star className="w-5 h-5 text-yellow-400 fill-current" />
                        <span className="text-lg font-semibold text-gray-900">
                          {rating.toFixed(1)}
                        </span>
                        <span className="text-sm text-gray-500">
                          ({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {city && (
                      <div className="flex items-center text-gray-600">
                        <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>{city}</span>
                      </div>
                    )}
                    
                    {languagesSpoken.length > 0 && (
                      <div className="flex items-center text-gray-600">
                        <Languages className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{languagesSpoken.slice(0, 3).join(', ')}{languagesSpoken.length > 3 ? '...' : ''}</span>
                      </div>
                    )}

                    {guide.email && (
                      <div className="flex items-center text-gray-600">
                        <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{guide.email}</span>
                      </div>
                    )}

                    {guide.mobile && (
                      <div className="flex items-center text-gray-600">
                        <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>{guide.mobile}</span>
                      </div>
                    )}

                    {guide.businessInfo?.websiteUrl && (
                      <div className="flex items-center text-gray-600">
                        <Globe className="w-4 h-4 mr-2 flex-shrink-0" />
                        <a 
                          href={guide.businessInfo.websiteUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:underline truncate"
                        >
                          {guide.businessInfo.websiteUrl}
                        </a>
                      </div>
                    )}

                    {guide.tourGuideInfo?.pricePerHour && (
                      <div className="flex items-center text-gray-600">
                        <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>
                          {guide.tourGuideInfo.currency === 'INR' ? '₹' : guide.tourGuideInfo.currency === 'USD' ? '$' : guide.tourGuideInfo.currency || '₹'}
                          {guide.tourGuideInfo.pricePerHour}/hour
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Single Page Layout - All Sections Stacked Vertically */}
          <div className="space-y-8">
            {/* About Section */}
            <div className="space-y-6">
                {aboutMe && (
                  <Card>
                    <CardHeader>
                      <CardTitle>About</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{aboutMe}</p>
                    </CardContent>
                  </Card>
                )}

                {languagesSpoken.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Languages className="w-5 h-5" />
                        Languages Spoken
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {languagesSpoken.map((lang: string, idx: number) => (
                          <Badge key={idx} variant="outline">
                            {lang}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {certifications.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Award className="w-5 h-5" />
                        Certifications
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {certifications.map((cert: string, idx: number) => (
                          <li key={idx} className="flex items-center text-gray-700">
                            <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                            {cert}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {awards.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Award className="w-5 h-5" />
                        Awards
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {awards.map((award: string, idx: number) => (
                          <li key={idx} className="flex items-center text-gray-700">
                            <Award className="w-4 h-4 text-yellow-600 mr-2" />
                            {award}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {guide.personalInfo?.education && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Education</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700">{guide.personalInfo.education}</p>
                    </CardContent>
                  </Card>
                )}

                {guide.tourGuideInfo?.hasVehicle && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Transportation</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>Vehicle Available</span>
                      </div>
                      {guide.tourGuideInfo.vehicleDescription && (
                        <p className="text-sm text-gray-600 mt-2">
                          {guide.tourGuideInfo.vehicleDescription}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>

            {/* Tours Section */}
            <Card>
              <CardHeader>
                <CardTitle>Tours by {showcaseName} ({plans.length})</CardTitle>
                <CardDescription>Explore all available tours from this guide</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingPlans ? (
                  <LoadingState message="Loading tours..." />
                ) : plans.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {plans.map((plan) => (
                      <Card key={plan._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                        {plan.gallery && plan.gallery.length > 0 && (
                          <div className="aspect-[4/3] overflow-hidden">
                            <img 
                              src={plan.gallery[0]} 
                              alt={plan.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <CardHeader>
                          <CardTitle className="line-clamp-2">{plan.title}</CardTitle>
                          <CardDescription className="line-clamp-2">
                            {plan.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {plan.pricing?.pricePerPerson && (
                              <div className="text-2xl font-bold text-primary-600">
                                {plan.pricing.currency === 'INR' ? '₹' : plan.pricing.currency === 'USD' ? '$' : plan.pricing.currency || '₹'}
                                {plan.pricing.pricePerPerson.toLocaleString()}
                                <span className="text-sm font-normal text-gray-600 ml-1">per person</span>
                              </div>
                            )}
                            
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              {plan.duration && (
                                <div className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  <span>
                                    {typeof plan.duration === 'object' 
                                      ? `${plan.duration.value} ${plan.duration.unit === 'days' ? 'day(s)' : 'hour(s)'}`
                                      : `${plan.duration} hour(s)`}
                                  </span>
                                </div>
                              )}
                              {plan.pricing?.maxParticipants && (
                                <div className="flex items-center gap-1">
                                  <Users className="w-4 h-4" />
                                  <span>Up to {plan.pricing.maxParticipants}</span>
                                </div>
                              )}
                            </div>

                            <Link href={`/plans/${plan._id}`}>
                              <Button className="w-full">View Tour</Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <p className="text-gray-600">No tours available yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Reviews Section */}
            <Card>
              <CardHeader>
                <CardTitle>Reviews ({reviews.length})</CardTitle>
                <CardDescription>What travelers are saying about {showcaseName}</CardDescription>
              </CardHeader>
              <CardContent>
                {reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <Card key={review._id} className="border-l-4 border-l-primary-500">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg">
                                {typeof review.travelerId === 'object' && review.travelerId
                                  ? `${review.travelerId.firstName || ''} ${review.travelerId.lastName || ''}`.trim() || 'Anonymous'
                                  : 'Anonymous'}
                              </CardTitle>
                              <div className="flex items-center gap-2 mt-1">
                                {review.rating && (
                                  <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`w-4 h-4 ${
                                          i < review.rating!
                                            ? 'text-yellow-400 fill-current'
                                            : 'text-gray-300'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                )}
                                {review.createdAt && (
                                  <span className="text-sm text-gray-500">
                                    {new Date(review.createdAt).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        {review.comment && (
                          <CardContent>
                            <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                          </CardContent>
                        )}
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <p className="text-gray-600">No reviews yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </Container>
      </Section>
    </AppLayout>
  );
}

