// src/features/invoices/invoiceDetail/components/InvoiceCategories.tsx
import React from 'react';

interface InvoiceCategoriesProps {
  tags: string[];
  categories: string[];
  availableTags: string[];
  availableCategories: string[];
  newTag: string;
  newCategory: string;
  setNewTag: (tag: string) => void;
  setNewCategory: (category: string) => void;
  handleTagChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleCategoryChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleAddTag: () => void;
  handleAddCategory: () => void;
  removeTag: (tag: string) => void;
  removeCategory: (category: string) => void;
}

const InvoiceCategories: React.FC<InvoiceCategoriesProps> = ({
  tags,
  categories,
  availableTags,
  availableCategories,
  newTag,
  newCategory,
  setNewTag,
  setNewCategory,
  handleTagChange,
  handleCategoryChange,
  handleAddTag,
  handleAddCategory,
  removeTag,
  removeCategory
}) => {
  return (
    <div>
      <h3 className="text-lg font-medium mt-6 mb-4">Tags & Categories</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tags Section with Add/Remove functionality */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-2">Tags</label>
          
          {/* Selected tags with remove option */}
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag) => (
              <div 
                key={tag} 
                className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center"
              >
                {tag}
                <button 
                  className="ml-1 text-blue-600 hover:text-blue-800 focus:outline-none"
                  onClick={() => removeTag(tag)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
          
          {/* Add new tag */}
          <div className="flex">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              className="flex-1 px-3 py-2 bg-gray-50 border-0 rounded-l-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Add a new tag"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="px-3 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600 focus:outline-none"
            >
              Add
            </button>
          </div>
          
          <label className="block text-xs font-medium text-gray-500 mt-3 mb-1">Available Tags</label>
          <select
            multiple
            value={tags}
            onChange={handleTagChange}
            className="w-full px-3 py-2 bg-gray-50 border-0 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            style={{ height: "100px" }}
          >
            {availableTags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Hold Ctrl (or Cmd on Mac) to select multiple tags
          </p>
        </div>
        
        {/* Categories Section with Add/Remove functionality */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-2">Categories</label>
          
          {/* Selected categories with remove option */}
          <div className="flex flex-wrap gap-2 mb-2">
            {categories.map((category) => (
              <div 
                key={category} 
                className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm flex items-center"
              >
                {category}
                <button 
                  className="ml-1 text-green-600 hover:text-green-800 focus:outline-none"
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
              className="flex-1 px-3 py-2 bg-gray-50 border-0 rounded-l-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
          
          <label className="block text-xs font-medium text-gray-500 mt-3 mb-1">Available Categories</label>
          <select
            multiple
            value={categories}
            onChange={handleCategoryChange}
            className="w-full px-3 py-2 bg-gray-50 border-0 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            style={{ height: "100px" }}
          >
            {availableCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Hold Ctrl (or Cmd on Mac) to select multiple categories
          </p>
        </div>
      </div>
    </div>
  );
};

export default InvoiceCategories;