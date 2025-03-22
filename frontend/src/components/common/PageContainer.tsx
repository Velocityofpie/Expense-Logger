import React from 'react';
import { CommonProps } from '../../types/common.types';

interface PageContainerProps extends CommonProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  breadcrumbs?: React.ReactNode;
  actions?: React.ReactNode;
  contentClassName?: string;
}

const PageContainer: React.FC<PageContainerProps> = ({
  title,
  description,
  breadcrumbs,
  actions,
  children,
  className = '',
  contentClassName = '',
  ...props
}) => {
  return (
    <div className={`space-y-6 ${className}`} {...props}>
      {/* Page Header */}
      {(breadcrumbs || title || description || actions) && (
        <div className="space-y-2 md:space-y-4">
          {/* Breadcrumbs */}
          {breadcrumbs && (
            <div className="mb-1">
              {breadcrumbs}
            </div>
          )}
          
          {/* Title and Actions */}
          {(title || actions) && (
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div>
                {title && typeof title === 'string' ? (
                  <h1 className="text-2xl font-semibold text-gray-900 dark:text-dark-text-primary">
                    {title}
                  </h1>
                ) : (
                  title
                )}
                
                {description && typeof description === 'string' ? (
                  <p className="mt-1 text-sm text-gray-500 dark:text-dark-text-secondary">
                    {description}
                  </p>
                ) : (
                  description
                )}
              </div>
              
              {actions && (
                <div className="mt-4 sm:mt-0 flex flex-wrap space-x-3">
                  {actions}
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Page Content */}
      <div className={contentClassName}>
        {children}
      </div>
    </div>
  );
};

export default PageContainer;