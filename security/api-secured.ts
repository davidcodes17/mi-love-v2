import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { toast } from "@/components/lib/toast-manager";

// Configure the base URL for your API
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://3v3gcz8b-9999.uks1.devtunnels.ms'

// Extend AxiosRequestConfig to include skipToast option
declare module 'axios' {
  export interface AxiosRequestConfig {
    skipToast?: boolean; // Skip showing toast for this request
    skipSuccessToast?: boolean; // Skip success toast only
    skipErrorToast?: boolean; // Skip error toast only
  }
}

// Create a configured axios instance
const apiSecured = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

// Helper function to extract message from response
const getMessage = (data: any): string | null => {
  if (!data) return null;
  
  // Try different common message fields
  if (typeof data.message === 'string' && data.message.trim()) {
    return data.message.trim();
  }
  if (typeof data.error === 'string' && data.error.trim()) {
    return data.error.trim();
  }
  if (Array.isArray(data.message) && data.message.length > 0) {
    return data.message.map((msg: any) => typeof msg === 'string' ? msg : String(msg)).join('. ');
  }
  if (Array.isArray(data.error) && data.error.length > 0) {
    return data.error.map((err: any) => typeof err === 'string' ? err : String(err)).join('. ');
  }
  
  // Check for nested error messages
  if (data.errors && Array.isArray(data.errors)) {
    const errorMessages = data.errors
      .map((err: any) => {
        if (typeof err === 'string') return err;
        if (err?.message) return err.message;
        return null;
      })
      .filter((msg: string | null) => msg);
    if (errorMessages.length > 0) {
      return errorMessages.join('. ');
    }
  }
  
  return null;
}

// Helper function to determine if response is successful
const isSuccessResponse = (data: any): boolean => {
  if (!data) return false;
  
  // Check for error indicators
  if (data.error) return false;
  if (data.status === 'error') return false;
  
  // Check for success indicators
  if (data.status === 'success') return true;
  if (data.id) return true; // If response has an ID, it's likely successful
  if (data.data) return true; // If response has data, it's likely successful
  
  return true; // Default to success if no clear error indicators
}

// Request interceptor to add auth token
apiSecured.interceptors.request.use(
  async (config) => {
    // You can add authentication token here
    const token = await AsyncStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Helper function to check if error should be shown to user
const shouldShowErrorToast = (status: number, method?: string): boolean => {
  // Don't show internal server errors to users
  const serverErrors = [500, 502, 503, 504];
  if (serverErrors.includes(status)) {
    return false;
  }
  
  // Only show errors for user-initiated actions (POST, PUT, PATCH, DELETE)
  // Skip showing errors for GET requests unless it's critical (401, 403)
  if (method === 'GET' && ![401, 403].includes(status)) {
    return false;
  }
  
  // Show all other user-actionable errors
  return true;
}

// Response interceptor for success and error handling with toast
apiSecured.interceptors.response.use(
  (response: AxiosResponse) => {
    const config = response.config;
    const method = config.method?.toUpperCase();
    const data = response.data;
    
    // Skip toast if explicitly requested
    if (config.skipToast || config.skipSuccessToast) {
      return response;
    }
    
    // Only show success toasts for user-initiated actions (POST, PUT, PATCH, DELETE)
    // and only if there's a meaningful message from the API
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method || '')) {
      const message = getMessage(data);
      
      // Only show success toast if API provides a specific message
      // Don't show generic success messages - let components handle that
      if (message && isSuccessResponse(data)) {
        const formattedMessage = message.charAt(0).toUpperCase() + message.slice(1);
        toast.show({
          type: 'success',
          title: formattedMessage,
          position: 'top',
          visibilityTime: 3000,
        });
      }
      // Removed generic success messages - components should handle these
    }
    // GET requests never show success toasts automatically
    
    return response;
  },
  (error: AxiosError) => {
    const config = error.config;
    const method = config?.method?.toUpperCase();
    
    // Skip error toast if explicitly requested
    if (config?.skipToast || config?.skipErrorToast) {
      return Promise.reject(error);
    }
    
    // Handle different error scenarios
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const data = error.response.data as any;
      
      // Log server errors but don't show to users
      if ([500, 502, 503, 504].includes(status)) {
        console.error(`Server error ${status}:`, {
          url: config?.url,
          method: method,
          data: data,
        });
        return Promise.reject(error);
      }
      
      // Only show user-actionable errors
      if (shouldShowErrorToast(status, method)) {
        const apiMessage = getMessage(data);
        const message = apiMessage || getErrorMessage(status, method);
        
        toast.show({
          type: 'error',
          title: message,
          position: 'top',
          visibilityTime: 4000,
        });
      }
      
      // Handle unauthorized access - token expired or invalid
      if (status === 401) {
        console.log('Unauthorized access - token expired or invalid');
        // Clear token and user data
        AsyncStorage.removeItem('token').catch(err => 
          console.error('Failed to clear token:', err)
        );
        // Note: User store clearing should be handled by the component that receives the error
        // This prevents navigation issues from the interceptor
      }
    } else if (error.request) {
      // Request was made but no response received
      // Only show network errors for user-initiated actions
      if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method || '')) {
        toast.error('Unable to connect to the server. Please check your internet connection and try again.');
      } else {
        // For GET requests, just log the network error
        console.warn('Network error for GET request:', config?.url);
      }
    } else {
      // Something else happened - only show for user actions
      if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method || '')) {
        toast.error('We encountered an unexpected issue. Please try again in a moment.');
      }
    }
    
    return Promise.reject(error);
  }
)

// Helper function to get user-friendly error messages
// Only for user-actionable errors (server errors are not shown)
const getErrorMessage = (status: number, method?: string): string => {
  const errorMessages: Record<number, string> = {
    400: 'The information you provided is invalid. Please review your input and try again.',
    401: 'Your session has expired. Please sign in again to continue.',
    403: 'You don\'t have permission to perform this action. Please contact support if you believe this is an error.',
    404: 'The requested information could not be found. It may have been removed or does not exist.',
    409: 'This action cannot be completed due to a conflict. Please refresh and try again.',
    422: 'Please check the information you entered and ensure all required fields are completed correctly.',
    429: 'Too many requests have been made. Please wait a moment before trying again.',
  };
  
  // Provide context-specific messages based on HTTP method
  if (!errorMessages[status]) {
    if (method === 'GET') {
      return 'Unable to retrieve the requested information. Please try again.';
    } else if (method === 'POST') {
      return 'Unable to complete your request. Please check your information and try again.';
    } else if (method === 'PUT' || method === 'PATCH') {
      return 'Unable to save your changes. Please verify your information and try again.';
    } else if (method === 'DELETE') {
      return 'Unable to remove this item. Please try again.';
    }
    return 'We encountered an issue processing your request. Please try again.';
  }
  
  return errorMessages[status];
}

export default apiSecured
