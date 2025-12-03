'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { plansService } from '@/lib/api';
import type { Plan } from '@/types';
import AppLayout from '@/components/layout/AppLayout';
import {
  MapPin,
  Clock,
  Users,
  Star,
  Calendar,
  Eye,
  Edit,
  Globe,
  Lock,
  ArrowLeft,
  Phone,
  Mail,
  DollarSign,
  CheckCircle,
  X,
  AlertCircle,
  Archive,
  ArchiveRestore,
  Info,
} from 'lucide-react';
import Link from 'next/link';
import toast from '@/lib/toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Heading } from '@/components/ui/heading';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { LoadingState } from '@/components/ui/loading-state';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { BaseDialog } from '@/components/ui/base-dialog';

export default function GuiderPlanDetailPage() {
  const params = useParams();
  const planId = params?.id as string;
  const { user, isAuthenticated, isLoading: authLoading, token } = useAuth();
  const router = useRouter();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPauseDialog, setShowPauseDialog] = useState(false);
  const [showPauseConfirmDialog, setShowPauseConfirmDialog] = useState(false);
  const [showArchiveConfirmDialog, setShowArchiveConfirmDialog] = useState(false);
  const [pausedToDate, setPausedToDate] = useState('');
  const [pausedToTime, setPausedToTime] = useState('');

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

      if (token && planId) {
        fetchPlanDetails();
      }
    }
  }, [authLoading, isAuthenticated, user, router, token, planId]);

  const fetchPlanDetails = async () => {
    if (!token || !planId) return;

    setIsLoading(true);
    try {
      const response = await plansService.getPlanById(planId);
      if (response.success && response.data) {
        const userId = user?.id || (user as any)?._id;
        // Handle both string ID and populated object
        const planGuiderId = typeof response.data.guiderId === 'object' && response.data.guiderId !== null
          ? (response.data.guiderId._id || '').toString()
          : (response.data.guiderId || '').toString();
        
        const userIdStr = (userId || '').toString();
        
        if (planGuiderId && userIdStr && planGuiderId !== userIdStr) {
          toast.error('You do not have permission to view this plan');
          router.push('/guider/my-plans');
          return;
        }
        setPlan(response.data);
      } else {
        router.push('/guider/my-plans');
      }
    } catch (error) {
      console.error('Error fetching plan:', error);
      router.push('/guider/my-plans');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (action: 'publish' | 'pause' | 'archive' | 'unarchive') => {
    if (!token || !plan) return;

    try {
      let response;
      switch (action) {
        case 'publish':
          response = await plansService.publishPlan(plan._id);
          break;
        case 'pause':
          // Show confirmation dialog first
          setShowPauseConfirmDialog(true);
          return;
        case 'archive':
          // Show confirmation dialog first
          setShowArchiveConfirmDialog(true);
          return;
        case 'unarchive':
          response = await plansService.unarchivePlan(plan._id);
          break;
      }

      if (response.success && response.data) {
        setPlan(response.data);
      }
    } catch (error) {
      console.error(`Error ${action}ing plan:`, error);
    }
  };

  const handlePauseConfirmationProceed = () => {
    // Close confirmation dialog and show pause duration dialog
    setShowPauseConfirmDialog(false);
    setShowPauseDialog(true);
  };

  const handleArchiveConfirm = async () => {
    if (!token || !plan) return;
    
    setShowArchiveConfirmDialog(false);
    
    try {
      const response = await plansService.archivePlan(plan._id);
      if (response.success && response.data) {
        setPlan(response.data);
      }
    } catch (error) {
      console.error('Error archiving plan:', error);
    }
  };

  // Helper function to combine date and time into ISO string
  const combineDateTime = (date: string, time: string): string => {
    if (!date || !time) return '';
    const dateTimeString = `${date}T${time}:00`;
    return new Date(dateTimeString).toISOString();
  };

  // Helper function to get current date in YYYY-MM-DD format
  const getCurrentDate = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Helper function to get current time in HH:mm format
  const getCurrentTime = (): string => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Helper function to check if date/time is in the past
  const isDateTimeInPast = (date: string, time: string): boolean => {
    if (!date || !time) return false;
    const dateTime = new Date(`${date}T${time}:00`);
    return dateTime < new Date();
  };

  const handlePauseConfirm = async () => {
    if (!token || !plan) return;

    // Validate inputs
    if (!pausedToDate || !pausedToTime) {
      toast.error('Please select pause until date and time');
      return;
    }

    // Check if end date/time is in the past
    if (isDateTimeInPast(pausedToDate, pausedToTime)) {
      toast.error('Pause until date/time must be in the future');
      return;
    }

    // Combine date and time into ISO string
    const pausedTo = combineDateTime(pausedToDate, pausedToTime);
    
    const toDate = new Date(pausedTo);
    const now = new Date();
    
    if (toDate <= now) {
      toast.error('Pause until date/time must be in the future');
      return;
    }

    try {
      const response = await plansService.pausePlan(plan._id, pausedTo);
      if (response.success && response.data) {
        setPlan(response.data);
        setShowPauseDialog(false);
        // Reset form
        setPausedToDate('');
        setPausedToTime('');
      }
    } catch (error) {
      console.error('Error pausing plan:', error);
    }
  };

  if (authLoading || isLoading) {
    return (
      <AppLayout>
        <LoadingState message="Loading plan details..." />
      </AppLayout>
    );
  }

  if (!isAuthenticated || user?.userType !== 'guider' || !user?.accountVerified) {
    return null;
  }

  if (!planId) {
    return (
      <AppLayout>
        <Section variant="muted" className="py-12">
          <Container>
            <div className="text-center">
              <Heading as="h2" variant="section" className="mb-2">Invalid Plan ID</Heading>
              <p className="text-gray-600 mb-4">The plan ID is missing or invalid.</p>
              <Link href="/guider/my-plans">
                <Button variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to My Plans
                </Button>
              </Link>
            </div>
          </Container>
        </Section>
      </AppLayout>
    );
  }

  if (!plan) {
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

  // Helper function to calculate duration between two dates
  const calculateDuration = (from: string, to: string): string => {
    if (!from || !to) return '';
    const fromDate = new Date(from);
    const toDate = new Date(to);
    const diffMs = toDate.getTime() - fromDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    const parts: string[] = [];
    if (diffDays > 0) parts.push(`${diffDays} day${diffDays > 1 ? 's' : ''}`);
    if (diffHours > 0) parts.push(`${diffHours} hour${diffHours > 1 ? 's' : ''}`);
    if (diffMinutes > 0 && diffDays === 0) parts.push(`${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`);
    
    return parts.length > 0 ? parts.join(', ') : 'Less than a minute';
  };

  return (
    <AppLayout>
      <Section variant="muted" className="py-8">
        <Container>
          {/* Back Button */}
          <div className="mb-6">
            <Link href="/guider/my-plans">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to My Plans
              </Button>
            </Link>
          </div>

          {/* Header Section */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <Badge variant={getStatusVariant(plan.status)} className="flex items-center gap-1">
                      {plan.status === 'published' ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                      {plan.status}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      Created {new Date(plan.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <Heading as="h1" variant="page" className="mb-2">{plan.title}</Heading>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-5 h-5 mr-2" />
                    <span className="text-lg">{plan.city}, {plan.state}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Link href={`/guider/create-plan?edit=${plan._id}`}>
                    <Button>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Plan
                    </Button>
                  </Link>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Separator className="mb-4" />
              
              {/* Pause Information */}
              {plan.status === 'paused' && plan.pausedFrom && plan.pausedTo && (
                <div className="mb-6 p-4 bg-gradient-to-r from-orange-50 to-amber-50 border-l-4 border-orange-500 rounded-lg shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Clock className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <Heading as="h3" variant="subsection" className="text-orange-900 m-0">
                          Plan is Currently Paused
                        </Heading>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-start gap-2">
                          <div className="p-1.5 bg-white rounded border border-orange-200">
                            <Calendar className="w-4 h-4 text-orange-600" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-orange-700 uppercase tracking-wide">Duration</p>
                            <p className="text-sm font-semibold text-orange-900 mt-0.5">
                              {calculateDuration(plan.pausedFrom, plan.pausedTo)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="p-1.5 bg-white rounded border border-orange-200">
                            <Clock className="w-4 h-4 text-orange-600" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-orange-700 uppercase tracking-wide">Resume At</p>
                            <p className="text-sm font-semibold text-orange-900 mt-0.5">
                              {new Date(plan.pausedTo).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="p-1.5 bg-white rounded border border-orange-200">
                            <Calendar className="w-4 h-4 text-orange-600" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-orange-700 uppercase tracking-wide">Paused From</p>
                            <p className="text-sm font-semibold text-orange-900 mt-0.5">
                              {new Date(plan.pausedFrom).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-orange-600 mt-3 italic">
                        The plan will automatically resume and become available after the pause period ends.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Status Actions */}
              <div className="flex items-center gap-3">
                {plan.status === 'draft' && (
                  <Button
                    onClick={() => handleStatusChange('publish')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    Publish Plan
                  </Button>
                )}
                {plan.status === 'published' && (
                  <Button
                    onClick={() => handleStatusChange('pause')}
                    variant="outline"
                    className="border-orange-600 text-orange-600 hover:bg-orange-50"
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Pause Plan
                  </Button>
                )}
                {plan.status === 'paused' && (
                  <Button
                    onClick={() => handleStatusChange('publish')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    Resume Plan
                  </Button>
                )}
                {plan.status !== 'archived' && (
                  <Button
                    onClick={() => handleStatusChange('archive')}
                    variant="outline"
                    className="border-gray-600 text-gray-600 hover:bg-gray-50"
                  >
                    <Archive className="w-4 h-4 mr-2" />
                    Archive Plan
                  </Button>
                )}
                {plan.status === 'archived' && (
                  <Button
                    onClick={() => handleStatusChange('unarchive')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <ArchiveRestore className="w-4 h-4 mr-2" />
                    Unarchive Plan
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Pause Confirmation Dialog */}
          <ConfirmationDialog
            isOpen={showPauseConfirmDialog}
            onClose={() => setShowPauseConfirmDialog(false)}
            onConfirm={handlePauseConfirmationProceed}
            title="Pause Plan"
            message="All confirmed upcoming trips will be cancelled automatically. Do you want to continue?"
            confirmText="Continue"
            cancelText="Cancel"
            variant="warning"
          />

          {/* Archive Confirmation Dialog */}
          <ConfirmationDialog
            isOpen={showArchiveConfirmDialog}
            onClose={() => setShowArchiveConfirmDialog(false)}
            onConfirm={handleArchiveConfirm}
            title="Archive Plan"
            message="This plan will be hidden and not bookable. You can unarchive it later if needed."
            confirmText="Archive"
            cancelText="Cancel"
            variant="default"
          />

          {/* Pause Dialog */}
          <BaseDialog
            isOpen={showPauseDialog}
            onClose={() => {
              setShowPauseDialog(false);
              // Reset form
              setPausedToDate('');
              setPausedToTime('');
            }}
            title="Pause Plan"
            description="The plan will be paused immediately and will automatically resume after the selected date and time."
            confirmText="Pause Plan"
            cancelText="Cancel"
            onConfirm={handlePauseConfirm}
            maxWidth="max-w-2xl"
          >
            <div className="grid gap-6">
              {/* Pause Until Section */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Pause Until</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="paused-to-date">Date</Label>
                    <Input
                      id="paused-to-date"
                      type="date"
                      min={getCurrentDate()}
                      value={pausedToDate}
                      onChange={(e) => {
                        const value = e.target.value;
                        setPausedToDate(value);
                        // If same date and time is in the past, clear time
                        if (value === getCurrentDate() && pausedToTime) {
                          const currentTime = getCurrentTime();
                          if (pausedToTime <= currentTime) {
                            setPausedToTime('');
                          }
                        }
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paused-to-time">Time</Label>
                    <Input
                      id="paused-to-time"
                      type="time"
                      min={pausedToDate === getCurrentDate() ? getCurrentTime() : undefined}
                      value={pausedToTime}
                      onChange={(e) => {
                        const value = e.target.value;
                        setPausedToTime(value);
                        // Validate if date/time is in the past
                        if (pausedToDate && value && isDateTimeInPast(pausedToDate, value)) {
                          toast.error('Pause until date/time must be in the future');
                          setPausedToTime('');
                        }
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Preview */}
              {pausedToDate && pausedToTime && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-900 mb-1">Pause Schedule</p>
                      <p className="text-sm text-blue-800">
                        The plan will be paused <span className="font-semibold">now</span> and will automatically resume on{' '}
                        <span className="font-semibold">
                          {new Date(combineDateTime(pausedToDate, pausedToTime)).toLocaleString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit'
                          })}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </BaseDialog>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Eye className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Total Views</p>
                    <p className="text-2xl font-bold text-gray-900">{plan.viewCount || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Calendar className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Total Bookings</p>
                    <p className="text-2xl font-bold text-gray-900">{plan.bookingCount || plan.totalBookings || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Star className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Rating</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {plan.rating && plan.rating > 0 ? plan.rating.toFixed(1) : 'N/A'}
                    </p>
                    <p className="text-xs text-gray-500">{plan.totalReviews || 0} reviews</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <DollarSign className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatPrice(plan.totalRevenue || 0, plan.pricing?.currency || 'INR')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Gallery */}
              {plan.gallery && plan.gallery.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Photos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {plan.gallery.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`${plan.title} ${index + 1}`}
                          className="w-full h-40 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle>About this tour</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">{plan.description}</p>
                </CardContent>
              </Card>

              {/* Highlights */}
              {plan.highlights && plan.highlights.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Highlights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {plan.highlights.map((highlight, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Inclusions & Exclusions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {plan.inclusions && plan.inclusions.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>What's Included</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {plan.inclusions.map((inclusion, index) => (
                          <li key={index} className="flex items-start">
                            <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{inclusion}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {plan.exclusions && plan.exclusions.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>What's Not Included</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {plan.exclusions.map((exclusion, index) => (
                          <li key={index} className="flex items-start">
                            <X className="w-5 h-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{exclusion}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Itinerary */}
              {plan.itinerary && Object.keys(plan.itinerary).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Itinerary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(plan.itinerary).map(([day, activities], index) => (
                        <div key={index} className="border-l-4 border-primary-500 pl-4">
                          <Heading as="h3" variant="subsection" className="mb-2">{day}</Heading>
                          <ul className="space-y-1">
                            {Array.isArray(activities) && activities.map((activity, actIndex) => (
                              <li key={actIndex} className="text-gray-700 flex items-start">
                                <span className="w-2 h-2 bg-primary-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                                <span>{activity}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Policies */}
              {(plan.cancellationPolicy || plan.termsAndConditions || plan.specialInstructions) && (
                <Card>
                  <CardHeader>
                    <CardTitle>Policies & Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {plan.cancellationPolicy && (
                      <div>
                        <Heading as="h3" variant="subsection" className="mb-2">Cancellation Policy</Heading>
                        <p className="text-gray-700 text-sm whitespace-pre-line">{plan.cancellationPolicy}</p>
                      </div>
                    )}

                    {plan.specialInstructions && (
                      <div>
                        <Heading as="h3" variant="subsection" className="mb-2">Special Instructions</Heading>
                        <p className="text-gray-700 text-sm whitespace-pre-line">{plan.specialInstructions}</p>
                      </div>
                    )}

                    {plan.termsAndConditions && (
                      <div>
                        <Heading as="h3" variant="subsection" className="mb-2">Terms & Conditions</Heading>
                        <p className="text-gray-700 text-sm whitespace-pre-line">{plan.termsAndConditions}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Pricing Card */}
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Pricing</CardTitle>
                </CardHeader>
                <CardContent>
                  {plan.pricing ? (
                    <>
                      <div className="mb-4">
                        <div className="text-3xl font-bold text-primary-600 mb-1">
                          {formatPrice(plan.pricing.pricePerPerson, plan.pricing.currency)}
                        </div>
                        <CardDescription>per person</CardDescription>
                      </div>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-2" />
                          <span>Max participants: {plan.pricing.maxParticipants}</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-500">Pricing not set</p>
                  )}
                </CardContent>
              </Card>

              {/* Tour Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Tour Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {plan.duration && (
                    <div className="flex items-start">
                      <Clock className="w-5 h-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Duration</p>
                        <p className="text-sm text-gray-600">
                          {typeof plan.duration === 'object'
                            ? `${plan.duration.value} ${plan.duration.unit === 'days' ? 'day(s)' : 'hour(s)'}`
                            : `${plan.duration} hour(s)`}
                        </p>
                      </div>
                    </div>
                  )}

                  {plan.availability?.recurring?.timeSlot?.startTime && (
                    <div className="flex items-start">
                      <Clock className="w-5 h-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Start Time</p>
                        <p className="text-sm text-gray-600">{plan.availability.recurring.timeSlot.startTime}</p>
                      </div>
                    </div>
                  )}

                  {plan.availability?.recurring?.timeSlot?.endTime && (
                    <div className="flex items-start">
                      <Clock className="w-5 h-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">End Time</p>
                        <p className="text-sm text-gray-600">{plan.availability.recurring.timeSlot.endTime}</p>
                      </div>
                    </div>
                  )}

                  {plan.tourTypes && plan.tourTypes.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-2">Tour Types</p>
                      <div className="flex flex-wrap gap-2">
                        {plan.tourTypes.map((type) => (
                          <Badge key={type} variant="secondary">
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Meeting Point */}
              {plan.meetingPoint && (
                <Card>
                  <CardHeader>
                    <CardTitle>Meeting Point</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-start">
                      <MapPin className="w-5 h-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-700">{plan.meetingPoint}</p>
                    </div>
                    {plan.contactPersonName && (
                      <div className="mt-4 space-y-2 text-sm">
                        <div className="flex items-center text-gray-600">
                          <Phone className="w-4 h-4 mr-2" />
                          {plan.contactPersonPhone || 'N/A'}
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Mail className="w-4 h-4 mr-2" />
                          {plan.contactPersonEmail || 'N/A'}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Requirements */}
              {plan.requirements && plan.requirements.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Requirements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {plan.requirements.map((requirement, index) => (
                        <li key={index} className="flex items-start">
                          <AlertCircle className="w-4 h-4 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{requirement}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Languages */}
              {plan.languages && plan.languages.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Languages</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {plan.languages.map((lang) => (
                        <Badge key={lang} variant="outline">
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </Container>
      </Section>
    </AppLayout>
  );
}
