import React, { forwardRef } from 'react';
import { TextInputProps } from '../../../types/common.types';
import { formatISODate } from '../../../services/formatters/dateFormatter';

interface DatePickerProps extends Omit<TextInputProps, 'type'> {
  label?: string;
  error?: string;
  helperText?: string;
  inputSize?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  minDate?: string;
  maxDate?: string;
  showWeekNumbers?: boolean;
  dateFormat?: string;
  inline?: boolean;
  allowClear?: boolean;
  showTodayButton?: boolean;
}

const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  (
    {
      label,
      error,
      helperText,
      inputSize = 'md',
      fullWidth = false,
      className = '',
      disabled = false,
      required = false,
      id,
      name,
      value,
      onChange,
      onBlur,
      onFocus,
      minDate,
      maxDate,
      placeholder = 'Select date...',
      ...props
    },
    ref
  ) => {
    // Generate an ID if not provided
    const inputId = id || name || `datepicker-${Math.random().toString(36).substring(2, 9)}`;
    
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
    
    // Handle date change
    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onChange) {
        onChange(e);
      }
    };
    
    // Format the date value to ISO format (YYYY-MM-DD) if it's a different format
    const formattedValue = value && typeof value === 'string' && !value.match(/^\d{4}-\d{2}-\d{2}$/) 
      ? formatISODate(value) 
      : value;
    
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
          <input
            ref={ref}
            id={inputId}
            name={name}
            type="date"
            className={`
              block bg-white dark:bg-dark-card rounded-md shadow-sm 
              ${sizeClasses[inputSize]} 
              ${errorClasses} 
              ${disabled ? 'bg-gray-100 dark:bg-gray-800 text-gray-500 cursor-not-allowed' : ''}
              ${widthClass}
            `}
            value={formattedValue as string}
            onChange={handleDateChange}
            onBlur={onBlur}
            onFocus={onFocus}
            disabled={disabled}
            required={required}
            min={minDate}
            max={maxDate}
            placeholder={placeholder}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          />
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

DatePicker.displayName = 'DatePicker';

export default DatePicker;