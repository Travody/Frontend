'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Clock, Upload, Video, FileText, Loader2, ArrowLeft, Edit2 } from 'lucide-react';
import { useAuth, isGuiderUser } from '@/contexts/AuthContext';
import { useNavigationHistory } from '@/hooks/useNavigationHistory';
import { guidesService, usersService, uploadService } from '@/lib/api';
import type { VerificationStepsConfig, VerificationFieldConfig, UpdateVerificationStepDto } from '@/types';
import toast from '@/lib/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { LoadingState } from '@/components/ui/loading-state';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Heading } from '@/components/ui/heading';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface VerificationStepDisplay {
  stepIndex: number; // 0-based array index
  stepName: string;
  description: string;
  status: 'completed' | 'current' | 'pending';
}

export default function GuiderVerificationDashboard() {
  const { user, token, refreshUser } = useAuth();
  const router = useRouter();
  const { goBack } = useNavigationHistory();

  if (!user || !isGuiderUser(user)) {
    return <div>Please log in to access verification</div>;
  }

  const [config, setConfig] = useState<VerificationStepsConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [filePreviews, setFilePreviews] = useState<Record<string, string>>({});
  const [filesToUpload, setFilesToUpload] = useState<Record<string, File>>({});
  const [uploadingFiles, setUploadingFiles] = useState<Record<string, boolean>>({});
  const [editMode, setEditMode] = useState<Record<number, boolean>>({});
  const [originalFormData, setOriginalFormData] = useState<Record<number, Record<string, any>>>({});
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingSubmit, setPendingSubmit] = useState<{ e?: React.FormEvent; stepNumber: number } | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const currentStep = user.currentVerificationStep || 1;
  const verificationData = user.verificationData;

  const loadStepData = useCallback((configData: VerificationStepsConfig, stepNumber: number) => {
    if (!verificationData?.steps) {
      setFormData({});
      setFilePreviews({});
      return;
    }

    // stepNumber is 1-based, convert to 0-based array index
    const stepIndex = stepNumber - 1;
    const currentStepData = verificationData.steps[stepIndex];

    if (currentStepData?.data) {
      setFormData(currentStepData.data);
      const stepConfig = configData.steps[stepIndex];
      if (stepConfig) {
        const previews: Record<string, string> = {};
        stepConfig.fields.forEach((field) => {
          if (field.fieldType === 'file' || field.fieldType === 'video') {
            const value = currentStepData.data?.[field.fieldName];
            if (value && typeof value === 'string') {
              previews[field.fieldName] = value;
            }
          }
        });
        setFilePreviews(previews);
      }
    } else {
      setFormData({});
      setFilePreviews({});
    }
  }, [verificationData]);

  // Redirect to verified dashboard if account is verified
  useEffect(() => {
    if (user?.accountVerified) {
      router.push('/guider/dashboard');
    }
  }, [user?.accountVerified, router]);

  // Fetch user profile on mount/refresh to ensure we have latest data
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userResponse = await usersService.getCurrentUser('guider');
        if (userResponse.success && userResponse.data) {
          refreshUser(userResponse.data);
        }
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
      }
    };

    fetchUserProfile();
  }, []); // Only run on mount

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        // Get config based on user's guiderType
        const guiderType = (user as any)?.guiderType || 'Professional';
        const response = await guidesService.getVerificationStepsConfig(guiderType);
        if (response.success && response.data) {
          setConfig(response.data);
        } else {
          toast.error('Failed to load verification configuration');
        }
      } catch (error) {
        console.error('Failed to fetch verification config:', error);
        toast.error('Failed to load verification configuration');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchConfig();
    }
  }, [user]);

  useEffect(() => {
    if (config) {
      // config.steps already excludes hidden steps, so array index = step position
      // stepNumber (1-based) = array index (0-based) + 1
      const lastStepNumber = config.steps.length;
      let effectiveStep = currentStep;

      // Ensure currentStep is within valid range
      if (effectiveStep < 1) effectiveStep = 1;
      if (effectiveStep > lastStepNumber) effectiveStep = lastStepNumber;

      loadStepData(config, effectiveStep);
    }
  }, [currentStep, verificationData, config, loadStepData]);

  const getStepDisplayStatus = (stepIndex: number): 'completed' | 'current' | 'pending' => {
    // stepIndex is 0-based, convert to 1-based step number for comparison
    const stepNumber = stepIndex + 1;
    const stepStatus = getStepStatus(stepNumber);

    // If step is approved, show as completed
    if (stepStatus === 'approved') return 'completed';

    // If step is in revision, show as current (needs attention)
    if (stepStatus === 'revision') return 'current';

    // If step is pending review, show as completed (waiting for admin)
    if (stepStatus === 'pending') return 'completed';

    // Default logic
    if (stepNumber < currentStep) return 'completed';
    if (stepNumber === currentStep) return 'current';
    return 'pending';
  };

  const calculateProgress = (): number => {
    if (!config) return 0;
    // config.steps already excludes hidden steps
    const totalSteps = config.steps.length;

    if (!verificationData?.steps || totalSteps === 0) return 0;

    // Check if all steps are approved (complete)
    const allStepsApproved = verificationData.steps.every((step: any) => step?.status === 'approved');
    if (allStepsApproved) {
      return 100;
    }

    // If last step is submitted for review, progress is 100%
    const lastStepIndex = totalSteps - 1;
    const lastStepData = verificationData?.steps?.[lastStepIndex];
    if (lastStepData?.data?.submittedForReview) {
      return 100;
    }

    // Count completed steps (steps before current step)
    const completedSteps = Math.max(0, currentStep - 1);
    return totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
  };

  const isStepCompleted = (stepNumber: number): boolean => {
    if (!verificationData?.steps) return false;
    const stepIndex = stepNumber - 1;
    const stepData = verificationData.steps[stepIndex];
    if (!stepData || !stepData.data) return false;
    return Object.keys(stepData.data).length > 0;
  };

  const [viewingStep, setViewingStep] = useState<number | null>(null);

  const handleEdit = (stepNumber: number) => {
    // Store original form data when entering edit mode
    // For revision steps, compare against the current step data from verificationData
    const stepStatus = getStepStatus(stepNumber);
    if (stepStatus === 'revision' && verificationData?.steps) {
      const stepIndex = stepNumber - 1;
      const stepData = verificationData.steps[stepIndex] as any;
      if (stepData?.data) {
        setOriginalFormData((prev) => ({
          ...prev,
          [stepNumber]: JSON.parse(JSON.stringify(stepData.data)), // Deep copy of current step data
        }));
      } else {
        setOriginalFormData((prev) => ({
          ...prev,
          [stepNumber]: JSON.parse(JSON.stringify(formData)), // Fallback to current formData
        }));
      }
    } else {
      setOriginalFormData((prev) => ({
        ...prev,
        [stepNumber]: JSON.parse(JSON.stringify(formData)), // Deep copy
      }));
    }
    setEditMode((prev) => ({ ...prev, [stepNumber]: true }));
  };

  // Check if all required fields are filled
  const areRequiredFieldsFilled = (stepNumber: number): boolean => {
    if (!config) return false;
    const stepIndex = stepNumber - 1;
    if (stepIndex < 0 || stepIndex >= config.steps.length) return false;

    const stepConfig = config.steps[stepIndex];
    if (!stepConfig || !stepConfig.fields) return false;

    // Check all required fields
    for (const field of stepConfig.fields) {
      if (field.required) {
        const value = formData[field.fieldName];
        // Check if field is empty (null, undefined, empty string, or empty array)
        if (value === undefined || value === null || value === '' ||
          (Array.isArray(value) && value.length === 0)) {
          return false;
        }
      }
    }

    return true;
  };

  // Check if form data has changed from original
  const hasFormDataChanged = (stepNumber: number): boolean => {
    const stepStatus = getStepStatus(stepNumber);
    const isRevision = stepStatus === 'revision';

    // For revision steps not in edit mode, compare with the original rejected step data
    if (isRevision && !editMode[stepNumber]) {
      // Get the original step data from verificationData
      if (!verificationData?.steps) return false;
      const stepIndex = stepNumber - 1;
      const stepData = verificationData.steps[stepIndex] as any;
      if (!stepData || !stepData.data) return false;

      const originalData = stepData.data;
      const currentKeys = Object.keys(formData).filter(key => formData[key] !== undefined && formData[key] !== null && formData[key] !== '');
      const originalKeys = Object.keys(originalData).filter(key => originalData[key] !== undefined && originalData[key] !== null && originalData[key] !== '');

      // Check if keys are different
      if (currentKeys.length !== originalKeys.length) return true;

      // Check if any values are different
      for (const key of currentKeys) {
        if (formData[key] !== originalData[key]) {
          return true;
        }
      }

      // Check for keys in original that are not in current
      for (const key of originalKeys) {
        if (!(key in formData) || formData[key] !== originalData[key]) {
          return true;
        }
      }

      // Check if any files are pending upload
      if (Object.keys(filesToUpload).length > 0) return true;

      return false;
    }

    // If not in edit mode and not revision, allow saving (for new steps or first submission)
    if (!editMode[stepNumber]) return true;

    // In edit mode, compare with original form data
    const original = originalFormData[stepNumber];
    if (!original) return true; // If no original data, consider it changed (new step)

    // Compare current formData with original
    const currentKeys = Object.keys(formData).filter(key => formData[key] !== undefined && formData[key] !== null && formData[key] !== '');
    const originalKeys = Object.keys(original).filter(key => original[key] !== undefined && original[key] !== null && original[key] !== '');

    // Check if keys are different
    if (currentKeys.length !== originalKeys.length) return true;

    // Check if any values are different
    for (const key of currentKeys) {
      if (formData[key] !== original[key]) {
        return true;
      }
    }

    // Check for keys in original that are not in current
    for (const key of originalKeys) {
      if (!(key in formData) || formData[key] !== original[key]) {
        return true;
      }
    }

    // Check if any files are pending upload
    if (Object.keys(filesToUpload).length > 0) return true;

    return false;
  };

  const handleFileChange = async (fieldName: string, file: File | null) => {
    if (!file) return;

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('File size must be less than 10MB');
      return;
    }

    // Create preview
    const previewUrl = URL.createObjectURL(file);
    setFilePreviews((prev) => ({ ...prev, [fieldName]: previewUrl }));

    // Store file for upload
    setFilesToUpload((prev) => ({ ...prev, [fieldName]: file }));
    setUploadingFiles((prev) => ({ ...prev, [fieldName]: true }));

    try {
      // Upload file immediately
      const userId = (user as any)?._id || user?.id;
      if (!userId) {
        toast.error('User ID not found');
        return;
      }

      // Determine folder based on field type
      const folder = fieldName.includes('video') || fieldName.includes('Video')
        ? 'verification/videos'
        : 'verification/documents';

      const response = await uploadService.uploadFile(file, folder);

      if (response.success && response.data?.url) {
        // Store the URL in formData
        setFormData((prev) => ({
          ...prev,
          [fieldName]: response.data?.url,
        }));
        toast.success('File uploaded successfully');
      } else {
        toast.error(response.message || 'Failed to upload file');
        // Remove file from preview and upload queue
        setFilePreviews((prev) => {
          const newPreviews = { ...prev };
          delete newPreviews[fieldName];
          return newPreviews;
        });
        setFilesToUpload((prev) => {
          const newFiles = { ...prev };
          delete newFiles[fieldName];
          return newFiles;
        });
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file');
      // Remove file from preview and upload queue
      setFilePreviews((prev) => {
        const newPreviews = { ...prev };
        delete newPreviews[fieldName];
        return newPreviews;
      });
      setFilesToUpload((prev) => {
        const newFiles = { ...prev };
        delete newFiles[fieldName];
        return newFiles;
      });
    } finally {
      setUploadingFiles((prev) => {
        const newUploading = { ...prev };
        delete newUploading[fieldName];
        return newUploading;
      });
    }
  };

  const handleInputChange = (fieldName: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const handleSubmitClick = (e?: React.FormEvent, stepNumberOverride?: number) => {
    e?.preventDefault();
    e?.stopPropagation();

    const stepNumber = stepNumberOverride || user?.currentVerificationStep || 1;
    const lastStepNumber = config?.steps.length || 0;
    const stepStatus = getStepStatus(stepNumber);

    // Show confirmation dialog for last step or when resubmitting a revision step
    if (stepNumber === lastStepNumber || stepStatus === 'revision') {
      setPendingSubmit({ e, stepNumber });
      setShowConfirmDialog(true);
      return;
    }

    // For other steps, submit directly
    handleSubmit(e, stepNumber);
  };

  const handleSubmit = useCallback(async (e?: React.FormEvent, stepNumberOverride?: number) => {
    e?.preventDefault();
    e?.stopPropagation();

    if (submitting) {
      return;
    }

    const userId = (user as any)?._id || user?.id;

    if (!userId || !token || !config) {
      toast.error('Missing required information. Please refresh the page.');
      return;
    }

    const stepNumber = stepNumberOverride || user?.currentVerificationStep || 1;
    // stepNumber is 1-based, convert to 0-based array index
    const stepIndex = stepNumber - 1;
    if (stepIndex < 0 || stepIndex >= config.steps.length) {
      toast.error('Step configuration not found. Please refresh the page.');
      return;
    }
    const stepConfig = config.steps[stepIndex];

    const missingFields = stepConfig.fields
      .filter((field) => field.required && !formData[field.fieldName])
      .map((field) => field.fieldLabel);

    if (missingFields.length > 0) {
      toast.error(`Please fill required fields: ${missingFields.join(', ')}`);
      return;
    }

    if (stepConfig.fields.length > 0 && Object.keys(formData).length === 0) {
      toast.error('Please fill in the required fields before submitting.');
      return;
    }

    setSubmitting(true);

    try {
      const updateDto: UpdateVerificationStepDto = {
        step: stepNumber,
        data: formData,
      };

      const response = await guidesService.updateVerificationStep(
        userId,
        updateDto
      );

      if (response.success) {
        const userResponse = await usersService.getCurrentUser('guider');
        if (userResponse.success && userResponse.data) {
          refreshUser(userResponse.data);
          // Exit edit mode after saving
          setEditMode((prev) => ({ ...prev, [stepNumber]: false }));
          // Clear original form data for this step
          setOriginalFormData((prev) => {
            const newData = { ...prev };
            delete newData[stepNumber];
            return newData;
          });
          // Clear viewing step if set
          setViewingStep(null);

          // If this was the last step and submitted for review, show success message
          if (stepNumber === lastStepNumber) {
            toast.success('Verification request sent to admin successfully! Your application is now pending review.');
          } else {
            setFormData({});
            setFilePreviews({});
          }
        }
      }
    } catch (error) {
      console.error('Failed to submit step:', error);
      toast.error('Failed to save step. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [(user as any)?._id || user?.id, user?.currentVerificationStep, token, config, formData, submitting, refreshUser]);

  if (loading) {
    return <LoadingState message="Loading verification..." />;
  }

  if (!config) {
    return (
      <Section variant="muted" className="py-12">
        <Container>
          <div className="text-center">
            <p className="text-gray-600">Failed to load verification configuration</p>
          </div>
        </Container>
      </Section>
    );
  }

  // config.steps already excludes hidden steps, so array index = step position
  // stepNumber (1-based) = array index (0-based) + 1
  const lastStepNumber = config.steps.length;
  const lastStepIndex = lastStepNumber - 1;
  const lastStepData = verificationData?.steps?.[lastStepIndex];
  const lastStepSubmittedForReview = lastStepData?.data?.submittedForReview === true;

  // Ensure currentStep is within valid range
  let effectiveCurrentStep = currentStep;
  if (effectiveCurrentStep < 1) effectiveCurrentStep = 1;
  if (effectiveCurrentStep > lastStepNumber) effectiveCurrentStep = lastStepNumber;

  const getStepStatus = (stepNumber: number): 'pending' | 'revision' | 'approved' | undefined => {
    if (!verificationData?.steps) return undefined;
    const stepIndex = stepNumber - 1;
    const step = verificationData.steps[stepIndex] as any; // Type assertion for new fields
    return step?.status;
  };

  const isFieldDisabled = (stepNumber: number, fieldName?: string): boolean => {
    const stepStatus = getStepStatus(stepNumber);
    const allSubmitted = areAllStepsSubmitted();
    const isInEditMode = editMode[stepNumber] || false;

    // If step is approved, always disable editing
    if (stepStatus === 'approved') {
      return true;
    }

    // If all steps are submitted for review, disable all fields except revision steps in edit mode
    if (allSubmitted && stepStatus !== 'revision' && !isInEditMode) {
      return true;
    }

    // If step is in revision status and in edit mode (resubmit mode)
    if (stepStatus === 'revision' && isInEditMode) {
      // Only allow editing fields that are in rejectedFields
      if (fieldName) {
        const rejectionInfo = getRejectionInfo(stepNumber);
        if (rejectionInfo && rejectionInfo.rejectedFields) {
          return !rejectionInfo.rejectedFields.includes(fieldName);
        }
        // If no rejection info or rejectedFields, disable all fields
        return true;
      }
      // If no fieldName provided, disable by default (shouldn't happen, but safety check)
      return true;
    }

    // If step is in revision status but not in edit mode, disable fields
    if (stepStatus === 'revision' && !isInEditMode) {
      return true;
    }

    // If not in edit mode and not a revision step, disable fields
    if (!isInEditMode && allSubmitted) {
      return true;
    }

    // Allow editing if in edit mode (for non-revision steps) or if not submitted
    return false;
  };

  // Check if all steps are submitted (locked state)
  const areAllStepsSubmitted = (): boolean => {
    const vData = verificationData as any;
    return vData?.submittedForReview === true;
  };

  const getRejectionInfo = (stepNumber: number) => {
    if (!verificationData?.steps) return null;
    const stepIndex = stepNumber - 1;
    const step = verificationData.steps[stepIndex] as any; // Type assertion for new fields
    if (step && step.status === 'revision') {
      return {
        rejectedFields: (step.rejectedFields as string[]) || [],
        rejectionReasons: (step.rejectionReasons as Record<string, string>) || {},
        rejectionDetails: step.rejectionDetails as string | undefined,
      };
    }
    return null;
  };

  // Use viewingStep if set, otherwise use effectiveCurrentStep
  const displayStep = viewingStep || effectiveCurrentStep;

  const handleBack = () => {
    if (displayStep > 1) {
      const prevStep = displayStep - 1;
      setViewingStep(prevStep);
      if (config) {
        loadStepData(config, prevStep);
        // Exit edit mode when going back
        setEditMode((prev) => ({ ...prev, [displayStep]: false }));
      }
    }
  };
  const displayStepIndex = displayStep - 1;
  const displayStepConfig = config.steps[displayStepIndex];
  const isDisplayStepCompleted = isStepCompleted(displayStep);
  const isDisplayStepInEditMode = editMode[displayStep] || false;

  const currentStepIndex = effectiveCurrentStep - 1;
  const currentStepConfig = config.steps[currentStepIndex];
  const progress = calculateProgress();

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
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center mb-2">
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-full">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight">
              Hello, {user?.personalInfo?.showcaseName || user?.personalInfo?.fullName || user?.email?.split('@')[0]}! 👋
            </h1>
            <p className="text-base md:text-lg text-white/95 mb-6 max-w-2xl mx-auto">
              {user?.accountVerified
                ? 'Your account is verified! Start creating plans and earning.'
                : 'Complete verification to start earning and attract travelers to your amazing experiences.'}
            </p>

            <Card className="max-w-lg mx-auto border-0 shadow-xl bg-white/95 backdrop-blur-sm">
              <CardContent className="p-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2.5 rounded-lg ${user?.accountVerified ? 'bg-green-500' : 'bg-yellow-500'}`}>
                      {user?.accountVerified ? (
                        <Check className="w-5 h-5 text-white" />
                      ) : (
                        <Clock className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div>
                      <span className="text-gray-900 font-semibold text-sm sm:text-base block">
                        {user?.accountVerified ? 'Verified' : 'Verification in Progress'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {progress}% Complete
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-gray-900">{progress}%</div>
                    <div className="text-xs text-gray-500">Progress</div>
                  </div>
                </div>
                <div className="mt-4">
                  <Progress value={progress} className="h-2.5" />
                </div>
              </CardContent>
            </Card>
          </div>
        </Container>
      </Section>

      {/* Verification Steps */}
      <Section className="py-12 pt-8 lg:pt-20 xl:pt-24">
        <Container>
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b">
              <CardTitle className="text-2xl font-bold">Complete your verification</CardTitle>
              <CardDescription className="mt-1 text-base">
                Follow the steps below to verify your account and start your journey as a guide
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-8">
              {/* Steps Progress */}
              <div className="flex items-center w-full mb-8 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                {config.steps.map((step, index) => {
                  // config.steps already excludes hidden steps, so index = step position (0-based)
                  const stepNumber = index + 1; // 1-based step number for display
                  const status = getStepDisplayStatus(index);
                  const stepStatus = getStepStatus(stepNumber);
                  const isRevision = stepStatus === 'revision';
                  const isApproved = stepStatus === 'approved';
                  const isPending = stepStatus === 'pending';

                  return (
                    <React.Fragment key={index}>
                      <div className="flex items-center flex-shrink-0">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md transition-all duration-300 ${isApproved
                              ? 'bg-green-500 ring-2 ring-green-200'
                              : isRevision
                                ? 'bg-red-500 ring-2 ring-red-200'
                                : isPending
                                  ? 'bg-yellow-500 ring-2 ring-yellow-200'
                                  : status === 'completed'
                                    ? 'bg-green-500 ring-2 ring-green-200'
                                    : status === 'current'
                                      ? 'bg-primary-500 ring-2 ring-primary-200 scale-110'
                                      : 'bg-gray-300 ring-2 ring-gray-200'
                            }`}
                        >
                          {isApproved || (status === 'completed' && !isRevision && !isPending) ? (
                            <Check className="w-6 h-6 text-white" />
                          ) : isRevision ? (
                            <Clock className="w-6 h-6 text-white" />
                          ) : (
                            <span className="text-white font-bold text-lg">{stepNumber}</span>
                          )}
                        </div>
                        <div className="ml-3 min-w-0 max-w-[200px]">
                          <div className="text-sm font-semibold text-gray-900 truncate">
                            {step.stepName}
                            {isApproved && <span className="ml-2 text-xs text-green-600 font-medium">(Approved)</span>}
                            {isRevision && <span className="ml-2 text-xs text-red-600 font-medium">(Needs Revision)</span>}
                          </div>
                          <div className="text-xs text-gray-500 truncate mt-0.5">{step.description}</div>
                        </div>
                      </div>
                      {index < config.steps.length - 1 && (
                        <div
                          className={`flex-1 h-0.5 mx-4 min-w-[50px] ${isApproved || (status === 'completed' && !isRevision) ? 'bg-green-500' : 'bg-gray-300'
                            }`}
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>

              <Separator />

              {/* Current Step Content */}
              <div className="border rounded-lg p-8">
                {displayStepConfig ? (
                  <div>
                    {/* Step Name and Description - Hide when submitted for review (unless in revision/edit mode) */}
                    {(() => {
                      const currentStepStatus = getStepStatus(displayStep);
                      const shouldHideHeader = areAllStepsSubmitted() &&
                        !isDisplayStepInEditMode &&
                        (currentStepStatus === 'pending' || currentStepStatus === undefined || currentStepStatus === 'approved');

                      if (!shouldHideHeader) {
                        return (
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <Heading as="h3" variant="subsection" className="mb-2">
                                {displayStepConfig.stepName}
                                {viewingStep && viewingStep !== effectiveCurrentStep && (
                                  <span className="ml-2 text-sm text-gray-500 font-normal">(Step {displayStep})</span>
                                )}
                              </Heading>
                              <p className="text-gray-600">{displayStepConfig.description}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              {/* Edit Button - Show for completed steps or revision steps */}
                              {(() => {
                                const stepStatus = getStepStatus(displayStep);
                                const allSubmitted = areAllStepsSubmitted();

                                // Can edit if:
                                // 1. Step is completed OR in revision
                                // 2. Not approved
                                // 3. Not in edit mode already
                                // 4. If verification is submitted, only revision steps can be edited
                                // 5. If verification is NOT submitted, any completed step can be edited (even if status is pending)

                                const canEditWhenNotSubmitted = !allSubmitted &&
                                  isDisplayStepCompleted &&
                                  !isDisplayStepInEditMode &&
                                  stepStatus !== 'approved';

                                const canEditWhenSubmitted = allSubmitted &&
                                  stepStatus === 'revision' &&
                                  !isDisplayStepInEditMode;

                                if (!canEditWhenNotSubmitted && !canEditWhenSubmitted) return null;

                                return (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                      // If we're viewing a different step, keep viewingStep set
                                      // If we're on current step, we don't need viewingStep
                                      if (displayStep !== effectiveCurrentStep) {
                                        setViewingStep(displayStep);
                                      }
                                      handleEdit(displayStep);
                                    }}
                                    disabled={submitting}
                                    size="sm"
                                  >
                                    <Edit2 className="w-4 h-4 mr-2" />
                                    {stepStatus === 'revision' ? 'Update & Resubmit' : 'Edit'}
                                  </Button>
                                );
                              })()}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}

                    {/* Status Message */}
                    {(() => {
                      const stepStatus = getStepStatus(displayStep);
                      const rejectionInfo = getRejectionInfo(displayStep);

                      if (stepStatus === 'revision' && rejectionInfo) {
                        return (
                          <Card className="bg-red-50 border-red-200 mb-6">
                            <CardContent className="p-4">
                              <div className="flex items-start">
                                <Clock className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                                <div className="flex-1">
                                  <p className="text-red-900 font-medium">Step Needs Revision</p>
                                  <p className="text-red-700 text-sm mt-1">
                                    This step has been rejected. Please update the following fields and resubmit:
                                  </p>
                                  {rejectionInfo.rejectedFields && rejectionInfo.rejectedFields.length > 0 && (
                                    <div className="mt-2">
                                      <p className="text-red-800 font-semibold text-sm">Fields to Update:</p>
                                      <ul className="list-disc list-inside text-red-700 text-sm mt-1 space-y-1">
                                        {rejectionInfo.rejectedFields.map((fieldName: string, idx: number) => {
                                          const fieldConfig = displayStepConfig.fields.find(f => f.fieldName === fieldName);
                                          const fieldReason = rejectionInfo.rejectionReasons?.[fieldName];
                                          return (
                                            <li key={idx}>
                                              <span className="font-medium">{fieldConfig?.fieldLabel || fieldName}:</span>
                                              {fieldReason && <span className="ml-2">{fieldReason}</span>}
                                            </li>
                                          );
                                        })}
                                      </ul>
                                    </div>
                                  )}
                                  {rejectionInfo.rejectionDetails && (
                                    <div className="mt-2">
                                      <p className="text-red-800 font-semibold text-sm">Additional Details:</p>
                                      <p className="text-red-700 text-sm mt-1">{rejectionInfo.rejectionDetails}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      } else if (areAllStepsSubmitted() && !isDisplayStepInEditMode && (stepStatus === 'pending' || stepStatus === undefined)) {
                        // Show pending review message when verification is submitted and step is not approved/revision
                        return (
                          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 mb-6 shadow-sm">
                            <CardContent className="p-6">
                              <div className="flex items-start">
                                <div className="flex-shrink-0">
                                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                    <Clock className="w-6 h-6 text-blue-600 animate-pulse" />
                                  </div>
                                </div>
                                <div className="ml-4 flex-1">
                                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    Verification Under Review
                                  </h3>
                                  <p className="text-gray-700 text-sm leading-relaxed mb-3">
                                    Great job! Your verification has been successfully submitted and is now being reviewed by our team.
                                    We're carefully checking all your information to ensure everything meets our standards.
                                  </p>
                                  <div className="bg-white rounded-lg p-4 mt-4 border border-blue-100">
                                    <p className="text-sm text-gray-600 mb-2">
                                      <strong className="text-gray-900">What happens next?</strong>
                                    </p>
                                    <ul className="text-sm text-gray-600 space-y-1.5 list-disc list-inside">
                                      <li>Our admin team will review your submission within <strong className="text-gray-900">24-48 hours</strong></li>
                                      <li>You'll receive a notification once the review is complete</li>
                                      <li>If any changes are needed, we'll guide you through the process</li>
                                    </ul>
                                  </div>
                                  <p className="text-xs text-gray-500 mt-4 italic">
                                    Thank you for your patience. We're working hard to get you verified and ready to start earning!
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      } else if (isDisplayStepCompleted && !isDisplayStepInEditMode && stepStatus !== 'revision' && !areAllStepsSubmitted()) {
                        return (
                          <Card className="bg-blue-50 border-blue-200 mb-6">
                            <CardContent className="p-4">
                              <div className="flex items-start">
                                <Check className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                                <div>
                                  <p className="text-blue-900 font-medium">Step Completed</p>
                                  <p className="text-blue-700 text-sm mt-1">
                                    This step has been completed. Click "Edit" to modify the information.
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      }
                      return null;
                    })()}

                    {/* Dynamic Form Fields - Hide when submitted for review (unless in revision/edit mode) */}
                    {(() => {
                      const currentStepStatus = getStepStatus(displayStep);
                      const shouldHideFields = areAllStepsSubmitted() &&
                        !isDisplayStepInEditMode &&
                        (currentStepStatus === 'pending' || currentStepStatus === undefined || currentStepStatus === 'approved');

                      if (shouldHideFields) {
                        return null;
                      }

                      const rejectionInfo = getRejectionInfo(displayStep);
                      // Get original step data to compare if field has been edited
                      const stepIndex = displayStep - 1;
                      const originalStepData = verificationData?.steps?.[stepIndex] as any;
                      const originalData = originalStepData?.data || {};

                      return (
                        <div className="space-y-6">
                          {displayStepConfig.fields.map((field) => {
                            // Calculate disabled state per field to handle rejectedFields in resubmit mode
                            const fieldDisabled = isFieldDisabled(displayStep, field.fieldName);
                            const isRejectedField = rejectionInfo?.rejectedFields?.includes(field.fieldName) || false;

                            // Check if field has been edited (value changed from original)
                            const originalValue = originalData[field.fieldName];
                            const currentValue = formData[field.fieldName];

                            // Field is considered edited if:
                            // 1. It was rejected AND
                            // 2. Current value exists AND
                            // 3. Current value is different from original value
                            const hasBeenEdited = isRejectedField &&
                              currentValue !== undefined &&
                              currentValue !== null &&
                              currentValue !== '' &&
                              currentValue !== originalValue;

                            // Only show highlighting if field is rejected AND hasn't been edited
                            const isRejected = isRejectedField && !hasBeenEdited;
                            const rejectionReason = isRejected ? rejectionInfo?.rejectionReasons?.[field.fieldName] : null;

                            return (
                              <DynamicField
                                key={field.fieldName}
                                field={field}
                                value={formData[field.fieldName]}
                                preview={filePreviews[field.fieldName]}
                                onChange={(value) => handleInputChange(field.fieldName, value)}
                                onFileChange={(file) => handleFileChange(field.fieldName, file)}
                                fileInputRefs={fileInputRefs}
                                uploading={uploadingFiles[field.fieldName]}
                                disabled={fieldDisabled}
                                isRejected={isRejected}
                                rejectionReason={rejectionReason}
                              />
                            );
                          })}
                        </div>
                      );
                    })()}

                    {/* Navigation and Action Buttons - Hide when submitted for review (unless in revision/edit mode) */}
                    {(() => {
                      const currentStepStatus = getStepStatus(displayStep);
                      const shouldHideButtons = areAllStepsSubmitted() &&
                        !isDisplayStepInEditMode &&
                        (currentStepStatus === 'pending' || currentStepStatus === undefined || currentStepStatus === 'approved');

                      if (shouldHideButtons) {
                        return null;
                      }

                      return (
                        <div className="mt-8">
                          <div className="flex justify-between items-center gap-4">
                            <div className="flex gap-2">
                              {/* Back Button */}
                              {displayStep > 1 && !areAllStepsSubmitted() && !isDisplayStepInEditMode && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={handleBack}
                                  disabled={submitting}
                                  size="lg"
                                >
                                  <ArrowLeft className="w-4 h-4 mr-2" />
                                  Back
                                </Button>
                              )}
                              {/* Cancel Button (only in edit mode) */}
                              {isDisplayStepInEditMode && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => {
                                    setEditMode((prev) => ({ ...prev, [displayStep]: false }));
                                    // Clear original form data
                                    setOriginalFormData((prev) => {
                                      const newData = { ...prev };
                                      delete newData[displayStep];
                                      return newData;
                                    });
                                    // If we were viewing a different step, go back to that step (not edit mode)
                                    // Otherwise, just reload the current step data
                                    if (viewingStep && viewingStep !== effectiveCurrentStep) {
                                      // Stay on the viewing step, just exit edit mode
                                      if (config) {
                                        loadStepData(config, displayStep);
                                      }
                                    } else {
                                      // Reload step data to reset form
                                      if (config) {
                                        loadStepData(config, displayStep);
                                      }
                                    }
                                  }}
                                  disabled={submitting}
                                  size="lg"
                                >
                                  Cancel
                                </Button>
                              )}
                            </div>
                            <div className="flex gap-2">
                              {/* Next/Continue Button - Show when viewing a previous completed step (not in edit mode) */}
                              {viewingStep && viewingStep !== effectiveCurrentStep && !isDisplayStepInEditMode && (
                                <Button
                                  type="button"
                                  variant="default"
                                  onClick={() => {
                                    // Navigate forward to the next step or current step
                                    const nextStep = Math.min(displayStep + 1, effectiveCurrentStep);
                                    if (nextStep === effectiveCurrentStep) {
                                      // Return to current step
                                      setViewingStep(null);
                                      if (config) {
                                        loadStepData(config, effectiveCurrentStep);
                                      }
                                    } else {
                                      // Go to next step
                                      setViewingStep(nextStep);
                                      if (config) {
                                        loadStepData(config, nextStep);
                                      }
                                    }
                                  }}
                                  size="lg"
                                >
                                  {displayStep < effectiveCurrentStep ? 'Next' : 'Continue to Current Step'}
                                </Button>
                              )}
                              {/* Save Button - Show when in edit mode, on current step, or for revision steps */}
                              {(!viewingStep || viewingStep === effectiveCurrentStep || isDisplayStepInEditMode || getStepStatus(displayStep) === 'revision') && (
                                <Button
                                  type="button"
                                  onClick={(e) => {
                                    // Use displayStep for submission (this is the step we're actually editing)
                                    handleSubmitClick(e, displayStep);
                                  }}
                                  disabled={
                                    submitting ||
                                    (displayStep === lastStepNumber && getStepStatus(displayStep) === 'pending' && !isDisplayStepInEditMode && areAllStepsSubmitted()) ||
                                    !areRequiredFieldsFilled(displayStep) ||
                                    (isDisplayStepInEditMode && !hasFormDataChanged(displayStep)) ||
                                    (getStepStatus(displayStep) === 'revision' && !isDisplayStepInEditMode && !hasFormDataChanged(displayStep)) ||
                                    (displayStep === lastStepNumber && !isDisplayStepInEditMode && !areAllStepsSubmitted() && !hasFormDataChanged(displayStep) && isDisplayStepCompleted)
                                  }
                                  size="lg"
                                >
                                  {submitting ? (
                                    <>
                                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                      {getStepStatus(displayStep) === 'revision' ? 'Resubmitting...' :
                                        displayStep === lastStepNumber ? 'Sending...' : 'Saving...'}
                                    </>
                                  ) : getStepStatus(displayStep) === 'revision' ? (
                                    isDisplayStepInEditMode ? 'Update & Resubmit' : 'Send for Approval Again'
                                  ) : displayStep === lastStepNumber ? (
                                    'Save & Send for Approval'
                                  ) : (
                                    'Save & Continue'
                                  )}
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                ) : (
                  <div className="text-center text-gray-500">
                    <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p>No step configuration found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </Container>
      </Section>

      {/* Confirmation Dialog for Final Submission */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {pendingSubmit && getStepStatus(pendingSubmit.stepNumber) === 'revision'
                ? 'Resubmit for Admin Approval?'
                : 'Send for Admin Approval?'}
            </DialogTitle>
            <DialogDescription>
              {pendingSubmit && getStepStatus(pendingSubmit.stepNumber) === 'revision'
                ? 'Are you sure you want to resubmit this step for admin review? The admin will review your updated information.'
                : 'Are you sure you want to submit your verification request for admin review? Once submitted, you won\'t be able to make changes until the admin reviews your application.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowConfirmDialog(false);
                setPendingSubmit(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => {
                setShowConfirmDialog(false);
                if (pendingSubmit) {
                  handleSubmit(pendingSubmit.e, pendingSubmit.stepNumber);
                }
                setPendingSubmit(null);
              }}
            >
              {pendingSubmit && getStepStatus(pendingSubmit.stepNumber) === 'revision'
                ? 'Yes, Resubmit for Approval'
                : 'Yes, Send for Approval'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Dynamic Field Component
interface DynamicFieldProps {
  field: VerificationFieldConfig;
  value: any;
  preview?: string;
  onChange: (value: any) => void;
  onFileChange: (file: File | null) => void;
  fileInputRefs: React.MutableRefObject<Record<string, HTMLInputElement | null>>;
  uploading?: boolean;
  disabled?: boolean;
  isRejected?: boolean;
  rejectionReason?: string | null;
}

function DynamicField({
  field,
  value,
  preview,
  onChange,
  onFileChange,
  fileInputRefs,
  uploading = false,
  disabled = false,
  isRejected = false,
  rejectionReason = null,
}: DynamicFieldProps) {
  const fieldErrorClass = isRejected
    ? "border-red-500 border-2 bg-red-50 focus:border-red-600 focus:ring-red-500"
    : "";

  const renderField = () => {
    switch (field.fieldType) {
      case 'text':
        return (
          <Input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder || field.fieldLabel}
            required={field.required}
            disabled={disabled}
            className={isRejected ? fieldErrorClass : ''}
          />
        );

      case 'image':
        return (
          <div className="space-y-2">
            <input
              ref={(el) => {
                fileInputRefs.current[field.fieldName] = el;
              }}
              type="file"
              accept={field.accept || 'image/*'}
              onChange={(e) => onFileChange(e.target.files?.[0] || null)}
              className="hidden"
              data-field={field.fieldName}
              required={field.required && !value}
              disabled={disabled}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                fileInputRefs.current[field.fieldName]?.click();
              }}
              className={`w-full ${isRejected ? 'border-red-500 border-2 bg-red-50 hover:bg-red-100 text-red-700' : ''}`}
              disabled={uploading || disabled}
            >
              {uploading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5 mr-2" />
                  {value ? 'Change Image' : 'Upload Image'}
                </>
              )}
            </Button>
            {preview && (
              <div className="mt-2">
                <img
                  src={preview}
                  alt="Preview"
                  className="max-w-full h-64 object-contain rounded-lg border border-gray-200"
                />
              </div>
            )}
            {value && !preview && (
              <p className="text-sm text-gray-600">Selected: {value}</p>
            )}
          </div>
        );

      case 'file':
        return (
          <div className="space-y-2">
            <input
              ref={(el) => {
                fileInputRefs.current[field.fieldName] = el;
              }}
              type="file"
              accept={field.accept || '*'}
              onChange={(e) => onFileChange(e.target.files?.[0] || null)}
              className="hidden"
              data-field={field.fieldName}
              required={field.required && !value}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                fileInputRefs.current[field.fieldName]?.click();
              }}
              className={`w-full ${isRejected ? 'border-red-500 border-2 bg-red-50 hover:bg-red-100 text-red-700' : ''}`}
              disabled={uploading || disabled}
            >
              {uploading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5 mr-2" />
                  {value ? 'Change File' : 'Upload File'}
                </>
              )}
            </Button>
            {preview && (
              <div className="mt-2">
                <img
                  src={preview}
                  alt="Preview"
                  className="max-w-full h-32 object-cover rounded-lg"
                />
              </div>
            )}
            {value && !preview && (
              <p className="text-sm text-gray-600">Selected: {value}</p>
            )}
          </div>
        );

      case 'video':
        return (
          <div className="space-y-2">
            <input
              ref={(el) => {
                fileInputRefs.current[field.fieldName] = el;
              }}
              type="file"
              accept="video/*"
              onChange={(e) => onFileChange(e.target.files?.[0] || null)}
              className="hidden"
              data-field={field.fieldName}
              required={field.required && !value}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                fileInputRefs.current[field.fieldName]?.click();
              }}
              className={`w-full ${isRejected ? 'border-red-500 border-2 bg-red-50 hover:bg-red-100 text-red-700' : ''}`}
              disabled={uploading || disabled}
            >
              {uploading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Video className="w-5 h-5 mr-2" />
                  {value ? 'Change Video' : 'Record/Upload Video'}
                </>
              )}
            </Button>
            {preview && (
              <div className="mt-2">
                <video
                  src={preview}
                  controls
                  className="max-w-full h-64 rounded-lg"
                />
              </div>
            )}
            {value && !preview && (
              <p className="text-sm text-gray-600">Selected: {value}</p>
            )}
          </div>
        );

      case 'select':
        const selectOptions = field.options || [
          { label: 'Aadhar', value: 'aadhar' },
          { label: 'PAN', value: 'pan' },
          { label: 'Other', value: 'other' }
        ];
        return (
          <Select
            value={value || ''}
            onValueChange={(value) => onChange(value)}
            disabled={disabled}
          >
            <SelectTrigger className={isRejected ? fieldErrorClass : ''}>
              <SelectValue placeholder={`Select ${field.fieldLabel}`} />
            </SelectTrigger>
            <SelectContent>
              {selectOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      default:
        return null;
    }
  };

  const labelErrorClass = isRejected ? "text-red-700 font-semibold" : "";

  return (
    <div className={`space-y-2 ${isRejected ? 'p-4 bg-red-50 rounded-lg border border-red-200' : ''}`}>
      <Label className={labelErrorClass}>
        {field.fieldLabel}
        {field.required && <span className="text-red-500 ml-1">*</span>}
        {isRejected && <span className="ml-2 text-red-600 text-xs font-medium">(Needs Revision)</span>}
      </Label>
      <div className={isRejected ? 'relative' : ''}>
        {renderField()}
      </div>
      {isRejected && rejectionReason && (
        <p className="text-sm text-red-600 mt-1 flex items-start">
          <span className="mr-1">⚠️</span>
          <span><strong>Issue:</strong> {rejectionReason}</span>
        </p>
      )}
    </div>
  );
}
