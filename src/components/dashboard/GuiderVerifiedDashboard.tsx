'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, Star, Users, Calendar, Plus, Eye, IndianRupee, ArrowRight, MapPin, FileText, PenTool } from 'lucide-react';
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
import StatsGrid from '@/components/dashboard/StatsGrid';

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Hero Section */}
      <Section variant="primary" className="py-10 pb-12 lg:pb-20 xl:pb-24 relative overflow-visible">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 opacity-95"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        <Container className="relative z-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center mb-2">
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight">
              Welcome back, {user.personalInfo?.showcaseName || user.personalInfo?.fullName || user.email?.split('@')[0]}! 👋
            </h1>
            <p className="text-base md:text-lg text-white/95 mb-4 max-w-2xl mx-auto">
              Your account is verified and ready to start earning.
            </p>
            
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 shadow-lg">
              <CheckCircle className="w-4 h-4 text-green-300" />
              <span className="text-white font-semibold text-sm">Account Verified</span>
            </div>
          </div>
        </Container>

        {/* Stats Cards - Overlapping on large screens, below hero on smaller screens */}
        {stats && (
          <>
            {/* Mobile/Tablet: Cards below hero section */}
            <div className="lg:hidden relative -mt-8 pb-4">
              <Container>
                <StatsGrid
                  stats={[
                    {
                      title: 'Total Plans',
                      value: stats.totalPlans || 0,
                      description: `${stats.publishedPlans || 0} published`,
                      icon: FileText,
                      iconColor: 'blue',
                    },
                    {
                      title: 'Total Bookings',
                      value: stats.totalBookings || 0,
                      description: 'Active bookings',
                      icon: Users,
                      iconColor: 'indigo',
                    },
                    {
                      title: 'Average Rating',
                      value: stats.averageRating?.toFixed(1) || '0.0',
                      description: 'Out of 5.0',
                      icon: Star,
                      iconColor: 'amber',
                      iconFill: true,
                    },
                    {
                      title: 'Total Revenue',
                      value: stats.totalRevenue || 0,
                      description: 'All time earnings',
                      icon: IndianRupee,
                      iconColor: 'emerald',
                      formatValue: (val) => `₹${Number(val).toLocaleString('en-IN')}`,
                    },
                  ]}
                  columns={4}
                />
              </Container>
            </div>

            {/* Desktop: Cards overlapping hero section */}
            <div className="hidden lg:block absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[40%] w-full max-w-7xl mx-auto px-4 xl:px-6 z-20">
              <StatsGrid
                stats={[
                  {
                    title: 'Total Plans',
                    value: stats.totalPlans || 0,
                    description: `${stats.publishedPlans || 0} published`,
                    icon: FileText,
                    iconColor: 'blue',
                  },
                  {
                    title: 'Total Bookings',
                    value: stats.totalBookings || 0,
                    description: 'Active bookings',
                    icon: Users,
                    iconColor: 'indigo',
                  },
                  {
                    title: 'Average Rating',
                    value: stats.averageRating?.toFixed(1) || '0.0',
                    description: 'Out of 5.0',
                    icon: Star,
                    iconColor: 'amber',
                    iconFill: true,
                  },
                  {
                    title: 'Total Revenue',
                    value: stats.totalRevenue || 0,
                    description: 'All time earnings',
                    icon: IndianRupee,
                    iconColor: 'emerald',
                    formatValue: (val) => `₹${Number(val).toLocaleString('en-IN')}`,
                  },
                ]}
                columns={4}
              />
            </div>
          </>
        )}
      </Section>

      {/* Dashboard Content */}
      <Section className="py-12 pt-8 lg:pt-20 xl:pt-28">
        <Container className="relative z-10">

          {/* Action Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
            <Card className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-lg hover:-translate-y-1 bg-gradient-to-br from-primary-500 to-primary-600 text-white overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-400/20 to-transparent"></div>
              <CardHeader className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="text-2xl text-white">Create New Plan</CardTitle>
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl group-hover:bg-white/30 transition-colors">
                    <PenTool className="w-6 h-6 text-white" />
                  </div>
                </div>
                <CardDescription className="text-white/90 text-base">
                  Create a new tour plan and start attracting travelers to your amazing experiences.
                </CardDescription>
              </CardHeader>
              <CardContent className="relative z-10">
                <Link href="/guider/create-plan">
                  <Button className="w-full bg-white text-primary-600 hover:bg-white/90 shadow-lg hover:shadow-xl transition-all duration-300 font-semibold">
                    Create Plan
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-lg hover:-translate-y-1 bg-white">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="text-2xl">My Plans</CardTitle>
                  <div className="p-3 bg-indigo-100 rounded-xl group-hover:bg-indigo-200 transition-colors">
                    <Calendar className="w-6 h-6 text-indigo-600" />
                  </div>
                </div>
                <CardDescription className="text-base">
                  Manage your existing tour plans and track their performance metrics.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/guider/my-plans">
                  <Button variant="outline" className="w-full border-2 hover:bg-indigo-50 hover:border-indigo-300 transition-all duration-300 font-semibold">
                    View Plans
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Recent Plans */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold">Recent Plans</CardTitle>
                  <CardDescription className="mt-1">Your latest tour plans and their performance</CardDescription>
                </div>
                <Link
                  href="/guider/my-plans"
                  className="text-sm font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1 transition-colors"
                >
                  View All
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {recentPlans.length > 0 ? (
                <div className="space-y-4">
                  {recentPlans.map((plan) => (
                    <Card key={plan._id} className="border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all duration-300 group">
                      <CardContent className="p-5">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-primary-100 rounded-lg group-hover:bg-primary-200 transition-colors">
                                <MapPin className="w-5 h-5 text-primary-600" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-bold text-lg text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">{plan.title}</h4>
                                <p className="text-sm text-gray-600 flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {plan.city}, {plan.state}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 mt-3">
                              {plan.status !== 'draft' && (
                                <>
                                  <span className="text-sm text-gray-600 flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg">
                                    <Eye className="w-4 h-4 text-gray-400" />
                                    <span className="font-medium">{plan.viewCount || 0}</span>
                                    <span className="text-gray-500">views</span>
                                  </span>
                                  <span className="text-sm text-gray-600 flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg">
                                    <Users className="w-4 h-4 text-gray-400" />
                                    <span className="font-medium">{plan.totalBookings || 0}</span>
                                    <span className="text-gray-500">bookings</span>
                                  </span>
                                </>
                              )}
                              <span className="text-sm font-semibold text-primary-600 bg-primary-50 px-3 py-1.5 rounded-lg">
                                ₹{plan.pricing?.pricePerPerson?.toLocaleString('en-IN') || 0}/person
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge 
                              variant={
                                plan.status === 'published' 
                                  ? 'default'
                                  : plan.status === 'draft'
                                  ? 'secondary'
                                  : 'outline'
                              }
                              className="text-xs font-semibold px-3 py-1"
                            >
                              {plan.status}
                            </Badge>
                            <Link href={`/guider/my-plans/${plan._id}`}>
                              <Button variant="ghost" size="sm" className="hover:bg-primary-50 hover:text-primary-600">
                                View Details
                                <ArrowRight className="w-4 h-4 ml-1" />
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
                  description="Start by creating your first tour plan and begin your journey as a guide!"
                  action={
                    <Link href="/guider/create-plan">
                      <Button className="bg-primary-600 hover:bg-primary-700 shadow-lg">
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
