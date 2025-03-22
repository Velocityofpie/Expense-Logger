import React, { forwardRef } from 'react';
import { CommonProps } from '../../../types/common.types';

interface CheckboxProps extends CommonProps, Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  error?: string;
  helperText?: string;
  checkboxSize?: 'sm' | 'md' | 'lg';
  indeterminate?: boolean;
  labelClassName?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      error,
      helperText,
      checkboxSize = 'md',
      indeterminate = false,
      className = '',
      labelClassName = '',
      disabled = false,
      required = false,
      id,
      name,
      checked,
      defaultChecked,
      onChange,
      ...props
    },
    ref
  ) => {
    // Handle ref with indeterminate state
    const handleRef = (el: HTMLInputElement | null) => {
      if (!el) return;
      
      if (typeof ref === 'function') {
        ref(el);
      } else if (ref) {
        ref.current = el;
      }
      
      if (el) {
        el.indeterminate = indeterminate;
      }
    };
    
    // Generate an ID if not provided
    const checkboxId = id || name || `checkbox-${Math.random().toString(36).substring(2, 9)}`;
    
    // Size classes
    const sizeClasses = {
      sm: 'h-3 w-3',
      md: 'h-4 w-4',
      lg: 'h-5 w-5'
    };
    
    const labelSizeClasses = {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg'
    };
    
    return (
      <div className={`${className}`}>
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              ref={handleRef}
              id={checkboxId}
              name={name}
              type="checkbox"
              className={`
                rounded border-gray-300 dark:border-dark-border
                text-primary-600 dark:text-primary-500
                focus:ring-primary-500 dark:focus:ring-primary-600
                focus:ring-opacity-50 transition
                ${sizeClasses[checkboxSize]}
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
              `}
              disabled={disabled}
              required={required}
              checked={checked}
              defaultChecked={defaultChecked}
              onChange={onChange}
              aria-invalid={!!error}
              aria-describedby={error ? `${checkboxId}-error` : helperText ? `${checkboxId}-helper` : undefined}
              {...props}
            />
          </div>
          
          {label && (
            <div className="ml-2">
              <label
                htmlFor={checkboxId}
                className={`
                  ${labelSizeClasses[checkboxSize]}
                  ${disabled ? 'text-gray-500 cursor-not-allowed' : 'text-gray-700 dark:text-dark-text-primary cursor-pointer'}
                  ${error ? 'text-red-500' : ''}
                  ${labelClassName}
                `}
              >
                {label}
                {required && <span className="ml-1 text-red-500">*</span>}
              </label>
            </div>
          )}
        </div>
        
        {error && (
          <p id={`${checkboxId}-error`} className="mt-1 text-sm text-red-500">
            {error}
          </p>
        )}
        
        {helperText && !error && (
          <p id={`${checkboxId}-helper`} className="mt-1 text-sm text-gray-500 dark:text-dark-text-secondary">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;