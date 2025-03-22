import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { APIError } from '../../types/api.types';

// Define the base URL from environment variables
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Create a custom axios instance with default configurations
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor - modify requests before they are sent
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    // Get the token from localStorage if it exists
    const token = localStorage.getItem('token');
    
    // If token exists, add it to the headers
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error: AxiosError): Promise<AxiosError> => {
    // Handle request errors
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - process responses before they are handled
axiosInstance.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    // Handle successful responses
    return response;
  },
  (error: AxiosError): Promise<AxiosError> => {
    // Handle response errors
    const errorResponse = error.response?.data as APIError;
    
    // Handle authentication errors
    if (error.response?.status === 401) {
      // Clear token and redirect to login page if not already there
      localStorage.removeItem('token');
      
      // Check if the current page is not the login page
      if (!window.location.pathname.includes('/login')) {
        // Redirect to login page
        window.location.href = '/login';
      }
    }
    
    // Create a more informative error message
    const enhancedError: APIError = {
      detail: errorResponse?.detail || error.message,
      status: error.response?.status,
      path: error.config?.url,
    };
    
    // Attach the enhanced error to the original error
    error.response = {
      ...error.response,
      data: enhancedError,
    } as AxiosResponse;
    
    return Promise.reject(error);
  }
);

// Generic GET request with type parameter for response data
export const get = async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  try {
    const response = await axiosInstance.get<T>(url, config);
    return response.data;
  } catch (error) {
    throw handleError(error as AxiosError);
  }
};

// Generic POST request with type parameters for request and response data
export const post = async <T, D = any>(
  url: string, 
  data?: D, 
  config?: AxiosRequestConfig
): Promise<T> => {
  try {
    const response = await axiosInstance.post<T>(url, data, config);
    return response.data;
  } catch (error) {
    throw handleError(error as AxiosError);
  }
};

// Generic PUT request with type parameters for request and response data
export const put = async <T, D = any>(
  url: string, 
  data?: D, 
  config?: AxiosRequestConfig
): Promise<T> => {
  try {
    const response = await axiosInstance.put<T>(url, data, config);
    return response.data;
  } catch (error) {
    throw handleError(error as AxiosError);
  }
};

// Generic PATCH request with type parameters for request and response data
export const patch = async <T, D = any>(
  url: string, 
  data?: D, 
  config?: AxiosRequestConfig
): Promise<T> => {
  try {
    const response = await axiosInstance.patch<T>(url, data, config);
    return response.data;
  } catch (error) {
    throw handleError(error as AxiosError);
  }
};

// Generic DELETE request with type parameter for response data
export const del = async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  try {
    const response = await axiosInstance.delete<T>(url, config);
    return response.data;
  } catch (error) {
    throw handleError(error as AxiosError);
  }
};

// Helper function to handle errors
const handleError = (error: AxiosError): Error => {
  const errorResponse = error.response?.data as APIError;
  
  // Create a more user-friendly error message
  const errorMessage = errorResponse?.detail || error.message || 'An unexpected error occurred';
  
  // Create a custom error with the error message
  const customError = new Error(errorMessage);
  
  // Attach the original error and response for debugging
  (customError as any).originalError = error;
  (customError as any).response = error.response;
  
  return customError;
};

// Export the axios instance and utility functions
export default {
  axiosInstance,
  get,
  post,
  put,
  patch,
  delete: del,
};