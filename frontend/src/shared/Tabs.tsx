// src/shared/Tabs.tsx
import React, { useState } from 'react';

export interface TabsProps {
  activeTab: string;
  onChange: (tabId: string) => void;
  children: React.ReactNode;
  className?: string;
}

export interface TabProps {
  id: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
}

export const Tabs: React.FC<TabsProps> = ({
  activeTab,
  onChange,
  children,
  className = '',
}) => {
  return (
    <div className={`border-b border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="flex space-x-1 overflow-x-auto">
        {React.Children.map(children, (child) => {
          if (React.isValidElement<TabProps>(child)) {
            const isActive = activeTab === child.props.id;
            
            return (
              <button
                key={child.props.id}
                className={`px-4 py-2 text-sm font-medium border-b-2 focus:outline-none ${
                  isActive
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
                }`}
                onClick={() => onChange(child.props.id)}
              >
                <div className="flex items-center">
                  {child.props.icon && <span className="mr-2">{child.props.icon}</span>}
                  {child.props.label}
                </div>
              </button>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
};

export const Tab: React.FC<TabProps> = ({ id, label, icon }) => {
  // This component doesn't render anything itself,
  // it's just used to pass props to its parent Tabs component
  return null;
};

export default Tabs;