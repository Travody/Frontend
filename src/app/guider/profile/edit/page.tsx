'use client';

import { Suspense, useState, useEffect } from 'react';
import { User, Building2, MapPin, Award, Star, Phone, Mail, Calendar, Languages, Trophy, Globe, Instagram, FileText, DollarSign, Clock, Car, Info, Coins, Save, X, Edit, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import { usersService } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { LoadingState } from '@/components/ui/loading-state';
import { Heading } from '@/components/ui/heading';

interface GuiderProfileData {
  _id: string;
  email?: string;
  mobile?: string;
  guiderType: 'Professional' | 'Agency';
  emailVerified?: boolean;
  accountVerified?: boolean;
  tourPoints?: number;
  badges?: string[];
  personalInfo?: {
    showcaseName: string;
    fullName?: string;
    city?: string;
    overview?: string;
    languagesKnown?: string[];
    education?: string;
    awards?: string[];
  };
  businessInfo?: {
    companyName?: string;
    foundingDate?: string;
    websiteUrl?: string;
    socialMediaProfile?: string;
    hasGSTNumber?: boolean;
    gstNumber?: string;
  };
  tourGuideInfo?: {
    certifications?: string[];
    pricePerHour?: number;
    pricePerDay?: number;
    pricePerTour?: number;
    currency?: string;
    rating?: number;
    totalReviews?: number;
    totalTours?: number;
    tourDurations?: string[];
    aboutMe?: string;
    languagesSpoken?: string[];
    hasVehicle?: boolean;
    vehicleDescription?: string;
  };
}

const commonLanguages = [
  'Hindi', 'English', 'Bengali', 'Telugu', 'Marathi', 'Tamil', 'Gujarati',
  'Kannada', 'Malayalam', 'Punjabi', 'Urdu', 'Odia', 'Assamese', 'Sanskrit'
];

function GuiderProfileEditContent() {
  const { user, token, isAuthenticated, isLoading, refreshUser } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'personal' | 'business' | 'tour'>('personal');
  const [profileData, setProfileData] = useState<GuiderProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [editingTabs, setEditingTabs] = useState<{
    personal: boolean;
    business: boolean;
    tour: boolean;
  }>({
    personal: false,
    business: false,
    tour: false,
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/guider/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token || !isAuthenticated) return;

      try {
        const response = await usersService.getCurrentUser('guider');
        if (response.success && response.data) {
          const data = response.data as any;
          setProfileData(data);
          // Initialize form data with current profile data
          setFormData({
            // Personal Info
            showcaseName: data.personalInfo?.showcaseName || '',
            fullName: data.personalInfo?.fullName || '',
            city: data.personalInfo?.city || '',
            overview: data.personalInfo?.overview || '',
            languagesKnown: data.personalInfo?.languagesKnown || [],
            education: data.personalInfo?.education || '',
            awards: data.personalInfo?.awards || [],
            newAward: '',
            // Business Info
            companyName: data.businessInfo?.companyName || '',
            foundingDate: data.businessInfo?.foundingDate ? new Date(data.businessInfo.foundingDate).toISOString().split('T')[0] : '',
            websiteUrl: data.businessInfo?.websiteUrl || '',
            socialMediaProfile: data.businessInfo?.socialMediaProfile || '',
            hasGSTNumber: data.businessInfo?.hasGSTNumber || false,
            gstNumber: data.businessInfo?.gstNumber || '',
            // Tour Guide Info
            certifications: data.tourGuideInfo?.certifications || [],
            newCertification: '',
            pricePerHour: data.tourGuideInfo?.pricePerHour || '',
            pricePerDay: data.tourGuideInfo?.pricePerDay || '',
            pricePerTour: data.tourGuideInfo?.pricePerTour || '',
            currency: data.tourGuideInfo?.currency || 'INR',
            tourDurations: data.tourGuideInfo?.tourDurations || [],
            newTourDuration: '',
            aboutMe: data.tourGuideInfo?.aboutMe || '',
            languagesSpoken: data.tourGuideInfo?.languagesSpoken || [],
            hasVehicle: data.tourGuideInfo?.hasVehicle || false,
            vehicleDescription: data.tourGuideInfo?.vehicleDescription || '',
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && token) {
      fetchProfile();
    }
  }, [token, isAuthenticated]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (field: string, item: string) => {
    setFormData((prev: any) => {
      const currentArray = prev[field] || [];
      const newArray = currentArray.includes(item)
        ? currentArray.filter((i: string) => i !== item)
        : [...currentArray, item];
      return { ...prev, [field]: newArray };
    });
  };

  const addArrayItem = (field: string, newItemField: string) => {
    const newItem = formData[newItemField]?.trim();
    if (newItem) {
      setFormData((prev: any) => ({
        ...prev,
        [field]: [...(prev[field] || []), newItem],
        [newItemField]: '',
      }));
    }
  };

  const removeArrayItem = (field: string, index: number) => {
    setFormData((prev: any) => {
      const newArray = [...(prev[field] || [])];
      newArray.splice(index, 1);
      return { ...prev, [field]: newArray };
    });
  };

  const handleSubmit = async (tab: 'personal' | 'business' | 'tour') => {
    if (!profileData || !token) return;

    setSaving(true);
    try {
      const updateData: any = {};

      if (tab === 'personal') {
        // Personal Info
        if (formData.showcaseName) updateData.showcaseName = formData.showcaseName;
        if (formData.fullName) updateData.fullName = formData.fullName;
        if (formData.city) updateData.city = formData.city;
        if (formData.overview !== undefined) updateData.overview = formData.overview;
        if (formData.languagesKnown) updateData.languagesKnown = formData.languagesKnown;
        if (formData.education) updateData.education = formData.education;
        if (formData.awards) updateData.awards = formData.awards;
      } else if (tab === 'business') {
        // Business Info
        if (formData.companyName) updateData.companyName = formData.companyName;
        if (formData.foundingDate) updateData.foundingDate = formData.foundingDate;
        if (formData.websiteUrl) updateData.websiteUrl = formData.websiteUrl;
        if (formData.socialMediaProfile) updateData.socialMediaProfile = formData.socialMediaProfile;
        if (formData.hasGSTNumber !== undefined) updateData.hasGSTNumber = formData.hasGSTNumber;
        if (formData.gstNumber) updateData.gstNumber = formData.gstNumber;
      } else if (tab === 'tour') {
        // Tour Guide Info
        if (formData.certifications) updateData.certifications = formData.certifications;
        if (formData.pricePerHour) updateData.pricePerHour = Number(formData.pricePerHour);
        if (formData.pricePerDay) updateData.pricePerDay = Number(formData.pricePerDay);
        if (formData.pricePerTour) updateData.pricePerTour = Number(formData.pricePerTour);
        if (formData.currency) updateData.currency = formData.currency;
        if (formData.tourDurations) updateData.tourDurations = formData.tourDurations;
        if (formData.aboutMe !== undefined) updateData.aboutMe = formData.aboutMe;
        if (formData.languagesSpoken) updateData.languagesSpoken = formData.languagesSpoken;
        if (formData.hasVehicle !== undefined) updateData.hasVehicle = formData.hasVehicle;
        if (formData.vehicleDescription) updateData.vehicleDescription = formData.vehicleDescription;
      }

      const response = await usersService.updateGuiderProfile(profileData._id, updateData);
      
      if (response.success) {
        // Refresh profile data
        const refreshResponse = await usersService.getCurrentUser('guider');
        if (refreshResponse.success && refreshResponse.data) {
          const refreshedData = refreshResponse.data as any;
          setProfileData(refreshedData);
          // Update user context with refreshed data
          refreshUser(refreshedData);
        }
        // Exit edit mode for this tab
        setEditingTabs((prev) => ({ ...prev, [tab]: false }));
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const toggleEditMode = (tab: 'personal' | 'business' | 'tour') => {
    setEditingTabs((prev) => ({ ...prev, [tab]: !prev[tab] }));
  };

  const renderEditHeader = (tab: 'personal' | 'business' | 'tour') => {
    const isEditing = editingTabs[tab];
    
    return (
      <div className="flex justify-end mb-4">
        {!isEditing ? (
          <button
            onClick={() => toggleEditMode(tab)}
            className="flex items-center gap-2 px-4 py-2 text-primary-600 border border-primary-600 rounded-lg hover:bg-primary-50 transition-colors font-medium"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => {
                toggleEditMode(tab);
                // Reset form data to original values for this tab
                const data = profileData as any;
                if (tab === 'personal') {
                  setFormData((prev: any) => ({
                    ...prev,
                    showcaseName: data.personalInfo?.showcaseName || '',
                    fullName: data.personalInfo?.fullName || '',
                    city: data.personalInfo?.city || '',
                    overview: data.personalInfo?.overview || '',
                    languagesKnown: data.personalInfo?.languagesKnown || [],
                    education: data.personalInfo?.education || '',
                    awards: data.personalInfo?.awards || [],
                  }));
                } else if (tab === 'business') {
                  setFormData((prev: any) => ({
                    ...prev,
                    companyName: data.businessInfo?.companyName || '',
                    foundingDate: data.businessInfo?.foundingDate ? new Date(data.businessInfo.foundingDate).toISOString().split('T')[0] : '',
                    websiteUrl: data.businessInfo?.websiteUrl || '',
                    socialMediaProfile: data.businessInfo?.socialMediaProfile || '',
                    hasGSTNumber: data.businessInfo?.hasGSTNumber || false,
                    gstNumber: data.businessInfo?.gstNumber || '',
                  }));
                } else if (tab === 'tour') {
                  setFormData((prev: any) => ({
                    ...prev,
                    certifications: data.tourGuideInfo?.certifications || [],
                    pricePerHour: data.tourGuideInfo?.pricePerHour || '',
                    pricePerDay: data.tourGuideInfo?.pricePerDay || '',
                    pricePerTour: data.tourGuideInfo?.pricePerTour || '',
                    currency: data.tourGuideInfo?.currency || 'INR',
                    aboutMe: data.tourGuideInfo?.aboutMe || '',
                    languagesSpoken: data.tourGuideInfo?.languagesSpoken || [],
                    hasVehicle: data.tourGuideInfo?.hasVehicle || false,
                    vehicleDescription: data.tourGuideInfo?.vehicleDescription || '',
                  }));
                }
              }}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={() => handleSubmit(tab)}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save
                </>
              )}
            </button>
          </div>
        )}
      </div>
    );
  };

  if (isLoading || loading) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading profile...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!isAuthenticated || !user || !profileData) {
    return null;
  }

  const tabs = [
    { id: 'personal' as const, label: 'Personal', icon: User },
    { id: 'business' as const, label: 'Business', icon: Building2 },
    { id: 'tour' as const, label: 'Tour Guide', icon: MapPin },
  ];

  const renderPersonalInfo = () => {
    const isEditing = editingTabs.personal;
    
    return (
      <div className="space-y-6">
        {renderEditHeader('personal')}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Showcase Name *</label>
          {isEditing ? (
            <input
              type="text"
              value={formData.showcaseName || ''}
              onChange={(e) => handleInputChange('showcaseName', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          ) : (
            <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
              {profileData?.personalInfo?.showcaseName || 'Not set'}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
          {isEditing ? (
            <input
              type="text"
              value={formData.fullName || ''}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          ) : (
            <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
              {profileData?.personalInfo?.fullName || 'Not set'}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
          {isEditing ? (
            <input
              type="text"
              value={formData.city || ''}
              onChange={(e) => handleInputChange('city', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          ) : (
            <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
              {profileData?.personalInfo?.city || 'Not set'}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Education</label>
          {isEditing ? (
            <input
              type="text"
              value={formData.education || ''}
              onChange={(e) => handleInputChange('education', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          ) : (
            <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
              {profileData?.personalInfo?.education || 'Not set'}
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Overview (max 200 characters)</label>
        {isEditing ? (
          <>
            <textarea
              value={formData.overview || ''}
              onChange={(e) => handleInputChange('overview', e.target.value)}
              maxLength={200}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <p className="text-sm text-gray-500 mt-1">{formData.overview?.length || 0}/200</p>
          </>
        ) : (
          <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
            {profileData?.personalInfo?.overview || 'Not set'}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
          <Languages className="w-4 h-4" />
          Languages Known
        </label>
        {isEditing ? (
          <>
            <div className="flex flex-wrap gap-2 mb-3">
              {commonLanguages.map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => toggleArrayItem('languagesKnown', lang)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    formData.languagesKnown?.includes(lang)
                      ? 'bg-primary-100 text-primary-800 border-2 border-primary-500'
                      : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:border-gray-300'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
            {formData.languagesKnown?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.languagesKnown.map((lang: string, idx: number) => (
                  <span key={idx} className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm flex items-center gap-2">
                    {lang}
                    <button
                      type="button"
                      onClick={() => removeArrayItem('languagesKnown', idx)}
                      className="text-primary-800 hover:text-primary-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-wrap gap-2">
            {profileData?.personalInfo?.languagesKnown && profileData.personalInfo.languagesKnown.length > 0 ? (
              profileData.personalInfo.languagesKnown.map((lang, idx) => (
                <span key={idx} className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm">
                  {lang}
                </span>
              ))
            ) : (
              <p className="text-gray-500">Not set</p>
            )}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
          <Trophy className="w-4 h-4" />
          Awards & Achievements
        </label>
        {isEditing ? (
          <>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={formData.newAward || ''}
                onChange={(e) => handleInputChange('newAward', e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addArrayItem('awards', 'newAward');
                  }
                }}
                placeholder="Add an award or achievement"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => addArrayItem('awards', 'newAward')}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Add
              </button>
            </div>
            {formData.awards?.length > 0 && (
              <div className="space-y-2">
                {formData.awards.map((award: string, idx: number) => (
                  <div key={idx} className="px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-lg text-sm flex items-center justify-between">
                    <span>{award}</span>
                    <button
                      type="button"
                      onClick={() => removeArrayItem('awards', idx)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="space-y-2">
            {profileData?.personalInfo?.awards && profileData.personalInfo.awards.length > 0 ? (
              profileData.personalInfo.awards.map((award, idx) => (
                <div key={idx} className="px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
                  {award}
                </div>
              ))
            ) : (
              <p className="text-gray-500">No awards added</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
  };

  const renderBusinessInfo = () => {
    const isEditing = editingTabs.business;
    
    return (
      <div className="space-y-6">
        {renderEditHeader('business')}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
          {isEditing ? (
            <input
              type="text"
              value={formData.companyName || ''}
              onChange={(e) => handleInputChange('companyName', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          ) : (
            <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
              {profileData?.businessInfo?.companyName || 'Not set'}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Founding Date
          </label>
          {isEditing ? (
            <input
              type="date"
              value={formData.foundingDate || ''}
              onChange={(e) => handleInputChange('foundingDate', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          ) : (
            <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
              {profileData?.businessInfo?.foundingDate 
                ? new Date(profileData.businessInfo.foundingDate).toLocaleDateString()
                : 'Not set'}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Website URL
          </label>
          {isEditing ? (
            <input
              type="url"
              value={formData.websiteUrl || ''}
              onChange={(e) => handleInputChange('websiteUrl', e.target.value)}
              placeholder="https://example.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          ) : (
            <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
              {profileData?.businessInfo?.websiteUrl || 'Not set'}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Instagram className="w-4 h-4" />
            Social Media Profile
          </label>
          {isEditing ? (
            <input
              type="url"
              value={formData.socialMediaProfile || ''}
              onChange={(e) => handleInputChange('socialMediaProfile', e.target.value)}
              placeholder="https://instagram.com/yourprofile"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          ) : (
            <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
              {profileData?.businessInfo?.socialMediaProfile || 'Not set'}
            </p>
          )}
        </div>
        <div className="md:col-span-2">
          <label className="flex items-center gap-2 mb-2">
            {isEditing ? (
              <>
                <input
                  type="checkbox"
                  checked={formData.hasGSTNumber || false}
                  onChange={(e) => handleInputChange('hasGSTNumber', e.target.checked)}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm font-medium text-gray-700">Has GST Number</span>
              </>
            ) : (
              <span className="text-sm font-medium text-gray-700">
                Has GST Number: {profileData?.businessInfo?.hasGSTNumber ? 'Yes' : 'No'}
              </span>
            )}
          </label>
        </div>
        {(isEditing ? formData.hasGSTNumber : profileData?.businessInfo?.hasGSTNumber) && (
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">GST Number</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.gstNumber || ''}
                onChange={(e) => handleInputChange('gstNumber', e.target.value)}
                placeholder="22ABCDE1234F1Z5"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            ) : (
              <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                {profileData?.businessInfo?.gstNumber || 'Not set'}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
  };

  const renderTourGuideInfo = () => {
    const isEditing = editingTabs.tour;
    
    return (
      <div className="space-y-6">
        {renderEditHeader('tour')}
      {/* Pricing */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
          <DollarSign className="w-4 h-4" />
          Pricing
        </label>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Currency</label>
            <select
              value={formData.currency || 'INR'}
              onChange={(e) => handleInputChange('currency', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Per Hour</label>
            <input
              type="number"
              value={formData.pricePerHour || ''}
              onChange={(e) => handleInputChange('pricePerHour', e.target.value)}
              placeholder="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Per Day</label>
            <input
              type="number"
              value={formData.pricePerDay || ''}
              onChange={(e) => handleInputChange('pricePerDay', e.target.value)}
              placeholder="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Per Tour</label>
            <input
              type="number"
              value={formData.pricePerTour || ''}
              onChange={(e) => handleInputChange('pricePerTour', e.target.value)}
              placeholder="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Certifications */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
          <Award className="w-4 h-4" />
          Certifications
        </label>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={formData.newCertification || ''}
            onChange={(e) => handleInputChange('newCertification', e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addArrayItem('certifications', 'newCertification');
              }
            }}
            placeholder="e.g., Government Licensed, First Aid"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <button
            type="button"
            onClick={() => addArrayItem('certifications', 'newCertification')}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Add
          </button>
        </div>
        {formData.certifications?.length > 0 && (
          <div className="space-y-2">
            {formData.certifications.map((cert: string, idx: number) => (
              <div key={idx} className="px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-lg text-sm flex items-center justify-between">
                <span>{cert}</span>
                <button
                  type="button"
                  onClick={() => removeArrayItem('certifications', idx)}
                  className="text-red-600 hover:text-red-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Languages Spoken */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
          <Languages className="w-4 h-4" />
          Languages Spoken
        </label>
        <div className="flex flex-wrap gap-2 mb-3">
          {commonLanguages.map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => toggleArrayItem('languagesSpoken', lang)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                formData.languagesSpoken?.includes(lang)
                  ? 'bg-purple-100 text-purple-800 border-2 border-purple-500'
                  : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:border-gray-300'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {/* Additional Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="flex items-center gap-2 mb-2">
            <input
              type="checkbox"
              checked={formData.hasVehicle || false}
              onChange={(e) => handleInputChange('hasVehicle', e.target.checked)}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Car className="w-4 h-4" />
              Has Vehicle
            </span>
          </label>
          {formData.hasVehicle && (
            <input
              type="text"
              value={formData.vehicleDescription || ''}
              onChange={(e) => handleInputChange('vehicleDescription', e.target.value)}
              placeholder="e.g., Toyota Innova, up to 5 seats"
              className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          )}
        </div>
      </div>

      {/* About Me */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">About Me</label>
        <textarea
          value={formData.aboutMe || ''}
          onChange={(e) => handleInputChange('aboutMe', e.target.value)}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>
    </div>
  );
  };

  return (
    <AppLayout>
      <Section variant="muted" className="py-8">
        <Container>
          {/* Header */}
          <Card className="mb-8 border-0 shadow-lg bg-gradient-to-r from-primary-600 to-primary-700 text-white">
            <CardContent className="p-8">
              <div>
                <Heading as="h1" variant="page" className="mb-2">
                  {profileData?.personalInfo?.showcaseName  || 'Guider Profile'}
                </Heading>
                <p className="text-white/90">
                  {profileData?.email || user?.email || ''}
                </p>
                {profileData?.accountVerified && (
                  <div className="flex items-center gap-2 mt-2">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="text-sm">Verified Account</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="mb-6">
            <TabsList className="grid w-full grid-cols-3">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                    <Icon className="w-5 h-5" />
                    <span className="text-base">{tab.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>

          {/* Tab Content */}
          <Card className="mb-6">
            <CardContent className="p-6">
              {activeTab === 'personal' && renderPersonalInfo()}
              {activeTab === 'business' && renderBusinessInfo()}
              {activeTab === 'tour' && renderTourGuideInfo()}
            </CardContent>
          </Card>

          {/* Back Button */}
          <div className="flex justify-end gap-4">
            <Link href="/guider/profile">
              <Button variant="outline">
                Back to Profile
              </Button>
            </Link>
          </div>
        </Container>
      </Section>
    </AppLayout>
  );
}

export default function GuiderProfileEditPage() {
  return (
    <Suspense fallback={
      <AppLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
        </div>
      </AppLayout>
    }>
      <GuiderProfileEditContent />
    </Suspense>
  );
}

