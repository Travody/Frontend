'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Check, Clock, Upload, Video, FileText, Loader2 } from 'lucide-react';
import { useAuth, isGuiderUser } from '@/contexts/AuthContext';
import { apiService, VerificationStepsConfig, VerificationFieldConfig, UpdateVerificationStepDto } from '@/lib/api';
import toast from 'react-hot-toast';

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

  // Use memo to ensure currentStep updates when user changes
  const currentStep = user.currentVerificationStep || 1;
  const verificationData = user.verificationData;

  // Check if step 4 has been submitted for admin approval
  const step4Data = verificationData?.steps?.find((s) => s.stepNumber === 4);
  const step4SubmittedForReview = step4Data?.data?.submittedForReview === true;

  // Load existing data for the current step
  const loadStepData = useCallback((configData: VerificationStepsConfig, stepNumber: number) => {
    if (!verificationData?.steps) {
      // No existing data, clear form
      setFormData({});
      setFilePreviews({});
      return;
    }

    const currentStepData = verificationData.steps.find(
      (s) => s.stepNumber === stepNumber
    );

    if (currentStepData?.data) {
      setFormData(currentStepData.data);
      // Set file previews for file/video fields
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
      // Step has no data yet, clear form
      setFormData({});
      setFilePreviews({});
    }
  }, [verificationData]);

  // Fetch verification config
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await apiService.getVerificationStepsConfig();
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

  // Reload step data when currentStep or verificationData changes
  useEffect(() => {
    if (config) {
      loadStepData(config, currentStep);
    }
  }, [currentStep, verificationData, config, loadStepData]);

  // Get step status
  const getStepStatus = (stepNumber: number): 'completed' | 'current' | 'pending' => {
    if (stepNumber < currentStep) return 'completed';
    if (stepNumber === currentStep) return 'current';
    return 'pending';
  };

  // Calculate progress
  const calculateProgress = (): number => {
    if (!config) return 0;
    const totalSteps = config.steps.length;
    const completedSteps = currentStep - 1;
    return Math.round((completedSteps / totalSteps) * 100);
  };

  // Handle file input change
  const handleFileChange = (fieldName: string, file: File | null) => {
    if (!file) return;

    // Validate file type and size
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error('File size must be less than 10MB');
      return;
    }

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setFilePreviews((prev) => ({ ...prev, [fieldName]: previewUrl }));

    // Store file in formData (for actual submission, you'll need to upload to server first)
    // For now, we'll store the file name as placeholder
    setFormData((prev) => ({
      ...prev,
      [fieldName]: file.name,
    }));
  };

  // Handle input change for text/select fields
  const handleInputChange = (fieldName: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  // Submit step data
  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    
    if (submitting) {
      console.log('Already submitting, ignoring click');
      return;
    }

    // Get user ID - check both id and _id
    const userId = (user as any)?._id || user?.id;
    
    if (!userId || !token || !config) {
      console.error('Missing required data:', { 
        userId, 
        userObject: user,
        hasToken: !!token, 
        hasConfig: !!config 
      });
      toast.error('Missing required information. Please refresh the page.');
      return;
    }

    const stepNumber = user?.currentVerificationStep || 1;
    const stepConfig = config.steps.find((s) => s.stepNumber === stepNumber);
    if (!stepConfig) {
      console.error('Step config not found for step:', stepNumber);
      toast.error('Step configuration not found. Please refresh the page.');
      return;
    }

    // Validate required fields using current formData
    const missingFields = stepConfig.fields
      .filter((field) => field.required && !formData[field.fieldName])
      .map((field) => field.fieldLabel);

    if (missingFields.length > 0) {
      toast.error(`Please fill required fields: ${missingFields.join(', ')}`);
      return;
    }

    // Check if formData is empty (skip if step has no fields configured - like step 4 which just submits for approval)
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

      console.log('Submitting step:', stepNumber, 'Data:', formData, 'User ID:', userId);

      const response = await apiService.updateVerificationStep(
        userId,
        updateDto,
        token
      );

      if (response.success) {
        // Different messages for step 4 vs other steps
        if (stepNumber === 4) {
          toast.success('Verification request sent to admin for approval!');
        } else {
          toast.success('Step completed successfully!');
        }
        
        // Refresh user data to get updated currentVerificationStep
          const userResponse = await apiService.getCurrentUser(token, 'guider');
          if (userResponse.success && userResponse.data) {
          // refreshUser will normalize the data (convert _id to id)
            refreshUser(userResponse.data);
          // Clear form data after successful submission to prepare for next step
          setFormData({});
          setFilePreviews({});
            // Step data will be reloaded automatically via useEffect when user/currentStep changes
        }
      } else {
        toast.error(response.message || 'Failed to save step');
      }
    } catch (error) {
      console.error('Failed to submit step:', error);
      toast.error('Failed to save step. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [(user as any)?._id || user?.id, user?.currentVerificationStep, token, config, formData, submitting, refreshUser]);

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  if (!config) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Failed to load verification configuration</p>
        </div>
      </div>
    );
  }

  const currentStepConfig = config.steps.find((s) => s.stepNumber === currentStep);
  const progress = calculateProgress();

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <div className="bg-teal-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-2">
              Hello, {user?.showcaseName || user?.email}! 👋
            </h1>
            <p className="text-teal-100 text-lg mb-8">
              {user?.accountVerified
                ? 'Your account is verified! 🎉'
                : 'Complete verification to start earning'}
            </p>
            
            {/* Verification Status Banner */}
            <div className="bg-white rounded-lg p-6 max-w-md mx-auto">
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
            </div>
          </div>
        </div>
      </div>

      {/* Verification Steps */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Complete your verification</h2>
          
          {/* Steps Progress */}
          <div className="flex items-center justify-between mb-8 overflow-x-auto">
            {config.steps.map((step, index) => {
              const status = getStepStatus(step.stepNumber);
              return (
                <div key={step.stepNumber} className="flex items-center min-w-0 flex-shrink-0">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      status === 'completed'
                        ? 'bg-green-500'
                        : status === 'current'
                        ? 'bg-teal-500'
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

          {/* Current Step Content */}
          <div className="border border-gray-200 rounded-lg p-8">
            {currentStepConfig ? (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {currentStepConfig.stepName}
                </h3>
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
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
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
                    </div>
                  ) : null}
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={(e) => handleSubmit(e)}
                      disabled={submitting || (currentStep === 4 && step4SubmittedForReview)}
                      className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>{currentStep === 4 ? 'Sending...' : 'Saving...'}</span>
                        </>
                      ) : currentStep === 4 ? (
                        <span>Send for Admin Approval</span>
                      ) : (
                        <span>Save & Continue</span>
                      )}
                    </button>
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
        </div>
      </div>
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
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder || field.fieldLabel}
            required={field.required}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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
            <button
              type="button"
              onClick={() => {
                fileInputRefs.current[field.fieldName]?.click();
              }}
              className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-teal-500 flex items-center justify-center space-x-2 text-gray-600"
            >
              <Upload className="w-5 h-5" />
              <span>{value ? 'Change File' : 'Upload File'}</span>
            </button>
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
            <button
              type="button"
              onClick={() => {
                fileInputRefs.current[field.fieldName]?.click();
              }}
              className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-teal-500 flex items-center justify-center space-x-2 text-gray-600"
            >
              <Video className="w-5 h-5" />
              <span>{value ? 'Change Video' : 'Record/Upload Video'}</span>
            </button>
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
          <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            required={field.required}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 bg-white"
          >
            <option value="">Select {field.fieldLabel}</option>
            {/* You can add options based on field configuration or hardcode common options */}
            <option value="aadhar">Aadhar</option>
            <option value="pan">PAN</option>
            <option value="other">Other</option>
          </select>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {field.fieldLabel}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {renderField()}
    </div>
  );
}