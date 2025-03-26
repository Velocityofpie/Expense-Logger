// src/services/index.ts
/**
 * Barrel exports for services
 * Provides centralized exports for all service-related modules
 */

// Export services
export { default as apiClient } from './api';
export { default as storageService } from './storage';

// Re-export individual functions from storage
export {
  setStorageItem,
  getStorageItem,
  removeStorageItem,
  clearStorage,
  setToken,
  getToken,
  removeToken,
  setUserData,
  getUserData,
  removeUserData,
  setThemePreference,
  getThemePreference,
  setPreferences,
  getPreferences,
  updatePreferences,
  isSessionValid
} from './storage';

// Export all types
export * from './types';

// Utility function to create API URLs with query parameters
export const createApiUrl = (
  endpoint: string, 
  params?: Record<string, string | number | boolean | undefined>
): string => {
  if (!params) return endpoint;
  
  const url = new URL(endpoint, window.location.origin);
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      url.searchParams.append(key, String(value));
    }
  });
  
  return url.pathname + url.search;
};

// Utility to handle API errors in a consistent way
export const handleApiError = (error: any): string => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // outside of the 2xx range
    const data = error.response.data;
    
    if (data.message) {
      return data.message;
    } else if (data.errors && data.errors.length > 0) {
      return data.errors.map((err: any) => err.message).join(', ');
    } else {
      return `Error ${error.response.status}: ${error.response.statusText}`;
    }
  } else if (error.request) {
    // The request was made but no response was received
    return 'No response received from server. Please check your connection.';
  } else {
    // Something happened in setting up the request
    return error.message || 'An unexpected error occurred';
  }
};

// Create a formatted error object from API error
export const createErrorObject = (error: any): { message: string; status?: number } => {
  const errorObject = { 
    message: handleApiError(error),
    status: error.response?.status 
  };
  
  return errorObject;
};