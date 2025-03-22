// src/components/invoice/filters/InvoiceFilterBar.tsx
import React from 'react';
import { CategoryFilter } from './CategoryFilter';
import { StatusFilter } from './StatusFilter';

interface InvoiceFilters {
  status: string;
  category: string;
  searchTerm: string;
}

interface InvoiceFilterBarProps {
  filters: InvoiceFilters;
  onFilterChange: (field: keyof InvoiceFilters, value: string) => void;
  availableCategories: string[];
  statusOptions: string[];
}

export const InvoiceFilterBar: React.FC<InvoiceFilterBarProps> = ({
  filters,
  onFilterChange,
  availableCategories,
  statusOptions
}) => {
  return (
    <div className="bg-white dark:bg-dark-card rounded-lg shadow-sm p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Search
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              id="search"
              name="search"
              value={filters.searchTerm}
              onChange={(e) => onFilterChange('searchTerm', e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white dark:bg-dark-card dark:border-dark-border dark:text-white placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="Search by order #, merchant..."
            />
          </div>
        </div>
        
        <StatusFilter 
          value={filters.status} 
          onChange={(value) => onFilterChange('status', value)} 
          options={statusOptions} 
        />
        
        <CategoryFilter 
          value={filters.category} 
          onChange={(value) => onFilterChange('category', value)} 
          categories={availableCategories} 
        />
      </div>
    </div>
  );
};