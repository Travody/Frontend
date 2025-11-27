'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { plansService } from '@/lib/api';
import type { Plan } from '@/types';
import { MapPin, Clock, Users, Star, Calendar, Eye, Edit, Globe, Lock, Plus } from 'lucide-react';
import Link from 'next/link';
import toast from '@/lib/toast';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { LoadingState } from '@/components/ui/loading-state';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/page-header';

export default function MyPlansPage() {
  const { user, isAuthenticated, isLoading: authLoading, token } = useAuth();
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/auth/guider/login');
        return;
      }

      if (user?.userType !== 'guider') {
        router.push('/');
        return;
      }

      if (!user?.accountVerified) {
        router.push('/guider/verification');
        return;
      }

      if (token) {
        fetchPlans();
      }
    }
  }, [authLoading, isAuthenticated, user, router, token, statusFilter]);

  const fetchPlans = async () => {
    if (!token) return;
    
    setIsLoading(true);
    try {
      const status = statusFilter === 'all' ? undefined : statusFilter;
      const response = await plansService.getGuiderPlans(status);
      if (response.success && response.data) {
        setPlans(response.data);
      } else {
        toast.error('Failed to load plans');
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast.error('Failed to load plans');
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <AppLayout>
        <LoadingState message="Loading plans..." />
      </AppLayout>
    );
  }

  if (!isAuthenticated || user?.userType !== 'guider' || !user?.accountVerified) {
    return null;
  }

  const formatPrice = (price: number, currency: string) => {
    const symbol = currency === 'INR' ? '₹' : currency === 'USD' ? '$' : currency;
    return `${symbol}${price?.toLocaleString() || 0}`;
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'published':
        return 'default';
      case 'draft':
        return 'secondary';
      case 'paused':
        return 'outline';
      case 'archived':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published':
        return <Globe className="w-3 h-3" />;
      case 'draft':
      case 'paused':
      case 'archived':
        return <Lock className="w-3 h-3" />;
      default:
        return null;
    }
  };

  return (
    <AppLayout>
      <Section variant="muted" className="py-8">
        <Container>
          <div className="flex items-center justify-between mb-8">
            <PageHeader
              title="My Tour Plans"
              description="Manage all your tour plans"
            />
            <Link href="/guider/create-plan">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create New Plan
              </Button>
            </Link>
          </div>

          {/* Filter Tabs */}
          <Tabs value={statusFilter} onValueChange={setStatusFilter} className="mb-8">
            <TabsList className="grid w-full max-w-md grid-cols-5">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="published">Published</TabsTrigger>
              <TabsTrigger value="draft">Draft</TabsTrigger>
              <TabsTrigger value="paused">Paused</TabsTrigger>
              <TabsTrigger value="archived">Archived</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Plans Grid */}
          {plans.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <Card key={plan._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Plan Image */}
                  {plan.gallery && plan.gallery.length > 0 ? (
                    <div className="relative h-48 w-full">
                      <img
                        src={plan.gallery[0]}
                        alt={plan.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2">
                        <Badge variant={getStatusVariant(plan.status)} className="flex items-center gap-1">
                          {getStatusIcon(plan.status)}
                          {plan.status}
                        </Badge>
                      </div>
                    </div>
                  ) : (
                    <div className="relative h-48 w-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                      <div className="absolute top-2 right-2">
                        <Badge variant={getStatusVariant(plan.status)} className="flex items-center gap-1">
                          {getStatusIcon(plan.status)}
                          {plan.status}
                        </Badge>
                      </div>
                      <Calendar className="w-16 h-16 text-white opacity-50" />
                    </div>
                  )}

                  {/* Plan Details */}
                  <CardHeader>
                    <CardTitle className="line-clamp-2 mb-2">{plan.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Location */}
                    <div className="flex items-center text-gray-600 text-sm">
                      <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="truncate">
                        {plan.city}, {plan.state}
                      </span>
                    </div>

                    {/* Plan Stats */}
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      {plan.duration && (
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          <span>
                            {typeof plan.duration === 'object' 
                              ? `${plan.duration.value} ${plan.duration.unit === 'days' ? 'day(s)' : 'hour(s)'}`
                              : `${plan.duration} hour(s)`}
                          </span>
                        </div>
                      )}
                      {plan.pricing?.maxParticipants && (
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          <span>Up to {plan.pricing.maxParticipants}</span>
                        </div>
                      )}
                      {plan.rating && plan.rating > 0 && (
                        <div className="flex items-center">
                          <Star className="w-4 h-4 mr-1 text-yellow-500 fill-current" />
                          <span>{plan.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>

                    {/* Price */}
                    {plan.pricing?.pricePerPerson && (
                      <div>
                        <div className="text-2xl font-bold text-primary-600">
                          {formatPrice(plan.pricing.pricePerPerson, plan.pricing.currency)}
                        </div>
                        <div className="text-xs text-gray-500">per person</div>
                      </div>
                    )}

                    {/* Plan Metrics */}
                    <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t">
                      <div>
                        <span className="font-medium">Views:</span> {plan.viewCount || 0}
                      </div>
                      <div>
                        <span className="font-medium">Bookings:</span> {plan.bookingCount || plan.totalBookings || 0}
                      </div>
                      <div>
                        <span className="font-medium">Reviews:</span> {plan.totalReviews || 0}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 pt-2">
                      <Link href={`/guider/my-plans/${plan._id}`} className="flex-1">
                        <Button variant="outline" className="w-full" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                      </Link>
                      <Link href={`/guider/create-plan?edit=${plan._id}`} className="flex-1">
                        <Button className="w-full" size="sm">
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Calendar}
              title={statusFilter === 'all' ? 'No plans created yet' : `No ${statusFilter} plans`}
              description={
                statusFilter === 'all' 
                  ? 'Start by creating your first tour plan!'
                  : `You don't have any ${statusFilter} plans yet.`
              }
              action={
                statusFilter === 'all' ? (
                  <Link href="/guider/create-plan">
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Plan
                    </Button>
                  </Link>
                ) : undefined
              }
            />
          )}
        </Container>
      </Section>
    </AppLayout>
  );
}
