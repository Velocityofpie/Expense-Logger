// src/features/tools/shared/api.ts

// API base URL from environment
export const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

/**
 * Generic function to handle error responses
 */
export const handleApiError = async (response: Response): Promise<never> => {
  try {
    const errorData = await response.json();
    throw new Error(errorData.detail || errorData.message || 'An error occurred');
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error(`HTTP error ${response.status}`);
    }
  }
};

/**
 * Generic GET request
 */
export const apiGet = async <T>(endpoint: string): Promise<T> => {
  const response = await fetch(`${API_URL}${endpoint}`);
  
  if (!response.ok) {
    await handleApiError(response);
  }
  
  return response.json();
};

/**
 * Generic POST request with JSON body
 */
export const apiPost = async <T>(endpoint: string, data: any): Promise<T> => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    await handleApiError(response);
  }
  
  return response.json();
};

/**
 * Generic PUT request with JSON body
 */
export const apiPut = async <T>(endpoint: string, data: any): Promise<T> => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    await handleApiError(response);
  }
  
  return response.json();
};

/**
 * Generic DELETE request
 */
export const apiDelete = async <T>(endpoint: string): Promise<T> => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: 'DELETE'
  });
  
  if (!response.ok) {
    await handleApiError(response);
  }
  
  return response.json();
};

/**
 * Upload file with FormData
 */
export const apiUploadFile = async <T>(endpoint: string, formData: FormData): Promise<T> => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: 'POST',
    body: formData
  });
  
  if (!response.ok) {
    await handleApiError(response);
  }
  
  return response.json();
};