// Update the Card.tsx file

import React, { forwardRef } from 'react';
import { CardProps, CardHeaderProps, CardBodyProps, CardFooterProps } from './types';

/**
 * Card component for grouping related content
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, className = '', hover = false, ...props }, ref) => {
    return (
      <div 
        ref={ref}
        className={`bg-white dark:bg-dark-card rounded-lg shadow-sm 
                    border border-gray-100 dark:border-dark-border 
                    transition-colors duration-200 
                    ${hover ? 'hover:shadow-md' : ''} 
                    ${className}`} 
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

/**
 * Card header component
 */
export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ children, headerTitle, subtitle, actions, className = '', ...props }, ref) => {
    return (
      <div 
        ref={ref}
        className={`px-5 py-4 border-b border-gray-100 dark:border-dark-border ${className}`} 
        {...props}
      >
        {children || (
          <div className="flex items-center justify-between">
            <div>
              {headerTitle && <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text-primary">{headerTitle}</h3>}
              {subtitle && <p className="text-sm text-gray-500 dark:text-dark-text-secondary mt-1">{subtitle}</p>}
            </div>
            {actions && <div className="flex space-x-2">{actions}</div>}
          </div>
        )}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

/**
 * Card body component
 */
export const CardBody = forwardRef<HTMLDivElement, CardBodyProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <div 
        ref={ref}
        className={`p-5 ${className}`} 
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardBody.displayName = 'CardBody';

/**
 * Card footer component
 */
export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <div 
        ref={ref}
        className={`px-5 py-4 border-t border-gray-100 dark:border-dark-border ${className}`} 
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardFooter.displayName = 'CardFooter';

export default Card;