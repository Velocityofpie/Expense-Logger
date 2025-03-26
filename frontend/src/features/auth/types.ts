// src/features/auth/types.ts

// User information interface
export interface User {
    user_id: number;
    username: string;
    email: string;
    first_name?: string;
    last_name?: string;
    role?: string;
    created_at: string;
    last_login?: string;
    is_active: boolean;
  }
  
  // Auth state interface
  export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
  }
  
  // Login request payload
  export interface LoginRequest {
    email: string;
    password: string;
  }
  
  // Login response payload
  export interface LoginResponse {
    access_token: string;
    token_type: string;
    user: User;
  }
  
  // Password reset request payload
  export interface PasswordResetRequest {
    email: string;
  }
  
  // Reset password payload
  export interface ResetPasswordPayload {
    token: string;
    new_password: string;
  }
  
  // User profile update payload
  export interface ProfileUpdateRequest {
    email?: string;
    first_name?: string;
    last_name?: string;
    new_password?: string;
  }