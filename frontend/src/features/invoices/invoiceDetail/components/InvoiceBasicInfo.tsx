// src/features/invoices/invoiceDetail/components/InvoiceBasicInfo.tsx
import React, { useState } from 'react';
import { Invoice } from '../../types';
import InvoiceCategories from './InvoiceCategories';

interface InvoiceBasicInfoProps {
  invoice: Invoice;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleDatePaste: (e: React.ClipboardEvent<HTMLInputElement>) => void;
  tags: string[];
  categories: string[];
  availableTags: string[];
  availableCategories: string[];
  setTags: (tags: string[]) => void;
  setCategories: (categories: string[]) => void;
}

const InvoiceBasicInfo: React.FC<InvoiceBasicInfoProps> = ({
  invoice,
  handleInputChange,
  handleDatePaste,
  tags,
  categories,
  availableTags,
  availableCategories,
  setTags,
  setCategories
}) => {
  const [newTag, setNewTag] = useState('');
  const [newCategory, setNewCategory] = useState('');

  // Handle tag selection
  const handleTagChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = Array.from(e.target.selectedOptions, option => option.value);
    setTags(value);
  };

  // Handle category selection
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = Array.from(e.target.selectedOptions, option => option.value);
    setCategories(value);
  };
  
  // Add a new tag
  const handleAddTag = () => {
    if (!newTag.trim()) return;
    
    // Check if tag already exists
    if (availableTags.includes(newTag.trim())) {
      // If it exists, just select it
      if (!tags.includes(newTag.trim())) {
        setTags([...tags, newTag.trim()]);
      }
    } else {
      // If it doesn't exist, add it to the available tags and select it
      const updatedTags = [...availableTags, newTag.trim()];
      // Here you would typically call an API to add the new tag
      // For now, we just update the local state
      setTags([...tags, newTag.trim()]);
    }
    
    // Clear the input
    setNewTag('');
  };
  
  // Add a new category
  const handleAddCategory = () => {
    if (!newCategory.trim()) return;
    
    // Check if category already exists
    if (availableCategories.includes(newCategory.trim())) {
      // If it exists, just select it
      if (!categories.includes(newCategory.trim())) {
        setCategories([...categories, newCategory.trim()]);
      }
    } else {
      // If it doesn't exist, add it to the available categories and select it
      const updatedCategories = [...availableCategories, newCategory.trim()];
      // Here you would typically call an API to add the new category
      // For now, we just update the local state
      setCategories([...categories, newCategory.trim()]);
    }
    
    // Clear the input
    setNewCategory('');
  };
  
  // Remove a tag
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  // Remove a category
  const removeCategory = (categoryToRemove: string) => {
    setCategories(categories.filter(category => category !== categoryToRemove));
  };

  // Array of valid statuses
  const VALID_STATUSES = ["Open", "Paid", "Draft", "Needs Attention", "Resolved"];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      <div className="p-6">
        <h3 className="text-lg font-medium mb-4 dark:text-white">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Order Number</label>
            <input
              type="text"
              name="order_number"
              value={invoice.order_number || ""}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border-0 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white"
              placeholder="Enter order number"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Purchase Date</label>
            <input
              type="date"
              name="purchase_date"
              value={invoice.purchase_date || ""}
              onChange={handleInputChange}
              onPaste={handleDatePaste}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border-0 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white"
            />
          </div>
          
          {/* Separate Merchant and File Name fields */}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Merchant Name</label>
            <input
              type="text"
              name="merchant_name"
              value={invoice.merchant_name || ""}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border-0 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white"
              placeholder="Enter merchant name"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">File Name</label>
            <input
              type="text"
              name="file_name"
              value={invoice.file_name || ""}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border-0 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white dark:opacity-75"
              placeholder="Original file name"
              disabled
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              File will be renamed automatically if merchant and order number are provided
            </p>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Grand Total</label>
            <div className="flex">
              <span className="inline-flex items-center px-3 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border-0 border-r-0 rounded-l-md">$</span>
              <input
                type="number"
                step="0.01"
                name="grand_total"
                value={invoice.grand_total || ""}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border-0 rounded-r-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white"
                placeholder="0.00"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Status</label>
            <select
              name="status"
              value={invoice.status || "Open"}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border-0 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white"
            >
              {VALID_STATUSES.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Payment Method</label>
            <input
              type="text"
              name="payment_method"
              value={invoice.payment_method || ""}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border-0 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white"
              placeholder="Enter payment method"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Notes</label>
            <textarea
              rows={3}
              name="notes"
              value={invoice.notes || ""}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border-0 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white"
              placeholder="Enter notes"
            />
          </div>
        </div>

        <h3 className="text-lg font-medium mt-6 mb-4 dark:text-white">Additional Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Shipping & Handling</label>
            <div className="flex">
              <span className="inline-flex items-center px-3 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border-0 border-r-0 rounded-l-md">$</span>
              <input
                type="number"
                step="0.01"
                name="shipping_handling"
                value={invoice.shipping_handling || ""}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border-0 rounded-r-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white"
                placeholder="0.00"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Estimated Tax</label>
            <div className="flex">
              <span className="inline-flex items-center px-3 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border-0 border-r-0 rounded-l-md">$</span>
              <input
                type="number"
                step="0.01"
                name="estimated_tax"
                value={invoice.estimated_tax || ""}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border-0 rounded-r-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white"
                placeholder="0.00"
              />
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Billing Address</label>
            <textarea
              rows={2}
              name="billing_address"
              value={invoice.billing_address || ""}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border-0 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white"
              placeholder="Enter billing address"
            />
          </div>
        </div>

        <div className="mt-6 space-y-6">
          <h3 className="text-lg font-medium dark:text-white">Tags & Categories</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tags Section with Add/Remove functionality */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Tags</label>
              
              {/* Selected tags with remove option */}
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag) => (
                  <div 
                    key={tag} 
                    className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-sm flex items-center"
                  >
                    {tag}
                    <button 
                      className="ml-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 focus:outline-none"
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
                  className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border-0 rounded-l-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white"
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
              
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mt-3 mb-1">Available Tags</label>
              <select
                multiple
                value={tags}
                onChange={handleTagChange}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border-0 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white"
                style={{ height: "100px" }}
              >
                {availableTags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Hold Ctrl (or Cmd on Mac) to select multiple tags
              </p>
            </div>
            
            {/* Categories Section with Add/Remove functionality */}
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
              
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mt-3 mb-1">Available Categories</label>
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
      </div>
    </div>
  );
};

export default InvoiceBasicInfo;