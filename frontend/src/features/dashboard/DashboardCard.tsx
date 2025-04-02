// src/features/dashboard/DashboardCard.tsx
import React, { useContext } from 'react';
import { ThemeContext } from '../../context/ThemeContext';
import { DashboardCardProps } from './types';
import './dashboard.css';

const DashboardCard: React.FC<DashboardCardProps> = ({
  title, 
  value, 
  icon, 
  color, 
  percentage, 
  trend
}) => {
  const { darkMode } = useContext(ThemeContext);
  
  // Map color prop to tailwind classes for both light and dark mode
  const getColorClasses = () => {
    const colorMap = {
      blue: {
        bg: darkMode ? 'from-blue-600 to-blue-700' : 'from-blue-500 to-blue-600',
        icon: 'bg-white/20 text-white',
      },
      indigo: {
        bg: darkMode ? 'from-indigo-600 to-indigo-700' : 'from-indigo-500 to-indigo-600',
        icon: 'bg-white/20 text-white',
      },
      purple: {
        bg: darkMode ? 'from-purple-600 to-purple-700' : 'from-purple-500 to-purple-600',
        icon: 'bg-white/20 text-white',
      },
      pink: {
        bg: darkMode ? 'from-pink-600 to-pink-700' : 'from-pink-500 to-pink-600',
        icon: 'bg-white/20 text-white',
      },
    };
    
    return colorMap[color] || colorMap.indigo;
  };
  
  const colorClasses = getColorClasses();
  
  return (
    <div className={`rounded-lg shadow-sm overflow-hidden bg-gradient-to-r ${colorClasses.bg}`}>
      <div className="p-5 text-center">
        {/* Simplified icon container - no nested div, no overflow:hidden */}
        <div className={`inline-flex items-center justify-center h-16 w-16 rounded-full mb-4 ${colorClasses.icon}`}>
          {icon}
        </div>
        
        <h3 className="text-3xl font-bold text-white">{value}</h3>
        <p className="text-white text-opacity-90 font-medium">{title}</p>
        
        {percentage !== undefined && (
          <div className="mt-2 flex items-center justify-center">
            {trend === 'up' ? (
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 text-green-300" 
                fill="none"
                viewBox="0 0 24 24" 
                stroke="currentColor"
                strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            ) : (
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 text-red-300" 
                fill="none"
                viewBox="0 0 24 24" 
                stroke="currentColor"
                strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            )}
            <span className={`text-sm ml-1 ${trend === 'up' ? 'text-green-300' : 'text-red-300'}`}>
              {percentage}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardCard;