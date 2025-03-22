// src/hooks/usePerformance.ts
import { useEffect, useRef } from 'react';

/**
 * Interface for performance metrics
 */
interface PerformanceMetrics {
  componentName: string;
  renderTime: number;
  mountTime: number;
  updateCount: number;
  lastUpdateTime: number;
}

/**
 * Custom hook for tracking component performance
 * @param componentName The name of the component to track
 * @returns Performance metrics object
 */
export function usePerformance(componentName: string): PerformanceMetrics {
  // Use refs to persist values between renders
  const renderStartTime = useRef<number>(performance.now());
  const mountStartTime = useRef<number>(performance.now());
  const updateCount = useRef<number>(0);
  const lastUpdateTime = useRef<number>(0);
  const isMounted = useRef<boolean>(false);
  
  // Calculate render time on each render
  const renderTime = performance.now() - renderStartTime.current;
  
  // Reset render start time for next render
  renderStartTime.current = performance.now();
  
  // Track mount and update
  useEffect(() => {
    if (!isMounted.current) {
      // First render (mount)
      const mountTime = performance.now() - mountStartTime.current;
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Performance] ${componentName} mounted in ${mountTime.toFixed(2)}ms`);
      }
      
      isMounted.current = true;
    } else {
      // Subsequent renders (updates)
      updateCount.current += 1;
      lastUpdateTime.current = performance.now();
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Performance] ${componentName} updated (${updateCount.current}) in ${renderTime.toFixed(2)}ms`);
      }
    }
    
    // Cleanup on unmount
    return () => {
      if (process.env.NODE_ENV === 'development' && isMounted.current) {
        console.log(`[Performance] ${componentName} unmounted after ${updateCount.current} updates`);
      }
    };
  });
  
  return {
    componentName,
    renderTime,
    mountTime: performance.now() - mountStartTime.current,
    updateCount: updateCount.current,
    lastUpdateTime: lastUpdateTime.current
  };
}

export default usePerformance;