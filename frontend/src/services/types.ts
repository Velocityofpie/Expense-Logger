// src/services/types.ts
/**
 * Service type definitions
 * Contains types shared among the service layer
 */

// API Response types
export interface ApiResponse<T = any> {
    data?: T;
    message?: string;
    success: boolean;
    status?: number;
    errors?: ErrorDetail[];
  }
  
  export interface ErrorDetail {
    field?: string;
    message: string;
    code?: string;
  }
  
  export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    pages: number;
    has_next: boolean;
    has_prev: boolean;
  }
  
  // API Error types
  export interface ApiError {
    status?: number;
    message: string;
    errors?: ErrorDetail[];
    code?: string;
  }
  
  // Auth types
  export interface AuthToken {
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token?: string;
  }
  
  export interface UserCredentials {
    email: string;
    password: string;
  }
  
  export interface RegistrationData extends UserCredentials {
    name: string;
    confirm_password: string;
  }
  
  export interface ForgotPasswordRequest {
    email: string;
  }
  
  export interface ResetPasswordRequest {
    token: string;
    new_password: string;
    confirm_password: string;
  }
  
  // User types
  export interface UserProfile {
    id: number;
    email: string;
    name: string;
    avatar_url?: string;
    role: string;
    created_at: string;
    updated_at: string;
    preferences?: UserPreferences;
  }
  
  export interface UserPreferences {
    notifications_enabled?: boolean;
    default_view?: string;
    theme?: 'light' | 'dark' | 'system';
    email_notifications?: boolean;
    language?: string;
    [key: string]: any; // Allow for additional preferences
  }
  
  // Request/Response parameter types
  export interface QueryParams {
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
    search?: string;
    [key: string]: any; // Allow for additional query parameters
  }
  
  // Config types
  export interface AppConfig {
    apiUrl: string;
    appName: string;
    version: string;
    environment: 'development' | 'staging' | 'production';
    features: {
      darkMode: boolean;
      analytics: boolean;
      fileUpload: boolean;
      [key: string]: boolean;
    };
  }
  
  // Storage service types
  export interface StorageItem<T> {
    value: T;
    expiry: number | null;
  }
  
  // Auth provider types
  export interface AuthContextType {
    isAuthenticated: boolean;
    user: UserProfile | null;
    loading: boolean;
    login: (credentials: UserCredentials) => Promise<void>;
    logout: () => void;
    register: (data: RegistrationData) => Promise<void>;
    forgotPassword: (email: string) => Promise<void>;
    resetPassword: (data: ResetPasswordRequest) => Promise<void>;
    updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  }
  
  // API Client types
  export interface ApiClientOptions {
    baseURL: string;
    timeout?: number;
    headers?: Record<string, string>;
  }
  
  // Notification types
  export enum NotificationType {
    SUCCESS = 'success',
    ERROR = 'error',
    WARNING = 'warning',
    INFO = 'info'
  }
  
  export interface Notification {
    id: string;
    type: NotificationType;
    message: string;
    title?: string;
    duration?: number;
    dismissible?: boolean;
  }
  
  // Event service types
  export interface EventPayload {
    [key: string]: any;
  }
  
  export type EventListener<T = EventPayload> = (payload: T) => void;
  
  export interface EventSubscription {
    unsubscribe: () => void;
  }
  
  // Utility Service types
  export interface FileUploadProgress {
    loaded: number;
    total: number;
    percentage: number;
  }
  
  export interface FileUploadOptions {
    onProgress?: (progress: FileUploadProgress) => void;
    headers?: Record<string, string>;
    data?: Record<string, any>;
  }