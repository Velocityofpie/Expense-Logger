// src/services/api.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { getToken, removeToken } from './storage';

/**
 * Core API client configuration
 * Handles API requests with authentication and error handling
 */
class ApiClient {
  private client: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
    
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to attach auth token to requests
    this.client.interceptors.request.use(
      (config) => {
        const token = getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        // Handle 401 Unauthorized errors (expired or invalid token)
        if (error.response && error.response.status === 401) {
          removeToken(); // Clear the invalid token
          // Redirect to login page if needed
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Make a GET request
   * @param url API endpoint URL
   * @param config Additional Axios config
   * @returns Promise with response data
   */
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.client.get<T>(url, config);
      return response.data;
    } catch (error) {
      console.error('API GET error:', error);
      throw error;
    }
  }

  /**
   * Make a POST request
   * @param url API endpoint URL
   * @param data Request payload
   * @param config Additional Axios config
   * @returns Promise with response data
   */
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.client.post<T>(url, data, config);
      return response.data;
    } catch (error) {
      console.error('API POST error:', error);
      throw error;
    }
  }

  /**
   * Make a PUT request
   * @param url API endpoint URL
   * @param data Request payload
   * @param config Additional Axios config
   * @returns Promise with response data
   */
  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.client.put<T>(url, data, config);
      return response.data;
    } catch (error) {
      console.error('API PUT error:', error);
      throw error;
    }
  }

  /**
   * Make a PATCH request
   * @param url API endpoint URL
   * @param data Request payload
   * @param config Additional Axios config
   * @returns Promise with response data
   */
  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.client.patch<T>(url, data, config);
      return response.data;
    } catch (error) {
      console.error('API PATCH error:', error);
      throw error;
    }
  }

  /**
   * Make a DELETE request
   * @param url API endpoint URL
   * @param config Additional Axios config
   * @returns Promise with response data
   */
  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.client.delete<T>(url, config);
      return response.data;
    } catch (error) {
      console.error('API DELETE error:', error);
      throw error;
    }
  }

  /**
   * Upload a file using multipart/form-data
   * @param url API endpoint URL
   * @param formData FormData object with file and other data
   * @param config Additional Axios config
   * @returns Promise with response data
   */
  async uploadFile<T = any>(url: string, formData: FormData, config?: AxiosRequestConfig): Promise<T> {
    try {
      const uploadConfig: AxiosRequestConfig = {
        ...config,
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(config?.headers || {})
        }
      };
      
      const response: AxiosResponse<T> = await this.client.post<T>(url, formData, uploadConfig);
      return response.data;
    } catch (error) {
      console.error('API upload error:', error);
      throw error;
    }
  }

  /**
   * Get the full URL for a given endpoint
   * @param endpoint API endpoint path
   * @returns Full URL including base URL
   */
  getFullUrl(endpoint: string): string {
    return `${this.baseURL}${endpoint}`;
  }
}

// Create API client instance
export const apiClient = new ApiClient();

// Export the fetchInvoices function for dashboard
export const fetchInvoices = async (skip = 0, limit = 100, userId = null) => {
  let url = `/invoices/?skip=${skip}&limit=${limit}`;
  if (userId) {
    url += `&user_id=${userId}`;
  }
  return apiClient.get(url);
};

// Export the fetchCategories function
export const fetchCategories = async () => {
  return apiClient.get('/categories/');
};

// Export the fetchTags function
export const fetchTags = async () => {
  return apiClient.get('/tags/');
};

// Export default api client
export default apiClient;