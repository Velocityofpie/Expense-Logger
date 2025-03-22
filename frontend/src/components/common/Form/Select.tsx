import React, { forwardRef } from 'react';
import { SelectProps } from '../../../types/common.types';

interface Option {
  value: string;
  label: string;
  disabled?: boolean;
}

interface OptionGroup {
  label: string;
  options: Option[];
}

interface ExtendedSelectProps extends Omit<SelectProps, 'options'> {
  label?: string;
  error?: string;
  helperText?: string;
  selectSize?: 'sm' | 'md' | 'lg';
  options?: Option[] | OptionGroup[];
  fullWidth?: boolean;
  isOptionGroup?: boolean;
}

const Select = forwardRef<HTMLSelectElement, ExtendedSelectProps>(
  (
    {
      label,
      error,
      helperText,
      selectSize = 'md',
      options = [],
      isOptionGroup = false,
      fullWidth = false,
      className = '',
      disabled = false,
      required = false,
      id,
      name,
      children,
      ...props
    },
    ref
  ) => {
    // Generate an ID if not provided
    const selectId = id || name || `select-${Math.random().toString(36).substring(2, 9)}`;
    
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
    
    // Check if the options prop is an array of OptionGroup
    const isGrouped = isOptionGroup || 
      (options.length > 0 && 'options' in options[0] && Array.isArray((options[0] as OptionGroup).options));
    
    return (
      <div className={`${widthClass} ${className}`}>
        {label && (
          <label 
            htmlFor={selectId} 
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
          <select
            ref={ref}
            id={selectId}
            name={name}
            className={`
              block bg-white dark:bg-dark-card rounded-md shadow-sm 
              appearance-none pl-3 pr-10
              ${sizeClasses[selectSize]} 
              ${errorClasses} 
              ${disabled ? 'bg-gray-100 dark:bg-gray-800 text-gray-500 cursor-not-allowed' : ''}
              ${widthClass}
            `}
            disabled={disabled}
            required={required}
            aria-invalid={!!error}
            aria-describedby={error ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined}
            {...props}
          >
            {children || (
              <>
                {isGrouped ? (
                  // Render option groups
                  (options as OptionGroup[]).map((group, groupIndex) => (
                    <optgroup key={`group-${groupIndex}`} label={group.label}>
                      {group.options.map((option, optionIndex) => (
                        <option 
                          key={`option-${groupIndex}-${optionIndex}`} 
                          value={option.value}
                          disabled={option.disabled}
                        >
                          {option.label}
                        </option>
                      ))}
                    </optgroup>
                  ))
                ) : (
                  // Render flat options
                  (options as Option[]).map((option, index) => (
                    <option 
                      key={`option-${index}`} 
                      value={option.value}
                      disabled={option.disabled}
                    >
                      {option.label}
                    </option>
                  ))
                )}
              </>
            )}
          </select>
          
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        
        {error && (
          <p id={`${selectId}-error`} className="mt-1 text-sm text-red-500">
            {error}
          </p>
        )}
        
        {helperText && !error && (
          <p id={`${selectId}-helper`} className="mt-1 text-sm text-gray-500 dark:text-dark-text-secondary">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;