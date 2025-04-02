// src/features/invoices/invoiceDetail/components/InvoiceCategories.tsx
import React, { useState } from 'react';
import { deleteCategory, fetchCategories } from '../../invoices/invoicesApi';

interface InvoiceCategoriesProps {
  categories: string[];
  availableCategories: string[];
  newCategory: string;
  setNewCategory: (category: string) => void;
  setCategories: (categories: string[]) => void;
  setAvailableCategories?: (categories: string[]) => void; // New prop to update available categories
  handleCategoryChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleAddCategory: () => void;
  removeCategory: (category: string) => void;
}

const InvoiceCategories: React.FC<InvoiceCategoriesProps> = ({
  categories,
  availableCategories,
  newCategory,
  setNewCategory,
  setCategories,
  setAvailableCategories,
  handleCategoryChange,
  handleAddCategory,
  removeCategory
}) => {
  // States for category deletion
  const [pendingDeleteCategory, setPendingDeleteCategory] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);

  // Function to handle category deletion from database
  const handleDeleteCategory = async (categoryName: string) => {
    try {
      setIsDeleting(true);
      setDeleteError(null);
      
      // API call to delete the category
      await deleteCategory(categoryName);
      
      // Remove from current invoice if it's selected
      if (categories.includes(categoryName)) {
        setCategories(categories.filter(cat => cat !== categoryName));
      }
      
      // Refresh available categories from server
      const updatedCategories = await fetchCategories();
      if (setAvailableCategories) {
        setAvailableCategories(updatedCategories);
      }
      
      // Show success message
      setDeleteSuccess(`Category "${categoryName}" has been deleted from the database.`);
      
      // Clear the pending delete state
      setPendingDeleteCategory(null);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setDeleteSuccess(null);
      }, 3000);
      
    } catch (error) {
      console.error('Error deleting category:', error);
      setDeleteError(`Failed to delete category. ${error instanceof Error ? error.message : ''}`);
      
      // Clear error message after 5 seconds
      setTimeout(() => {
        setDeleteError(null);
      }, 5000);
    } finally {
      setIsDeleting(false);
    }
  };

  // Cancel deletion
  const cancelDelete = () => {
    setPendingDeleteCategory(null);
  };

  return (
    <div>
      <h3 className="text-lg font-medium mt-6 mb-4 dark:text-white">Categories</h3>
      
      {/* Success message */}
      {deleteSuccess && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 rounded text-sm text-green-700 dark:text-green-300">
          {deleteSuccess}
        </div>
      )}
      
      {/* Error message */}
      {deleteError && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded text-sm text-red-700 dark:text-red-300">
          {deleteError}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Categories</label>
          
          {/* Selected categories with remove option */}
          <div className="flex flex-wrap gap-2 mb-2">
            {categories.map((category) => (
              <div 
                key={category} 
                className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full text-sm flex items-center"
              >
                {category}
                <button 
                  className="ml-1 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200 focus:outline-none"
                  onClick={() => removeCategory(category)}
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
              className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border-0 rounded-l-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white"
              placeholder="Add a new category"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddCategory();
                }
              }}
            />
            <button
              type="button"
              onClick={handleAddCategory}
              className="px-3 py-2 bg-green-500 text-white rounded-r-md hover:bg-green-600 focus:outline-none"
            >
              Add
            </button>
          </div>
          
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mt-3 mb-1">
            Available Categories 
            <span className="text-xs font-normal ml-1 text-gray-400 dark:text-gray-500">
              (hover to see delete option)
            </span>
          </label>
          
          {/* Available categories list with delete option */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-md max-h-52 overflow-y-auto">
            {availableCategories.length === 0 ? (
              <div className="p-4 text-gray-500 dark:text-gray-400 text-center">
                No categories available
              </div>
            ) : (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {availableCategories.map((category) => (
                  <li 
                    key={category}
                    className="px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 flex justify-between items-center group"
                  >
                    <span 
                      className="text-gray-700 dark:text-gray-300 cursor-pointer"
                      onClick={() => {
                        if (!categories.includes(category)) {
                          setCategories([...categories, category]);
                        }
                      }}
                    >
                      {category}
                    </span>
                    
                    {/* Delete button (visible on hover) */}
                    <button
                      className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 focus:outline-none transition-opacity"
                      onClick={() => setPendingDeleteCategory(category)}
                      aria-label={`Delete ${category} category from database`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Click on a category to add it to this invoice.
          </p>
          
          {/* Multiple selection option */}
          <div className="mt-3">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Or select multiple categories:
            </label>
            <select
              multiple
              value={categories}
              onChange={handleCategoryChange}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border-0 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white"
              style={{ height: "100px" }}
            >
              {availableCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Hold Ctrl (or Cmd on Mac) to select multiple categories
            </p>
          </div>
        </div>
      </div>
      
      {/* Confirmation dialog for category deletion */}
      {pendingDeleteCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-lg font-medium text-red-600 dark:text-red-400 mb-4">Confirm Category Deletion</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Are you sure you want to permanently delete the category <strong>"{pendingDeleteCategory}"</strong> from the database? 
              This cannot be undone and will remove this category from all invoices.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none"
                onClick={cancelDelete}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none"
                onClick={() => handleDeleteCategory(pendingDeleteCategory)}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  'Delete Permanently'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceCategories;