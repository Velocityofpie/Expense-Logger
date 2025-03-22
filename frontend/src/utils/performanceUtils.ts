// src/utils/performanceUtils.ts

/**
 * Measures the execution time of a function
 * @param fn Function to measure
 * @param args Arguments to pass to the function
 * @returns An object containing the result and execution time
 */
export function measureExecutionTime<T, Args extends any[]>(
    fn: (...args: Args) => T,
    ...args: Args
  ): { result: T; executionTime: number } {
    const start = performance.now();
    const result = fn(...args);
    const end = performance.now();
    const executionTime = end - start;
    
    return { result, executionTime };
  }
  
  /**
   * Debounces a function call
   * @param fn Function to debounce
   * @param delay Delay in milliseconds
   * @returns Debounced function
   */
  export function debounce<T extends (...args: any[]) => any>(
    fn: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    
    return function(...args: Parameters<T>): void {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      timeoutId = setTimeout(() => {
        fn(...args);
        timeoutId = null;
      }, delay);
    };
  }
  
  /**
   * Throttles a function call
   * @param fn Function to throttle
   * @param limit Time limit in milliseconds
   * @returns Throttled function
   */
  export function throttle<T extends (...args: any[]) => any>(
    fn: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle = false;
    let lastArgs: Parameters<T> | null = null;
    
    return function(...args: Parameters<T>): void {
      lastArgs = args;
      
      if (!inThrottle) {
        fn(...args);
        inThrottle = true;
        
        setTimeout(() => {
          inThrottle = false;
          if (lastArgs) {
            fn(...lastArgs);
          }
        }, limit);
      }
    };
  }
  
  /**
   * Memoizes a function to cache its results
   * @param fn Function to memoize
   * @returns Memoized function
   */
  export function memoize<T extends (...args: any[]) => any>(
    fn: T
  ): (...args: Parameters<T>) => ReturnType<T> {
    const cache = new Map<string, ReturnType<T>>();
    
    return function(...args: Parameters<T>): ReturnType<T> {
      const key = JSON.stringify(args);
      
      if (cache.has(key)) {
        return cache.get(key)!;
      }
      
      const result = fn(...args);
      cache.set(key, result);
      
      return result;
    };
  }
  
  /**
   * Creates a deferred promise
   * @returns A deferred promise object
   */
  export function createDeferredPromise<T>(): {
    promise: Promise<T>;
    resolve: (value: T | PromiseLike<T>) => void;
    reject: (reason?: any) => void;
  } {
    let resolve!: (value: T | PromiseLike<T>) => void;
    let reject!: (reason?: any) => void;
    
    const promise = new Promise<T>((res, rej) => {
      resolve = res;
      reject = rej;
    });
    
    return { promise, resolve, reject };
  }
  
  /**
   * Adds a request/tracking ID to a component for performance monitoring
   * @param componentName Name of the component
   * @returns A unique tracking ID
   */
  export function trackComponentRender(componentName: string): string {
    const trackingId = `${componentName}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // You could send this to your monitoring system
    if (process.env.NODE_ENV === 'development') {
      console.log(`Component rendered: ${componentName} (${trackingId})`);
    }
    
    return trackingId;
  }
  
  /**
   * Measures component render time
   * @param componentName Name of the component 
   * @returns An object with start and end functions
   */
  export function measureRenderTime(componentName: string): {
    start: () => void;
    end: () => number;
  } {
    let startTime = 0;
    
    const start = () => {
      startTime = performance.now();
    };
    
    const end = () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`Component ${componentName} rendered in ${renderTime.toFixed(2)}ms`);
      }
      
      return renderTime;
    };
    
    return { start, end };
  }