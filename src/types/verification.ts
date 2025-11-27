/**
 * Verification Types
 * Types related to guider verification process
 */

export interface VerificationFieldConfig {
  fieldName: string;
  fieldLabel: string;
  fieldType: 'text' | 'file' | 'video' | 'select';
  required: boolean;
  placeholder?: string;
  accept?: string;
}

export interface VerificationStepConfig {
  stepNumber: number;
  stepName: string;
  description: string;
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

