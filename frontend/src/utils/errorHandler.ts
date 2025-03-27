// src/utils/errorHandler.ts
import axios, { AxiosError } from 'axios';

/**
 * Error details interface
 */
export interface ErrorDetails {
  message: string;
  code?: string;
  status?: number;
  stack?: string;
  timestamp?: string;
}

/**
 * Format an error into a standardized error details object
 * @param error - The error to format
 * @returns Standardized error details
 */
export const formatError = (error: unknown): ErrorDetails => {
  // Current timestamp
  const timestamp = new Date().toISOString();
  
  // Handle axios errors
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    
    // Get response data if available
    const responseData = axiosError.response?.data as any;
    
    return {
      message: responseData?.detail || responseData?.message || axiosError.message || 'An API error occurred',
      code: responseData?.code || 'API_ERROR',
      status: axiosError.response?.status,
      timestamp
    };
  }
  
  // Handle standard JS errors
  if (error instanceof Error) {
    return {
      message: error.message,
      code: error.name,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      timestamp
    };
  }
  
  // Handle string errors
  if (typeof error === 'string') {
    return {
      message: error,
      code: 'UNKNOWN_ERROR',
      timestamp
    };
  }
  
  // Handle everything else
  return {
    message: 'An unknown error occurred',
    code: 'UNKNOWN_ERROR',
    timestamp
  };
};

/**
 * Format API error message for user display
 * @param error - The error to format
 * @returns User-friendly error message
 */
export const getUserErrorMessage = (error: unknown): string => {
  const errorDetails = formatError(error);
  
  // Handle common HTTP status codes
  if (errorDetails.status) {
    switch (errorDetails.status) {
      case 400:
        return 'The request was invalid. Please check your input and try again.';
      case 401:
        return 'You need to log in to perform this action.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'The requested resource could not be found.';
      case 409:
        return 'There was a conflict with the current state of the resource.';
      case 422:
        return 'The data provided is invalid. Please check your input and try again.';
      case 429:
        return 'Too many requests. Please try again later.';
      case 500:
      case 502:
      case 503:
      case 504:
        return 'A server error occurred. Please try again later.';
    }
  }
  
  // Return the original message if no special handling
  return errorDetails.message;
};

/**
 * Log error details
 * @param error - The error to log
 * @param context - Additional context information
 */
export const logError = (error: unknown, context?: Record<string, any>): void => {
  const errorDetails = formatError(error);
  
  // Add context information
  const logData = {
    ...errorDetails,
    ...(context && { context })
  };
  
  // Log to console
  console.error('Error:', logData);
  
  // In a real app, you might send this to an error logging service
  // Example: errorLoggingService.captureException(error, { extra: logData });
};

/**
 * Error handler for async functions
 * @param fn - Async function to wrap with error handling
 * @returns Wrapped function with error handling
 */
export const withErrorHandling = <T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  onError?: (error: unknown) => void
) => {
  return async (...args: T): Promise<R | null> => {
    try {
      return await fn(...args);
    } catch (error) {
      // Log the error
      logError(error, { functionName: fn.name, arguments: args });
      
      // Call the error callback if provided
      if (onError) {
        onError(error);
      }
      
      return null;
    }
  };
};