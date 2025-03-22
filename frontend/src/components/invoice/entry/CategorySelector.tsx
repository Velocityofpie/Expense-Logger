// src/components/invoice/entry/CategorySelector.tsx
import React, { useState } from 'react';
import Button from '../../../components/common/Button';

interface CategorySelectorProps {
  selectedCategories: string[];
  availableCategories: string[];
  onChange: (categories: string[]) => void;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  selectedCategories,
  availableCategories,
  onChange
}) => {
  const [newCategory, setNewCategory] = useState<string>('');
  
  const handleCategorySelect = (category: string) => {
    // Add to selected if not already selected
    if (!selectedCategories.includes(category)) {
      onChange([...selectedCategories, category]);
    }
  };
  
  const handleCategoryRemove = (category: string) => {
    onChange(selectedCategories.filter(c => c !== category));
  };
  
  const handleAddNewCategory = () => {
    if (!newCategory.trim()) return;
    
    // Check if category already exists
    if (!availableCategories.includes(newCategory.trim())) {
      // Would typically call an API to add the category here
      // For this example, just add it to the selection
      handleCategorySelect(newCategory.trim());
    } else {
      handleCategorySelect(newCategory.trim());
    }
    
    setNewCategory('');
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddNewCategory();
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Categories
      </label>
      
      {/* Selected categories */}
      <div className="flex flex-wrap gap-2 mb-3">
        {selectedCategories.map(category => (
          <div 
            key={category} 
            className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full text-sm flex items-center"
          >
            {category}
            <button 
              type="button"
              onClick={() => handleCategoryRemove(category)}
              className="ml-1 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 focus:outline-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
      
      {/* Add new category */}
      <div className="flex">
        <input
          type="text"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          onKeyPress={handleKeyPress}
          className="block w-full py-2 px-3 border border-gray-300 bg-white dark:bg-dark-card dark:border-dark-border dark:text-white rounded-l-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          placeholder="Add a category"
        />
        <Button
          type="button"
          variant="primary"
          onClick={handleAddNewCategory}
          className="rounded-l-none"
        >
          Add
        </Button>
      </div>
      
      {/* Available categories */}
      <div className="mt-3">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Available Categories
        </label>
        <div className="flex flex-wrap gap-2">
          {availableCategories
            .filter(category => !selectedCategories.includes(category))
            .map(category => (
              <button
                key={category}
                type="button"
                onClick={() => handleCategorySelect(category)}
                className="bg-gray-100 dark:bg-gray-800 hover:bg-green-100 dark:hover:bg-green-900 text-gray-800 dark:text-gray-200 hover:text-green-800 dark:hover:text-green-200 px-2 py-1 rounded-md text-sm transition-colors"
              >
                {category}
              </button>
            ))}
        </div>
      </div>
    </div>
  );
};