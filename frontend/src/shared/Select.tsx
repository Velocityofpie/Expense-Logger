// src/shared/Select.tsx
import React, { forwardRef, SelectHTMLAttributes } from 'react';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  className?: string;
  error?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', children, error, ...props }, ref) => {
    return (
      <>
        <select
          ref={ref}
          className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                      focus:outline-none focus:ring-primary-500 focus:border-primary-500 
                      dark:bg-gray-700 dark:border-gray-600 dark:text-white 
                      ${error ? 'border-red-500' : ''} 
                      ${className}`}
          {...props}
        >
          {children}
        </select>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </>
    );
  }
);

Select.displayName = 'Select';

export default Select;