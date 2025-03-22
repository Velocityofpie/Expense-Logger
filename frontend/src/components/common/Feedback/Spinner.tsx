import React from 'react';
import { CommonProps } from '../../../types/common.types';

interface SpinnerProps extends CommonProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark';
  label?: string;
  centerInParent?: boolean;
}

const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  color = 'primary',
  label,
  centerInParent = false,
  className = '',
  ...props
}) => {
  // Size classes
  const sizeClasses = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  };
  
  // Color classes
  const colorClasses = {
    primary: 'text-primary-600 dark:text-primary-500',
    secondary: 'text-gray-600 dark:text-gray-400',
    success: 'text-green-600 dark:text-green-500',
    danger: 'text-red-600 dark:text-red-500',
    warning: 'text-yellow-600 dark:text-yellow-500',
    info: 'text-blue-600 dark:text-blue-500',
    light: 'text-gray-300 dark:text-gray-600',
    dark: 'text-gray-900 dark:text-gray-300',
  };
  
  // Center in parent container
  const centerClasses = centerInParent ? 'absolute inset-0 flex items-center justify-center' : '';
  
  return (
    <div className={`inline-flex ${centerClasses} ${label ? 'flex-col items-center' : ''} ${className}`} role="status" {...props}>
      <svg 
        className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]}`} 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path 
          className="opacity-75" 
          fill="currentColor" 
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      
      {label && (
        <span className={`mt-2 ${colorClasses[color]} text-sm font-medium`}>
          {label}
        </span>
      )}
      
      <span className="sr-only">Loading</span>
    </div>
  );
};

export default Spinner;