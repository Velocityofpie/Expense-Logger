import React from 'react';
import { ButtonProps } from '../../types/common.types';

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  icon, 
  iconPosition = 'left',
  disabled = false,
  isLoading = false,
  onClick,
  className = '',
  type = 'button',
  fullWidth = false,
  ...props 
}) => {
  // Base classes for all buttons
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md focus:outline-none transition-colors duration-200';
  
  // Size variants
  const sizeClasses = {
    sm: 'px-2.5 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };
  
  // Style variants
  const variantClasses = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white shadow-sm dark:bg-primary-700 dark:hover:bg-primary-600 focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-dark-bg',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white shadow-sm dark:bg-gray-700 dark:hover:bg-gray-600 focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:focus:ring-offset-dark-bg',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-sm dark:bg-red-700 dark:hover:bg-red-600 focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-dark-bg',
    success: 'bg-green-600 hover:bg-green-700 text-white shadow-sm dark:bg-green-700 dark:hover:bg-green-600 focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-dark-bg',
    outline: 'bg-white dark:bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-300 dark:border-gray-600',
    ghost: 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300',
  };
  
  // Disabled and loading states
  const stateClasses = disabled || isLoading 
    ? 'opacity-60 cursor-not-allowed' 
    : 'hover:shadow-md';
  
  // Full width class
  const widthClass = fullWidth ? 'w-full' : '';
  
  // Combine all classes
  const buttonClasses = `
    ${baseClasses} 
    ${sizeClasses[size] || sizeClasses.md} 
    ${variantClasses[variant] || variantClasses.primary} 
    ${stateClasses} 
    ${widthClass}
    ${className}
  `;
  
  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={disabled || isLoading}
      onClick={onClick}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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
};

export default Button;