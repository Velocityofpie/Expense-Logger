// src/features/auth/authApi.ts
import { 
    LoginRequest, 
    LoginResponse, 
    PasswordResetRequest, 
    ResetPasswordPayload, 
    ProfileUpdateRequest,
    User 
  } from './types';
  
  // Define API_URL with fallback
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";
  
  /**
   * Login user with email and password
   * @param credentials - Login credentials
   * @returns Promise with login response data
   */
  export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed');
      }
  
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };
  
  /**
   * Get the current user's profile
   * @param token - JWT token for authentication
   * @returns Promise with user data
   */
  export const fetchProfile = async (token: string): Promise<User> => {
    try {
      const response = await fetch(`${API_URL}/profile/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch profile');
      }
  
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Profile fetch error:', error);
      throw error;
    }
  };
  
  /**
   * Update the user's profile
   * @param token - JWT token for authentication
   * @param profileData - Profile data to update
   * @returns Promise with updated user data
   */
  export const updateProfile = async (
    token: string, 
    profileData: ProfileUpdateRequest
  ): Promise<{ message: string; user: User }> => {
    try {
      const response = await fetch(`${API_URL}/profile/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update profile');
      }
  
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  };
  
  /**
   * Upload avatar image
   * @param token - JWT token for authentication
   * @param file - Avatar image file
   * @returns Promise with upload result
   */
  export const uploadAvatar = async (
    token: string, 
    file: File
  ): Promise<{ message: string }> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
  
      const response = await fetch(`${API_URL}/upload-avatar/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to upload avatar');
      }
  
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Avatar upload error:', error);
      throw error;
    }
  };
  
  /**
   * Request a password reset
   * @param email - User's email address
   * @returns Promise with request result
   */
  export const requestPasswordReset = async (
    request: PasswordResetRequest
  ): Promise<{ detail: string }> => {
    try {
      const response = await fetch(`${API_URL}/request-password-reset/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to request password reset');
      }
  
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Password reset request error:', error);
      throw error;
    }
  };
  
  /**
   * Reset password with token
   * @param payload - Reset password payload with token and new password
   * @returns Promise with reset result
   */
  export const resetPassword = async (
    payload: ResetPasswordPayload
  ): Promise<{ message: string }> => {
    try {
      const response = await fetch(`${API_URL}/reset-password/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to reset password');
      }
  
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  };
  
  /**
   * Logout the current user
   */
  export const logout = (): void => {
    localStorage.removeItem('token');
  };