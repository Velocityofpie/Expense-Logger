// src/components/navigation/NavbarContainer.tsx
import React, { ReactNode } from 'react';
import { ThemeContext } from '../../context/ThemeContext';

interface NavbarContainerProps {
  children: ReactNode;
  className?: string;
}

const NavbarContainer: React.FC<NavbarContainerProps> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <nav className={`bg-gray-800 dark:bg-dark-nav shadow-md transition-colors duration-200 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </nav>
  );
};

export default NavbarContainer;