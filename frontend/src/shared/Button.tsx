import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { ButtonProps, ButtonSize, ButtonVariant } from './types';

/**
 * Primary button component for user interactions
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      icon,
      iconPosition = 'left',
      fullWidth = false,
      disabled = false,
      isLoading = false,
      onClick,
      className = '',
      type = 'button',
      ...props
    },
    ref
  ) => {
    // Base button classes
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md focus:outline-none transition-colors duration-200';
    
    // Size variants
    const sizeClasses: Record<ButtonSize, string> = {
      xs: 'px-2 py-1 text-xs',
      sm: 'px-2.5 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
      xl: 'px-8 py-4 text-lg'
    };
    
    // Style variants
    const variantClasses: Record<ButtonVariant, string> = {
      primary: 'bg-primary-600 hover:bg-primary-700 text-white shadow-sm dark:bg-primary-700 dark:hover:bg-primary-600 focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-dark-bg',
      secondary: 'bg-gray-600 hover:bg-gray-700 text-white shadow-sm dark:bg-gray-700 dark:hover:bg-gray-600 focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:focus:ring-offset-dark-bg',
      danger: 'bg-red-600 hover:bg-red-700 text-white shadow-sm dark:bg-red-700 dark:hover:bg-red-600 focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-dark-bg',
      success: 'bg-green-600 hover:bg-green-700 text-white shadow-sm dark:bg-green-700 dark:hover:bg-green-600 focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-dark-bg',
      warning: 'bg-yellow-600 hover:bg-yellow-700 text-white shadow-sm dark:bg-yellow-700 dark:hover:bg-yellow-600 focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 dark:focus:ring-offset-dark-bg',
      info: 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm dark:bg-blue-700 dark:hover:bg-blue-600 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-dark-bg',
      outline: 'bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-800',
      ghost: 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300',
      link: 'bg-transparent text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 hover:underline p-0 h-auto shadow-none'
    };
    
    // Disabled and loading states
    const stateClasses = disabled || isLoading 
      ? 'opacity-60 cursor-not-allowed' 
      : 'hover:shadow-md';
    
    // Full width option
    const widthClasses = fullWidth ? 'w-full' : '';
    
    // Combine all classes
    const buttonClasses = `
      ${baseClasses} 
      ${sizeClasses[size]} 
      ${variantClasses[variant]} 
      ${stateClasses} 
      ${widthClasses} 
      ${className}
    `;
    
    return (
      <button
        ref={ref}
        type={type}
        className={buttonClasses}
        disabled={disabled || isLoading}
        onClick={onClick}
        {...props}
      >
        {isLoading && (
          <svg 
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        
        {!isLoading && icon && iconPosition === 'left' && (
          <span className="mr-2">{icon}</span>
        )}
        
        {children}
        
        {!isLoading && icon && iconPosition === 'right' && (
          <span className="ml-2">{icon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;