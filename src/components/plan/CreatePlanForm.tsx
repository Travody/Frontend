'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePlanCreation } from '@/hooks/usePlanCreation';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, Save, Globe, Lock, MapPin, Clock, Users, Star, X, Maximize2, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { LoadingState } from '@/components/ui/loading-state';
import { Heading } from '@/components/ui/heading';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// Step Components
import Step1BasicDetails from './CreatePlanSteps/Step1BasicDetails';
import Step2Itinerary from './CreatePlanSteps/Step2Itinerary';
import Step3Pricing from './CreatePlanSteps/Step3Pricing';
import Step4Schedule from './CreatePlanSteps/Step4Schedule';
import Step5AdditionalInfo from './CreatePlanSteps/Step5AdditionalInfo';
import Step6Logistics from './CreatePlanSteps/Step6Logistics';
import Step7Policies from './CreatePlanSteps/Step5Policies';

export default function CreatePlanForm() {
  const { token } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editPlanId = searchParams.get('edit');

  const {
    currentStep,
    isLoading,
    isLoadingPlan,
    planData,
    createdPlan,
    steps,
    stepCompleted,
    updateStepData,
    markStepCompleted,
    createPlan,
    updatePlanStep,
    publishPlan,
    loadPlan,
    resetPlanCreation,
    goToStep,
    nextStep,
    prevStep,
    isStepValid,
    areAllStepsCompleted
  } = usePlanCreation(editPlanId || undefined);

  const isEditMode = !!editPlanId;

  const [isSaving, setIsSaving] = useState(false);
  const [showFullPreview, setShowFullPreview] = useState(false);
  const [lastSavedStepData, setLastSavedStepData] = useState<Record<number, any>>({});

  // Load plan data when in edit mode
  useEffect(() => {
    if (isEditMode && editPlanId && token && !createdPlan && !isLoadingPlan) {
      loadPlan(editPlanId, token);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, editPlanId, token]);

  // Extract step-specific data
  const getStepData = (step: number, data: any) => {
    switch (step) {
      case 1: // Basic Details
        return {
          title: data.title,
          description: data.description,
          city: data.city,
          state: data.state,
          tourTypes: data.tourTypes || []
        };
      case 2: // Itinerary
        return {
          duration: data.duration || { value: 1, unit: 'hours' },
          itinerary: data.itinerary,
          gallery: data.gallery || []
        };
      case 3: // Pricing
        return {
          pricing: data.pricing || {
            pricePerPerson: data.pricePerPerson || 0,
            currency: data.currency || 'INR',
            maxParticipants: data.maxParticipants || 1
          }
        };
      case 4: // Schedule
        return {
          startTime: data.startTime,
          endTime: data.endTime,
          availability: data.availability || []
        };
      case 5: // Additional Information
        return {
          highlights: data.highlights || [],
          inclusions: data.inclusions || [],
          exclusions: data.exclusions || [],
          requirements: data.requirements || [],
          languages: data.languages || []
        };
      case 6: // Logistics
        return {
          meetingPoint: data.meetingPoint || '',
          vehicleDetails: data.vehicleDetails || '',
          contactPersonName: data.contactPersonName || '',
          contactPersonPhone: data.contactPersonPhone || '',
          contactPersonEmail: data.contactPersonEmail || ''
        };
      case 7: // Policies
        return {
          cancellationPolicy: data.cancellationPolicy || '',
          termsAndConditions: data.termsAndConditions || '',
          specialInstructions: data.specialInstructions || ''
        };
      default:
        return {};
    }
  };

  // Check if step data has changed
  const hasStepDataChanged = (step: number, currentData: any): boolean => {
    const previousData = lastSavedStepData[step];
    if (!previousData) return true; // First time saving this step
    
    const currentStepData = getStepData(step, currentData);
    return JSON.stringify(currentStepData) !== JSON.stringify(previousData);
  };

  const handleStepSave = async (stepData: any) => {
    if (!token) {
      toast.error('Authentication required');
      return;
    }

    setIsSaving(true);
    try {
      // Update local data first
      updateStepData(currentStep, stepData);
      
      // If we have a created plan, update the step on the server
      if (createdPlan) {
        await updatePlanStep(createdPlan._id, currentStep, stepData, token);
        markStepCompleted(currentStep);
        toast.success(`Step ${currentStep} saved successfully!`);
      } else if (currentStep === 1 && isStepValid(1)) {
        // For step 1, we need to create the plan first
        // Merge stepData with existing planData for createPlan call
        const mergedData = { ...planData, ...stepData };
        
        // Create the plan with step 1 data
        const newPlan = await createPlan(mergedData, token);
        if (newPlan) {
          // Update the first step to mark it as completed
          await updatePlanStep(newPlan._id, 1, stepData, token);
          markStepCompleted(1);
          toast.success('Plan created and Step 1 saved successfully!');
        }
      } else {
        toast.error('Please complete Step 1 first to create the plan');
      }
    } catch (error) {
      console.error('Error saving step:', error);
      toast.error('Failed to save step data');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!token) return;
    
    // Check if step 1 is completed
    if (!isStepValid(1)) {
      toast.error('Please complete the first step (Basic Details) before saving as draft');
      return;
    }
    
    setIsSaving(true);
    try {
      if (createdPlan) {
        // Save current step data (only if changed)
        const stepData = getStepData(currentStep, planData);
        if (hasStepDataChanged(currentStep, planData)) {
          await updatePlanStep(createdPlan._id, currentStep, stepData, token);
          setLastSavedStepData(prev => ({ ...prev, [currentStep]: stepData }));
        }
        toast.success('Draft saved successfully!');
      } else {
        // Create plan as draft if step 1 is valid (only Step 1 data)
        const step1Data = getStepData(1, planData);
        const newPlan = await createPlan(step1Data, token);
        if (newPlan) {
          // Save step 1 data
          await updatePlanStep(newPlan._id, 1, step1Data, token);
          setLastSavedStepData(prev => ({ ...prev, [1]: step1Data }));
          toast.success('Plan created and saved as draft!');
        }
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      toast.error('Failed to save draft');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!token || !createdPlan) {
      toast.error('Plan must be created first');
      return;
    }

    if (!areAllStepsCompleted()) {
      toast.error('Please complete all steps before publishing');
      return;
    }
    
    setIsSaving(true);
    try {
      await publishPlan(createdPlan._id, token);
      toast.success('Plan published successfully! It is now visible to travelers.');
    } catch (error) {
      console.error('Error publishing plan:', error);
      toast.error('Failed to publish plan');
    } finally {
      setIsSaving(false);
    }
  };

  const formatPrice = (price: number, currency: string) => {
    const symbol = currency === 'INR' ? '₹' : currency === 'USD' ? '$' : currency;
    return `${symbol}${price || 0}`;
  };

  const handlePrevious = async () => {
    if (currentStep > 1) {
      // Save current step before going back (only if data changed)
      if (token && createdPlan && hasStepDataChanged(currentStep, planData)) {
        try {
          const stepData = getStepData(currentStep, planData);
          await updatePlanStep(createdPlan._id, currentStep, stepData, token);
          setLastSavedStepData(prev => ({ ...prev, [currentStep]: stepData }));
        } catch (error) {
          console.error('Error saving step:', error);
        }
      }
      prevStep();
    }
  };

  const handleNext = async () => {
    // Validate current step
    if (!isStepValid(currentStep)) {
      toast.error(`Please complete Step ${currentStep} before proceeding`);
      return;
    }

    // Don't proceed if already on last step
    if (currentStep >= steps.length) {
      return;
    }

    // Save current step
    if (!token) {
      toast.error('Authentication required');
      return;
    }

    setIsSaving(true);
    try {
      if (createdPlan) {
        // Only update if data has changed
        const stepData = getStepData(currentStep, planData);
        if (hasStepDataChanged(currentStep, planData)) {
          await updatePlanStep(createdPlan._id, currentStep, stepData, token);
          setLastSavedStepData(prev => ({ ...prev, [currentStep]: stepData }));
          toast.success(`Step ${currentStep} saved`);
        }
        markStepCompleted(currentStep);
        nextStep();
      } else {
        // First step - create plan with Step 1 data only
        if (currentStep === 1 && isStepValid(1)) {
          const step1Data = getStepData(1, planData);
          const newPlan = await createPlan(step1Data, token);
          if (newPlan) {
            // Update step 1 completion
            await updatePlanStep(newPlan._id, 1, step1Data, token);
            setLastSavedStepData(prev => ({ ...prev, [1]: step1Data }));
            markStepCompleted(1);
            nextStep();
            toast.success('Plan created and Step 1 saved');
          }
        }
      }
    } catch (error) {
      console.error('Error saving step:', error);
      toast.error('Failed to save step');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFinish = async () => {
    if (!token || !createdPlan) {
      toast.error('Please complete Step 1 first to create the plan');
      return;
    }

    // Validate current step
    if (!isStepValid(currentStep)) {
      toast.error(`Please complete Step ${currentStep} before finishing`);
      return;
    }

    setIsSaving(true);
    try {
      // Save the last step if data has changed
      const stepData = getStepData(currentStep, planData);
      if (hasStepDataChanged(currentStep, planData)) {
        await updatePlanStep(createdPlan._id, currentStep, stepData, token);
        setLastSavedStepData(prev => ({ ...prev, [currentStep]: stepData }));
      }
      markStepCompleted(currentStep);
      
      toast.success('Plan completed successfully!');
      
      // Navigate to the plan detail page
      if (isEditMode) {
        router.push(`/guider/my-plans/${createdPlan._id}`);
      } else {
        router.push(`/guider/my-plans/${createdPlan._id}`);
      }
    } catch (error) {
      console.error('Error finishing plan:', error);
      toast.error('Failed to save final step');
    } finally {
      setIsSaving(false);
    }
  };

  const renderStepContent = () => {
    const stepProps = {
      data: planData,
      onSubmit: (stepData: any) => {
        // Update planData immediately when form changes
        updateStepData(currentStep, stepData);
      },
      isLoading: isSaving,
      isValid: isStepValid(currentStep)
    };

    switch (currentStep) {
      case 1:
        return <Step1BasicDetails {...stepProps} />;
      case 2:
        return <Step2Itinerary {...stepProps} />;
      case 3:
        return <Step3Pricing {...stepProps} />;
      case 4:
        return <Step4Schedule {...stepProps} />;
      case 5:
        return <Step5AdditionalInfo {...stepProps} />;
      case 6:
        return <Step6Logistics {...stepProps} />;
      case 7:
        return <Step7Policies {...stepProps} />;
      default:
        return null;
    }
  };

  const renderPreviewCard = () => {
    if (!createdPlan && !planData.title) return null;

    const previewData = createdPlan || planData;

  return (
      <div className="bg-gray-50 rounded-lg border p-3">
        <div className="flex items-center justify-between mb-2">
          <Heading as="h3" variant="card" className="text-xs">Plan Preview</Heading>
          {createdPlan && (
            <button
              onClick={() => setShowFullPreview(true)}
              className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              <Maximize2 className="w-3 h-3" />
              Full
            </button>
          )}
        </div>

        {previewData.gallery && previewData.gallery.length > 0 && (
          <div className="mb-2">
            <img
              src={previewData.gallery[0]}
              alt={previewData.title || 'Plan preview'}
              className="w-full h-24 object-cover rounded"
            />
          </div>
        )}
        
        <h4 className="font-medium text-xs text-gray-900 mb-1 line-clamp-2">
          {previewData.title || 'Untitled Plan'}
        </h4>
        
        {previewData.city && previewData.state && (
          <div className="flex items-center text-xs text-gray-600 mb-1.5">
            <MapPin className="w-3 h-3 mr-1" />
            <span className="line-clamp-1">{previewData.city}, {previewData.state}</span>
          </div>
        )}
        
        <div className="flex items-center justify-between mt-1.5">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            {previewData.duration && (
              <div className="flex items-center">
                <Clock className="w-3 h-3 mr-0.5" />
                <span>
                  {typeof previewData.duration === 'object' ? previewData.duration.value : previewData.duration} 
                  {' '}
                  {typeof previewData.duration === 'object' 
                    ? (previewData.duration.unit === 'days' ? 'day(s)' : 'hour(s)')
                    : 'hour(s)'}
                </span>
              </div>
            )}
            {((previewData as any).pricing?.maxParticipants || (previewData as any).maxParticipants) && (
              <div className="flex items-center">
                <Users className="w-3 h-3 mr-0.5" />
                <span>{(previewData as any).pricing?.maxParticipants || (previewData as any).maxParticipants}</span>
              </div>
            )}
          </div>
          
          {((previewData as any).pricing?.pricePerPerson || (previewData as any).pricePerPerson) && (
            <div className="text-right">
              <div className="text-xs font-bold text-primary-600">
                {formatPrice(
                  (previewData as any).pricing?.pricePerPerson || (previewData as any).pricePerPerson || 0, 
                  (previewData as any).pricing?.currency || (previewData as any).currency || 'INR'
                )}
              </div>
              <div className="text-xs text-gray-500">per person</div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderFullPreview = () => {
    if (!createdPlan) return null;
    // Merge createdPlan with planData to show latest updates
    const plan = { ...createdPlan, ...planData };

    return (
      <Dialog open={showFullPreview} onOpenChange={setShowFullPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Plan Preview</DialogTitle>
            <DialogDescription>Review your plan before publishing</DialogDescription>
          </DialogHeader>
          
          <div className="p-6 space-y-6">
            {/* Plan Header */}
            <div>
              <Heading as="h1" variant="page" className="mb-2">{plan.title}</Heading>
              <div className="flex items-center text-gray-600 mb-2">
                <MapPin className="w-5 h-5 mr-2" />
                <span>{plan.city}, {plan.state}</span>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>{plan.duration?.value || (typeof plan.duration === 'number' ? plan.duration : 0)} {plan.duration?.unit === 'days' ? 'day(s)' : 'hour(s)'}</span>
                </div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  <span>Up to {(plan as any).pricing?.maxParticipants || (plan as any).maxParticipants || 0} people</span>
                </div>
                <div className="flex items-center">
                  <Star className="w-4 h-4 mr-1 text-yellow-500" />
                  <span>{plan.rating?.toFixed(1) || 'New'} ({plan.totalReviews || 0} reviews)</span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-3xl font-bold text-primary-600">
                {formatPrice(
                  (plan as any).pricing?.pricePerPerson || (plan as any).pricePerPerson || 0,
                  (plan as any).pricing?.currency || (plan as any).currency || 'INR'
                )}
              </div>
              <div className="text-sm text-gray-500">per person</div>
            </div>

            {/* Tour Types */}
            {plan.tourTypes && plan.tourTypes.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {plan.tourTypes.map((type) => (
                  <Badge key={type} variant="secondary">
                    {type}
                  </Badge>
                ))}
              </div>
            )}

            {/* Gallery */}
            {plan.gallery && plan.gallery.length > 0 && (
              <div>
                <Heading as="h2" variant="subsection" className="mb-4">Photos</Heading>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {plan.gallery.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`${plan.title} ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <Heading as="h2" variant="subsection" className="mb-4">About this tour</Heading>
              <p className="text-gray-700 leading-relaxed">{plan.description}</p>
            </div>

            {/* Itinerary */}
            {plan.itinerary && Object.keys(plan.itinerary).length > 0 && (
              <div>
                <Heading as="h2" variant="subsection" className="mb-4">Itinerary</Heading>
                <div className="space-y-4">
                  {Object.entries(plan.itinerary).map(([key, items]: [string, any]) => {
                    const dayLabel = key === '0' ? 'Hourly Schedule' : `Day ${key}`;
                    return (
                      <div key={key} className="border-l-4 border-primary-500 pl-4">
                        <Heading as="h3" variant="subsection" className="mb-2">{dayLabel}</Heading>
                        <ul className="space-y-2">
                          {Array.isArray(items) && items.map((item: string, idx: number) => (
                            <li key={idx} className="flex items-start">
                              <CheckCircle className="w-4 h-4 text-teal-500 mr-2 mt-1 flex-shrink-0" />
                              <span className="text-gray-700">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Availability/Schedule */}
            {plan.availability && (
              <div>
                <Heading as="h2" variant="subsection" className="mb-4">Availability</Heading>
                <div className="bg-gray-50 p-4 rounded-lg">
                  {plan.availability.type === 'all_days' && (
                    <div className="flex items-center">
                      <Clock className="w-5 h-5 text-primary-600 mr-2" />
                      <span className="text-gray-700 font-medium">Available all days</span>
                    </div>
                  )}
                  {plan.availability.type === 'recurring' && plan.availability.recurring && (
                    <div>
                      <div className="flex items-center mb-2">
                        <Clock className="w-5 h-5 text-primary-600 mr-2" />
                        <span className="text-gray-700 font-medium">Recurring Schedule</span>
                      </div>
                      <div className="ml-7">
                        <p className="text-gray-600 mb-1">
                          <span className="font-medium">Days:</span> {plan.availability.recurring.daysOfWeek?.join(', ') || 'Not specified'}
                        </p>
                        {plan.availability.recurring.timeSlot && (
                          <p className="text-gray-600">
                            <span className="font-medium">Time:</span> {
                              plan.availability.recurring.timeSlot.startTime && plan.availability.recurring.timeSlot.endTime
                                ? `${plan.availability.recurring.timeSlot.startTime} - ${plan.availability.recurring.timeSlot.endTime}`
                                : plan.availability.recurring.timeSlot.startTime || 'Not specified'
                            }
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  {plan.availability.type === 'specific' && plan.availability.specific && plan.availability.specific.length > 0 && (
                    <div>
                      <div className="flex items-center mb-2">
                        <Clock className="w-5 h-5 text-primary-600 mr-2" />
                        <span className="text-gray-700 font-medium">Specific Dates</span>
                      </div>
                      <div className="ml-7 space-y-1">
                        {plan.availability.specific.map((spec: any, idx: number) => (
                          <div key={idx} className="text-gray-600">
                            <span className="font-medium">{spec.date}</span>
                            {spec.timeSlot && (spec.timeSlot.startTime || spec.timeSlot.endTime) && (
                              <span className="ml-2">
                                {spec.timeSlot.startTime && spec.timeSlot.endTime
                                  ? `(${spec.timeSlot.startTime} - ${spec.timeSlot.endTime})`
                                  : spec.timeSlot.startTime ? `(${spec.timeSlot.startTime})` : ''}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Highlights */}
            {plan.highlights && plan.highlights.length > 0 && (
              <div>
                <Heading as="h2" variant="subsection" className="mb-4">Highlights</Heading>
                <ul className="space-y-2">
                  {plan.highlights.map((highlight, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Requirements & Languages */}
            {(plan.requirements || plan.languages) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {plan.requirements && plan.requirements.length > 0 && (
                  <div>
                    <Heading as="h2" variant="subsection" className="mb-4">Requirements</Heading>
                    <ul className="space-y-2">
                      {plan.requirements.map((requirement, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{requirement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {plan.languages && plan.languages.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Languages Offered</h2>
                    <div className="flex flex-wrap gap-2">
                      {plan.languages.map((lang, index) => (
                        <Badge key={index} variant="secondary">
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Inclusions & Exclusions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {plan.inclusions && plan.inclusions.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">What's Included</h2>
                  <ul className="space-y-2">
                    {plan.inclusions.map((inclusion, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{inclusion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {plan.exclusions && plan.exclusions.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">What's Not Included</h2>
                  <ul className="space-y-2">
                    {plan.exclusions.map((exclusion, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-gray-700">{exclusion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Logistics & Contact Information */}
            {(plan.meetingPoint || plan.vehicleDetails || plan.contactPersonName || plan.contactPersonPhone || plan.contactPersonEmail) && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Logistics & Contact Information</h2>
                
                {plan.meetingPoint && (
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-primary-600" />
                      Meeting Point
                    </h3>
                    <p className="text-gray-700 ml-6">{plan.meetingPoint}</p>
                    {plan.meetingPointCoordinates && (
                      <p className="text-gray-500 text-sm ml-6 mt-1">
                        Coordinates: {plan.meetingPointCoordinates.lat}, {plan.meetingPointCoordinates.lng}
                      </p>
                    )}
                  </div>
                )}

                {plan.vehicleDetails && (
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <Users className="w-4 h-4 mr-2 text-primary-600" />
                      Vehicle Details
                    </h3>
                    <p className="text-gray-700 ml-6">{plan.vehicleDetails}</p>
                  </div>
                )}

                {(plan.contactPersonName || plan.contactPersonPhone || plan.contactPersonEmail) && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Contact Person</h3>
                    <div className="ml-6 space-y-2">
                      {plan.contactPersonName && (
                        <p className="text-gray-700">
                          <span className="font-medium">Name:</span> {plan.contactPersonName}
                        </p>
                      )}
                      {plan.contactPersonPhone && (
                        <p className="text-gray-700">
                          <span className="font-medium">Phone:</span> {plan.contactPersonPhone}
                        </p>
                      )}
                      {plan.contactPersonEmail && (
                        <p className="text-gray-700">
                          <span className="font-medium">Email:</span> {plan.contactPersonEmail}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Policies */}
            {(plan.cancellationPolicy || plan.termsAndConditions || plan.specialInstructions) && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Policies & Information</h2>
                
                {plan.cancellationPolicy && (
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Cancellation Policy</h3>
                    <p className="text-gray-700 text-sm">{plan.cancellationPolicy}</p>
                  </div>
                )}

                {plan.specialInstructions && (
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Special Instructions</h3>
                    <p className="text-gray-700 text-sm">{plan.specialInstructions}</p>
                  </div>
                )}

                {plan.termsAndConditions && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Terms & Conditions</h3>
                    <p className="text-gray-700 text-sm">{plan.termsAndConditions}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  // Show loading state while loading plan in edit mode
  if (isEditMode && isLoadingPlan && !createdPlan) {
    return (
      <Section variant="muted" className="h-[calc(100vh-4rem)]">
        <Container>
          <LoadingState message="Loading plan data..." />
        </Container>
      </Section>
    );
  }

  return (
    <>
      <div className="h-[calc(100vh-4rem)] bg-gray-50 flex flex-col overflow-hidden">
        {/* Top Header with Publish Button */}
        <div className="bg-white border-b flex-shrink-0 z-20">
          <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    if (isEditMode && createdPlan) {
                      router.push(`/guider/my-plans/${createdPlan._id}`);
                    } else {
                      router.push('/guider/my-plans');
                    }
                  }}
                  className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors"
                  title={isEditMode ? "Back to Plan Details" : "Back to My Plans"}
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-xl font-bold text-gray-900">
                  {isEditMode ? 'Edit Tour Plan' : 'Create New Tour Plan'}
                </h1>
              </div>
              <div className="flex items-center gap-3">
                {createdPlan && (
                  <>
                    {createdPlan.status === 'published' ? (
                      <div className="flex items-center px-4 py-2 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-md">
                        <Globe className="w-4 h-4 mr-2" />
                        Published
                      </div>
                    ) : (
                      <Button
                        onClick={handlePublish}
                        disabled={isSaving || !areAllStepsCompleted()}
                        title={!areAllStepsCompleted() ? 'Complete all steps to publish' : 'Publish plan to make it visible to travelers'}
                        size="sm"
                      >
                        <Globe className="w-4 h-4 mr-2" />
                        Publish Plan
                      </Button>
                    )}
                  </>
                )}
                
                {!createdPlan && (
                  <div className="flex items-center px-4 py-2 text-sm text-gray-500 bg-gray-100 rounded-md">
                    <Lock className="w-4 h-4 mr-2" />
                    Complete Step 1
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area - Fixed Height with Independent Scrolling */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar - Fixed Width, Scrollable */}
          <div className="w-72 flex-shrink-0 bg-white border-r flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto">
              <div className="p-3 space-y-3">
                {/* Steps - Compact */}
                <div>
                  <h2 className="text-sm font-semibold text-gray-900 mb-2">Steps</h2>
                  <div className="space-y-1">
                    {steps.map((step, index) => (
                      <div key={step.step}>
                        <button
                          onClick={() => goToStep(step.step)}
                          className={`w-full text-left p-2 rounded border transition-all ${
                            currentStep === step.step
                              ? 'border-primary-500 bg-primary-50'
                              : step.completed
                              ? 'border-green-300 bg-green-50 hover:border-green-400'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center border-2 text-xs ${
                              currentStep === step.step
                                ? 'border-primary-500 bg-primary-500 text-white'
                                : step.completed
                                ? 'border-green-500 bg-green-500 text-white'
                                : 'border-gray-300 bg-white text-gray-500'
                            }`}>
                              {step.completed ? (
                                <CheckCircle className="w-4 h-4" />
                              ) : (
                                <span className="text-xs font-medium">{step.step}</span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`font-medium text-xs ${
                                currentStep === step.step ? 'text-primary-700' : step.completed ? 'text-green-700' : 'text-gray-700'
                              }`}>
                                {step.title}
                              </p>
                            </div>
                          </div>
                        </button>
                        {index < steps.length - 1 && (
                          <div className={`ml-3 h-2 w-0.5 ${
                            step.completed ? 'bg-green-400' : 'bg-gray-200'
                          }`} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Progress Summary - Compact */}
                <div className="pt-2 border-t border-gray-200">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium text-gray-900">
                        {steps.filter(s => s.completed).length}/{steps.length}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className="bg-primary-500 h-1.5 rounded-full transition-all"
                        style={{ width: `${(steps.filter(s => s.completed).length / steps.length) * 100}%` }}
                      />
                    </div>
                  </div>
                  
                  {createdPlan && (
                    <div className="mt-2 p-1.5 bg-blue-50 rounded text-xs">
                      <p className="text-blue-700">
                        <strong>Status:</strong> {createdPlan.status === 'published' ? 'Published' : 'Draft'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Preview Card */}
                <div className="pt-2">
                  {renderPreviewCard()}
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Form Content - Scrollable with Fixed Button */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto">
              <div className="p-6 lg:p-8">
                {renderStepContent()}
              </div>
            </div>

            {/* Fixed Bottom Navigation */}
            <div className="border-t border-gray-200 px-6 lg:px-8 py-3 bg-white flex-shrink-0">
              <div className="flex items-center justify-between gap-4">
                {/* Left side - Save Draft */}
                <Button
                  onClick={handleSaveDraft}
                  disabled={isSaving || !isStepValid(1)}
                  variant="outline"
                  size="sm"
                  title={!isStepValid(1) ? 'Complete Step 1 first to save as draft' : 'Save draft'}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Draft
                </Button>

                {/* Center - Navigation buttons */}
                <div className="flex items-center gap-3 ml-auto">
                  <Button
                    onClick={handlePrevious}
                    disabled={currentStep === 1 || isSaving}
                    variant="outline"
                    size="sm"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                  
                  {currentStep === steps.length ? (
                    <Button
                      onClick={handleFinish}
                      disabled={!createdPlan || !isStepValid(currentStep) || isSaving}
                      size="sm"
                      title={!createdPlan ? 'Please complete Step 1 first to create the plan' : 'Finish and save plan'}
                    >
                      Finish
                      <CheckCircle className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleNext}
                      disabled={!isStepValid(currentStep) || isSaving}
                      size="sm"
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full Preview Modal */}
      {renderFullPreview()}
    </>
  );
}