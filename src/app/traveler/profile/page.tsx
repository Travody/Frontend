'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import { User, Phone, Mail, Edit, Save, X, MapPin, Globe, Award, Image as ImageIcon, Camera, CheckCircle2, XCircle, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import { apiService } from '@/lib/api';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { LoadingState } from '@/components/ui/loading-state';
import { Heading } from '@/components/ui/heading';
import ChangePasswordForm from '@/components/auth/ChangePasswordForm';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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

function TravelerProfileContent() {
  const { user, token, isAuthenticated, isLoading, refreshUser } = useAuth();
  const router = useRouter();
  const [profileData, setProfileData] = useState<TravelerProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [editingTabs, setEditingTabs] = useState<Record<string, boolean>>({
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
  
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [showOtpDialog, setShowOtpDialog] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const toggleEditMode = (tab: string) => {
    if (editingTabs[tab]) {
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
      setShowOtpDialog(false);
      setOtp('');
      setOtpSent(false);
    } else {
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
      const mockUrl = URL.createObjectURL(file);
      handleInputChange('profileImageUrl', mockUrl);
      toast.success('Profile image updated (demo mode)');
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
        setShowOtpDialog(true);
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
        const refreshResponse = await apiService.getCurrentUser(token || '', 'traveler');
        if (refreshResponse.success && refreshResponse.data) {
          setProfileData(refreshResponse.data as any);
        }
        setShowOtpDialog(false);
        setOtp('');
        setNewEmail('');
        setOtpSent(false);
        
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
      setEditingTabs((prev) => ({ ...prev, account: false }));
      return;
    }

    if (emailChanged && !showOtpDialog) {
      if (!newEmail || !newEmail.includes('@')) {
        toast.error('Please enter a valid email address');
        return;
      }
      await handleSendOtpForEmail();
      return;
    }

    if (showOtpDialog && emailChanged) {
      if (otp.length !== 6) {
        toast.error('Please enter the 6-digit OTP');
        return;
      }
      await handleVerifyOtpAndUpdateEmail();
      return;
    }

    if (phoneChanged && !emailChanged) {
      await handleUpdatePhone();
      setEditingTabs((prev) => ({ ...prev, account: false }));
      setNewPhone('');
      toast.success('Phone number updated successfully!');
    }
  };

  const handleSubmit = async (tab: string) => {
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

  if (loading) {
    return (
      <AppLayout>
        <LoadingState message="Loading profile..." />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Section variant="muted" className="py-8">
        <Container>
          {/* Profile Header */}
          <Card className="mb-8 border-0 shadow-lg bg-gradient-to-r from-primary-600 to-primary-700 text-white">
            <CardContent className="p-8">
              <div className="flex items-center space-x-6">
                <Avatar className="w-20 h-20 border-4 border-white/20">
                  <AvatarImage src={profileData?.profileImageUrl} alt="Profile" />
                  <AvatarFallback className="bg-white/20 text-white text-2xl">
                    {profileData?.firstName?.charAt(0) || (user && user.userType === 'traveler' ? user.firstName?.charAt(0) : null) || 'T'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Heading as="h1" variant="page" className="mb-2">
                    {profileData?.firstName || 'Traveler'} {profileData?.lastName || ''}
                  </Heading>
                  <p className="text-white/90">{profileData?.email || user?.email || ''}</p>
                  {profileData?.isVerified && (
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
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-3 mb-6">
              <TabsTrigger value="personal" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Personal Info
              </TabsTrigger>
              <TabsTrigger value="travel" className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Travel Preferences
              </TabsTrigger>
              <TabsTrigger value="account" className="flex items-center gap-2">
                <Award className="w-4 h-4" />
                Account
              </TabsTrigger>
            </TabsList>

            {/* Personal Info Tab */}
            <TabsContent value="personal">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Personal Information</CardTitle>
                      <CardDescription>Manage your personal details and profile image</CardDescription>
                    </div>
                    {!editingTabs.personal ? (
                      <Button onClick={() => toggleEditMode('personal')} variant="outline">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button onClick={() => toggleEditMode('personal')} variant="outline">
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                        <Button onClick={() => handleSubmit('personal')} disabled={saving}>
                          {saving ? (
                            <>Saving...</>
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
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Profile Image */}
                  <div className="space-y-4">
                    <Label>Profile Image</Label>
                    {editingTabs.personal ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-4">
                          <Avatar className="w-24 h-24">
                            <AvatarImage src={formData.profileImageUrl || profileData?.profileImageUrl} />
                            <AvatarFallback>
                              <User className="w-12 h-12" />
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="hidden"
                            />
                            <Button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              variant="outline"
                            >
                              <Camera className="w-4 h-4 mr-2" />
                              {formData.profileImageUrl ? 'Change Image' : 'Upload Image'}
                            </Button>
                          </div>
                        </div>
                        <Input
                          value={formData.profileImageUrl}
                          onChange={(e) => handleInputChange('profileImageUrl', e.target.value)}
                          placeholder="Or enter image URL"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-4">
                        <Avatar className="w-24 h-24">
                          <AvatarImage src={profileData?.profileImageUrl} />
                          <AvatarFallback>
                            <User className="w-12 h-12" />
                          </AvatarFallback>
                        </Avatar>
                        <p className="text-gray-600">{profileData?.profileImageUrl ? 'Profile image set' : 'No profile image'}</p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      {editingTabs.personal ? (
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          required
                        />
                      ) : (
                        <p className="text-gray-900 bg-gray-50 p-3 rounded-md">
                          {profileData?.firstName || 'Not set'}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      {editingTabs.personal ? (
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                        />
                      ) : (
                        <p className="text-gray-900 bg-gray-50 p-3 rounded-md">
                          {profileData?.lastName || 'Not set'}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="city" className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        City
                      </Label>
                      {editingTabs.personal ? (
                        <Input
                          id="city"
                          value={formData.city}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                        />
                      ) : (
                        <p className="text-gray-900 bg-gray-50 p-3 rounded-md">
                          {profileData?.city || user?.city || 'Not set'}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="mobile" className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        Mobile
                      </Label>
                      {editingTabs.personal ? (
                        <Input
                          id="mobile"
                          type="tel"
                          value={formData.mobile}
                          onChange={(e) => handleInputChange('mobile', e.target.value.replace(/\D/g, ''))}
                          placeholder="Enter phone number"
                        />
                      ) : (
                        <p className="text-gray-900 bg-gray-50 p-3 rounded-md">
                          {profileData?.mobile || user?.mobile || 'Not set'}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Travel Preferences Tab */}
            <TabsContent value="travel">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Travel Preferences</CardTitle>
                      <CardDescription>Tell us about your travel style and interests</CardDescription>
                    </div>
                    {!editingTabs.travel ? (
                      <Button onClick={() => toggleEditMode('travel')} variant="outline">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button onClick={() => toggleEditMode('travel')} variant="outline">
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                        <Button onClick={() => handleSubmit('travel')} disabled={saving}>
                          {saving ? (
                            <>Saving...</>
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
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="travelStyle">Travel Style</Label>
                    {editingTabs.travel ? (
                      <Select
                        value={formData.travelStyle}
                        onValueChange={(value) => handleInputChange('travelStyle', value)}
                      >
                        <SelectTrigger id="travelStyle">
                          <SelectValue placeholder="Select travel style" />
                        </SelectTrigger>
                        <SelectContent>
                          {travelStyles.map((style) => (
                            <SelectItem key={style} value={style}>
                              {style}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-md">
                        {profileData?.travelStyle || 'Not set'}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Preferred Categories</Label>
                    {editingTabs.travel ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {preferredCategoriesOptions.map((category) => (
                          <label key={category} className="flex items-center space-x-2 cursor-pointer p-2 rounded-md hover:bg-gray-50">
                            <input
                              type="checkbox"
                              checked={formData.preferredCategories.includes(category)}
                              onChange={() => toggleArrayItem('preferredCategories', category)}
                              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                            />
                            <span className="text-sm text-gray-900">{category}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {profileData?.preferredCategories && profileData.preferredCategories.length > 0 ? (
                          profileData.preferredCategories.map((cat, idx) => (
                            <Badge key={idx} variant="secondary">
                              {cat}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-gray-500">No categories selected</p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="travelPreferences">Travel Preferences</Label>
                    {editingTabs.travel ? (
                      <Textarea
                        id="travelPreferences"
                        value={formData.travelPreferences}
                        onChange={(e) => handleInputChange('travelPreferences', e.target.value)}
                        placeholder="Describe your travel preferences, interests, and what you look for in trips..."
                        rows={4}
                      />
                    ) : (
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-md whitespace-pre-wrap">
                        {profileData?.travelPreferences || 'Not set'}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Account Tab */}
            <TabsContent value="account">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Account Settings</CardTitle>
                      <CardDescription>Manage your email, phone, and account status</CardDescription>
                    </div>
                    {!editingTabs.account ? (
                      <Button onClick={() => toggleEditMode('account')} variant="outline">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button onClick={() => toggleEditMode('account')} variant="outline">
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                        <Button onClick={handleSubmitAccount} disabled={saving || otpLoading}>
                          {saving || otpLoading ? (
                            <>Saving...</>
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
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Email
                      </Label>
                      {editingTabs.account ? (
                        <div className="space-y-2">
                          <Input
                            id="email"
                            type="email"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            placeholder="Enter new email"
                          />
                          {newEmail && newEmail !== (profileData?.email || user?.email) && (
                            <Button
                              onClick={handleSendOtpForEmail}
                              disabled={!newEmail || otpLoading || !newEmail.includes('@')}
                              variant="outline"
                              className="w-full"
                            >
                              {otpLoading ? 'Sending OTP...' : 'Send OTP to Verify'}
                            </Button>
                          )}
                        </div>
                      ) : (
                        <>
                          <p className="text-gray-900 bg-gray-50 p-3 rounded-md">
                            {profileData?.email || user?.email || 'Not set'}
                          </p>
                          {profileData?.isVerified && (
                            <div className="flex items-center gap-2 text-sm text-green-600">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Email verified</span>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        Mobile
                      </Label>
                      {editingTabs.account ? (
                        <Input
                          id="phone"
                          type="tel"
                          value={newPhone}
                          onChange={(e) => setNewPhone(e.target.value.replace(/\D/g, ''))}
                          placeholder="Enter phone number"
                        />
                      ) : (
                        <p className="text-gray-900 bg-gray-50 p-3 rounded-md">
                          {profileData?.mobile || user?.mobile || 'Not set'}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Account Status</Label>
                      <div className="flex items-center gap-2">
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

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Award className="w-4 h-4" />
                        Tour Points
                      </Label>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-md">
                        {profileData?.tourPoints || 0}
                      </p>
                    </div>

                    {profileData?.badges && profileData.badges.length > 0 && (
                      <div className="md:col-span-2 space-y-2">
                        <Label className="flex items-center gap-2">
                          <Award className="w-4 h-4" />
                          Badges
                        </Label>
                        <div className="flex flex-wrap gap-2">
                          {profileData.badges.map((badge, idx) => (
                            <Badge key={idx} variant="secondary">
                              {badge}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Change Password Section */}
                  <div className="md:col-span-2 pt-6 border-t">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="flex items-center gap-2 text-base">
                            <Lock className="w-4 h-4" />
                            Password
                          </Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            Change your account password
                          </p>
                        </div>
                        <Button
                          onClick={() => setShowChangePassword(!showChangePassword)}
                          variant="outline"
                        >
                          {showChangePassword ? 'Cancel' : 'Change Password'}
                        </Button>
                      </div>
                      
                      {showChangePassword && (
                        <Card className="mt-4">
                          <CardContent className="pt-6">
                            <ChangePasswordForm
                              onSuccess={() => {
                                setShowChangePassword(false);
                              }}
                              onCancel={() => setShowChangePassword(false)}
                            />
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </Container>
      </Section>

      {/* OTP Verification Dialog */}
      <Dialog open={showOtpDialog} onOpenChange={setShowOtpDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify OTP</DialogTitle>
            <DialogDescription>
              We've sent a 6-digit OTP to <strong>{newEmail}</strong>. Please enter it below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp">OTP Code</Label>
              <Input
                id="otp"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                className="text-center text-2xl tracking-widest"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowOtpDialog(false);
                setOtp('');
                setOtpSent(false);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleVerifyOtpAndUpdateEmail}
              disabled={otp.length !== 6 || otpLoading}
            >
              {otpLoading ? 'Verifying...' : 'Verify & Update'}
            </Button>
          </DialogFooter>
          {otpSent && (
            <Button
              variant="ghost"
              onClick={handleSendOtpForEmail}
              disabled={otpLoading}
              className="w-full"
            >
              Resend OTP
            </Button>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}

export default function TravelerProfilePage() {
  return (
    <Suspense fallback={<LoadingState message="Loading..." />}>
      <TravelerProfileContent />
    </Suspense>
  );
}
