import { apiClient } from './api-client';
import type { ApiResponse } from './api-client';

/**
 * Upload API Service
 * Handles file uploads to GCS via backend
 */
export class UploadService {
  /**
   * Upload profile picture
   * @param file - File to upload
   * @param userId - User ID
   * @returns Promise with image URL
   */
  async uploadProfilePicture(
    file: File,
    userId: string
  ): Promise<ApiResponse<{ imageUrl: string }>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId);

    return apiClient.post<{ imageUrl: string }>(
      '/upload/profile-picture',
      formData,
      { showToast: false }
    );
  }

  /**
   * Upload guide images (multiple files)
   * @param files - Array of files to upload
   * @param guideId - Guide ID
   * @returns Promise with array of image URLs
   */
  async uploadGuideImages(
    files: File[],
    guideId: string
  ): Promise<ApiResponse<{ imageUrls: string[] }>> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    formData.append('guideId', guideId);

    return apiClient.post<{ imageUrls: string[] }>(
      '/upload/guide-images',
      formData,
      { showToast: true }
    );
  }

  /**
   * Upload a single file (generic upload)
   * @param file - File to upload
   * @param folder - Folder path in storage (optional)
   * @returns Promise with file URL
   */
  async uploadFile(
    file: File,
    folder?: string
  ): Promise<ApiResponse<{ url: string }>> {
    const formData = new FormData();
    formData.append('file', file);
    if (folder) {
      formData.append('folder', folder);
    }

    return apiClient.post<{ url: string }>(
      '/upload/file',
      formData,
      { showToast: false }
    );
  }
}

export const uploadService = new UploadService();
