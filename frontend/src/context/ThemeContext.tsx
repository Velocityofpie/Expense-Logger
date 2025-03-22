// src/context/ThemeContext.tsx
import React, { createContext, useState, useEffect, ReactNode } from 'react';

// Define the theme context props interface
export interface ThemeContextProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (isDark: boolean) => void;
}

// Create the context
export const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

// Define props for the provider component
interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Initialize dark mode from localStorage or user preference
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    // Try to get theme preference from localStorage
    const savedTheme = localStorage.getItem('darkMode');
    // Check if user has a system preference
    const prefersDark = window.matchMedia && 
                       window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Return saved preference or system preference
    return savedTheme ? JSON.parse(savedTheme) : prefersDark;
  });

  // Toggle dark mode function
  const toggleDarkMode = (): void => {
    setDarkMode(!darkMode);
  };

  // Set dark mode with a specific value
  const setDarkModeValue = (isDark: boolean): void => {
    setDarkMode(isDark);
  };

  // Update localStorage and apply theme when darkMode changes
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    
    // Apply dark mode class to html element for Tailwind
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Handle Bootstrap components that don't respect Tailwind's dark mode
    if (darkMode) {
      document.body.classList.add('bootstrap-dark');
    } else {
      document.body.classList.remove('bootstrap-dark');
    }
  }, [darkMode]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Define the handler function
    const handleChange = (e: MediaQueryListEvent): void => {
      // Only change if the user hasn't explicitly set a preference
      if (!localStorage.getItem('darkMode')) {
        setDarkMode(e.matches);
      }
    };
    
    // Add listener for changes
    mediaQuery.addEventListener('change', handleChange);
    
    // Cleanup listener
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        darkMode,
        toggleDarkMode,
        setDarkMode: setDarkModeValue
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};