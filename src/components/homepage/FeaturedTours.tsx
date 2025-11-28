'use client';

import { useState, useEffect } from 'react';
import { Star, MapPin, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { plansService } from '@/lib/api';
import type { Plan } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { Skeleton } from '@/components/ui/skeleton';
import { Heading } from '@/components/ui/heading';

export default function FeaturedTours() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedPlans();
  }, []);

  const fetchFeaturedPlans = async () => {
    try {
      setIsLoading(true);
      const response = await plansService.searchPlans({
        limit: 3,
        page: 1
      });
      if (response.success && response.data) {
        const publishedPlans = response.data.plans
          .filter((plan: Plan) => plan.status === 'published')
          .slice(0, 3);
        setPlans(publishedPlans);
      }
    } catch (error) {
      console.error('Failed to fetch featured plans:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDuration = (duration?: { value: number; unit: 'hours' | 'days' }) => {
    if (!duration) return '';
    if (duration.unit === 'hours') {
      return duration.value === 1 ? '1 Hour' : `${duration.value} Hours`;
    }
    return duration.value === 1 ? '1 Day' : `${duration.value} Days`;
  };

  const getImageUrl = (plan: Plan) => {
    if (plan.gallery && plan.gallery.length > 0) {
      return plan.gallery[0];
    }
    return "https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80";
  };

  const getBadgeInfo = (plan: Plan) => {
    if (plan.tourTypes && plan.tourTypes.length > 0) {
      const firstType = plan.tourTypes[0];
      const badgeColors: { [key: string]: string } = {
        'Adventure': 'bg-red-500',
        'Cultural': 'bg-purple-500',
        'Nature': 'bg-green-500',
        'Beach': 'bg-blue-500',
        'Heritage': 'bg-orange-500',
      };
      return {
        text: firstType,
        color: badgeColors[firstType] || 'bg-primary-600'
      };
    }
    return { text: 'Featured', color: 'bg-primary-600' };
  };

  if (isLoading) {
    return (
      <Section variant="muted">
        <Container>
          <div className="text-center mb-12">
            <Heading as="h2" variant="section" className="mb-4 text-3xl md:text-4xl">
              Featured Tours & Experiences
            </Heading>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Handpicked experiences from verified local guides
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="w-full h-48" />
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-3/4 mb-4" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </Section>
    );
  }

  if (plans.length === 0) {
    return null;
  }

  return (
    <Section variant="muted">
      <Container>
        <div className="text-center mb-12">
          <Heading as="h2" variant="section" className="mb-4 text-3xl md:text-4xl">
            Featured Tours & Experiences
          </Heading>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Handpicked experiences from verified local guides
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const badgeInfo = getBadgeInfo(plan);
            return (
              <Card key={plan._id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={getImageUrl(plan)}
                    alt={plan.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className={`${badgeInfo.color} text-white border-0`}>
                      {badgeInfo.text}
                    </Badge>
                  </div>
                  {plan.rating && (
                    <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg px-2.5 py-1.5 flex items-center gap-1 shadow-sm">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-semibold text-gray-900">{plan.rating.toFixed(1)}</span>
                      {plan.totalReviews && (
                        <span className="text-xs text-gray-500">({plan.totalReviews})</span>
                      )}
                    </div>
                  )}
                </div>

                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-1 flex-1">{plan.title}</h3>
                    {plan.duration && (
                      <div className="flex items-center text-gray-500 ml-2 flex-shrink-0">
                        <Clock className="w-4 h-4 mr-1" />
                        <span className="text-sm whitespace-nowrap">{formatDuration(plan.duration)}</span>
                      </div>
                    )}
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2 min-h-[2.5rem]">
                    {plan.description}
                  </p>

                  {plan.city && (
                    <div className="flex items-center mb-4 text-gray-500">
                      <MapPin className="w-4 h-4 mr-1.5 flex-shrink-0" />
                      <span className="text-sm">{plan.city}{plan.state && `, ${plan.state}`}</span>
                    </div>
                  )}

                  {plan.pricing && (
                    <div className="flex items-baseline justify-between mb-4">
                      <div>
                        <span className="text-2xl font-bold text-gray-900">₹{plan.pricing.pricePerPerson.toLocaleString()}</span>
                        <span className="text-sm text-gray-500 ml-1">per person</span>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Link href={`/plans/${plan._id}`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        View Details
                      </Button>
                    </Link>
                    <Link href={`/plans/${plan._id}`} className="flex-1">
                      <Button className="w-full">
                        Book Now
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
