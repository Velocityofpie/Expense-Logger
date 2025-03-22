// src/hooks/useMediaQuery.ts
import { useState, useEffect } from 'react';

/**
 * A hook that returns whether the document matches a media query string
 * 
 * @param query - The media query string to evaluate
 * @returns A boolean indicating if the media query matches
 */
export function useMediaQuery(query: string): boolean {
  // Initialize with the current match state
  const getMatches = (): boolean => {
    // Check if window is defined (for SSR)
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  };

  const [matches, setMatches] = useState<boolean>(getMatches);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    
    // Update the state initially and whenever it changes
    const updateMatches = (): void => {
      setMatches(mediaQuery.matches);
    };
    
    // Call once initially
    updateMatches();
    
    // Use the modern API with addEventListener when available
    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', updateMatches);
      return () => {
        mediaQuery.removeEventListener('change', updateMatches);
      };
    } 
    // Fallback for older browsers
    else if (typeof mediaQuery.addListener === 'function') {
      mediaQuery.addListener(updateMatches);
      return () => {
        mediaQuery.removeListener(updateMatches);
      };
    }
    
    return undefined;
  }, [query]);

  return matches;
}

// Common media query helpers
export const useIsMobile = (): boolean => useMediaQuery('(max-width: 767px)');
export const useIsTablet = (): boolean => useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
export const useIsDesktop = (): boolean => useMediaQuery('(min-width: 1024px)');
export const useIsDarkMode = (): boolean => useMediaQuery('(prefers-color-scheme: dark)');

export default useMediaQuery;