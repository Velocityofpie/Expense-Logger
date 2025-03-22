// src/components/dashboard/DashboardFilters.tsx
import React from 'react';

interface FilterOption {
  value: string;
  label: string;
}

interface DashboardFiltersProps {
  yearOptions: FilterOption[];
  statusOptions: FilterOption[];
  selectedYear: string;
  selectedStatus: string;
  onYearChange: (year: string) => void;
  onStatusChange: (status: string) => void;
  onChartTypeChange: (type: 'monthly' | 'area') => void;
  activeChart: 'monthly' | 'area';
}

const DashboardFilters: React.FC<DashboardFiltersProps> = ({
  yearOptions,
  statusOptions,
  selectedYear,
  selectedStatus,
  onYearChange,
  onStatusChange,
  onChartTypeChange,
  activeChart
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm px-5 py-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="md:col-span-2">
          <label htmlFor="year" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Filter by Year
          </label>
          <select
            id="year"
            name="year"
            value={selectedYear}
            onChange={(e) => onYearChange(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
          >
            {yearOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Filter by Status
          </label>
          <select
            id="status"
            name="status"
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
        <div className="md:col-span-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Chart Type
          </label>
          <div className="flex space-x-2">
            <button
              onClick={() => onChartTypeChange('monthly')}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-md ${
                activeChart === 'monthly'
                ? 'bg-primary-600 text-white'
                : 'bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600'
              }`}
              aria-label="Bar chart view"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </button>
            <button
              onClick={() => onChartTypeChange('area')}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-md ${
                activeChart === 'area'
                ? 'bg-primary-600 text-white'
                : 'bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600'
              }`}
              aria-label="Area chart view"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardFilters;