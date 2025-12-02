// Toast will be accessed via a global function to avoid React context issues in non-React code
let toastInstance: {
  success: (message: string, duration?: number) => string;
  error: (message: string, duration?: number) => string;
  warning: (message: string, duration?: number) => string;
  info: (message: string, duration?: number) => string;
} | null = null;

export function setToastInstance(instance: typeof toastInstance) {
  toastInstance = instance;
}

// Logout callback will be accessed via a global function to avoid React context issues
let logoutCallback: (() => void) | null = null;

export function setLogoutCallback(callback: (() => void) | null) {
  logoutCallback = callback;
}

// Get API base URL at runtime to ensure env variable is available
export const getApiBaseUrl = () => {
  return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api';
};

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  requiresVerification?: boolean;
  requiresGuiderType?: boolean;
  otpSent?: boolean;
}

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface RequestOptions extends RequestInit {
  showToast?: boolean;
  toastType?: ToastType;
  skipAuth?: boolean;
}

/**
 * Base API Client class that handles all HTTP requests
 * Provides centralized error handling, token management, and response parsing
 */
export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || getApiBaseUrl();
  }

  /**
   * Core request method that handles all HTTP calls
   * @param endpoint - API endpoint (without base URL)
   * @param options - Fetch options with additional custom options
   * @returns Promise with typed API response
   */
  async request<T = any>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      showToast,
      toastType,
      skipAuth = false,
      headers: optionsHeaders,
      method = 'GET',
      ...restOptions
    } = options;

    // Default: Don't show toasts unless explicitly requested
    const shouldShowToast = showToast === true;

    try {
      // Build headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(optionsHeaders as Record<string, string> || {}),
      };

      // Add auth token if not skipped
      if (!skipAuth && typeof window !== 'undefined') {
        const token = this.getToken();
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }

      // Make the request
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...restOptions,
        method,
        headers,
      });

      // Handle 401 Unauthorized before parsing (token expired or invalid)
      if (response.status === 401) {
        // Try to parse error message first
        let errorMessage = 'Session expired. Please login again.';
        try {
          const text = await response.text();
          if (text) {
            const parsed = JSON.parse(text);
            errorMessage = parsed.message || parsed.error || errorMessage;
          }
        } catch {
          // Use default message if parsing fails
        }
        
        // Only trigger logout/redirect if this is an authenticated request (not login/signup)
        // When skipAuth is true, it means it's a login/signup request - don't logout/redirect
        if (!skipAuth) {
          // Get userType before clearing to determine redirect path
          let userType: string | null = null;
          if (typeof window !== 'undefined') {
            userType = localStorage.getItem('userType');
            // Clear auth data from localStorage
            localStorage.removeItem('authToken');
            localStorage.removeItem('userType');
            localStorage.removeItem('userData');
          }
          
          // Call logout callback if registered (from AuthContext)
          if (logoutCallback) {
            logoutCallback();
          } else {
            // Fallback: redirect to respective login page based on userType
            if (typeof window !== 'undefined') {
              if (userType === 'traveler') {
                window.location.href = '/auth/traveler/login';
              } else if (userType === 'guider') {
                window.location.href = '/auth/guider/login';
              } else {
                window.location.href = '/';
              }
            }
          }
        }
        
        // Show error toast (for both authenticated and unauthenticated 401 errors)
        this.showToast('error', errorMessage);
        
        return {
          success: false,
          message: errorMessage,
          error: 'Unauthorized',
        };
      }

      // Parse response
      let data: any;
      try {
        const text = await response.text();
        data = text ? JSON.parse(text) : {};
      } catch (parseError) {
        const errorMessage = response.statusText || 'An error occurred';
        // Always show error toasts
        this.showToast('error', errorMessage);
        return {
          success: false,
          message: errorMessage,
          error: 'JSON Parse Error',
        };
      }

      // Handle error responses
      if (data.success === false || !response.ok) {
        const errorMessage = this.extractErrorMessage(data, response);
        
        // Always show error toasts, regardless of showToast setting
        this.showToast('error', errorMessage);
        
        return {
          success: false,
          message: errorMessage,
          error: data.error || 'Unknown error',
        };
      }

      // Handle success responses
      const successMessage = data.message || 'Success';
      // Only show success toasts when explicitly requested
      if (shouldShowToast) {
        this.showToast(toastType || 'success', successMessage);
      }
      
      // Build response with all properties
      const apiResponse: ApiResponse<T> = {
        success: true,
        message: successMessage,
        data: data.data,
      };
      
      // Preserve special auth response properties
      if ('requiresVerification' in data) {
        apiResponse.requiresVerification = data.requiresVerification;
      }
      if ('requiresGuiderType' in data) {
        apiResponse.requiresGuiderType = data.requiresGuiderType;
      }
      if ('otpSent' in data) {
        apiResponse.otpSent = data.otpSent;
      }
      
      return apiResponse;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error occurred';
      // Always show error toasts for network errors
      this.showToast('error', errorMessage);
      return {
        success: false,
        message: errorMessage,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Show toast notification using custom toast system
   */
  private showToast(type: ToastType, message: string) {
    if (!toastInstance) {
      // Fallback to console if toast instance is not available
      console[type === 'error' ? 'error' : type === 'warning' ? 'warn' : 'log'](message);
      return;
    }

    const duration = type === 'error' ? 5000 : type === 'success' ? 3000 : 4000;

    switch (type) {
      case 'success':
        toastInstance.success(message, duration);
        break;
      case 'error':
        toastInstance.error(message, duration);
        break;
      case 'warning':
        toastInstance.warning(message, duration);
        break;
      case 'info':
        toastInstance.info(message, duration);
        break;
    }
  }

  /**
   * GET request helper
   * By default, GET requests don't show toasts (data fetching)
   */
  async get<T = any>(
    endpoint: string,
    options?: Omit<RequestOptions, 'method' | 'body'>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'GET',
    });
  }

  /**
   * POST request helper
   */
  async post<T = any>(
    endpoint: string,
    data?: any,
    options?: Omit<RequestOptions, 'method' | 'body'>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PATCH request helper
   */
  async patch<T = any>(
    endpoint: string,
    data?: any,
    options?: Omit<RequestOptions, 'method' | 'body'>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request helper
   */
  async put<T = any>(
    endpoint: string,
    data?: any,
    options?: Omit<RequestOptions, 'method' | 'body'>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request helper
   */
  async delete<T = any>(
    endpoint: string,
    options?: Omit<RequestOptions, 'method' | 'body'>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'DELETE',
    });
  }

  /**
   * Build query string from object
   */
  buildQueryString(params: Record<string, any>): string {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          searchParams.append(key, value.join(','));
        } else {
          searchParams.append(key, value.toString());
        }
      }
    });
    return searchParams.toString();
  }

  /**
   * Get auth token from localStorage
   */
  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('authToken');
  }

  /**
   * Extract error message from response data
   */
  private extractErrorMessage(data: any, response: Response): string {
    let errorMessage = data.message || data.error || response.statusText || 'An error occurred';
    
    // Handle array of errors (e.g., validation errors)
    if (!errorMessage || (data.errors && typeof data.errors !== 'string')) {
      if (data.errors) {
        errorMessage = Array.isArray(data.errors) 
          ? data.errors.map((e: any) => e.message || e).join(', ')
          : JSON.stringify(data.errors);
      }
    }
    
    // Ensure we have a valid error message
    if (!errorMessage || errorMessage === 'An error occurred') {
      if (data.message) {
        errorMessage = data.message;
      } else if (typeof data === 'string') {
        errorMessage = data;
      }
    }
    
    return errorMessage;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

