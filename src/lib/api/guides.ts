import { apiClient } from './client';
import type { ApiResponse } from './client';
import type {
  Guide,
  SearchGuidesData,
  VerificationStepsConfig,
  UpdateVerificationStepDto,
} from '@/types';

/**
 * Guides API Service
 * Handles guide-related operations and verification
 */
export class GuidesService {
  /**
   * Search guides
   */
  async searchGuides(searchData: SearchGuidesData): Promise<ApiResponse<Guide[]>> {
    const queryString = apiClient.buildQueryString(searchData);
    return apiClient.get<Guide[]>(`/guides?${queryString}`, { skipAuth: true });
  }

  /**
   * Get verification steps configuration
   */
  async getVerificationStepsConfig(): Promise<ApiResponse<VerificationStepsConfig>> {
    return apiClient.get<VerificationStepsConfig>(
      '/guides/verification-steps-config',
      { skipAuth: true }
    );
  }

  /**
   * Update verification step
   */
  async updateVerificationStep(
    guiderId: string,
    data: UpdateVerificationStepDto
  ): Promise<ApiResponse> {
    return apiClient.patch(`/guides/${guiderId}/verification-step`, data, { showToast: true });
  }
}

export const guidesService = new GuidesService();

