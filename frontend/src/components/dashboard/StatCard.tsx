// src/components/dashboard/StatCard.tsx
import React from 'react';
import { ThemeContext } from '../../context/ThemeContext';

type ColorType = 'blue' | 'indigo' | 'purple' | 'pink';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: ColorType;
  percentage?: number;
  trend?: 'up' | 'down';
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon, 
  color, 
  percentage, 
  trend 
}) => {
  // Map color prop to tailwind classes for both light and dark mode
  const getColorClasses = (): { bg: string; icon: string } => {
    const colorMap: Record<ColorType, { bg: string; icon: string }> = {
      blue: {
        bg: 'from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700',
        icon: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200',
      },
      indigo: {
        bg: 'from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-700',
        icon: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-200',
      },
      purple: {
        bg: 'from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700',
        icon: 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-200',
      },
      pink: {
        bg: 'from-pink-500 to-pink-600 dark:from-pink-600 dark:to-pink-700',
        icon: 'bg-pink-100 text-pink-600 dark:bg-pink-900 dark:text-pink-200',
      },
    };
    
    return colorMap[color] || colorMap.indigo;
  };
  
  const colorClasses = getColorClasses();
  
  return (
    <div className={`rounded-lg shadow overflow-hidden bg-gradient-to-r ${colorClasses.bg}`}>
      <div className="p-5 text-center">
        <div className={`inline-flex items-center justify-center h-14 w-14 rounded-full mb-4 ${colorClasses.icon}`} style={{overflow: 'hidden'}}>
          <div className="dashboard-icon" style={{width: '24px', height: '24px'}}>{icon}</div>
        </div>
        <h3 className="text-3xl font-bold text-white">{value}</h3>
        <p className="text-indigo-100 dark:text-indigo-200">{title}</p>
        
        {percentage !== undefined && (
          <div className="mt-2 flex items-center justify-center">
            {trend === 'up' ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-300" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-300" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
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

export default StatCard;