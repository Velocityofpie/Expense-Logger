import { post, get } from './client';
import { UserCredentials, TokenResponse } from '../../types/api.types';

/**
 * Log in a user
 */
export const login = async (
  email: string,
  password: string
): Promise<TokenResponse> => {
  try {
    const response = await post<TokenResponse, UserCredentials>(
      '/auth/login',
      { email, password }
    );
    
    // Store the token in localStorage
    if (response && response.access_token) {
      localStorage.setItem('token', response.access_token);
    }
    
    return response;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

/**
 * Log out the current user
 */
export const logout = (): void => {
  // Remove the token from localStorage
  localStorage.removeItem('token');
  
  // Redirect to login page
  window.location.href = '/login';
};

/**
 * Register a new user
 */
export const register = async (
  email: string,
  password: string,
  name: string
): Promise<{ success: boolean; message: string }> => {
  try {
    return await post<{ success: boolean; message: string }>(
      '/auth/register',
      { email, password, name }
    );
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

/**
 * Request a password reset
 */
export const requestPasswordReset = async (
  email: string
): Promise<{ success: boolean; message: string }> => {
  try {
    return await post<{ success: boolean; message: string }>(
      '/auth/request-password-reset',
      { email }
    );
  } catch (error) {
    console.error('Password reset request error:', error);
    throw error;
  }
};

/**
 * Reset a password with a token
 */
export const resetPassword = async (
  token: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> => {
  try {
    return await post<{ success: boolean; message: string }>(
      '/auth/reset-password',
      { token, new_password: newPassword }
    );
  } catch (error) {
    console.error('Password reset error:', error);
    throw error;
  }
};

/**
 * Check if the current user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('token');
};

/**
 * Get the current user's profile
 */
export const getCurrentUser = async (): Promise<any> => {
  try {
    // Only attempt to fetch if we have a token
    if (!isAuthenticated()) {
      return null;
    }
    
    return await get<any>('/auth/profile');
  } catch (error) {
    console.error('Error fetching current user:', error);
    // If there's an error (e.g., token expired), clear the token
    logout();
    return null;
  }
};

export default {
  login,
  logout,
  register,
  requestPasswordReset,
  resetPassword,
  isAuthenticated,
  getCurrentUser
};