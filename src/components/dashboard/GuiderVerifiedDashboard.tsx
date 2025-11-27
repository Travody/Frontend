'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, Star, TrendingUp, Users, Calendar, Plus, Eye, DollarSign, ArrowRight } from 'lucide-react';
import { GuiderUser } from '@/contexts/AuthContext';
import { useAuth } from '@/contexts/AuthContext';
import { plansService } from '@/lib/api';
import type { GuiderStats, Plan } from '@/types';
import Link from 'next/link';
import toast from '@/lib/toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { LoadingState } from '@/components/ui/loading-state';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';

interface GuiderVerifiedDashboardProps {
  user: GuiderUser;
}

export default function GuiderVerifiedDashboard({ user }: GuiderVerifiedDashboardProps) {
  const { token } = useAuth();
  const [stats, setStats] = useState<GuiderStats | null>(null);
  const [recentPlans, setRecentPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchDashboardData();
    }
  }, [token]);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, plansResponse] = await Promise.all([
        plansService.getGuiderStats(),
        plansService.getGuiderPlans('published')
      ]);

      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data);
      }

      if (plansResponse.success && plansResponse.data) {
        setRecentPlans(plansResponse.data.slice(0, 3));
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Section variant="muted">
        <Section variant="primary" className="py-12">
          <Container>
            <div className="text-center">
              <Skeleton className="h-10 w-64 mx-auto mb-4" />
              <Skeleton className="h-6 w-96 mx-auto" />
            </div>
          </Container>
        </Section>
        <Container className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-16 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </Section>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <Section variant="primary" className="py-12">
        <Container>
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-2">
              Welcome back, {user.showcaseName || user.email}! 👋
            </h1>
            <p className="text-lg text-white/90 mb-6">
              Your account is verified and ready to start earning
            </p>
            
            <Card className="max-w-md mx-auto border-0 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  <span className="text-gray-900 font-semibold">Account Verified</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </Container>
      </Section>

      {/* Dashboard Content */}
      <Section>
        <Container>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Tour Points</p>
                    <p className="text-2xl font-bold text-gray-900">{user.tourPoints || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Bookings</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.totalBookings || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Star className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Rating</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.averageRating?.toFixed(1) || '0.0'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <DollarSign className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">₹{stats?.totalRevenue?.toLocaleString() || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Create New Plan</CardTitle>
                  <Plus className="w-6 h-6 text-primary-600" />
                </div>
                <CardDescription>
                  Create a new tour plan and start attracting travelers to your amazing experiences.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/guider/create-plan">
                  <Button className="w-full">
                    Create Plan
                    <Plus className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>My Plans</CardTitle>
                  <Calendar className="w-6 h-6 text-primary-600" />
                </div>
                <CardDescription>
                  Manage your existing tour plans and track their performance.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/guider/my-plans">
                  <Button variant="outline" className="w-full">
                    View Plans
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Recent Plans */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Plans</CardTitle>
                <Link
                  href="/guider/my-plans"
                  className="text-sm font-medium text-primary-600 hover:text-primary-700"
                >
                  View All
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {recentPlans.length > 0 ? (
                <div className="space-y-4">
                  {recentPlans.map((plan) => (
                    <Card key={plan._id} className="border">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">{plan.title}</h4>
                            <p className="text-sm text-gray-600 mb-3">{plan.city}, {plan.state}</p>
                            <div className="flex items-center space-x-4">
                              <span className="text-sm text-gray-500 flex items-center">
                                <Eye className="w-4 h-4 mr-1" />
                                {plan.viewCount || 0} views
                              </span>
                              <span className="text-sm text-gray-500 flex items-center">
                                <Users className="w-4 h-4 mr-1" />
                                {plan.totalBookings || 0} bookings
                              </span>
                              <span className="text-sm font-medium text-primary-600">
                                ₹{plan.pricing?.pricePerPerson?.toLocaleString() || 0}/person
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Badge 
                              variant={
                                plan.status === 'published' 
                                  ? 'default'
                                  : plan.status === 'draft'
                                  ? 'secondary'
                                  : 'outline'
                              }
                            >
                              {plan.status}
                            </Badge>
                            <Link href={`/guider/my-plans/${plan._id}`}>
                              <Button variant="ghost" size="sm">
                                View
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Calendar}
                  title="No plans created yet"
                  description="Start by creating your first tour plan!"
                  action={
                    <Link href="/guider/create-plan">
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Your First Plan
                      </Button>
                    </Link>
                  }
                />
              )}
            </CardContent>
          </Card>
        </Container>
      </Section>
    </div>
  );
}
