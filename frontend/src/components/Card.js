// frontend/src/components/Card.js
import React from 'react';

export const Card = ({ children, className = '', ...props }) => {
  return (
    <div 
      className={`bg-white dark:bg-dark-card rounded-lg shadow-sm dark:shadow-md 
                  border border-gray-100 dark:border-dark-border 
                  transition-colors duration-200 ${className}`} 
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, title, subtitle, actions, className = '', ...props }) => {
  return (
    <div 
      className={`px-5 py-4 border-b border-gray-100 dark:border-dark-border ${className}`} 
      {...props}
    >
      {children || (
        <div className="flex items-center justify-between">
          <div>
            {title && <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text-primary">{title}</h3>}
            {subtitle && <p className="text-sm text-gray-500 dark:text-dark-text-secondary mt-1">{subtitle}</p>}
          </div>
          {actions && <div className="flex space-x-2">{actions}</div>}
        </div>
      )}
    </div>
  );
};

export const CardBody = ({ children, className = '', ...props }) => {
  return (
    <div className={`p-5 ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardFooter = ({ children, className = '', ...props }) => {
  return (
    <div 
      className={`px-5 py-4 border-t border-gray-100 dark:border-dark-border ${className}`} 
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;