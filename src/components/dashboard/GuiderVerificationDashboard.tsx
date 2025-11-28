'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Check, Clock, Upload, Video, FileText, Loader2 } from 'lucide-react';
import { useAuth, isGuiderUser } from '@/contexts/AuthContext';
import { guidesService, usersService } from '@/lib/api';
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

interface VerificationStepDisplay {
  stepNumber: number;
  stepName: string;
  description: string;
  status: 'completed' | 'current' | 'pending';
}

export default function GuiderVerificationDashboard() {
  const { user, token, refreshUser } = useAuth();
  
  if (!user || !isGuiderUser(user)) {
    return <div>Please log in to access verification</div>;
  }
  const [config, setConfig] = useState<VerificationStepsConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [filePreviews, setFilePreviews] = useState<Record<string, string>>({});
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const currentStep = user.currentVerificationStep || 1;
  const verificationData = user.verificationData;

  const step4Data = verificationData?.steps?.find((s) => s.stepNumber === 4);
  const step4SubmittedForReview = step4Data?.data?.submittedForReview === true;

  const loadStepData = useCallback((configData: VerificationStepsConfig, stepNumber: number) => {
    if (!verificationData?.steps) {
      setFormData({});
      setFilePreviews({});
      return;
    }

    const currentStepData = verificationData.steps.find(
      (s) => s.stepNumber === stepNumber
    );

    if (currentStepData?.data) {
      setFormData(currentStepData.data);
      const stepConfig = configData.steps.find((s) => s.stepNumber === stepNumber);
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

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await guidesService.getVerificationStepsConfig();
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

    fetchConfig();
  }, []);

  useEffect(() => {
    if (config) {
      loadStepData(config, currentStep);
    }
  }, [currentStep, verificationData, config, loadStepData]);

  const getStepStatus = (stepNumber: number): 'completed' | 'current' | 'pending' => {
    if (stepNumber < currentStep) return 'completed';
    if (stepNumber === currentStep) return 'current';
    return 'pending';
  };

  const calculateProgress = (): number => {
    if (!config) return 0;
    const totalSteps = config.steps.length;
    const completedSteps = currentStep - 1;
    return Math.round((completedSteps / totalSteps) * 100);
  };

  const handleFileChange = (fieldName: string, file: File | null) => {
    if (!file) return;

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('File size must be less than 10MB');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setFilePreviews((prev) => ({ ...prev, [fieldName]: previewUrl }));

    setFormData((prev) => ({
      ...prev,
      [fieldName]: file.name,
    }));
  };

  const handleInputChange = (fieldName: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
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

    const stepNumber = user?.currentVerificationStep || 1;
    const stepConfig = config.steps.find((s) => s.stepNumber === stepNumber);
    if (!stepConfig) {
      toast.error('Step configuration not found. Please refresh the page.');
      return;
    }

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
          setFormData({});
          setFilePreviews({});
        }
      }
    } catch (error) {
      console.error('Failed to submit step:', error);
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

  const currentStepConfig = config.steps.find((s) => s.stepNumber === currentStep);
  const progress = calculateProgress();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <Section variant="primary" className="py-12">
        <Container>
          <div className="text-center">
            <Heading as="h1" variant="page" className="text-white mb-2 text-4xl">
              Hello, {user?.showcaseName || user?.email}! 👋
            </Heading>
            <p className="text-white/90 text-lg mb-8">
              {user?.accountVerified
                ? 'Your account is verified! 🎉'
                : 'Complete verification to start earning'}
            </p>
            
            <Card className="max-w-md mx-auto border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-6 h-6 text-yellow-500" />
                    <span className="text-gray-900 font-semibold">
                      {user?.accountVerified ? 'Verified' : 'Verification in Progress'}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">{progress}%</div>
                    <div className="text-sm text-gray-500">Complete</div>
                  </div>
                </div>
                <div className="mt-4">
                  <Progress value={progress} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </Container>
      </Section>

      {/* Verification Steps */}
      <Section>
        <Container>
          <Card>
            <CardHeader>
              <CardTitle>Complete your verification</CardTitle>
              <CardDescription>Follow the steps below to verify your account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Steps Progress */}
              <div className="flex items-center justify-between mb-8 overflow-x-auto pb-4">
                {config.steps.map((step, index) => {
                  const status = getStepStatus(step.stepNumber);
                  return (
                    <div key={step.stepNumber} className="flex items-center min-w-0 flex-shrink-0">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          status === 'completed'
                            ? 'bg-green-500'
                            : status === 'current'
                            ? 'bg-primary-500'
                            : 'bg-gray-300'
                        }`}
                      >
                        {status === 'completed' ? (
                          <Check className="w-5 h-5 text-white" />
                        ) : (
                          <span className="text-white font-bold">{step.stepNumber}</span>
                        )}
                      </div>
                      <div className="ml-3 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {step.stepName}
                        </div>
                        <div className="text-xs text-gray-500 truncate">{step.description}</div>
                      </div>
                      {index < config.steps.length - 1 && (
                        <div
                          className={`flex-1 h-0.5 mx-4 min-w-[50px] ${
                            status === 'completed' ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              <Separator />

              {/* Current Step Content */}
              <div className="border rounded-lg p-8">
                {currentStepConfig ? (
                  <div>
                    <Heading as="h3" variant="subsection" className="mb-2">
                      {currentStepConfig.stepName}
                    </Heading>
                    <p className="text-gray-600 mb-6">{currentStepConfig.description}</p>

                    {/* Dynamic Form Fields */}
                    <div className="space-y-6">
                      {currentStepConfig.fields.map((field) => (
                        <DynamicField
                          key={field.fieldName}
                          field={field}
                          value={formData[field.fieldName]}
                          preview={filePreviews[field.fieldName]}
                          onChange={(value) => handleInputChange(field.fieldName, value)}
                          onFileChange={(file) => handleFileChange(field.fieldName, file)}
                          fileInputRefs={fileInputRefs}
                        />
                      ))}
                    </div>

                    {/* Submit Button */}
                    <div className="mt-8">
                      {currentStep === 4 && step4SubmittedForReview ? (
                        <Card className="bg-blue-50 border-blue-200 mb-4">
                          <CardContent className="p-4">
                            <div className="flex items-start">
                              <Clock className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                              <div>
                                <p className="text-blue-900 font-medium">Sent for Admin Approval</p>
                                <p className="text-blue-700 text-sm mt-1">
                                  Your verification request has been submitted and is pending admin review. 
                                  You will be notified once the admin reviews your application.
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ) : null}
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          onClick={(e) => handleSubmit(e)}
                          disabled={submitting || (currentStep === 4 && step4SubmittedForReview)}
                          size="lg"
                        >
                          {submitting ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin mr-2" />
                              {currentStep === 4 ? 'Sending...' : 'Saving...'}
                            </>
                          ) : currentStep === 4 ? (
                            'Send for Admin Approval'
                          ) : (
                            'Save & Continue'
                          )}
                        </Button>
                      </div>
                    </div>
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
}

function DynamicField({
  field,
  value,
  preview,
  onChange,
  onFileChange,
  fileInputRefs,
}: DynamicFieldProps) {
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
          />
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
              className="w-full"
            >
              <Upload className="w-5 h-5 mr-2" />
              {value ? 'Change File' : 'Upload File'}
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
              className="w-full"
            >
              <Video className="w-5 h-5 mr-2" />
              {value ? 'Change Video' : 'Record/Upload Video'}
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
        return (
          <Select
            value={value || ''}
            onValueChange={(value) => onChange(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={`Select ${field.fieldLabel}`} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="aadhar">Aadhar</SelectItem>
              <SelectItem value="pan">PAN</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-2">
      <Label>
        {field.fieldLabel}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {renderField()}
    </div>
  );
}
