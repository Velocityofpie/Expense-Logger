export interface APIResponse<T> {
    data?: T;
    error?: string;
    message?: string;
    status?: number;
  }
  
  export interface PaginationParams {
    skip?: number;
    limit?: number;
  }
  
  export interface UserCredentials {
    email: string;
    password: string;
  }
  
  export interface TokenResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
  }
  
  export interface APIError {
    detail?: string;
    message?: string;
    status?: number;
    path?: string;
  }