// src/services/utils/performanceMonitor.ts

/**
 * Interface for performance metrics
 */
interface PerformanceMetric {
    metricName: string;
    value: number;
    timestamp: number;
    labels?: Record<string, string>;
  }
  
  /**
   * Interface for resource timing data
   */
  interface ResourceTiming {
    name: string;
    duration: number;
    startTime: number;
    initiatorType: string;
    size?: number;
  }
  
  /**
   * Class for monitoring application performance
   */
  class PerformanceMonitor {
    private metrics: PerformanceMetric[] = [];
    private enabled: boolean = false;
    private flushInterval: NodeJS.Timeout | null = null;
    private flushIntervalMs: number = 30000; // 30 seconds
    private endpoint: string = '';
  
    /**
     * Initialize the performance monitor
     * @param endpoint API endpoint for sending metrics
     * @param enabled Whether monitoring is enabled
     * @param flushIntervalMs Interval for flushing metrics to the server
     */
    public init(endpoint: string, enabled = true, flushIntervalMs = 30000): void {
      this.endpoint = endpoint;
      this.enabled = enabled;
      this.flushIntervalMs = flushIntervalMs;
  
      if (this.enabled) {
        this.startMonitoring();
      }
    }
  
    /**
     * Start monitoring performance
     */
    private startMonitoring(): void {
      if (!this.enabled || this.flushInterval) return;
  
      // Collect initial performance data
      this.collectInitialMetrics();
  
      // Set up periodic flushing of metrics
      this.flushInterval = setInterval(() => {
        this.flushMetrics();
      }, this.flushIntervalMs);
  
      // Monitor resource timing
      this.observeResourceTiming();
  
      // Monitor navigation timing
      this.observeNavigationTiming();
  
      // Monitor long tasks
      this.observeLongTasks();
    }
  
    /**
     * Stop monitoring performance
     */
    public stopMonitoring(): void {
      if (this.flushInterval) {
        clearInterval(this.flushInterval);
        this.flushInterval = null;
      }
  
      this.enabled = false;
    }
  
    /**
     * Collect initial performance metrics
     */
    private collectInitialMetrics(): void {
      // Basic navigation timing metrics
      if (window.performance && window.performance.timing) {
        const timing = window.performance.timing;
        
        // Time to First Byte (TTFB)
        this.recordMetric('ttfb', timing.responseStart - timing.navigationStart);
        
        // DOM Content Loaded
        this.recordMetric('domContentLoaded', timing.domContentLoadedEventEnd - timing.navigationStart);
        
        // Page Load Time
        this.recordMetric('pageLoad', timing.loadEventEnd - timing.navigationStart);
      }
    }
  
    /**
     * Observe resource timing
     */
    private observeResourceTiming(): void {
      if (window.performance && window.performance.getEntriesByType) {
        // Get initial resource timings
        const resourceEntries = window.performance.getEntriesByType('resource');
        this.processResourceEntries(resourceEntries as PerformanceResourceTiming[]);
  
        // Observe new resource timings
        if (window.PerformanceObserver) {
          try {
            const observer = new PerformanceObserver((list) => {
              this.processResourceEntries(list.getEntries() as PerformanceResourceTiming[]);
            });
            
            observer.observe({ entryTypes: ['resource'] });
          } catch (e) {
            console.error('PerformanceObserver for resources not supported', e);
          }
        }
      }
    }
  
    /**
     * Process resource timing entries
     * @param entries Resource timing entries
     */
    private processResourceEntries(entries: PerformanceResourceTiming[]): void {
      entries.forEach(entry => {
        const resourceTiming: ResourceTiming = {
          name: entry.name,
          duration: entry.duration,
          startTime: entry.startTime,
          initiatorType: entry.initiatorType,
          size: entry.transferSize || undefined
        };
  
        // Record slow resources (over 1 second)
        if (resourceTiming.duration > 1000) {
          this.recordMetric(`slow_resource`, resourceTiming.duration, {
            name: this.truncateUrl(resourceTiming.name),
            type: resourceTiming.initiatorType
          });
        }
      });
    }
  
    /**
     * Observe navigation timing
     */
    private observeNavigationTiming(): void {
      if (window.PerformanceObserver) {
        try {
          const observer = new PerformanceObserver((list) => {
            list.getEntries().forEach((entry) => {
              if (entry.entryType === 'navigation') {
                const navEntry = entry as PerformanceNavigationTiming;
                
                this.recordMetric('nav_ttfb', navEntry.responseStart, {
                  page: window.location.pathname
                });
                
                this.recordMetric('nav_dom_complete', navEntry.domComplete, {
                  page: window.location.pathname
                });
                
                this.recordMetric('nav_load_complete', navEntry.loadEventEnd, {
                  page: window.location.pathname
                });
              }
            });
          });
          
          observer.observe({ entryTypes: ['navigation'] });
        } catch (e) {
          console.error('PerformanceObserver for navigation not supported', e);
        }
      }
    }
  
    /**
     * Observe long tasks
     */
    private observeLongTasks(): void {
      if (window.PerformanceObserver) {
        try {
          const observer = new PerformanceObserver((list) => {
            list.getEntries().forEach((entry) => {
              this.recordMetric('long_task', entry.duration, {
                page: window.location.pathname
              });
            });
          });
          
          observer.observe({ entryTypes: ['longtask'] });
        } catch (e) {
          console.error('PerformanceObserver for long tasks not supported', e);
        }
      }
    }
  
    /**
     * Record a performance metric
     * @param metricName Name of the metric
     * @param value Value of the metric
     * @param labels Additional labels for the metric
     */
    public recordMetric(metricName: string, value: number, labels?: Record<string, string>): void {
      if (!this.enabled) return;
  
      this.metrics.push({
        metricName,
        value,
        timestamp: Date.now(),
        labels
      });
  
      // If we have too many metrics, flush them early
      if (this.metrics.length > 100) {
        this.flushMetrics();
      }
    }
  
    /**
     * Measure execution time of a function
     * @param fn Function to measure
     * @param metricName Name of the metric
     * @param labels Additional labels for the metric
     * @returns Result of the function
     */
    public measureExecution<T>(fn: () => T, metricName: string, labels?: Record<string, string>): T {
      const start = performance.now();
      const result = fn();
      const duration = performance.now() - start;
  
      this.recordMetric(metricName, duration, labels);
  
      return result;
    }
  
    /**
     * Measure execution time of an async function
     * @param fn Async function to measure
     * @param metricName Name of the metric
     * @param labels Additional labels for the metric
     * @returns Promise resolving to the result of the function
     */
    public async measureExecutionAsync<T>(fn: () => Promise<T>, metricName: string, labels?: Record<string, string>): Promise<T> {
      const start = performance.now();
      const result = await fn();
      const duration = performance.now() - start;
  
      this.recordMetric(metricName, duration, labels);
  
      return result;
    }
  
    /**
     * Flush metrics to the server
     */
    public flushMetrics(): void {
      if (!this.enabled || this.metrics.length === 0 || !this.endpoint) return;
  
      const metricsToSend = [...this.metrics];
      this.metrics = [];
  
      // Only send metrics in production to avoid polluting metrics during development
      if (process.env.NODE_ENV === 'production') {
        fetch(this.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            metrics: metricsToSend,
            userAgent: navigator.userAgent,
            url: window.location.href,
            timestamp: Date.now()
          }),
          // Use keepalive to ensure the request completes even if the page is unloading
          keepalive: true
        }).catch(error => {
          console.error('Error sending performance metrics:', error);
          // Don't add back to the queue - if we can't send now, it's unlikely to work later
        });
      } else {
        // In development, just log to console
        console.debug('Performance metrics:', metricsToSend);
      }
    }
  
    /**
     * Truncate URL to avoid sending too much data
     * @param url URL to truncate
     * @returns Truncated URL
     */
    private truncateUrl(url: string): string {
      // Remove query parameters
      const urlWithoutQuery = url.split('?')[0];
      
      // Limit length
      if (urlWithoutQuery.length > 100) {
        return urlWithoutQuery.substring(0, 100) + '...';
      }
      
      return urlWithoutQuery;
    }
  }
  
  // Create and export a singleton instance
  export const performanceMonitor = new PerformanceMonitor();
  
  export default performanceMonitor;