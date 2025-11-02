import { useState, useCallback } from 'react';
import { apiService, CreatePlanData, Plan } from '@/lib/api';
import toast from 'react-hot-toast';

export interface PlanCreationStep {
  step: number;
  title: string;
  description: string;
  completed: boolean;
}

export interface PlanCreationData {
  // Step 1: Basic Details
  title: string;
  description: string;
  city: string;
  state: string;
  tourTypes?: string[];
  
  // Step 2: Itinerary
  duration?: {
    value: number;
    unit: 'hours' | 'days';
  };
  itinerary?: Record<string, string[]>; // For days: { "1": [...], "2": [...] }, For hours: { "0": [...] }
  gallery?: string[]; // Moved from Step 8 to Step 2
  
  // Step 3: Pricing
  pricing?: {
    pricePerPerson: number;
    currency: string;
    maxParticipants: number;
  };
  
  // Step 4: Schedule
  availability: {
    type: 'all_days' | 'recurring' | 'specific';
    recurring?: {
      daysOfWeek: string[];
      timeSlot?: {
        startTime?: string;
        endTime?: string;
      };
    };
    specific?: Array<{
      date: string;
      timeSlot?: {
        startTime?: string;
        endTime?: string;
      };
    }>;
  };
  
  // Step 5: Additional Information
  highlights?: string[];
  inclusions?: string[];
  exclusions?: string[];
  requirements?: string[];
  languages?: string[];
  
  // Step 6: Meeting Point & Logistics
  meetingPoint?: string;
  vehicleDetails?: string;
  contactPersonName?: string;
  contactPersonPhone?: string;
  contactPersonEmail?: string;
  
  // Step 7: Policies
  cancellationPolicy?: string;
  termsAndConditions?: string;
  specialInstructions?: string;
}

export const usePlanCreation = (planId?: string) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPlan, setIsLoadingPlan] = useState(false);
  const [planData, setPlanData] = useState<Partial<PlanCreationData>>({});
  const [createdPlan, setCreatedPlan] = useState<Plan | null>(null);
  const [stepCompleted, setStepCompleted] = useState<Record<number, boolean>>({
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
    6: false,
    7: false,
  });

  const steps: PlanCreationStep[] = [
    {
      step: 1,
      title: 'Basic Details',
      description: 'Title, description, location',
      completed: stepCompleted[1]
    },
    {
      step: 2,
      title: 'Itinerary',
      description: 'Places, activities & media',
      completed: stepCompleted[2]
    },
    {
      step: 3,
      title: 'Pricing',
      description: 'Price and participants',
      completed: stepCompleted[3]
    },
    {
      step: 4,
      title: 'Schedule',
      description: 'Timing and availability',
      completed: stepCompleted[4]
    },
    {
      step: 5,
      title: 'Additional Info',
      description: 'Highlights and details',
      completed: stepCompleted[5]
    },
    {
      step: 6,
      title: 'Logistics',
      description: 'Meeting point & contacts',
      completed: stepCompleted[6]
    },
    {
      step: 7,
      title: 'Policies',
      description: 'Terms and conditions',
      completed: stepCompleted[7]
    }
  ];

  const updateStepData = useCallback((step: number, data: Partial<PlanCreationData>) => {
    setPlanData(prev => ({
      ...prev,
      ...data
    }));
  }, []);

  const markStepCompleted = useCallback((step: number) => {
    setStepCompleted(prev => ({
      ...prev,
      [step]: true
    }));
  }, []);

  const createPlan = useCallback(async (data?: Partial<PlanCreationData>, token?: string) => {
    // Support both signatures: (token) or (data, token)
    let actualToken: string;
    let actualData: Partial<PlanCreationData>;
    
    if (typeof data === 'string') {
      // Old signature: createPlan(token)
      actualToken = data;
      actualData = planData;
    } else {
      // New signature: createPlan(data, token)
      actualData = data || planData;
      actualToken = token || '';
    }

    if (!actualToken) {
      toast.error('Authentication required');
      return null;
    }

    setIsLoading(true);
    try {
      const response = await apiService.createPlan(actualData as CreatePlanData, actualToken);
      if (response.success && response.data) {
        setCreatedPlan(response.data);
        // Don't show toast here - let the caller handle it
        return response.data;
      } else {
        toast.error(response.message || 'Failed to create plan');
        return null;
      }
    } catch (error) {
      console.error('Error creating plan:', error);
      toast.error('Failed to create plan');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [planData]);

  const updatePlanStep = useCallback(async (planId: string, step: number, data: any, token: string) => {
    if (!token) {
      toast.error('Authentication required');
      return null;
    }

    setIsLoading(true);
    try {
      const response = await apiService.updatePlanStep(planId, step, data, token);
      if (response.success && response.data) {
        // Update createdPlan with the latest data from server
        setCreatedPlan(response.data);
        markStepCompleted(step);
        toast.success(`Step ${step} saved successfully!`);
        return response.data;
      } else {
        toast.error(response.message || `Failed to update step ${step}`);
        return null;
      }
    } catch (error) {
      console.error(`Error updating step ${step}:`, error);
      toast.error(`Failed to update step ${step}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [markStepCompleted]);

  const publishPlan = useCallback(async (planId: string, token: string) => {
    if (!token) {
      toast.error('Authentication required');
      return null;
    }

    setIsLoading(true);
    try {
      const response = await apiService.publishPlan(planId, token);
      if (response.success && response.data) {
        toast.success('Plan published successfully!');
        return response.data;
      } else {
        toast.error(response.message || 'Failed to publish plan');
        return null;
      }
    } catch (error) {
      console.error('Error publishing plan:', error);
      toast.error('Failed to publish plan');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadPlan = useCallback(async (planIdToLoad: string, token: string) => {
    if (!token) {
      toast.error('Authentication required');
      return null;
    }

    setIsLoadingPlan(true);
    try {
      const response = await apiService.getPlanById(planIdToLoad);
      if (response.success && response.data) {
        const plan = response.data;
        setCreatedPlan(plan);

        // Map plan data to PlanCreationData format
        const mappedData: Partial<PlanCreationData> = {
          title: plan.title || '',
          description: plan.description || '',
          city: plan.city || '',
          state: plan.state || '',
          tourTypes: plan.tourTypes || [],
          duration: plan.duration || { value: 1, unit: 'hours' },
          itinerary: plan.itinerary || {},
          gallery: plan.gallery || [],
          pricing: plan.pricing || {
            pricePerPerson: 0,
            currency: 'INR',
            maxParticipants: 1
          },
          availability: plan.availability || { type: 'all_days' },
          highlights: plan.highlights || [],
          inclusions: plan.inclusions || [],
          exclusions: plan.exclusions || [],
          requirements: plan.requirements || [],
          languages: plan.languages || [],
          meetingPoint: plan.meetingPoint || '',
          vehicleDetails: plan.vehicleDetails || '',
          contactPersonName: plan.contactPersonName || '',
          contactPersonPhone: plan.contactPersonPhone || '',
          contactPersonEmail: plan.contactPersonEmail || '',
          cancellationPolicy: plan.cancellationPolicy || '',
          termsAndConditions: plan.termsAndConditions || '',
          specialInstructions: plan.specialInstructions || '',
        };

        setPlanData(mappedData);

        // Mark all completed steps
        const completed: Record<number, boolean> = {
          1: !!(plan.title && plan.description && plan.city && plan.state),
          2: !!(plan.duration && plan.itinerary && Object.keys(plan.itinerary).length > 0),
          3: !!(plan.pricing && plan.pricing.pricePerPerson),
          4: !!(plan.availability && plan.availability.type && (
            plan.availability.type === 'all_days' ||
            (plan.availability.type === 'recurring' && plan.availability.recurring?.daysOfWeek && plan.availability.recurring.daysOfWeek.length > 0) ||
            (plan.availability.type === 'specific' && plan.availability.specific && plan.availability.specific.length > 0)
          )),
          5: true, // Optional step
          6: true, // Optional step
          7: true, // Optional step
        };
        setStepCompleted(completed);

        return plan;
      } else {
        toast.error(response.message || 'Failed to load plan');
        return null;
      }
    } catch (error) {
      console.error('Error loading plan:', error);
      toast.error('Failed to load plan');
      return null;
    } finally {
      setIsLoadingPlan(false);
    }
  }, []);

  const resetPlanCreation = useCallback(() => {
    setCurrentStep(1);
    setPlanData({});
    setCreatedPlan(null);
  }, []);

  const goToStep = useCallback((step: number) => {
    if (step >= 1 && step <= steps.length) {
      setCurrentStep(step);
    }
  }, [steps.length]);

  const nextStep = useCallback(() => {
    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, steps.length]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const isStepValid = useCallback((step: number): boolean => {
    switch (step) {
      case 1:
        return !!(
          planData.title &&
          planData.description &&
          planData.city &&
          planData.state
        );
      case 2:
        const duration = planData.duration;
        let hasValidDuration = false;
        if (duration) {
          if (typeof duration === 'object' && duration !== null && 'value' in duration && 'unit' in duration) {
            hasValidDuration = !!(duration as { value: number; unit: string }).value && !!(duration as { value: number; unit: string }).unit;
          } else if (typeof duration === 'number') {
            hasValidDuration = duration > 0;
          }
        }
        return !!(
          hasValidDuration &&
          planData.itinerary &&
          Object.keys(planData.itinerary).length > 0 &&
          Object.values(planData.itinerary).some((items: any) => Array.isArray(items) && items.length > 0)
        );
      case 3:
        const pricing = planData.pricing;
        const hasValidPricing = pricing && (
          (typeof pricing === 'object' && pricing !== null && 
           'pricePerPerson' in pricing && 'currency' in pricing && 'maxParticipants' in pricing &&
           pricing.pricePerPerson && pricing.currency && pricing.maxParticipants)
        );
        return !!hasValidPricing;
      case 4:
        const availability = planData.availability;
        if (!availability || !availability.type) return false;
        
        if (availability.type === 'all_days') return true;
        if (availability.type === 'recurring') {
          return !!(availability.recurring?.daysOfWeek && availability.recurring.daysOfWeek.length > 0);
        }
        if (availability.type === 'specific') {
          return !!(availability.specific && availability.specific.length > 0);
        }
        return false;
      case 5:
        return true; // Optional step
      case 6:
        return true; // Optional step (meeting point is optional)
      case 7:
        return true; // Optional step
      default:
        return false;
    }
  }, [planData]);

  const areAllStepsCompleted = useCallback((): boolean => {
    return stepCompleted[1] && stepCompleted[2] && stepCompleted[3] && 
           stepCompleted[4] && stepCompleted[5] && stepCompleted[6] && 
           stepCompleted[7];
  }, [stepCompleted]);

  return {
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
  };
};
