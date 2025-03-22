// src/components/common/Form/Input.tsx
import React, { forwardRef } from 'react';
import { useFormContext } from './Form';
import { ValidationState } from '../../../types/common.types';

/**
 * Props for Input component
 */
interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Input field name (used for form context) */
  name: string;
  /** Input label */
  label?: string;
  /** Helper text displayed below the input */
  helperText?: string;
  /** Error message */
  error?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Input size */
  size?: 'sm' | 'md' | 'lg';
  /** Input validation state */
  validationState?: ValidationState;
  /** Left addon (icon or text) */
  leftAddon?: React.ReactNode;
  /** Right addon (icon or text) */
  rightAddon?: React.ReactNode;
  /** Whether to show the validation icon */
  showValidationIcon?: boolean;
  /** Whether the field is full width */
  fullWidth?: boolean;
  /** Additional class names for the input container */
  containerClassName?: string;
  /** Additional class names for the input element */
  inputClassName?: string;
  /** Additional class names for the label */
  labelClassName?: string;
  /** Additional class names for the helper text */
  helperTextClassName?: string;
}

/**
 * Input component for forms
 */
const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      name,
      label,
      helperText,
      error,
      required = false,
      size = 'md',
      validationState = 'neutral',
      leftAddon,
      rightAddon,
      showValidationIcon = true,
      fullWidth = true,
      containerClassName = '',
      inputClassName = '',
      labelClassName = '',
      helperTextClassName = '',
      disabled = false,
      readOnly = false,
      onBlur,
      onChange,
      ...props
    },
    ref
  ) => {
    // Try to use form context if available
    const formContext = useFormContext();
    const isInForm = !!formContext && name in formContext.values;
    
    // Get value, error, and touched status from form context if available
    const value = isInForm ? formContext.values[name] : props.value;
    const fieldError = isInForm ? formContext.errors[name] : error;
    const touched = isInForm ? formContext.touched[name] : true;
    
    // Calculate validation state
    const calculatedValidationState = fieldError && touched ? 'invalid' : validationState;
    
    // Handle change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (isInForm) {
        formContext.handleChange(name, e.target.value);
      }
      if (onChange) {
        onChange(e);
      }
    };
    
    // Handle blur
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      if (isInForm) {
        formContext.handleBlur(name);
      }
      if (onBlur) {
        onBlur(e);
      }
    };
    
    // Get input size classes
    const getSizeClasses = (): string => {
      switch (size) {
        case 'sm':
          return 'h-8 text-xs';
        case 'lg':
          return 'h-12 text-base';
        case 'md':
        default:
          return 'h-10 text-sm';
      }
    };
    
    // Get validation classes
    const getValidationClasses = (): string => {
      switch (calculatedValidationState) {
        case 'valid':
          return 'border-green-500 focus:border-green-500 focus:ring-green-500';
        case 'invalid':
          return 'border-red-500 focus:border-red-500 focus:ring-red-500';
        case 'warning':
          return 'border-yellow-500 focus:border-yellow-500 focus:ring-yellow-500';
        case 'neutral':
        default:
          return 'border-gray-300 dark:border-gray-600 focus:border-primary-500 focus:ring-primary-500 dark:focus:border-primary-400 dark:focus:ring-primary-400';
      }
    };
    
    // Get validation icon
    const getValidationIcon = (): React.ReactNode => {
      if (!showValidationIcon) return null;
      
      switch (calculatedValidationState) {
        case 'valid':
          return (
            <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          );
        case 'invalid':
          return (
            <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          );
        case 'warning':
          return (
            <svg className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          );
        default:
          return null;
      }
    };
    
    // Generate IDs for accessibility
    const inputId = `input-${name}`;
    const helperId = `helper-${name}`;
    
    return (
      <div className={`${fullWidth ? 'w-full' : ''} ${containerClassName}`}>
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ${labelClassName}`}
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        {/* Input with addons */}
        <div className="relative flex">
          {/* Left addon */}
          {leftAddon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {typeof leftAddon === 'string' ? (
                <span className="text-gray-500 dark:text-gray-400 text-sm">{leftAddon}</span>
              ) : (
                leftAddon
              )}
            </div>
          )}
          
          {/* Input element */}
          <input
            id={inputId}
            ref={ref}
            name={name}
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            aria-invalid={calculatedValidationState === 'invalid'}
            aria-describedby={helperText || fieldError ? helperId : undefined}
            disabled={disabled}
            readOnly={readOnly}
            required={required}
            className={`
              w-full rounded-md shadow-sm
              ${getSizeClasses()}
              ${getValidationClasses()}
              ${leftAddon ? 'pl-10' : ''}
              ${rightAddon || getValidationIcon() ? 'pr-10' : ''}
              ${disabled ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : ''}
              ${readOnly ? 'bg-gray-50 dark:bg-gray-900' : ''}
              focus:outline-none focus:ring-2 focus:ring-opacity-50
              dark:bg-gray-800 dark:text-white
              transition-colors duration-200
              ${inputClassName}
            `}
            {...props}
          />
          
          {/* Right addon or validation icon */}
          {(rightAddon || getValidationIcon()) && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              {rightAddon || getValidationIcon()}
            </div>
          )}
        </div>
        
        {/* Helper text or error message */}
        {(helperText || fieldError) && (
          <p
            id={helperId}
            className={`mt-1 text-xs ${
              fieldError && touched
                ? 'text-red-500 dark:text-red-400'
                : 'text-gray-500 dark:text-gray-400'
            } ${helperTextClassName}`}
          >
            {fieldError && touched ? fieldError : helperText}
          </p>
        )}
      </div>
    );
  }
);

// Display name for debugging
Input.displayName = 'Input';

export default Input;