'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import { User, Phone, Mail, Edit, Save, X, MapPin, Globe, Award, Image as ImageIcon, Camera, CheckCircle2, XCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import { apiService } from '@/lib/api';
import toast from 'react-hot-toast';

interface TravelerProfileData {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  mobile?: string;
  city?: string;
  profileImageUrl?: string;
  travelStyle?: 'Adventure' | 'Cultural' | 'Relaxation' | 'Wildlife';
  preferredCategories?: string[];
  travelPreferences?: string;
  tourPoints?: number;
  badges?: string[];
  isVerified?: boolean;
}

const travelStyles = ['Adventure', 'Cultural', 'Relaxation', 'Wildlife'];
const preferredCategoriesOptions = [
  'Beaches', 'Mountains', 'Historical Sites', 'Wildlife', 'Adventure Sports',
  'Cultural Tours', 'Food & Cuisine', 'Nightlife', 'Shopping', 'Wellness',
  'Art & Museums', 'Festivals', 'Photography', 'Nature & Parks'
];

type TabType = 'personal' | 'travel' | 'account';

function TravelerProfileContent() {
  const { user, token, isAuthenticated, isLoading, refreshUser } = useAuth();
  const router = useRouter();
  const [profileData, setProfileData] = useState<TravelerProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('personal');
  const [editingTabs, setEditingTabs] = useState<Record<TabType, boolean>>({
    personal: false,
    travel: false,
    account: false,
  });
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    city: '',
    mobile: '',
    profileImageUrl: '',
    travelStyle: '' as 'Adventure' | 'Cultural' | 'Relaxation' | 'Wildlife' | '',
    preferredCategories: [] as string[],
    travelPreferences: '',
  });
  
  // Email and phone update states
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const tabs = [
    { id: 'personal' as TabType, label: 'Personal Info', icon: User },
    { id: 'travel' as TabType, label: 'Travel Preferences', icon: Globe },
    { id: 'account' as TabType, label: 'Account', icon: Award },
  ];

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/traveler/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token || !isAuthenticated) return;

      try {
        setLoading(true);
        const response = await apiService.getCurrentUser(token, 'traveler');
        if (response.success && response.data) {
          const data = response.data as any;
          setProfileData(data);
          setFormData({
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            city: data.city || '',
            mobile: data.mobile || '',
            profileImageUrl: data.profileImageUrl || '',
            travelStyle: data.travelStyle || '',
            preferredCategories: data.preferredCategories || [],
            travelPreferences: data.travelPreferences || '',
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
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (field: string, item: string) => {
    setFormData((prev) => {
      const currentArray = prev[field as keyof typeof prev] as string[];
      if (currentArray.includes(item)) {
        return { ...prev, [field]: currentArray.filter((i) => i !== item) };
      } else {
        return { ...prev, [field]: [...currentArray, item] };
      }
    });
  };

  const toggleEditMode = (tab: TabType) => {
    if (editingTabs[tab]) {
      // Cancel - reset to original values
      if (profileData) {
        setFormData({
          firstName: profileData.firstName || '',
          lastName: profileData.lastName || '',
          city: profileData.city || '',
          mobile: profileData.mobile || '',
          profileImageUrl: profileData.profileImageUrl || '',
          travelStyle: profileData.travelStyle || '',
          preferredCategories: profileData.preferredCategories || [],
          travelPreferences: profileData.travelPreferences || '',
        });
      }
      setNewEmail('');
      setNewPhone('');
      setShowOtpVerification(false);
      setOtp('');
      setOtpSent(false);
    } else {
      // Enter edit mode
      if (profileData) {
        setFormData({
          firstName: profileData.firstName || '',
          lastName: profileData.lastName || '',
          city: profileData.city || '',
          mobile: profileData.mobile || '',
          profileImageUrl: profileData.profileImageUrl || '',
          travelStyle: profileData.travelStyle || '',
          preferredCategories: profileData.preferredCategories || [],
          travelPreferences: profileData.travelPreferences || '',
        });
        setNewEmail(profileData.email || user?.email || '');
        setNewPhone(profileData.mobile || user?.mobile || '');
      }
    }
    setEditingTabs((prev) => ({ ...prev, [tab]: !prev[tab] }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    try {
      // Here you would upload to your storage service and get the URL
      // For now, we'll use a mock URL. In production, upload to S3 or similar
      const mockUrl = URL.createObjectURL(file);
      handleInputChange('profileImageUrl', mockUrl);
      toast.success('Profile image updated (demo mode)');
      
      // In production, you would:
      // 1. Upload file to storage
      // 2. Get URL from storage
      // 3. Update via API: await apiService.updateTravelerProfileImage(imageUrl, token!);
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    }
  };

  const handleSendOtpForEmail = async () => {
    if (!newEmail || !newEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setOtpLoading(true);
    try {
      const response = await apiService.sendOtpForEmailUpdate(newEmail, 'traveler', token || '');
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
      const response = await apiService.verifyOtpAndUpdateEmail(newEmail, otp, 'traveler', token || '');
      if (response.success) {
        // Refresh profile data
        const refreshResponse = await apiService.getCurrentUser(token || '', 'traveler');
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
      const response = await apiService.updateTravelerProfile({ mobile: newPhone }, token || '');
      if (response.success) {
        // Refresh profile data
        const refreshResponse = await apiService.getCurrentUser(token || '', 'traveler');
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

  const handleSubmit = async (tab: TabType) => {
    if (!profileData || !token) return;

    setSaving(true);
    try {
      let updateData: any = {};

      if (tab === 'personal') {
        if (formData.firstName) updateData.firstName = formData.firstName;
        if (formData.lastName !== undefined) updateData.lastName = formData.lastName;
        if (formData.city !== undefined) updateData.city = formData.city;
        if (formData.mobile !== undefined) updateData.mobile = formData.mobile;
        if (formData.profileImageUrl) {
          // Update profile image separately if URL changed
          await apiService.updateTravelerProfileImage(formData.profileImageUrl, token);
        }
      } else if (tab === 'travel') {
        if (formData.travelStyle) updateData.travelStyle = formData.travelStyle;
        if (formData.preferredCategories !== undefined) updateData.preferredCategories = formData.preferredCategories;
        if (formData.travelPreferences !== undefined) updateData.travelPreferences = formData.travelPreferences;
      }

      if (Object.keys(updateData).length > 0) {
        const response = await apiService.updateTravelerProfile(updateData, token);
        if (response.success) {
          const refreshResponse = await apiService.getCurrentUser(token, 'traveler');
          if (refreshResponse.success && refreshResponse.data) {
            const refreshedData = refreshResponse.data as any;
            setProfileData(refreshedData);
            setFormData({
              firstName: refreshedData.firstName || '',
              lastName: refreshedData.lastName || '',
              city: refreshedData.city || '',
              mobile: refreshedData.mobile || '',
              profileImageUrl: refreshedData.profileImageUrl || '',
              travelStyle: refreshedData.travelStyle || '',
              preferredCategories: refreshedData.preferredCategories || [],
              travelPreferences: refreshedData.travelPreferences || '',
            });
            // Update user context with refreshed data
            refreshUser(refreshedData);
          }
          setEditingTabs((prev) => ({ ...prev, [tab]: false }));
          toast.success('Profile updated successfully!');
        } else {
          toast.error(response.message || 'Failed to update profile');
        }
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const renderEditHeader = (tab: TabType) => {
    const isEditing = editingTabs[tab];
    return (
      <div className="flex justify-end mb-4">
        {!isEditing ? (
          <button
            onClick={() => toggleEditMode(tab)}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => toggleEditMode(tab)}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={() => tab === 'account' ? handleSubmitAccount() : handleSubmit(tab)}
              disabled={saving || otpLoading}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving || otpLoading ? (
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

  const renderPersonalInfo = () => {
    const isEditing = editingTabs.personal;
    return (
      <div>
        {renderEditHeader('personal')}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Profile Image */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              Profile Image
            </label>
            {isEditing ? (
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  {(formData.profileImageUrl || profileData?.profileImageUrl) ? (
                    <img
                      src={formData.profileImageUrl || profileData?.profileImageUrl}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover border-2 border-gray-300"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                    >
                      <Camera className="w-4 h-4" />
                      {formData.profileImageUrl ? 'Change Image' : 'Upload Image'}
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  value={formData.profileImageUrl}
                  onChange={(e) => handleInputChange('profileImageUrl', e.target.value)}
                  placeholder="Or enter image URL"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900"
                />
              </div>
            ) : (
              <div className="flex items-center gap-4">
                {profileData?.profileImageUrl ? (
                  <img
                    src={profileData.profileImageUrl}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-2 border-gray-300"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                <p className="text-gray-600">{profileData?.profileImageUrl ? 'Profile image set' : 'No profile image'}</p>
              </div>
            )}
          </div>

          {/* First Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900"
                required
              />
            ) : (
              <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                {profileData?.firstName || 'Not set'}
              </p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900"
              />
            ) : (
              <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                {profileData?.lastName || 'Not set'}
              </p>
            )}
          </div>

          {/* City */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              City
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900"
              />
            ) : (
              <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                {profileData?.city || user?.city || 'Not set'}
              </p>
            )}
          </div>

          {/* Mobile */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Mobile
            </label>
            {isEditing ? (
              <input
                type="tel"
                value={formData.mobile}
                onChange={(e) => handleInputChange('mobile', e.target.value.replace(/\D/g, ''))}
                placeholder="Enter phone number"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900"
              />
            ) : (
              <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                {profileData?.mobile || user?.mobile || 'Not set'}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderTravelPreferences = () => {
    const isEditing = editingTabs.travel;
    return (
      <div>
        {renderEditHeader('travel')}
        <div className="space-y-6">
          {/* Travel Style */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Travel Style</label>
            {isEditing ? (
              <select
                value={formData.travelStyle}
                onChange={(e) => handleInputChange('travelStyle', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900"
              >
                <option value="">Select travel style</option>
                {travelStyles.map((style) => (
                  <option key={style} value={style}>
                    {style}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                {profileData?.travelStyle || 'Not set'}
              </p>
            )}
          </div>

          {/* Preferred Categories */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Categories</label>
            {isEditing ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {preferredCategoriesOptions.map((category) => (
                  <label key={category} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.preferredCategories.includes(category)}
                      onChange={() => toggleArrayItem('preferredCategories', category)}
                      className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                    />
                    <span className="text-sm text-gray-900">{category}</span>
                  </label>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {profileData?.preferredCategories && profileData.preferredCategories.length > 0 ? (
                  profileData.preferredCategories.map((cat, idx) => (
                    <span key={idx} className="px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-sm">
                      {cat}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500">No categories selected</p>
                )}
              </div>
            )}
          </div>

          {/* Travel Preferences */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Travel Preferences</label>
            {isEditing ? (
              <textarea
                value={formData.travelPreferences}
                onChange={(e) => handleInputChange('travelPreferences', e.target.value)}
                rows={4}
                placeholder="Describe your travel preferences, interests, and what you look for in trips..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900"
              />
            ) : (
              <p className="text-gray-900 bg-gray-50 p-3 rounded-lg whitespace-pre-wrap">
                {profileData?.travelPreferences || 'Not set'}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderAccountInfo = () => {
    const isEditing = editingTabs.account;
    
    return (
      <div className="space-y-6">
        {/* OTP Verification Modal for Email */}
        {showOtpVerification && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Verify OTP</h3>
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-center text-2xl tracking-widest text-gray-900 bg-white"
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
                  className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {otpLoading ? 'Verifying...' : 'Verify & Update'}
                </button>
              </div>
              {otpSent && (
                <button
                  onClick={handleSendOtpForEmail}
                  disabled={otpLoading}
                  className="mt-2 w-full text-sm text-teal-600 hover:text-teal-700 disabled:opacity-50"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900"
                />
                {newEmail && newEmail !== (profileData?.email || user?.email) && (
                  <button
                    onClick={handleSendOtpForEmail}
                    disabled={!newEmail || otpLoading || !newEmail.includes('@')}
                    className="w-full px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
                {profileData?.isVerified && (
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900"
              />
            ) : (
              <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                {profileData?.mobile || user?.mobile || 'Not set'}
              </p>
            )}
          </div>

          {/* Account Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Account Status</label>
            <div className="flex items-center gap-2 mt-2">
              {profileData?.isVerified ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="text-green-600 font-medium">Verified</span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-600">Not Verified</span>
                </>
              )}
            </div>
          </div>

          {/* Tour Points */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Award className="w-4 h-4" />
              Tour Points
            </label>
            <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
              {profileData?.tourPoints || 0}
            </p>
          </div>

          {/* Badges */}
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

  if (loading) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-500"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-50 pt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-teal-600 to-blue-600 text-white rounded-lg p-8 mb-8">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center overflow-hidden">
                {profileData?.profileImageUrl ? (
                  <img
                    src={profileData.profileImageUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                <User className="w-10 h-10 text-white" />
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  {profileData?.firstName || 'Traveler'} {profileData?.lastName || ''}
                </h1>
                <p className="text-teal-100">{profileData?.email || user?.email || ''}</p>
                {profileData?.isVerified && (
                  <div className="flex items-center gap-2 mt-2">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="text-sm">Verified Account</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-sm border mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6" aria-label="Tabs">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                        ${
                          activeTab === tab.id
                            ? 'border-teal-500 text-teal-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }
                      `}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
              </div>
            </div>

          {/* Tab Content */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            {activeTab === 'personal' && renderPersonalInfo()}
            {activeTab === 'travel' && renderTravelPreferences()}
            {activeTab === 'account' && renderAccountInfo()}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

export default function TravelerProfilePage() {
  return (
    <Suspense fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-500"></div>
        </div>
    }>
      <TravelerProfileContent />
    </Suspense>
  );
}
