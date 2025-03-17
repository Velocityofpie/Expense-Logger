// frontend/src/components/PageContainer.js
import React, { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';

const PageContainer = ({ title, children, actions }) => {
  const { darkMode } = useContext(ThemeContext);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-dark-text-primary">
          {title}
        </h1>
        {actions && (
          <div className="flex space-x-3">
            {actions}
          </div>
        )}
      </div>
      
      {children}
    </div>
  );
};

export default PageContainer;