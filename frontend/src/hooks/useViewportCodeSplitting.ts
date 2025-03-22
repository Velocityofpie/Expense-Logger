// src/hooks/useViewportCodeSplitting.ts
import { useState, useEffect, ComponentType, LazyExoticComponent } from 'react';

/**
 * Interface for component variants based on viewport
 */
interface ViewportComponents<P> {
  mobile: LazyExoticComponent<ComponentType<P>>;
  tablet?: LazyExoticComponent<ComponentType<P>>;
  desktop: LazyExoticComponent<ComponentType<P>>;
}

type ViewportSize = 'mobile' | 'tablet' | 'desktop';

/**
 * Custom hook for loading different components based on viewport size
 * This allows for more efficient code splitting based on device type
 * 
 * @param components Object containing components for different viewports
 * @param mobileBreakpoint Max width for mobile devices (default: 640px)
 * @param tabletBreakpoint Max width for tablet devices (default: 1024px)
 * @returns The component appropriate for the current viewport
 */
function useViewportCodeSplitting<P>(
  components: ViewportComponents<P>,
  mobileBreakpoint: number = 640,
  tabletBreakpoint: number = 1024
): LazyExoticComponent<ComponentType<P>> {
  // Initial viewport detection
  const getInitialViewport = (): ViewportSize => {
    // For SSR, default to mobile
    if (typeof window === 'undefined') return 'mobile';
    
    const width = window.innerWidth;
    if (width <= mobileBreakpoint) return 'mobile';
    if (width <= tabletBreakpoint) return components.tablet ? 'tablet' : 'desktop';
    return 'desktop';
  };
  
  // State to track the current viewport
  const [currentViewport, setCurrentViewport] = useState<ViewportSize>(getInitialViewport());
  
  // Update viewport on resize
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      
      if (width <= mobileBreakpoint) {
        setCurrentViewport('mobile');
      } else if (width <= tabletBreakpoint) {
        setCurrentViewport(components.tablet ? 'tablet' : 'desktop');
      } else {
        setCurrentViewport('desktop');
      }
    };
    
    // Set initial viewport
    handleResize();
    
    // Add resize listener
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [components.tablet, mobileBreakpoint, tabletBreakpoint]);
  
  // Get the component for the current viewport
  const getComponentForViewport = (): LazyExoticComponent<ComponentType<P>> => {
    switch (currentViewport) {
      case 'mobile':
        return components.mobile;
      case 'tablet':
        return components.tablet || components.desktop;
      case 'desktop':
        return components.desktop;
      default:
        return components.desktop;
    }
  };
  
  return getComponentForViewport();
}

export default useViewportCodeSplitting;