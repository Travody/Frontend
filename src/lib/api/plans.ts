import { apiClient } from './api-client';
import type { ApiResponse } from './api-client';
import type {
  Plan,
  CreatePlanData,
  SearchPlansData,
  GuiderStats,
} from '@/types';

/**
 * Plans API Service
 * Handles all plan/tour-related operations
 */
export class PlansService {
  /**
   * Create a new plan
   */
  async createPlan(data: CreatePlanData): Promise<ApiResponse<Plan>> {
    return apiClient.post<Plan>('/plans', data, { showToast: true });
  }

  /**
   * Get plan by ID
   */
  async getPlanById(planId: string): Promise<ApiResponse<Plan>> {
    return apiClient.get<Plan>(`/plans/${planId}`, { skipAuth: true });
  }

  /**
   * Get guider's plans
   */
  async getGuiderPlans(status?: string): Promise<ApiResponse<Plan[]>> {
    const url = status 
      ? `/plans/guider/my-plans?status=${status}` 
      : '/plans/guider/my-plans';
    return apiClient.get<Plan[]>(url);
  }

  /**
   * Get guider statistics
   */
  async getGuiderStats(): Promise<ApiResponse<GuiderStats>> {
    return apiClient.get<GuiderStats>('/plans/guider/stats');
  }

  /**
   * Update plan
   */
  async updatePlan(planId: string, data: Partial<CreatePlanData>): Promise<ApiResponse<Plan>> {
    return apiClient.patch<Plan>(`/plans/${planId}`, data, { showToast: true });
  }

  /**
   * Update plan step
   */
  async updatePlanStep(planId: string, step: number, data: any): Promise<ApiResponse<Plan>> {
    return apiClient.patch<Plan>(`/plans/${planId}/step`, { step, data }, { showToast: true });
  }

  /**
   * Publish plan
   */
  async publishPlan(planId: string): Promise<ApiResponse<Plan>> {
    return apiClient.patch<Plan>(`/plans/${planId}/publish`, {}, { showToast: true });
  }

  /**
   * Pause plan
   */
  async pausePlan(
    planId: string, 
    pausedTo: string
  ): Promise<ApiResponse<Plan>> {
    return apiClient.patch<Plan>(`/plans/${planId}/pause`, { pausedTo }, { showToast: true });
  }

  /**
   * Archive plan
   */
  async archivePlan(planId: string): Promise<ApiResponse<Plan>> {
    return apiClient.patch<Plan>(`/plans/${planId}/archive`, {}, { showToast: true });
  }

  /**
   * Unarchive plan
   */
  async unarchivePlan(planId: string): Promise<ApiResponse<Plan>> {
    return apiClient.patch<Plan>(`/plans/${planId}/unarchive`, {}, { showToast: true });
  }

  /**
   * Delete plan
   */
  async deletePlan(planId: string): Promise<ApiResponse> {
    return apiClient.delete(`/plans/${planId}`, { showToast: true });
  }

  /**
   * Search plans
   */
  async searchPlans(
    searchData: SearchPlansData
  ): Promise<ApiResponse<{ plans: Plan[]; total: number; page: number; limit: number }>> {
    const queryString = apiClient.buildQueryString(searchData);
    return apiClient.get<{ plans: Plan[]; total: number; page: number; limit: number }>(
      `/plans/search?${queryString}`,
      { skipAuth: true }
    );
  }

  /**
   * Update plan availability
   */
  async updatePlanAvailability(
    planId: string,
    availability: Array<{ date: string; availableSlots: number }>
  ): Promise<ApiResponse<Plan>> {
    return apiClient.patch<Plan>(`/plans/${planId}/availability`, availability, { showToast: true });
  }
}

export const plansService = new PlansService();

