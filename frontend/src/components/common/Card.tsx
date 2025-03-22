import React from 'react';
import { CommonProps } from '../../types/common.types';

interface CardProps extends CommonProps {
  elevated?: boolean;
  noPadding?: boolean;
}

interface CardHeaderProps extends CommonProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
}

interface CardBodyProps extends CommonProps {
  noPadding?: boolean;
}

interface CardFooterProps extends CommonProps {}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  elevated = false,
  noPadding = false,
  ...props 
}) => {
  return (
    <div 
      className={`bg-white dark:bg-dark-card rounded-lg ${elevated ? 'shadow-md' : 'shadow-sm'} 
                  border border-gray-100 dark:border-dark-border 
                  transition-colors duration-200 ${noPadding ? '' : 'p-4'} ${className}`} 
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<CardHeaderProps> = ({ 
  children, 
  title, 
  subtitle, 
  actions, 
  className = '', 
  ...props 
}) => {
  return (
    <div 
      className={`px-5 py-4 border-b border-gray-100 dark:border-dark-border ${className}`} 
      {...props}
    >
      {children || (
        <div className="flex items-center justify-between">
          <div>
            {title && typeof title === 'string' ? (
              <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text-primary">{title}</h3>
            ) : (
              title
            )}
            {subtitle && typeof subtitle === 'string' ? (
              <p className="text-sm text-gray-500 dark:text-dark-text-secondary mt-1">{subtitle}</p>
            ) : (
              subtitle
            )}
          </div>
          {actions && <div className="flex space-x-2">{actions}</div>}
        </div>
      )}
    </div>
  );
};

export const CardBody: React.FC<CardBodyProps> = ({ 
  children, 
  className = '', 
  noPadding = false,
  ...props 
}) => {
  return (
    <div className={`${noPadding ? '' : 'p-5'} ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardFooter: React.FC<CardFooterProps> = ({ 
  children, 
  className = '', 
  ...props 
}) => {
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