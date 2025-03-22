// src/context/ThemeContext.tsx
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { ThemeMode } from '../types/common.types';

/**
 * Interface for theme context
 */
interface ThemeContextType {
  darkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (isDark: boolean) => void;
  theme: ThemeMode;
}

// Create context with default values
export const ThemeContext = createContext<ThemeContextType>({
  darkMode: false,
  toggleDarkMode: () => {},
  setDarkMode: () => {},
  theme: 'light',
});

/**
 * Theme provider props
 */
interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: ThemeMode;
}

/**
 * Theme provider component for light/dark mode
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ 
  children, 
  defaultTheme = 'light' 
}) => {
  // Initialize dark mode from localStorage or system preference
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    // Check localStorage first
    const savedTheme = localStorage.getItem('darkMode');
    
    if (savedTheme !== null) {
      return JSON.parse(savedTheme);
    }
    
    // If no saved preference, check system preference
    const prefersDark = window.matchMedia && 
      window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // If no system preference, use default theme
    return prefersDark || defaultTheme === 'dark';
  });

  // Update localStorage and apply theme when darkMode changes
  useEffect(() => {
    // Save to localStorage
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    
    // Apply dark mode class to html element for Tailwind
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Handle Bootstrap components
    if (darkMode) {
      document.body.classList.add('bootstrap-dark');
    } else {
      document.body.classList.remove('bootstrap-dark');
    }
  }, [darkMode]);

  // Listen for system theme changes
  useEffect(() => {
    // Only apply if no user preference is set
    if (localStorage.getItem('darkMode') !== null) {
      return;
    }
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent): void => {
      setDarkMode(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  /**
   * Toggle between light and dark mode
   */
  const toggleDarkMode = (): void => {
    setDarkMode(!darkMode);
  };

  /**
   * Set dark mode directly
   */
  const setDarkModeState = (isDark: boolean): void => {
    setDarkMode(isDark);
  };

  // Context value
  const contextValue: ThemeContextType = {
    darkMode,
    toggleDarkMode,
    setDarkMode: setDarkModeState,
    theme: darkMode ? 'dark' : 'light',
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;