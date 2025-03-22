// src/services/api/client.ts
import { ApiResponse, ApiErrorResponse } from '../../types/common.types';

/**
 * Interface for request options
 */
interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
  withCredentials?: boolean;
}

/**
 * Interface for request headers
 */
interface RequestHeaders {
  [key: string]: string;
}

/**
 * Class providing a typed API client for making HTTP requests
 */
class ApiClient {
  private baseUrl: string;
  private defaultHeaders: RequestHeaders;
  
  /**
   * Create a new API client
   * @param baseUrl Base URL for API requests
   */
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }
  
  /**
   * Set default headers for all requests
   * @param headers Headers to set
   */
  public setDefaultHeaders(headers: RequestHeaders): void {
    this.defaultHeaders = {
      ...this.defaultHeaders,
      ...headers,
    };
  }
  
  /**
   * Set authentication token for all requests
   * @param token Authentication token
   */
  public setAuthToken(token: string): void {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`;
  }
  
  /**
   * Clear authentication token
   */
  public clearAuthToken(): void {
    delete this.defaultHeaders['Authorization'];
  }
  
  /**
   * Create URL with query parameters
   * @param url Base URL
   * @param params Query parameters
   * @returns Full URL with query parameters
   */
  private createUrl(url: string, params?: Record<string, string | number | boolean | undefined>): string {
    const fullUrl = url.startsWith('/') ? `${this.baseUrl}${url}` : `${this.baseUrl}/${url}`;
    
    if (!params) {
      return fullUrl;
    }
    
    // Filter out undefined values
    const filteredParams = Object.entries(params)
      .filter(([_, value]) => value !== undefined)
      .reduce((acc, [key, value]) => {
        acc[key] = String(value);
        return acc;
      }, {} as Record<string, string>);
    
    const searchParams = new URLSearchParams(filteredParams);
    return `${fullUrl}?${searchParams.toString()}`;
  }
  
  /**
   * Make a request to the API
   * @param url API endpoint
   * @param options Request options
   * @returns Promise with the response
   */
  private async request<T>(url: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    const { params, withCredentials, ...fetchOptions } = options;
    
    const headers = {
      ...this.defaultHeaders,
      ...options.headers,
    };
    
    const fetchUrl = this.createUrl(url, params);
    
    try {
      const response = await fetch(fetchUrl, {
        ...fetchOptions,
        headers,
        credentials: withCredentials ? 'include' : 'same-origin',
      });
      
      const contentType = response.headers.get('Content-Type') || '';
      let data;
      
      if (contentType.includes('application/json')) {
        data = await response.json();
      } else if (contentType.includes('text/')) {
        data = await response.text();
      } else {
        data = await response.blob();
      }
      
      if (!response.ok) {
        const errorData = data as ApiErrorResponse;
        throw {
          status: response.status,
          message: errorData.message || response.statusText,
          errors: errorData.errors,
        };
      }
      
      return {
        data: data as T,
        status: response.status,
        message: 'Success',
        success: true,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw {
          status: 0,
          message: error.message,
          success: false,
        };
      }
      
      throw error;
    }
  }
  
  /**
   * Make a GET request
   * @param url API endpoint
   * @param options Request options
   * @returns Promise with the response
   */
  public async get<T>(url: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      ...options,
      method: 'GET',
    });
  }
  
  /**
   * Make a POST request
   * @param url API endpoint
   * @param data Request body
   * @param options Request options
   * @returns Promise with the response
   */
  public async post<T>(url: string, data?: any, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }
  
  /**
   * Make a PUT request
   * @param url API endpoint
   * @param data Request body
   * @param options Request options
   * @returns Promise with the response
   */
  public async put<T>(url: string, data?: any, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }
  
  /**
   * Make a PATCH request
   * @param url API endpoint
   * @param data Request body
   * @param options Request options
   * @returns Promise with the response
   */
  public async patch<T>(url: string, data?: any, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }
  
  /**
   * Make a DELETE request
   * @param url API endpoint
   * @param options Request options
   * @returns Promise with the response
   */
  public async delete<T>(url: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      ...options,
      method: 'DELETE',
    });
  }
  
  /**
   * Upload a file
   * @param url API endpoint
   * @param formData FormData object with file(s)
   * @param options Request options
   * @returns Promise with the response
   */
  public async upload<T>(url: string, formData: FormData, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    // Remove Content-Type header so the browser can set it with the correct boundary
    const headers = { ...this.defaultHeaders };
    delete headers['Content-Type'];
    
    return this.request<T>(url, {
      ...options,
      method: 'POST',
      headers,
      body: formData,
    });
  }
}

// Create and export a singleton instance
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const apiClient = new ApiClient(API_URL);

export default apiClient;