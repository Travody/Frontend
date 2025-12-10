import { apiClient } from './api-client';
import type { ApiResponse } from './api-client';
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
   * Get guide by ID
   */
  async getGuideById(guideId: string): Promise<ApiResponse<Guide>> {
    return apiClient.get<Guide>(`/guides/${guideId}`, { skipAuth: true });
  }

  /**
   * Get verification steps configuration
   * @param guiderType - Optional guider type to get config for specific type
   */
  async getVerificationStepsConfig(guiderType?: 'Professional' | 'Agency'): Promise<ApiResponse<VerificationStepsConfig>> {
    const queryParams = guiderType ? `?guiderType=${guiderType}` : '';
    return apiClient.get<VerificationStepsConfig>(
      `/guides/verification-steps-config${queryParams}`,
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

