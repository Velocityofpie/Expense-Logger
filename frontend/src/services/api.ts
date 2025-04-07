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
    // Use environment variable or default for API URL
    this.baseURL = process.env.REACT_APP_API_URL || "http://localhost:8000";
    
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
      // Set longer timeout for file uploads
      timeout: 30000
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
          removeToken();
          // Redirect to login page if needed
          // window.location.href = '/login';
          console.warn('Session expired or unauthorized access');
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
const apiClient = new ApiClient();

// Specialized API functions for the dashboard

/**
 * Fetch invoices from the API
 * @param skip Number of records to skip
 * @param limit Maximum number of records to return
 * @param userId Optional user ID filter
 * @returns Promise with invoices data
 */
export const fetchInvoices = async (skip = 0, limit = 100, userId: string | null = null) => {
  try {
    let url = `/invoices/?skip=${skip}&limit=${limit}`;
    if (userId) {
      url += `&user_id=${userId}`;
    }
    return await apiClient.get(url);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return [];
  }
};

/**
 * Fetch categories from the API
 * @returns Promise with categories data
 */
export const fetchCategories = async () => {
  try {
    return await apiClient.get('/categories/');
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};

/**
 * Fetch tags from the API
 * @returns Promise with tags data
 */
export const fetchTags = async () => {
  try {
    return await apiClient.get('/tags/');
  } catch (error) {
    console.error('Error fetching tags:', error);
    return [];
  }
};

/**
 * Upload invoice file
 * @param file File to upload
 * @param category Optional category
 * @param tags Optional tags array
 * @returns Promise with upload result
 */
export const uploadInvoice = async (file: File, category?: string, tags?: string[]) => {
  const formData = new FormData();
  formData.append('file', file);
  
  if (category) {
    formData.append('category', category);
  }
  
  if (tags && tags.length > 0) {
    tags.forEach(tag => {
      formData.append('tags', tag);
    });
  }
  
  return apiClient.uploadFile('/upload/', formData);
};

/**
 * Get invoice details
 * @param invoiceId Invoice ID
 * @returns Promise with invoice details
 */
export const getInvoiceDetails = async (invoiceId: number) => {
  try {
    return await apiClient.get(`/invoice/${invoiceId}`);
  } catch (error) {
    console.error(`Error fetching invoice ${invoiceId}:`, error);
    throw error;
  }
};

/**
 * Update an invoice
 * @param invoiceId Invoice ID
 * @param data Invoice data to update
 * @returns Promise with update result
 */
export const updateInvoice = async (invoiceId: number, data: any) => {
  try {
    return await apiClient.put(`/update/${invoiceId}`, data);
  } catch (error) {
    console.error(`Error updating invoice ${invoiceId}:`, error);
    throw error;
  }
};

/**
 * Delete an invoice
 * @param invoiceId Invoice ID
 * @returns Promise with delete result
 */
export const deleteInvoice = async (invoiceId: number) => {
  try {
    return await apiClient.delete(`/delete/${invoiceId}`);
  } catch (error) {
    console.error(`Error deleting invoice ${invoiceId}:`, error);
    throw error;
  }
};

export { apiClient };
export default apiClient;