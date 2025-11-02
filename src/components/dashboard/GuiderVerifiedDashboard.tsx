'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, Star, TrendingUp, Users, Calendar, Plus, Eye, DollarSign } from 'lucide-react';
import { GuiderUser } from '@/contexts/AuthContext';
import { useAuth } from '@/contexts/AuthContext';
import { apiService, GuiderStats, Plan } from '@/lib/api';
import Link from 'next/link';
import toast from 'react-hot-toast';

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
        apiService.getGuiderStats(token!),
        apiService.getGuiderPlans(token!, 'published')
      ]);

      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data);
      }

      if (plansResponse.success && plansResponse.data) {
        setRecentPlans(plansResponse.data.slice(0, 3)); // Show only 3 recent plans
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
      <div className="bg-gray-50">
        <div className="bg-teal-600 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-2">
                Welcome back, {user.showcaseName || user.email}! 👋
              </h1>
              <p className="text-teal-100 text-lg mb-8">
                Your account is verified and ready to start earning
              </p>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow p-6">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <div className="bg-teal-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-2">
              Welcome back, {user.showcaseName || user.email}! 👋
            </h1>
            <p className="text-teal-100 text-lg mb-8">
              Your account is verified and ready to start earning
            </p>
            
            {/* Verification Status Banner */}
            <div className="bg-white rounded-lg p-6 max-w-md mx-auto">
              <div className="flex items-center justify-center space-x-3">
                <CheckCircle className="w-6 h-6 text-green-500" />
                <span className="text-gray-900 font-semibold">Account Verified</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Tour Points</p>
                <p className="text-2xl font-bold text-gray-900">{user.tourPoints || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalBookings || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Star className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Rating</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.averageRating?.toFixed(1) || '0.0'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">₹{stats?.totalRevenue || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Create New Plan */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Create New Plan</h3>
              <Plus className="w-6 h-6 text-teal-600" />
            </div>
            <p className="text-gray-600 mb-6">
              Create a new tour plan and start attracting travelers to your amazing experiences.
            </p>
            <Link
              href="/guider/create-plan"
              className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              Create Plan
            </Link>
          </div>

          {/* My Plans */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">My Plans</h3>
              <Calendar className="w-6 h-6 text-teal-600" />
            </div>
            <p className="text-gray-600 mb-6">
              Manage your existing tour plans and track their performance.
            </p>
            <Link
              href="/guider/my-plans"
              className="inline-flex items-center px-4 py-2 border border-teal-600 text-teal-600 rounded-lg hover:bg-teal-50 transition-colors"
            >
              View Plans
            </Link>
          </div>
        </div>

        {/* Recent Plans */}
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Recent Plans</h3>
              <Link
                href="/guider/my-plans"
                className="text-teal-600 hover:text-teal-700 text-sm font-medium"
              >
                View All
              </Link>
            </div>
            
            {recentPlans.length > 0 ? (
              <div className="space-y-4">
                {recentPlans.map((plan) => (
                  <div key={plan._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{plan.title}</h4>
                        <p className="text-sm text-gray-600">{plan.city}, {plan.state}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-sm text-gray-500">
                            <Eye className="w-4 h-4 inline mr-1" />
                            {plan.viewCount} views
                          </span>
                          <span className="text-sm text-gray-500">
                            <Users className="w-4 h-4 inline mr-1" />
                            {plan.totalBookings} bookings
                          </span>
                          <span className="text-sm text-gray-500">
                            ₹{plan.pricing?.pricePerPerson || 0}/person
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          plan.status === 'published' 
                            ? 'bg-green-100 text-green-800'
                            : plan.status === 'draft'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {plan.status}
                        </span>
                        <Link
                          href={`/guider/my-plans/${plan._id}`}
                          className="text-teal-600 hover:text-teal-700 text-sm font-medium"
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No plans created yet</p>
                <p className="text-sm">Start by creating your first tour plan!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
