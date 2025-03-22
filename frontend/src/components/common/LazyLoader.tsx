// src/components/common/LazyLoader.tsx
import React, { Suspense, ComponentType, LazyExoticComponent } from 'react';

/**
 * Props for the LazyLoader component
 */
interface LazyLoaderProps {
  component: LazyExoticComponent<ComponentType<any>>;
  fallback?: React.ReactNode;
  props?: Record<string, any>;
}

/**
 * Default loading fallback component
 */
const DefaultLoadingFallback: React.FC = () => (
  <div className="flex justify-center items-center min-h-32">
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
    <span className="ml-2 text-gray-600 dark:text-gray-400">Loading...</span>
  </div>
);

/**
 * LazyLoader component that handles lazy loading of components with Suspense
 * @param props LazyLoaderProps
 * @returns React component
 */
const LazyLoader: React.FC<LazyLoaderProps> = ({ 
  component: Component, 
  fallback = <DefaultLoadingFallback />,
  props = {} 
}) => {
  return (
    <Suspense fallback={fallback}>
      <Component {...props} />
    </Suspense>
  );
};

export default LazyLoader;