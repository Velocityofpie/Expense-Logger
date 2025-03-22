// src/components/common/PageContainer.tsx
import React, { ReactNode } from 'react';

interface PageContainerProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

const PageContainer: React.FC<PageContainerProps> = ({
  title,
  subtitle,
  actions,
  children,
  className = ''
}) => {
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-dark-text-primary">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 text-sm text-gray-500 dark:text-dark-text-secondary">
              {subtitle}
            </p>
          )}
        </div>
        {actions && (
          <div className="mt-3 md:mt-0 flex flex-wrap gap-3">
            {actions}
          </div>
        )}
      </div>
      
      <div>
        {children}
      </div>
    </div>
  );
};

export default PageContainer;