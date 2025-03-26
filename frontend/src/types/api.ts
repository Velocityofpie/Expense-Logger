/**
 * API-related type definitions
 */

/**
 * Standard API response structure
 */
export interface ApiResponse<T = any> {
    data?: T;
    error?: string | ApiError;
    message?: string;
    status?: 'success' | 'error' | 'warning';
    meta?: ApiMetadata;
  }
  
  /**
   * API error details
   */
  export interface ApiError {
    code: string;
    message: string;
    details?: Record<string, any>;
    timestamp?: string;
    path?: string;
  }
  
  /**
   * API metadata for pagination and filtering
   */
  export interface ApiMetadata {
    page?: number;
    pageSize?: number;
    total?: number;
    totalPages?: number;
    filters?: Record<string, any>;
    sort?: {
      field: string;
      direction: 'asc' | 'desc';
    };
  }
  
  /**
   * Common request options for API calls
   */
  export interface RequestOptions {
    headers?: Record<string, string>;
    params?: Record<string, any>;
    timeout?: number;
    signal?: AbortSignal;
    cache?: RequestCache;
  }
  
  /**
   * Pagination parameters for list endpoints
   */
  export interface PaginationParams {
    page?: number;
    pageSize?: number;
    skip?: number;
    limit?: number;
  }
  
  /**
   * Sorting parameters for list endpoints
   */
  export interface SortParams {
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
  }
  
  /**
   * Filter parameters for list endpoints
   */
  export interface FilterParams {
    search?: string;
    category?: string | string[];
    status?: string | string[];
    dateFrom?: string;
    dateTo?: string;
    tags?: string | string[];
    [key: string]: any;
  }
  
  /**
   * Combined query parameters for API calls
   */
  export type QueryParams = PaginationParams & SortParams & FilterParams;
  
  /**
   * HTTP methods supported by the API
   */
  export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  
  /**
   * API endpoint configuration
   */
  export interface ApiEndpoint {
    path: string;
    method: HttpMethod;
    requiresAuth?: boolean;
    mockResponse?: any;
  }
  
  /**
   * Authentication tokens returned from login/register
   */
  export interface AuthTokens {
    accessToken: string;
    refreshToken?: string;
    expiresIn?: number;
    tokenType?: string;
  }
  
  /**
   * Upload file response
   */
  export interface UploadResponse {
    fileId: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    url: string;
    uploadedAt: string;
  }
  
  /**
   * Batch operation response
   */
  export interface BatchResponse {
    successCount: number;
    failureCount: number;
    errors?: Record<string, string>;
  }
  
  /**
   * WebSocket message type
   */
  export interface WebSocketMessage<T = any> {
    type: string;
    payload: T;
    timestamp: string;
    id: string;
  }