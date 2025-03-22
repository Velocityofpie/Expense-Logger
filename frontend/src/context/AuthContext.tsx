// src/context/AuthContext.tsx
import React, { createContext, useState, useEffect, ReactNode } from 'react';

// Define the User interface
export interface User {
  id: string;
  username: string;
  email: string;
  role?: string;
}

// Define the AuthContextProps interface
export interface AuthContextProps {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (username: string, email: string, password: string) => Promise<void>;
  clearError: () => void;
}

// Create the context with an initial undefined value
export const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// Define props for the provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is already logged in (from localStorage token)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          setIsAuthenticated(false);
          setUser(null);
          setIsLoading(false);
          return;
        }
        
        // In a real app, you would verify the token with your backend
        // and get the user information
        // For now, we'll simulate this behavior
        const fakeUser: User = {
          id: '1',
          username: 'User',
          email: 'user@example.com'
        };
        
        setUser(fakeUser);
        setIsAuthenticated(true);
      } catch (err) {
        setError('Authentication failed. Please log in again.');
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // In a real app, call your API endpoint here
      // For simulation:
      const response = await fetch("http://localhost:8000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      
      if (!response.ok) {
        throw new Error('Invalid email or password');
      }
      
      const data = await response.json();
      localStorage.setItem("token", data.access_token);
      
      // Simulate getting user data
      const fakeUser: User = {
        id: '1',
        username: email.split('@')[0],
        email
      };
      
      setUser(fakeUser);
      setIsAuthenticated(true);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Login failed. Please try again.');
      }
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = (): void => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
  };

  // Register function
  const register = async (username: string, email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // In a real app, call your API endpoint here
      // For simulation:
      const response = await fetch("http://localhost:8000/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      });
      
      if (!response.ok) {
        throw new Error('Registration failed');
      }
      
      // Automatically log in the user
      await login(email, password);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Clear error function
  const clearError = (): void => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        error,
        login,
        logout,
        register,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};