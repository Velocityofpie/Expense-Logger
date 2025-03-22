// src/components/invoice/filters/StatusFilter.tsx
import React from 'react';

interface StatusFilterProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
}

export const StatusFilter: React.FC<StatusFilterProps> = ({ 
  value, 
  onChange, 
  options 
}) => {
  return (
    <div>
      <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Status
      </label>
      <select
        id="status-filter"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full py-2 px-3 border border-gray-300 bg-white dark:bg-dark-card dark:border-dark-border dark:text-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
      >
        <option value="All">All Statuses</option>
        {options.map(status => (
          <option key={status} value={status}>{status}</option>
        ))}
      </select>
    </div>
  );
};