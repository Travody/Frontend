import { ApiClient } from './api-client';
import { Notification, NotificationResponse, UnreadCountResponse } from '@/types/notification';

export class NotificationService extends ApiClient {
  /**
   * Get notifications for the current user
   */
  async getNotifications(params?: {
    unreadOnly?: boolean;
    page?: number;
    limit?: number;
  }): Promise<NotificationResponse> {
    const queryParams = new URLSearchParams();
    if (params?.unreadOnly) queryParams.append('unreadOnly', 'true');
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await this.request<NotificationResponse>(
      `/notifications${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch notifications');
    }

    return response.data;
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(): Promise<number> {
    const response = await this.request<UnreadCountResponse>(
      '/notifications/unread-count'
    );

    if (!response.success || !response.data) {
      return 0;
    }

    return response.data.count;
  }

  /**
   * Get a single notification by ID
   */
  async getNotificationById(id: string): Promise<Notification> {
    const response = await this.request<Notification>(`/notifications/${id}`);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch notification');
    }

    return response.data;
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(id: string): Promise<void> {
    const response = await this.request(`/notifications/${id}/read`, {
      method: 'PUT',
    });

    if (!response.success) {
      throw new Error(response.message || 'Failed to mark notification as read');
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<void> {
    const response = await this.request('/notifications/mark-all-read', {
      method: 'PUT',
    });

    if (!response.success) {
      throw new Error(response.message || 'Failed to mark all notifications as read');
    }
  }

  /**
   * Mark multiple notifications as read
   */
  async markMultipleAsRead(notificationIds: string[]): Promise<void> {
    const response = await this.request('/notifications/mark-multiple-read', {
      method: 'PUT',
      body: JSON.stringify({ notificationIds }),
    });

    if (!response.success) {
      throw new Error(response.message || 'Failed to mark notifications as read');
    }
  }

  /**
   * Delete a notification
   */
  async deleteNotification(id: string): Promise<void> {
    const response = await this.request(`/notifications/${id}`, {
      method: 'DELETE',
    });

    if (!response.success) {
      throw new Error(response.message || 'Failed to delete notification');
    }
  }

  /**
   * Delete all read notifications
   */
  async deleteAllRead(): Promise<void> {
    const response = await this.request('/notifications/read/all', {
      method: 'DELETE',
    });

    if (!response.success) {
      throw new Error(response.message || 'Failed to delete read notifications');
    }
  }
}

export const notificationService = new NotificationService();

