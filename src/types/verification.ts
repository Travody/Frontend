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
  stepName: string;
  description: string;
  isHidden?: boolean; // Option to hide steps from verification flow (hidden steps are excluded from array)
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
  stepName: string;
  data?: Record<string, any>;
  completedAt?: string;
  uploadedAt?: string;
  // Step-level status tracking
  status?: 'pending' | 'revision' | 'approved';
  resubmittedAt?: string;
  // Rejection information
  rejectedFields?: string[];
  rejectionReasons?: Record<string, string>; // Per-field rejection reasons
  rejectionReason?: string; // General rejection reason (backward compatibility)
  rejectionDetails?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  // Approval information
  approvedBy?: string;
  approvedAt?: string;
}

export interface VerificationData {
  submittedForReview?: boolean;
  submittedAt?: string;
  steps?: VerificationStepData[];
  approvalInfo?: {
    approvalStatus?: 'approved' | 'rejected';
    approvedBy?: string;
    approvedAt?: string;
    rejectedAt?: string;
    rejectionDetails?: string;
  };
}

export interface UpdateVerificationStepDto {
  step: number;
  data?: Record<string, any>;
}

