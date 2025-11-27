/**
 * API Toast Utilities
 * 
 * This file provides utilities and documentation for the automatic toast notification system
 * that's integrated into the API interceptor.
 * 
 * The API interceptor automatically shows toast notifications for:
 * - Success responses (POST, PUT, PATCH, DELETE)
 * - Error responses (all HTTP methods)
 * 
 * You can opt-out of toasts for specific requests using the config options below.
 */

import { AxiosRequestConfig } from 'axios';

/**
 * Example: Skip all toasts for a specific request
 * 
 * const response = await apiSecured.get('/endpoint', {
 *   skipToast: true
 * });
 */
export const skipAllToasts = (config: AxiosRequestConfig = {}): AxiosRequestConfig => ({
  ...config,
  skipToast: true,
});

/**
 * Example: Skip only success toast
 * 
 * const response = await apiSecured.post('/endpoint', data, {
 *   skipSuccessToast: true
 * });
 */
export const skipSuccessToast = (config: AxiosRequestConfig = {}): AxiosRequestConfig => ({
  ...config,
  skipSuccessToast: true,
});

/**
 * Example: Skip only error toast
 * 
 * const response = await apiSecured.get('/endpoint', {
 *   skipErrorToast: true
 * });
 */
export const skipErrorToast = (config: AxiosRequestConfig = {}): AxiosRequestConfig => ({
  ...config,
  skipErrorToast: true,
});

/**
 * Usage Examples:
 * 
 * 1. Normal request (toasts will show automatically):
 *    const response = await apiSecured.post('/friends', { friendId: '123' });
 * 
 * 2. Skip all toasts:
 *    const response = await apiSecured.get('/profile/me', { skipToast: true });
 * 
 * 3. Skip only success toast (errors will still show):
 *    const response = await apiSecured.post('/upload', formData, { skipSuccessToast: true });
 * 
 * 4. Skip only error toast (success will still show):
 *    const response = await apiSecured.get('/data', { skipErrorToast: true });
 */

