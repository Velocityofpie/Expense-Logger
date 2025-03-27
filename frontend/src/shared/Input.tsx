// src/shared/Input.tsx
import React, { forwardRef, InputHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', error, ...props }, ref) => {
    return (
      <>
        <input
          ref={ref}
          className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                      focus:outline-none focus:ring-primary-500 focus:border-primary-500 
                      dark:bg-gray-700 dark:border-gray-600 dark:text-white 
                      ${error ? 'border-red-500' : ''} 
                      ${className}`}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </>
    );
  }
);

Input.displayName = 'Input';

export default Input;