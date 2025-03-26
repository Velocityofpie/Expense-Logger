// frontend/src/layout/PageContainer.tsx
import React, { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import { PageContainerProps } from './types';

const PageContainer: React.FC<PageContainerProps> = ({ 
  title, 
  children, 
  actions,
  className = ''
}) => {
  const { darkMode } = useContext(ThemeContext);
  
  return (
    <div className={`space-y-6 ${className}`}>
      {(title || actions) && (
        <div className="flex justify-between items-center mb-4">
          {title && (
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-dark-text-primary">
              {title}
            </h1>
          )}
          {actions && (
            <div className="flex space-x-3">
              {actions}
            </div>
          )}
        </div>
      )}
      
      {children}
    </div>
  );
};

export default PageContainer;