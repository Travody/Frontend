'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import { User, Building2, MapPin, Award, Star, Phone, Mail, CheckCircle2, XCircle, Calendar, Languages, Trophy, Globe, Instagram, FileText, Clock, Car, Info, Coins, Edit, Save, X, Search, ChevronDown, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import { apiService, Review } from '@/lib/api';
import { tourTypes } from '@/lib/tour-types';
import toast from 'react-hot-toast';
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
import { Separator } from '@/components/ui/separator';

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
    tourTypes?: string[];
    specializations?: string[];
    certifications?: string[];
    rating?: number;
    totalReviews?: number;
    totalTours?: number;
    responseTime?: number;
    cancellationPolicy?: string;
    tourDurations?: string[];
    groupSizes?: string[];
    accessibility?: string[];
    aboutMe?: string;
    whyChooseMe?: string;
    languagesSpoken?: string[];
    hasVehicle?: boolean;
    vehicleDescription?: string;
    isExperienced?: boolean;
    gallery?: string[];
    highlights?: string[];
    availabilitySchedule?: {
      type: 'all_days' | 'recurring';
      recurring?: {
        daysOfWeek: string[];
        timeSlot?: {
          startTime?: string;
          endTime?: string;
        };
      };
    };
  };
  indiaSpecificInfo?: {
    indianStates?: string[];
    indianCities?: string[];
    indianLanguages?: string[];
    indianCuisines?: string[];
    indianFestivals?: string[];
  };
}

const defaultLanguages = [
  'English', 'Hindi', 'Bengali', 'Telugu', 'Marathi', 'Tamil', 'Gujarati',
  'Urdu', 'Kannada', 'Odia', 'Malayalam', 'Punjabi', 'Assamese', 'French',
  'Spanish', 'German', 'Italian', 'Portuguese', 'Chinese', 'Japanese'
];

const DAYS_OF_WEEK = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' }
];

interface LanguageSelectorProps {
  label: string;
  selectedLanguages: string[];
  onLanguageChange?: (languages: string[]) => void;
  isEditing: boolean;
  defaultLanguages: string[];
}

function LanguageSelector({ label, selectedLanguages, onLanguageChange, isEditing, defaultLanguages }: LanguageSelectorProps) {
  const [languageSearch, setLanguageSearch] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [availableLanguages, setAvailableLanguages] = useState(defaultLanguages);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Update available languages to include any custom languages already selected
    const customLangs = selectedLanguages.filter(lang => !defaultLanguages.includes(lang));
    if (customLangs.length > 0) {
      setAvailableLanguages([...defaultLanguages, ...customLangs]);
    }
  }, [selectedLanguages]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
        setLanguageSearch('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const addLanguage = (lang: string) => {
    if (!onLanguageChange) return;
    const trimmedLang = lang.trim();
    if (trimmedLang && !selectedLanguages.includes(trimmedLang)) {
      // Add to available languages if not already there
      if (!availableLanguages.includes(trimmedLang)) {
        setAvailableLanguages([...availableLanguages, trimmedLang]);
      }
      onLanguageChange([...selectedLanguages, trimmedLang]);
      setLanguageSearch('');
      setIsDropdownOpen(false);
    }
  };

  const removeLanguage = (lang: string) => {
    if (!onLanguageChange) return;
    onLanguageChange(selectedLanguages.filter(l => l !== lang));
  };

  const filteredLanguages = availableLanguages.filter(lang => 
    !selectedLanguages.includes(lang) &&
    lang.toLowerCase().includes(languageSearch.toLowerCase())
  );

  const searchTermExists = languageSearch.trim() && 
    !availableLanguages.some(lang => lang.toLowerCase() === languageSearch.toLowerCase().trim());

  if (!isEditing) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
          <Languages className="w-4 h-4" />
          {label}
        </label>
        <div className="flex flex-wrap gap-2">
          {selectedLanguages.length > 0 ? (
            selectedLanguages.map((lang, idx) => (
              <Badge key={idx} variant="secondary">
                {lang}
              </Badge>
            ))
          ) : (
            <p className="text-gray-500">Not set</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
        <Languages className="w-4 h-4" />
        {label}
      </label>
      
      {/* Selected Languages List */}
      {selectedLanguages.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {selectedLanguages.map((lang: string) => (
            <div
              key={lang}
                  className="flex items-center gap-1"
            >
              <span>{lang}</span>
              <button
                type="button"
                onClick={() => removeLanguage(lang)}
                className="text-primary-700 hover:text-primary-900"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Language Search Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={languageSearch}
            onChange={(e) => {
              setLanguageSearch(e.target.value);
              setIsDropdownOpen(true);
            }}
            onFocus={() => setIsDropdownOpen(true)}
            placeholder="Search and select languages..."
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white"
          />
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"
          >
            <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isDropdownOpen ? 'transform rotate-180' : ''}`} />
          </button>
        </div>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {filteredLanguages.length > 0 ? (
              <div className="py-1">
                {filteredLanguages.map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => addLanguage(lang)}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-900 focus:bg-primary-50 focus:outline-none"
                  >
                    {lang}
                  </button>
                ))}
              </div>
            ) : searchTermExists ? (
              <div className="py-1">
                <button
                  type="button"
                  onClick={() => addLanguage(languageSearch.trim())}
                  className="w-full text-left px-4 py-2 text-sm text-primary-600 hover:bg-primary-50 focus:bg-primary-50 focus:outline-none flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add '{languageSearch.trim()}'
                </button>
              </div>
            ) : (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                {languageSearch ? 'No languages found' : 'Start typing to search languages'}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function GuiderProfileContent() {
  const { user, token, isAuthenticated, isLoading, refreshUser } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'personal' | 'business' | 'tour' | 'reviews' | 'india' | 'account'>('personal');
  const [profileData, setProfileData] = useState<GuiderProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [editingTabs, setEditingTabs] = useState<{
    personal: boolean;
    business: boolean;
    tour: boolean;
    india: boolean;
    account: boolean;
  }>({
    personal: false,
    business: false,
    tour: false,
    india: false,
    account: false,
  });
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/guider/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Reset activeTab if business tab is not available
  useEffect(() => {
    if (activeTab === 'business' && profileData?.guiderType !== 'Agency') {
      setActiveTab('personal');
    }
  }, [activeTab, profileData?.guiderType]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token || !isAuthenticated) return;

      try {
        const response = await apiService.getCurrentUser(token, 'guider');
        if (response.success && response.data) {
          const data = response.data as any;
          setProfileData(data);
          // Fetch reviews if included in response
          if (data.reviews) {
            setReviews(data.reviews);
          } else {
            // Fetch reviews separately
            fetchGuiderReviews(data._id);
          }
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
            tourTypes: data.tourGuideInfo?.tourTypes || [],
            specializations: data.tourGuideInfo?.specializations || [],
            newSpecialization: '',
            certifications: data.tourGuideInfo?.certifications || [],
            newCertification: '',
            responseTime: data.tourGuideInfo?.responseTime || '',
            cancellationPolicy: data.tourGuideInfo?.cancellationPolicy || '',
            accessibility: data.tourGuideInfo?.accessibility || [],
            newAccessibility: '',
            aboutMe: data.tourGuideInfo?.aboutMe || '',
            whyChooseMe: data.tourGuideInfo?.whyChooseMe || '',
            languagesSpoken: data.tourGuideInfo?.languagesSpoken || [],
            hasVehicle: data.tourGuideInfo?.hasVehicle || false,
            vehicleDescription: data.tourGuideInfo?.vehicleDescription || '',
            isExperienced: data.tourGuideInfo?.isExperienced || false,
            gallery: data.tourGuideInfo?.gallery || [],
            newGalleryUrl: '',
            highlights: data.tourGuideInfo?.highlights || [],
            newHighlight: '',
            // Availability Schedule
            availabilitySchedule: data.tourGuideInfo?.availabilitySchedule || { type: 'all_days' },
            // India Specific Info
            indianStates: data.indiaSpecificInfo?.indianStates || [],
            newIndianState: '',
            indianCities: data.indiaSpecificInfo?.indianCities || [],
            newIndianCity: '',
            indianLanguages: data.indiaSpecificInfo?.indianLanguages || [],
            indianCuisines: data.indiaSpecificInfo?.indianCuisines || [],
            newIndianCuisine: '',
            indianFestivals: data.indiaSpecificInfo?.indianFestivals || [],
            newIndianFestival: '',
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

  const fetchGuiderReviews = async (guiderId: string) => {
    if (!guiderId) return;

    setIsLoadingReviews(true);
    try {
      const response = await apiService.getReviewsByGuider(guiderId, 'guider');
      if (response.success && response.data) {
        setReviews(response.data);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setIsLoadingReviews(false);
    }
  };

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

  const handleSubmit = async (tab: 'personal' | 'business' | 'tour' | 'india') => {
    if (!profileData || !token) return;

    setSaving(true);
    try {
      const updateData: any = {};

      if (tab === 'personal') {
        if (formData.showcaseName) updateData.showcaseName = formData.showcaseName;
        if (formData.fullName !== undefined) updateData.fullName = formData.fullName;
        if (formData.city !== undefined) updateData.city = formData.city;
        if (formData.overview !== undefined) updateData.overview = formData.overview;
        if (formData.languagesKnown) updateData.languagesKnown = formData.languagesKnown;
        if (formData.education !== undefined) updateData.education = formData.education;
        if (formData.awards) updateData.awards = formData.awards;
      } else if (tab === 'business') {
        if (formData.companyName !== undefined) updateData.companyName = formData.companyName;
        if (formData.foundingDate) updateData.foundingDate = formData.foundingDate;
        if (formData.websiteUrl !== undefined) updateData.websiteUrl = formData.websiteUrl;
        if (formData.socialMediaProfile !== undefined) updateData.socialMediaProfile = formData.socialMediaProfile;
        if (formData.hasGSTNumber !== undefined) updateData.hasGSTNumber = formData.hasGSTNumber;
        if (formData.gstNumber !== undefined) updateData.gstNumber = formData.gstNumber;
      } else if (tab === 'tour') {
        if (formData.tourTypes) updateData.tourTypes = formData.tourTypes;
        if (formData.specializations) updateData.specializations = formData.specializations;
        if (formData.certifications) updateData.certifications = formData.certifications;
        if (formData.responseTime !== undefined && formData.responseTime !== '') updateData.responseTime = Number(formData.responseTime);
        if (formData.cancellationPolicy !== undefined) updateData.cancellationPolicy = formData.cancellationPolicy;
        if (formData.accessibility) updateData.accessibility = formData.accessibility;
        if (formData.aboutMe !== undefined) updateData.aboutMe = formData.aboutMe;
        if (formData.whyChooseMe !== undefined) updateData.whyChooseMe = formData.whyChooseMe;
        if (formData.languagesSpoken) updateData.languagesSpoken = formData.languagesSpoken;
        if (formData.hasVehicle !== undefined) updateData.hasVehicle = formData.hasVehicle;
        if (formData.vehicleDescription !== undefined) updateData.vehicleDescription = formData.vehicleDescription;
        if (formData.isExperienced !== undefined) updateData.isExperienced = formData.isExperienced;
        if (formData.gallery) updateData.gallery = formData.gallery;
        if (formData.highlights) updateData.highlights = formData.highlights;
        if (formData.availabilitySchedule) updateData.availabilitySchedule = formData.availabilitySchedule;
      } else if (tab === 'india') {
        if (formData.indianStates) updateData.indianStates = formData.indianStates;
        if (formData.indianCities) updateData.indianCities = formData.indianCities;
        if (formData.indianLanguages) updateData.indianLanguages = formData.indianLanguages;
        if (formData.indianCuisines) updateData.indianCuisines = formData.indianCuisines;
        if (formData.indianFestivals) updateData.indianFestivals = formData.indianFestivals;
      }

      const response = await apiService.updateGuiderProfile(profileData._id, updateData, token);
      
      if (response.success) {
        // Refresh profile data to show updated information in view mode
        const refreshResponse = await apiService.getCurrentUser(token, 'guider');
        if (refreshResponse.success && refreshResponse.data) {
          const refreshedData = refreshResponse.data as any;
          setProfileData(refreshedData);
          // Also update formData with refreshed data for when user enters edit mode again
          if (tab === 'personal') {
            setFormData((prev: any) => ({
              ...prev,
              showcaseName: refreshedData.personalInfo?.showcaseName || '',
              fullName: refreshedData.personalInfo?.fullName || '',
              city: refreshedData.personalInfo?.city || '',
              overview: refreshedData.personalInfo?.overview || '',
              languagesKnown: refreshedData.personalInfo?.languagesKnown || [],
              education: refreshedData.personalInfo?.education || '',
              awards: refreshedData.personalInfo?.awards || [],
            }));
          }
          // Update user context with refreshed data
          refreshUser(refreshedData);
        }
        // Exit edit mode for this tab
        setEditingTabs((prev) => ({ ...prev, [tab]: false }));
        toast.success('Profile updated successfully!');
      } else {
        toast.error(response.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const toggleEditMode = (tab: 'personal' | 'business' | 'tour' | 'india' | 'account') => {
    setEditingTabs((prev) => ({ ...prev, [tab]: !prev[tab] }));
    // Reset form data to current values when entering edit mode
    if (!editingTabs[tab]) {
      const data = profileData as any;
      if (tab === 'account') {
        setNewEmail(data.email || user?.email || '');
        setNewPhone(data.mobile || user?.mobile || '');
        setShowOtpVerification(false);
        setOtp('');
        setOtpSent(false);
      } else if (tab === 'personal') {
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
          tourTypes: data.tourGuideInfo?.tourTypes || [],
          specializations: data.tourGuideInfo?.specializations || [],
          certifications: data.tourGuideInfo?.certifications || [],
          responseTime: data.tourGuideInfo?.responseTime || '',
          cancellationPolicy: data.tourGuideInfo?.cancellationPolicy || '',
          accessibility: data.tourGuideInfo?.accessibility || [],
          aboutMe: data.tourGuideInfo?.aboutMe || '',
          whyChooseMe: data.tourGuideInfo?.whyChooseMe || '',
          languagesSpoken: data.tourGuideInfo?.languagesSpoken || [],
          hasVehicle: data.tourGuideInfo?.hasVehicle || false,
          vehicleDescription: data.tourGuideInfo?.vehicleDescription || '',
          isExperienced: data.tourGuideInfo?.isExperienced || false,
          gallery: data.tourGuideInfo?.gallery || [],
          highlights: data.tourGuideInfo?.highlights || [],
          availabilitySchedule: data.tourGuideInfo?.availabilitySchedule || { type: 'all_days' },
        }));
      } else if (tab === 'india') {
        setFormData((prev: any) => ({
          ...prev,
          indianStates: data.indiaSpecificInfo?.indianStates || [],
          indianCities: data.indiaSpecificInfo?.indianCities || [],
          indianLanguages: data.indiaSpecificInfo?.indianLanguages || [],
          indianCuisines: data.indiaSpecificInfo?.indianCuisines || [],
          indianFestivals: data.indiaSpecificInfo?.indianFestivals || [],
        }));
      }
    }
  };

  const renderEditHeader = (tab: 'personal' | 'business' | 'tour' | 'india' | 'account') => {
    const isEditing = editingTabs[tab];
    
    return (
      <div className="flex justify-end mb-4">
        {!isEditing ? (
          <Button
            onClick={() => toggleEditMode(tab)}
            variant="outline"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              onClick={() => {
                toggleEditMode(tab);
                // Reset form data to original values
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
                    tourTypes: data.tourGuideInfo?.tourTypes || [],
                    specializations: data.tourGuideInfo?.specializations || [],
                    certifications: data.tourGuideInfo?.certifications || [],
                    responseTime: data.tourGuideInfo?.responseTime || '',
                    cancellationPolicy: data.tourGuideInfo?.cancellationPolicy || '',
                    aboutMe: data.tourGuideInfo?.aboutMe || '',
                    whyChooseMe: data.tourGuideInfo?.whyChooseMe || '',
                    languagesSpoken: data.tourGuideInfo?.languagesSpoken || [],
                    hasVehicle: data.tourGuideInfo?.hasVehicle || false,
                    vehicleDescription: data.tourGuideInfo?.vehicleDescription || '',
                    isExperienced: data.tourGuideInfo?.isExperienced || false,
                    gallery: data.tourGuideInfo?.gallery || [],
                    highlights: data.tourGuideInfo?.highlights || [],
                    availabilitySchedule: data.tourGuideInfo?.availabilitySchedule || { type: 'all_days' },
                  }));
                } else if (tab === 'india') {
                  setFormData((prev: any) => ({
                    ...prev,
                    indianStates: data.indiaSpecificInfo?.indianStates || [],
                    indianCities: data.indiaSpecificInfo?.indianCities || [],
                    indianLanguages: data.indiaSpecificInfo?.indianLanguages || [],
                    indianCuisines: data.indiaSpecificInfo?.indianCuisines || [],
                    indianFestivals: data.indiaSpecificInfo?.indianFestivals || [],
                  }));
                } else if (tab === 'account') {
                  setNewEmail(data.email || user?.email || '');
                  setNewPhone(data.mobile || user?.mobile || '');
                  setShowOtpVerification(false);
                  setOtp('');
                  setOtpSent(false);
                }
              }}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (tab === 'account') {
                  handleSubmitAccount();
                } else {
                  handleSubmit(tab);
                }
              }}
              disabled={saving || otpLoading}
            >
              {saving || otpLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    );
  };

  if (isLoading || loading) {
    return (
      <AppLayout>
        <LoadingState message="Loading profile..." />
      </AppLayout>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const tabs = [
    { id: 'personal' as const, label: 'Personal', icon: User },
    ...(profileData?.guiderType === 'Agency' ? [{ id: 'business' as const, label: 'Business', icon: Building2 }] : []),
    { id: 'tour' as const, label: 'Tour Guide', icon: MapPin },
    { id: 'reviews' as const, label: 'Reviews', icon: Star },
    { id: 'india' as const, label: 'India Specific', icon: Coins },
    { id: 'account' as const, label: 'Account', icon: Info },
  ];

  const renderPersonalInfo = () => {
    const isEditing = editingTabs.personal;
    
    return (
      <div className="space-y-6">
        {renderEditHeader('personal')}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Showcase Name</label>
            {isEditing ? (
              <Input
                type="text"
                value={formData.showcaseName || ''}
                onChange={(e) => handleInputChange('showcaseName', e.target.value)}
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
              />
            ) : (
              <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                {profileData?.personalInfo?.education || 'Not set'}
              </p>
            )}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Overview</label>
          {isEditing ? (
            <>
              <textarea
                value={formData.overview || ''}
                onChange={(e) => handleInputChange('overview', e.target.value)}
                maxLength={200}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
              />
              <p className="text-sm text-gray-500 mt-1">{formData.overview?.length || 0}/200</p>
            </>
          ) : (
            <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
              {profileData?.personalInfo?.overview || 'Not set'}
            </p>
          )}
        </div>
        <LanguageSelector
          label="Languages Known"
          selectedLanguages={isEditing ? (formData.languagesKnown || []) : (profileData?.personalInfo?.languagesKnown || [])}
          onLanguageChange={isEditing ? (languages: string[]) => handleInputChange('languagesKnown', languages) : undefined}
          isEditing={isEditing}
          defaultLanguages={defaultLanguages}
        />
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
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                />
                <button
                  type="button"
                  onClick={() => addArrayItem('awards', 'newAward')}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Add
                </button>
              </div>
              {(formData.awards?.length > 0) && (
                <div className="space-y-2 mt-3">
                  {formData.awards.map((award: string, idx: number) => (
                    <div key={idx} className="px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-lg text-sm flex items-center justify-between">
                      <span className="text-gray-900">{award}</span>
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
              {formData.awards?.length === 0 && (
                <p className="text-gray-500 text-sm mt-2">No awards added yet</p>
              )}
            </>
          ) : (
            <div className="space-y-2">
              {profileData?.personalInfo?.awards && profileData.personalInfo.awards.length > 0 ? (
                profileData.personalInfo.awards.map((award, idx) => (
                  <div key={idx} className="px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
                    <span className="text-gray-900">{award}</span>
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
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
              Website
            </label>
            {isEditing ? (
              <input
                type="url"
                value={formData.websiteUrl || ''}
                onChange={(e) => handleInputChange('websiteUrl', e.target.value)}
                placeholder="https://example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
              />
            ) : (
              profileData?.businessInfo?.websiteUrl ? (
                <a
                  href={profileData.businessInfo.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700 bg-gray-50 p-3 rounded-lg block break-all"
                >
                  {profileData.businessInfo.websiteUrl}
                </a>
              ) : (
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">Not set</p>
              )
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
              />
            ) : (
              profileData?.businessInfo?.socialMediaProfile ? (
                <a
                  href={profileData.businessInfo.socialMediaProfile}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700 bg-gray-50 p-3 rounded-lg block break-all"
                >
                  {profileData.businessInfo.socialMediaProfile}
                </a>
              ) : (
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">Not set</p>
              )
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
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
        {/* Ratings and Stats - Read Only */}
        {(profileData?.tourGuideInfo?.rating || profileData?.tourGuideInfo?.totalReviews || profileData?.tourGuideInfo?.totalTours) && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {profileData?.tourGuideInfo?.rating && (
              <div className="bg-primary-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-5 h-5 text-primary-600" />
                  <label className="text-sm font-medium text-gray-700">Rating</label>
                </div>
                <p className="text-2xl font-bold text-primary-600">{profileData.tourGuideInfo.rating.toFixed(1)}</p>
              </div>
            )}
            {profileData?.tourGuideInfo?.totalReviews && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-5 h-5 text-blue-600" />
                  <label className="text-sm font-medium text-gray-700">Total Reviews</label>
                </div>
                <p className="text-2xl font-bold text-blue-600">{profileData.tourGuideInfo.totalReviews}</p>
              </div>
            )}
            {profileData.tourGuideInfo.totalTours && (
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-5 h-5 text-purple-600" />
                  <label className="text-sm font-medium text-gray-700">Total Tours</label>
                </div>
                <p className="text-2xl font-bold text-purple-600">{profileData.tourGuideInfo.totalTours}</p>
              </div>
            )}
          </div>
        )}
        
        {/* Tour Types */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Tour Types
          </label>
          {isEditing ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {tourTypes.map((tourType) => {
                const Icon = tourType.icon;
                const isSelected = (formData.tourTypes || []).includes(tourType.name);
                return (
                  <button
                    key={tourType.name}
                    type="button"
                    onClick={() => toggleArrayItem('tourTypes', tourType.name)}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      isSelected
                        ? `${tourType.color} border-current`
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className={`w-5 h-5 ${isSelected ? '' : 'text-gray-400'}`} />
                      <span className={`text-sm font-medium ${isSelected ? '' : 'text-gray-600'}`}>
                        {tourType.name}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {profileData?.tourGuideInfo?.tourTypes && profileData.tourGuideInfo.tourTypes.length > 0 ? (
                profileData.tourGuideInfo.tourTypes.map((type, idx) => (
                  <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                    {type}
                  </span>
                ))
              ) : (
                <p className="text-gray-500">Not set</p>
              )}
            </div>
          )}
        </div>

        {/* Specializations */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Specializations</label>
          {isEditing ? (
            <>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={formData.newSpecialization || ''}
                  onChange={(e) => handleInputChange('newSpecialization', e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addArrayItem('specializations', 'newSpecialization');
                    }
                  }}
                  placeholder="Add a specialization"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                />
                <button
                  type="button"
                  onClick={() => addArrayItem('specializations', 'newSpecialization')}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Add
                </button>
              </div>
              {(formData.specializations?.length > 0) && (
                <div className="space-y-2 mt-3">
                  {formData.specializations.map((spec: string, idx: number) => (
                    <div key={idx} className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm flex items-center justify-between">
                      <span className="text-gray-900">{spec}</span>
                      <button
                        type="button"
                        onClick={() => removeArrayItem('specializations', idx)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {formData.specializations?.length === 0 && (
                <p className="text-gray-500 text-sm mt-2">No specializations added yet</p>
              )}
            </>
          ) : (
            <div className="space-y-2">
              {profileData?.tourGuideInfo?.specializations && profileData.tourGuideInfo.specializations.length > 0 ? (
                profileData.tourGuideInfo.specializations.map((spec, idx) => (
                  <div key={idx} className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                    <span className="text-gray-900">{spec}</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">Not set</p>
              )}
            </div>
          )}
        </div>

        {/* Certifications */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Award className="w-4 h-4" />
            Certifications
          </label>
          {isEditing ? (
            <>
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
                  placeholder="Add a certification"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                />
                <button
                  type="button"
                  onClick={() => addArrayItem('certifications', 'newCertification')}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Add
                </button>
              </div>
              {(formData.certifications?.length > 0) && (
                <div className="space-y-2 mt-3">
                  {formData.certifications.map((cert: string, idx: number) => (
                    <div key={idx} className="px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-sm flex items-center justify-between">
                      <span className="text-gray-900">{cert}</span>
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
              {formData.certifications?.length === 0 && (
                <p className="text-gray-500 text-sm mt-2">No certifications added yet</p>
              )}
            </>
          ) : (
            <div className="space-y-2">
              {profileData?.tourGuideInfo?.certifications && profileData.tourGuideInfo.certifications.length > 0 ? (
                profileData.tourGuideInfo.certifications.map((cert, idx) => (
                  <div key={idx} className="px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-sm">
                    <span className="text-gray-900">{cert}</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">Not set</p>
              )}
            </div>
          )}
        </div>

        {/* Response Time & Cancellation Policy */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Response Time (minutes)
            </label>
            {isEditing ? (
              <input
                type="number"
                value={formData.responseTime || ''}
                onChange={(e) => handleInputChange('responseTime', e.target.value)}
                placeholder="e.g., 30"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
              />
            ) : (
              <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                {profileData?.tourGuideInfo?.responseTime ? `${profileData.tourGuideInfo.responseTime} minutes` : 'Not set'}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cancellation Policy</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.cancellationPolicy || ''}
                onChange={(e) => handleInputChange('cancellationPolicy', e.target.value)}
                placeholder="e.g., Free cancellation up to 24 hours"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
              />
            ) : (
              <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                {profileData?.tourGuideInfo?.cancellationPolicy || 'Not set'}
              </p>
            )}
          </div>
        </div>

        {/* Accessibility */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Accessibility</label>
          {isEditing ? (
            <>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={formData.newAccessibility || ''}
                  onChange={(e) => handleInputChange('newAccessibility', e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addArrayItem('accessibility', 'newAccessibility');
                    }
                  }}
                  placeholder="e.g., Wheelchair accessible"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                />
                <button
                  type="button"
                  onClick={() => addArrayItem('accessibility', 'newAccessibility')}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Add
                </button>
              </div>
              {(formData.accessibility?.length > 0) && (
                <div className="space-y-2 mt-3">
                  {formData.accessibility.map((acc: string, idx: number) => (
                    <div key={idx} className="px-3 py-2 bg-cyan-50 border border-cyan-200 rounded-lg text-sm flex items-center justify-between">
                      <span className="text-gray-900">{acc}</span>
                      <button
                        type="button"
                        onClick={() => removeArrayItem('accessibility', idx)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {formData.accessibility?.length === 0 && (
                <p className="text-gray-500 text-sm mt-2">No accessibility options added yet</p>
              )}
            </>
          ) : (
            <div className="space-y-2">
              {profileData?.tourGuideInfo?.accessibility && profileData.tourGuideInfo.accessibility.length > 0 ? (
                profileData.tourGuideInfo.accessibility.map((acc, idx) => (
                  <div key={idx} className="px-3 py-2 bg-cyan-50 border border-cyan-200 rounded-lg text-sm">
                    <span className="text-gray-900">{acc}</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">Not set</p>
              )}
            </div>
          )}
        </div>

        {/* About Me */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">About Me</label>
          {isEditing ? (
            <textarea
              value={formData.aboutMe || ''}
              onChange={(e) => handleInputChange('aboutMe', e.target.value)}
              rows={4}
              placeholder="Tell us about yourself and your guiding experience..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
            />
          ) : (
            <p className="text-gray-900 bg-gray-50 p-3 rounded-lg whitespace-pre-wrap">
              {profileData?.tourGuideInfo?.aboutMe || 'Not set'}
            </p>
          )}
        </div>

        {/* Why Choose Me */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Why Choose Me</label>
          {isEditing ? (
            <textarea
              value={formData.whyChooseMe || ''}
              onChange={(e) => handleInputChange('whyChooseMe', e.target.value)}
              rows={4}
              placeholder="What makes you unique as a guide..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
            />
          ) : (
            <p className="text-gray-900 bg-gray-50 p-3 rounded-lg whitespace-pre-wrap">
              {profileData?.tourGuideInfo?.whyChooseMe || 'Not set'}
            </p>
          )}
        </div>

        {/* Languages Spoken */}
        <LanguageSelector
          label="Languages Spoken"
          selectedLanguages={isEditing ? (formData.languagesSpoken || []) : (profileData?.tourGuideInfo?.languagesSpoken || [])}
          onLanguageChange={isEditing ? (languages: string[]) => handleInputChange('languagesSpoken', languages) : undefined}
          isEditing={isEditing}
          defaultLanguages={defaultLanguages}
        />

        {/* Vehicle Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="flex items-center gap-2 mb-2">
              {isEditing ? (
                <>
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
                </>
              ) : (
                <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Car className="w-4 h-4" />
                  Has Vehicle: {profileData?.tourGuideInfo?.hasVehicle ? 'Yes' : 'No'}
                </span>
              )}
            </label>
          </div>
          {(isEditing ? formData.hasVehicle : profileData?.tourGuideInfo?.hasVehicle) && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Description</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.vehicleDescription || ''}
                  onChange={(e) => handleInputChange('vehicleDescription', e.target.value)}
                  placeholder="e.g., Toyota Innova, up to 5 seats"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                />
              ) : (
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                  {profileData?.tourGuideInfo?.vehicleDescription || 'Not set'}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Experience */}
        <div>
          <label className="flex items-center gap-2 mb-2">
            {isEditing ? (
              <>
                <input
                  type="checkbox"
                  checked={formData.isExperienced || false}
                  onChange={(e) => handleInputChange('isExperienced', e.target.checked)}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm font-medium text-gray-700">Is Experienced Guide</span>
              </>
            ) : (
              <span className="text-sm font-medium text-gray-700">
                Is Experienced Guide: {profileData?.tourGuideInfo?.isExperienced ? 'Yes' : 'No'}
              </span>
            )}
          </label>
        </div>

        {/* Gallery */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Gallery (Image URLs)</label>
          {isEditing ? (
            <>
              <div className="flex gap-2 mb-3">
                <input
                  type="url"
                  value={formData.newGalleryUrl || ''}
                  onChange={(e) => handleInputChange('newGalleryUrl', e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addArrayItem('gallery', 'newGalleryUrl');
                    }
                  }}
                  placeholder="https://example.com/image.jpg"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                />
                <button
                  type="button"
                  onClick={() => addArrayItem('gallery', 'newGalleryUrl')}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Add
                </button>
              </div>
              {(formData.gallery?.length > 0) && (
                <div className="space-y-2 mt-3">
                  {formData.gallery.map((url: string, idx: number) => (
                    <div key={idx} className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm flex items-center justify-between">
                      <a href={url} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700 truncate flex-1 mr-2">
                        {url}
                      </a>
                      <button
                        type="button"
                        onClick={() => removeArrayItem('gallery', idx)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {formData.gallery?.length === 0 && (
                <p className="text-gray-500 text-sm mt-2">No gallery images added yet</p>
              )}
            </>
          ) : (
            <div className="space-y-2">
              {profileData?.tourGuideInfo?.gallery && profileData.tourGuideInfo.gallery.length > 0 ? (
                profileData.tourGuideInfo.gallery.map((url, idx) => (
                  <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700 bg-gray-50 p-3 rounded-lg block break-all">
                    {url}
                  </a>
                ))
              ) : (
                <p className="text-gray-500">Not set</p>
              )}
            </div>
          )}
        </div>

        {/* Highlights */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Highlights</label>
          {isEditing ? (
            <>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={formData.newHighlight || ''}
                  onChange={(e) => handleInputChange('newHighlight', e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addArrayItem('highlights', 'newHighlight');
                    }
                  }}
                  placeholder="Add a highlight"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                />
                <button
                  type="button"
                  onClick={() => addArrayItem('highlights', 'newHighlight')}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Add
                </button>
              </div>
              {(formData.highlights?.length > 0) && (
                <div className="space-y-2 mt-3">
                  {formData.highlights.map((highlight: string, idx: number) => (
                    <div key={idx} className="px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-lg text-sm flex items-center justify-between">
                      <span className="text-gray-900">{highlight}</span>
                      <button
                        type="button"
                        onClick={() => removeArrayItem('highlights', idx)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {formData.highlights?.length === 0 && (
                <p className="text-gray-500 text-sm mt-2">No highlights added yet</p>
              )}
            </>
          ) : (
            <div className="space-y-2">
              {profileData?.tourGuideInfo?.highlights && profileData.tourGuideInfo.highlights.length > 0 ? (
                profileData.tourGuideInfo.highlights.map((highlight, idx) => (
                  <div key={idx} className="px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
                    <span className="text-gray-900">{highlight}</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">Not set</p>
              )}
            </div>
          )}
        </div>

        {/* Availability Schedule */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Availability Schedule
          </label>
          {isEditing ? (
            <div className="space-y-4">
              {/* Availability Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Availability Type</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleInputChange('availabilitySchedule', { type: 'all_days' })}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      formData.availabilitySchedule?.type === 'all_days'
                        ? 'border-primary-600 bg-primary-50 text-primary-900'
                        : 'border-gray-200 hover:border-gray-300 text-gray-900'
                    }`}
                  >
                    <div className="font-medium">All Days</div>
                    <div className="text-xs text-gray-600 mt-1">Available every day</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleInputChange('availabilitySchedule', { 
                      type: 'recurring',
                      recurring: formData.availabilitySchedule?.recurring || { daysOfWeek: [], timeSlot: { startTime: '', endTime: '' } }
                    })}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      formData.availabilitySchedule?.type === 'recurring'
                        ? 'border-primary-600 bg-primary-50 text-primary-900'
                        : 'border-gray-200 hover:border-gray-300 text-gray-900'
                    }`}
                  >
                    <div className="font-medium">Recurring</div>
                    <div className="text-xs text-gray-600 mt-1">Weekly schedule</div>
                  </button>
                </div>
              </div>

              {/* Recurring Availability */}
              {formData.availabilitySchedule?.type === 'recurring' && (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Days of Week</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                    {DAYS_OF_WEEK.map(day => {
                      const isSelected = formData.availabilitySchedule?.recurring?.daysOfWeek?.includes(day.value);
                      return (
                        <button
                          key={day.value}
                          type="button"
                          onClick={() => {
                            const currentDays = formData.availabilitySchedule?.recurring?.daysOfWeek || [];
                            const newDays = currentDays.includes(day.value)
                              ? currentDays.filter((d: string) => d !== day.value)
                              : [...currentDays, day.value];
                            handleInputChange('availabilitySchedule', {
                              ...formData.availabilitySchedule,
                              recurring: {
                                ...formData.availabilitySchedule?.recurring,
                                daysOfWeek: newDays,
                                timeSlot: formData.availabilitySchedule?.recurring?.timeSlot || { startTime: '', endTime: '' }
                              }
                            });
                          }}
                          className={`p-3 border-2 rounded-lg text-sm font-medium transition-all ${
                            isSelected
                              ? 'border-primary-600 bg-primary-100 text-primary-900'
                              : 'border-gray-200 hover:border-gray-300 text-gray-900'
                          }`}
                        >
                          {isSelected && <CheckCircle2 className="w-4 h-4 inline mr-1" />}
                          {day.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Optional Time Slot for Recurring */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Time Slot (Optional)</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Start Time</label>
                        <input
                          type="time"
                          value={formData.availabilitySchedule?.recurring?.timeSlot?.startTime || ''}
                          onChange={(e) => handleInputChange('availabilitySchedule', {
                            ...formData.availabilitySchedule,
                            recurring: {
                              ...formData.availabilitySchedule?.recurring,
                              daysOfWeek: formData.availabilitySchedule?.recurring?.daysOfWeek || [],
                              timeSlot: {
                                ...formData.availabilitySchedule?.recurring?.timeSlot,
                                startTime: e.target.value
                              }
                            }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">End Time</label>
                        <input
                          type="time"
                          value={formData.availabilitySchedule?.recurring?.timeSlot?.endTime || ''}
                          onChange={(e) => handleInputChange('availabilitySchedule', {
                            ...formData.availabilitySchedule,
                            recurring: {
                              ...formData.availabilitySchedule?.recurring,
                              daysOfWeek: formData.availabilitySchedule?.recurring?.daysOfWeek || [],
                              timeSlot: {
                                ...formData.availabilitySchedule?.recurring?.timeSlot,
                                endTime: e.target.value
                              }
                            }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* All Days - No additional configuration needed */}
              {formData.availabilitySchedule?.type === 'all_days' && (
                <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                  <p className="text-sm text-primary-800">
                    <strong>All Days:</strong> You are available for booking on all days. 
                    Travelers can book tours for any date.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {profileData?.tourGuideInfo?.availabilitySchedule ? (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  {profileData.tourGuideInfo.availabilitySchedule.type === 'all_days' && (
                    <p className="text-gray-900"><strong>Type:</strong> Available all days</p>
                  )}
                  {profileData.tourGuideInfo.availabilitySchedule.type === 'recurring' && (
                    <div>
                      <p className="text-gray-900 mb-2"><strong>Type:</strong> Recurring schedule</p>
                      {profileData.tourGuideInfo.availabilitySchedule.recurring?.daysOfWeek && profileData.tourGuideInfo.availabilitySchedule.recurring.daysOfWeek.length > 0 && (
                        <div className="mb-2">
                          <p className="text-sm text-gray-700 mb-1">Days:</p>
                          <div className="flex flex-wrap gap-2">
                            {profileData.tourGuideInfo.availabilitySchedule.recurring.daysOfWeek.map((day: string) => (
                              <span key={day} className="px-2 py-1 bg-primary-100 text-primary-800 rounded text-sm">
                                {DAYS_OF_WEEK.find(d => d.value === day)?.label || day}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {profileData.tourGuideInfo.availabilitySchedule.recurring?.timeSlot && (
                        <p className="text-sm text-gray-700">
                          Time: {profileData.tourGuideInfo.availabilitySchedule.recurring.timeSlot.startTime || '--:--'} - {profileData.tourGuideInfo.availabilitySchedule.recurring.timeSlot.endTime || '--:--'}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">Not set</p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderIndiaSpecificInfo = () => {
    const isEditing = editingTabs.india;
    
    return (
      <div className="space-y-6">
        {renderEditHeader('india')}
        
        {/* Indian States */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Indian States</label>
          {isEditing ? (
            <>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={formData.newIndianState || ''}
                  onChange={(e) => handleInputChange('newIndianState', e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addArrayItem('indianStates', 'newIndianState');
                    }
                  }}
                  placeholder="e.g., Rajasthan"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                />
                <button
                  type="button"
                  onClick={() => addArrayItem('indianStates', 'newIndianState')}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Add
                </button>
              </div>
              {(formData.indianStates?.length > 0) && (
                <div className="space-y-2 mt-3">
                  {formData.indianStates.map((state: string, idx: number) => (
                    <div key={idx} className="px-3 py-2 bg-orange-50 border border-orange-200 rounded-lg text-sm flex items-center justify-between">
                      <span className="text-gray-900">{state}</span>
                      <button
                        type="button"
                        onClick={() => removeArrayItem('indianStates', idx)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {formData.indianStates?.length === 0 && (
                <p className="text-gray-500 text-sm mt-2">No states added yet</p>
              )}
            </>
          ) : (
            <div className="space-y-2">
              {profileData?.indiaSpecificInfo?.indianStates && profileData.indiaSpecificInfo.indianStates.length > 0 ? (
                profileData.indiaSpecificInfo.indianStates.map((state, idx) => (
                  <div key={idx} className="px-3 py-2 bg-orange-50 border border-orange-200 rounded-lg text-sm">
                    <span className="text-gray-900">{state}</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">Not set</p>
              )}
            </div>
          )}
        </div>

        {/* Indian Cities */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Indian Cities</label>
          {isEditing ? (
            <>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={formData.newIndianCity || ''}
                  onChange={(e) => handleInputChange('newIndianCity', e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addArrayItem('indianCities', 'newIndianCity');
                    }
                  }}
                  placeholder="e.g., Jaipur"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                />
                <button
                  type="button"
                  onClick={() => addArrayItem('indianCities', 'newIndianCity')}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Add
                </button>
              </div>
              {(formData.indianCities?.length > 0) && (
                <div className="space-y-2 mt-3">
                  {formData.indianCities.map((city: string, idx: number) => (
                    <div key={idx} className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm flex items-center justify-between">
                      <span className="text-gray-900">{city}</span>
                      <button
                        type="button"
                        onClick={() => removeArrayItem('indianCities', idx)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {formData.indianCities?.length === 0 && (
                <p className="text-gray-500 text-sm mt-2">No cities added yet</p>
              )}
            </>
          ) : (
            <div className="space-y-2">
              {profileData?.indiaSpecificInfo?.indianCities && profileData.indiaSpecificInfo.indianCities.length > 0 ? (
                profileData.indiaSpecificInfo.indianCities.map((city, idx) => (
                  <div key={idx} className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                    <span className="text-gray-900">{city}</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">Not set</p>
              )}
            </div>
          )}
        </div>

        {/* Indian Languages */}
        <LanguageSelector
          label="Indian Languages"
          selectedLanguages={isEditing ? (formData.indianLanguages || []) : (profileData?.indiaSpecificInfo?.indianLanguages || [])}
          onLanguageChange={isEditing ? (languages: string[]) => handleInputChange('indianLanguages', languages) : undefined}
          isEditing={isEditing}
          defaultLanguages={defaultLanguages}
        />

        {/* Indian Cuisines */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Indian Cuisines</label>
          {isEditing ? (
            <>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={formData.newIndianCuisine || ''}
                  onChange={(e) => handleInputChange('newIndianCuisine', e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addArrayItem('indianCuisines', 'newIndianCuisine');
                    }
                  }}
                  placeholder="e.g., Rajasthani Thali"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                />
                <button
                  type="button"
                  onClick={() => addArrayItem('indianCuisines', 'newIndianCuisine')}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Add
                </button>
              </div>
              {(formData.indianCuisines?.length > 0) && (
                <div className="space-y-2 mt-3">
                  {formData.indianCuisines.map((cuisine: string, idx: number) => (
                    <div key={idx} className="px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-sm flex items-center justify-between">
                      <span className="text-gray-900">{cuisine}</span>
                      <button
                        type="button"
                        onClick={() => removeArrayItem('indianCuisines', idx)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {formData.indianCuisines?.length === 0 && (
                <p className="text-gray-500 text-sm mt-2">No cuisines added yet</p>
              )}
            </>
          ) : (
            <div className="space-y-2">
              {profileData?.indiaSpecificInfo?.indianCuisines && profileData.indiaSpecificInfo.indianCuisines.length > 0 ? (
                profileData.indiaSpecificInfo.indianCuisines.map((cuisine, idx) => (
                  <div key={idx} className="px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-sm">
                    <span className="text-gray-900">{cuisine}</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">Not set</p>
              )}
            </div>
          )}
        </div>

        {/* Indian Festivals */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Indian Festivals</label>
          {isEditing ? (
            <>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={formData.newIndianFestival || ''}
                  onChange={(e) => handleInputChange('newIndianFestival', e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addArrayItem('indianFestivals', 'newIndianFestival');
                    }
                  }}
                  placeholder="e.g., Diwali"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                />
                <button
                  type="button"
                  onClick={() => addArrayItem('indianFestivals', 'newIndianFestival')}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Add
                </button>
              </div>
              {(formData.indianFestivals?.length > 0) && (
                <div className="space-y-2 mt-3">
                  {formData.indianFestivals.map((festival: string, idx: number) => (
                    <div key={idx} className="px-3 py-2 bg-purple-50 border border-purple-200 rounded-lg text-sm flex items-center justify-between">
                      <span className="text-gray-900">{festival}</span>
                      <button
                        type="button"
                        onClick={() => removeArrayItem('indianFestivals', idx)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {formData.indianFestivals?.length === 0 && (
                <p className="text-gray-500 text-sm mt-2">No festivals added yet</p>
              )}
            </>
          ) : (
            <div className="space-y-2">
              {profileData?.indiaSpecificInfo?.indianFestivals && profileData.indiaSpecificInfo.indianFestivals.length > 0 ? (
                profileData.indiaSpecificInfo.indianFestivals.map((festival, idx) => (
                  <div key={idx} className="px-3 py-2 bg-purple-50 border border-purple-200 rounded-lg text-sm">
                    <span className="text-gray-900">{festival}</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">Not set</p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const handleSendOtpForEmail = async () => {
    if (!newEmail || !newEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setOtpLoading(true);
    try {
      const response = await apiService.sendOtpForEmailUpdate(newEmail, 'guider', token || '');
      if (response.success) {
        setOtpSent(true);
        setShowOtpVerification(true);
      } else {
        toast.error(response.message || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      toast.error('Failed to send OTP. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtpAndUpdateEmail = async () => {
    if (otp.length !== 6) {
      toast.error('Please enter a 6-digit OTP');
      return;
    }

    setOtpLoading(true);
    try {
      const response = await apiService.verifyOtpAndUpdateEmail(newEmail, otp, 'guider', token || '');
      if (response.success) {
        // Refresh profile data
        const refreshResponse = await apiService.getCurrentUser(token || '', 'guider');
        if (refreshResponse.success && refreshResponse.data) {
          setProfileData(refreshResponse.data as any);
        }
        setShowOtpVerification(false);
        setOtp('');
        setNewEmail('');
        setOtpSent(false);
        
        // Check if phone also needs to be updated
        const phoneChanged = newPhone && newPhone !== (profileData?.mobile || user?.mobile);
        if (phoneChanged) {
          await handleUpdatePhone();
        }
        
        setEditingTabs((prev) => ({ ...prev, account: false }));
        toast.success('Account updated successfully!');
      } else {
        toast.error(response.message || 'Invalid OTP');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      toast.error('Failed to verify OTP. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleUpdatePhone = async () => {
    if (!newPhone || newPhone.trim().length < 10) {
      toast.error('Please enter a valid phone number');
      return;
    }

    setSaving(true);
    try {
      const response = await apiService.updateGuiderProfile(profileData?._id || '', { mobile: newPhone }, token || '');
      if (response.success) {
        // Refresh profile data
        const refreshResponse = await apiService.getCurrentUser(token || '', 'guider');
        if (refreshResponse.success && refreshResponse.data) {
          setProfileData(refreshResponse.data as any);
        }
      } else {
        toast.error(response.message || 'Failed to update phone number');
      }
    } catch (error) {
      console.error('Error updating phone:', error);
      toast.error('Failed to update phone number. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitAccount = async () => {
    if (!profileData || !token) return;

    const emailChanged = newEmail && newEmail !== (profileData.email || user?.email);
    const phoneChanged = newPhone && newPhone !== (profileData.mobile || user?.mobile);

    if (!emailChanged && !phoneChanged) {
      // No changes, just exit edit mode
      setEditingTabs((prev) => ({ ...prev, account: false }));
      return;
    }

    // If email changed, need OTP verification
    if (emailChanged && !showOtpVerification) {
      if (!newEmail || !newEmail.includes('@')) {
        toast.error('Please enter a valid email address');
        return;
      }
      // Send OTP first
      await handleSendOtpForEmail();
      return;
    }

    // If OTP verification is showing, verify first
    if (showOtpVerification && emailChanged) {
      if (otp.length !== 6) {
        toast.error('Please enter the 6-digit OTP');
        return;
      }
      await handleVerifyOtpAndUpdateEmail();
      // Exit edit mode will be handled in handleVerifyOtpAndUpdateEmail
      return;
    }

    // Only phone changed
    if (phoneChanged && !emailChanged) {
      await handleUpdatePhone();
      setEditingTabs((prev) => ({ ...prev, account: false }));
      setNewPhone('');
      toast.success('Phone number updated successfully!');
    }
  };

  const renderAccountInfo = () => {
    const isEditing = editingTabs.account;
    
    return (
      <div className="space-y-6">
        {/* OTP Verification Modal for Email */}
        {showOtpVerification && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <Heading as="h3" variant="subsection" className="mb-4">Verify OTP</Heading>
              <p className="text-sm text-gray-600 mb-4">
                We've sent a 6-digit OTP to <strong>{newEmail}</strong>. Please enter it below.
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">OTP Code</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-center text-2xl tracking-widest text-gray-900 bg-white"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowOtpVerification(false);
                    setOtp('');
                    setOtpSent(false);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleVerifyOtpAndUpdateEmail}
                  disabled={otp.length !== 6 || otpLoading}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {otpLoading ? 'Verifying...' : 'Verify & Update'}
                </button>
              </div>
              {otpSent && (
                <button
                  onClick={handleSendOtpForEmail}
                  disabled={otpLoading}
                  className="mt-2 w-full text-sm text-primary-600 hover:text-primary-700 disabled:opacity-50"
                >
                  Resend OTP
                </button>
              )}
            </div>
          </div>
        )}

        {renderEditHeader('account')}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email
            </label>
            {isEditing ? (
              <div className="space-y-2">
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="Enter new email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                />
                {newEmail && newEmail !== (profileData?.email || user?.email) && (
                  <button
                    onClick={handleSendOtpForEmail}
                    disabled={!newEmail || otpLoading || !newEmail.includes('@')}
                    className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {otpLoading ? 'Sending OTP...' : 'Send OTP to Verify'}
                  </button>
                )}
              </div>
            ) : (
              <>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                  {profileData?.email || user?.email || 'Not set'}
                </p>
                {profileData?.emailVerified && (
                  <div className="flex items-center gap-2 mt-2 text-sm text-green-600">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Email verified</span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Phone Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Mobile
            </label>
            {isEditing ? (
              <input
                type="tel"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter phone number"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
              />
            ) : (
              <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                {profileData?.mobile || user?.mobile || 'Not set'}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Guider Type</label>
            <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
              {profileData?.guiderType || 'Not set'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Account Status</label>
            <div className="flex items-center gap-2 mt-2">
              {profileData?.accountVerified ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="text-green-600 font-medium">Verified</span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-orange-600" />
                  <span className="text-orange-600 font-medium">Not Verified</span>
                </>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tour Points</label>
            <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
              {profileData?.tourPoints || 0}
            </p>
          </div>
          {profileData?.badges && profileData.badges.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Award className="w-4 h-4" />
                Badges
              </label>
              <div className="flex flex-wrap gap-2">
                {profileData.badges.map((badge, idx) => (
                  <span key={idx} className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                    {badge}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderReviews = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-4">
          <Heading as="h2" variant="subsection">Your Reviews</Heading>
          {profileData?.tourGuideInfo?.rating !== undefined && (
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500 fill-current" />
              <span className="text-2xl font-bold text-gray-900">
                {profileData.tourGuideInfo.rating.toFixed(1)}
              </span>
              <span className="text-sm text-gray-600">
                ({profileData.tourGuideInfo.totalReviews || 0} {profileData.tourGuideInfo.totalReviews === 1 ? 'review' : 'reviews'})
              </span>
            </div>
          )}
        </div>

        {isLoadingReviews ? (
          <div className="text-center py-8 text-gray-500">Loading reviews...</div>
        ) : reviews && reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => {
              const traveler = typeof review.travelerId === 'object' 
                ? review.travelerId 
                : null;
              const travelerName = traveler 
                ? `${traveler.firstName || ''} ${traveler.lastName || ''}`.trim() || 'Anonymous'
                : 'Anonymous';
              const travelerImage = traveler?.profileImageUrl;
              
              const plan = typeof review.planId === 'object' ? review.planId : null;
              const booking = typeof review.bookingId === 'object' ? review.bookingId : null;
              const bookingDate = booking?.bookingDetails?.date 
                ? new Date(booking.bookingDetails.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })
                : null;

              return (
                <Card key={review._id} className="border-l-4 border-l-primary-500">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {travelerImage ? (
                        <img
                          src={travelerImage}
                          alt={travelerName}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-primary-600 font-semibold">
                            {travelerName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-medium text-gray-900">{travelerName}</p>
                            {plan && (
                              <p className="text-sm text-gray-600">
                                Review for: {plan.title || 'Tour'}
                              </p>
                            )}
                            {bookingDate && (
                              <p className="text-xs text-gray-500 mt-1">
                                Tour Date: {bookingDate}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                            <span className="ml-1 text-sm font-medium text-gray-700">
                              {review.rating}
                            </span>
                          </div>
                        </div>
                        {review.comment && (
                          <p className="text-gray-700 text-sm mt-2 leading-relaxed">{review.comment}</p>
                        )}
                        <div className="flex items-center gap-2 mt-3">
                          <p className="text-xs text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </p>
                          {review.isVerified && (
                            <Badge variant="secondary" className="text-xs">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Verified Booking
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 font-medium mb-2">No reviews yet</p>
            <p className="text-sm text-gray-500">
              Reviews from travelers will appear here once they complete their tours.
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <AppLayout>
      <Section variant="muted" className="py-8">
        <Container>
          {/* Profile Header */}
          <Card className="mb-8 border-0 shadow-lg bg-gradient-to-r from-primary-600 to-primary-700 text-white">
            <CardContent className="p-8">
              <div className="flex items-center space-x-6">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                  <User className="w-10 h-10 text-white" />
                </div>
                <div>
                  <Heading as="h1" variant="page" className="mb-2">
                    {profileData?.personalInfo?.showcaseName || (user && 'userType' in user && user.userType === 'guider' ? user.showcaseName : '') || 'Guider Profile'}
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
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="mb-6">
            <TabsList className={`grid w-full ${profileData?.guiderType === 'Agency' ? 'grid-cols-6' : 'grid-cols-5'}`}>
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>

          {/* Tab Content */}
          <Card>
            <CardContent className="p-6">
              {activeTab === 'personal' && renderPersonalInfo()}
              {activeTab === 'business' && renderBusinessInfo()}
              {activeTab === 'tour' && renderTourGuideInfo()}
              {activeTab === 'reviews' && renderReviews()}
              {activeTab === 'india' && renderIndiaSpecificInfo()}
              {activeTab === 'account' && renderAccountInfo()}
            </CardContent>
          </Card>
        </Container>
      </Section>
    </AppLayout>
  );
}

export default function GuiderProfilePage() {
  return (
    <Suspense fallback={
      <AppLayout>
        <LoadingState message="Loading profile..." />
      </AppLayout>
    }>
      <GuiderProfileContent />
    </Suspense>
  );
}

