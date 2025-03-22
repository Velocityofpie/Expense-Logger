// src/components/invoice/detail/InvoiceCategoriesEditor.tsx
import React, { useState } from 'react';
import Button from '../../../components/common/Button';

interface InvoiceCategoriesEditorProps {
  categories: string[];
  onCategoriesChange: (categories: string[]) => void;
  availableCategories: string[];
  onAddNewCategory: (category: string) => void;
}

export const InvoiceCategoriesEditor: React.FC<InvoiceCategoriesEditorProps> = ({
  categories,
  onCategoriesChange,
  availableCategories,
  onAddNewCategory
}) => {
  const [newCategory, setNewCategory] = useState<string>('');
  
  const handleCategorySelect = (category: string) => {
    if (!categories.includes(category)) {
      onCategoriesChange([...categories, category]);
    }
  };
  
  const handleCategoryRemove = (category: string) => {
    onCategoriesChange(categories.filter(c => c !== category));
  };
  
  const handleAddNewCategory = () => {
    if (!newCategory.trim()) return;
    
    if (!availableCategories.includes(newCategory.trim())) {
      // Add to available categories
      onAddNewCategory(newCategory.trim());
    }
    
    // Add to selected categories
    handleCategorySelect(newCategory.trim());
    
    // Reset input
    setNewCategory('');
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddNewCategory();
    }
  };

  return (
    <div className="bg-white dark:bg-dark-card rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Categories</h3>
      
      {/* Selected categories */}
      <div className="flex flex-wrap gap-2 mb-4">
        {categories.length > 0 ? (
          categories.map((category) => (
            <div 
              key={category} 
              className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-sm flex items-center"
            >
              {category}
              <button 
                type="button"
                onClick={() => handleCategoryRemove(category)}
                className="ml-2 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 focus:outline-none"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))
        ) : (
          <div className="text-gray-500 dark:text-gray-400">No categories selected</div>
        )}
      </div>
      
      {/* Add new category */}
      <div className="flex mb-4">
        <input
          type="text"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-l-md shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:outline-none"
          placeholder="Add a new category"
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

      <div>
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Available Categories
        </h4>
        <div className="flex flex-wrap gap-2">
          {availableCategories
            .filter(category => !categories.includes(category))
            .map(category => (
              <button
                key={category}
                type="button"
                onClick={() => handleCategorySelect(category)}
                className="bg-gray-100 dark:bg-gray-800 hover:bg-green-100 dark:hover:bg-green-900 text-gray-800 dark:text-gray-200 hover:text-green-800 dark:hover:text-green-200 px-3 py-1 rounded-md text-sm transition-colors"
              >
                {category}
              </button>
            ))}
        </div>
      </div>
    </div>
  );
};