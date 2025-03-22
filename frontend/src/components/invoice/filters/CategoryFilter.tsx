// src/components/invoice/filters/CategoryFilter.tsx
import React from 'react';

interface CategoryFilterProps {
  value: string;
  onChange: (value: string) => void;
  categories: string[];
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({ 
  value, 
  onChange, 
  categories 
}) => {
  return (
    <div>
      <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Category
      </label>
      <select
        id="category-filter"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full py-2 px-3 border border-gray-300 bg-white dark:bg-dark-card dark:border-dark-border dark:text-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
      >
        <option value="All">All Categories</option>
        {categories.map(category => (
          <option key={category} value={category}>{category}</option>
        ))}
      </select>
    </div>
  );
};