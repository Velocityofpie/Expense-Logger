import React, { forwardRef } from 'react';
import { TextInputProps } from '../../../types/common.types';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  inputSize?: 'sm' | 'md' | 'lg';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      inputSize = 'md',
      leftIcon,
      rightIcon,
      fullWidth = false,
      className = '',
      disabled = false,
      required = false,
      id,
      name,
      type = 'text',
      ...props
    },
    ref
  ) => {
    // Generate an ID if not provided
    const inputId = id || name || `input-${Math.random().toString(36).substring(2, 9)}`;
    
    // Size classes
    const sizeClasses = {
      sm: 'py-1 px-2 text-sm',
      md: 'py-2 px-3 text-base',
      lg: 'py-3 px-4 text-lg'
    };
    
    // Width classes
    const widthClass = fullWidth ? 'w-full' : '';

    // Error classes
    const errorClasses = error 
      ? 'border-red-500 focus:border-red-500 focus:ring focus:ring-red-500 focus:ring-opacity-50' 
      : 'border-gray-300 dark:border-dark-border focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50';
    
    // Icon padding
    const leftIconPadding = leftIcon ? 'pl-10' : '';
    const rightIconPadding = rightIcon ? 'pr-10' : '';
    
    return (
      <div className={`${widthClass} ${className}`}>
        {label && (
          <label 
            htmlFor={inputId} 
            className={`block text-sm font-medium mb-1 ${
              error 
                ? 'text-red-500' 
                : 'text-gray-700 dark:text-dark-text-primary'
            }`}
          >
            {label}
            {required && <span className="ml-1 text-red-500">*</span>}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            id={inputId}
            name={name}
            type={type}
            className={`
              block bg-white dark:bg-dark-card rounded-md shadow-sm 
              ${sizeClasses[inputSize]} 
              ${errorClasses} 
              ${leftIconPadding} 
              ${rightIconPadding} 
              ${disabled ? 'bg-gray-100 dark:bg-gray-800 text-gray-500 cursor-not-allowed' : ''}
              ${widthClass}
            `}
            disabled={disabled}
            required={required}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
            {...props}
          />
          
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              {rightIcon}
            </div>
          )}
        </div>
        
        {error && (
          <p id={`${inputId}-error`} className="mt-1 text-sm text-red-500">
            {error}
          </p>
        )}
        
        {helperText && !error && (
          <p id={`${inputId}-helper`} className="mt-1 text-sm text-gray-500 dark:text-dark-text-secondary">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;