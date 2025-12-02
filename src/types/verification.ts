/**
 * Verification Types
 * Types related to guider verification process
 */

export interface VerificationFieldConfig {
  fieldName: string;
  fieldLabel: string;
  fieldType: 'text' | 'file' | 'video' | 'select' | 'image';
  required: boolean;
  placeholder?: string;
  accept?: string;
  options?: Array<{ label: string; value: string }>; // For select fields
}

export interface VerificationStepConfig {
  stepNumber: number;
  stepName: string;
  description: string;
  isHidden?: boolean; // Option to hide steps from verification flow
  fields: VerificationFieldConfig[];
}

export interface VerificationStepsConfig {
  _id?: string;
  configName: string;
  steps: VerificationStepConfig[];
  isActive: boolean;
  version?: string;
}

export interface VerificationStepData {
  stepNumber: number;
  stepName: string;
  data?: Record<string, any>;
  completedAt?: string;
  uploadedAt?: string;
}

export interface VerificationData {
  steps?: VerificationStepData[];
}

export interface UpdateVerificationStepDto {
  step: number;
  data?: Record<string, any>;
}

