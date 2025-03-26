// dashboard/DashboardCard.tsx - Dashboard card component
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
        icon: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200',
      },
      indigo: {
        bg: darkMode ? 'from-indigo-600 to-indigo-700' : 'from-indigo-500 to-indigo-600',
        icon: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-200',
      },
      purple: {
        bg: darkMode ? 'from-purple-600 to-purple-700' : 'from-purple-500 to-purple-600',
        icon: 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-200',
      },
      pink: {
        bg: darkMode ? 'from-pink-600 to-pink-700' : 'from-pink-500 to-pink-600',
        icon: 'bg-pink-100 text-pink-600 dark:bg-pink-900 dark:text-pink-200',
      },
    };
    
    return colorMap[color] || colorMap.indigo;
  };
  
  const colorClasses = getColorClasses();
  
  return (
    <div className={`rounded-lg shadow overflow-hidden bg-gradient-to-r ${colorClasses.bg}`}>
      <div className="p-5 text-center">
        <div 
          className={`inline-flex items-center justify-center h-14 w-14 rounded-full mb-4 ${colorClasses.icon}`} 
          style={{overflow: 'hidden'}}
        >
          <div className="dashboard-icon" style={{width: '24px', height: '24px'}}>{icon}</div>
        </div>
        <h3 className="text-3xl font-bold text-white">{value}</h3>
        <p className="text-indigo-100 dark:text-indigo-200">{title}</p>
        
        {percentage !== undefined && (
          <div className="mt-2 flex items-center justify-center">
            {trend === 'up' ? (
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 text-green-300" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path 
                  fillRule="evenodd" 
                  d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" 
                  clipRule="evenodd" 
                />
              </svg>
            ) : (
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 text-red-300" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path 
                  fillRule="evenodd" 
                  d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" 
                  clipRule="evenodd" 
                />
              </svg>
            )}
            <span className={`text-sm ${trend === 'up' ? 'text-green-300' : 'text-red-300'}`}>
              {percentage}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardCard;