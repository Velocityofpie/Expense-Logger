// src/features/invoiceDetails/components/CategoryManagementModal.tsx
// This file will be placed directly in the invoiceDetails components folder

import React, { useState, useEffect } from 'react';
import { fetchCategories, deleteCategory } from '../../invoices/invoicesApi';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from '../../../shared';

interface CategoryManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCategoryDeleted?: () => void;
}

const CategoryManagementModal: React.FC<CategoryManagementModalProps> = ({ 
  isOpen, 
  onClose,
  onCategoryDeleted 
}) => {
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  // Load categories when the modal opens
  useEffect(() => {
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  const loadCategories = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await fetchCategories();
      setCategories(data);
    } catch (err) {
      setError('Failed to load categories. Please try again.');
      console.error('Error loading categories:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSelect = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleSelectAll = () => {
    if (selectedCategories.length === categories.length) {
      // Deselect all
      setSelectedCategories([]);
    } else {
      // Select all
      setSelectedCategories([...categories]);
    }
  };

  const confirmDeleteCategory = (category: string) => {
    setCategoryToDelete(category);
    setShowConfirmDialog(true);
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;
    
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      // URL encode the category name to handle special characters
      const encodedCategoryName = encodeURIComponent(categoryToDelete);
      await deleteCategory(encodedCategoryName);
      
      // Update local state after successful delete
      setCategories(prev => prev.filter(c => c !== categoryToDelete));
      setSelectedCategories(prev => prev.filter(c => c !== categoryToDelete));
      
      // Show success message
      setSuccessMessage(`Category "${categoryToDelete}" has been deleted.`);
      
      // Notify parent component
      if (onCategoryDeleted) {
        onCategoryDeleted();
      }
      
      // Close confirmation dialog
      setShowConfirmDialog(false);
      setCategoryToDelete(null);
    } catch (err) {
      setError(`Failed to delete category "${categoryToDelete}". It may be in use by invoices.`);
      console.error('Error deleting category:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalHeader modalTitle="Manage Categories" onClose={onClose} />
        <ModalBody>
          {isLoading && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          )}
          
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 mb-4">
              <p className="text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}
          
          {successMessage && (
            <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4 mb-4">
              <p className="text-green-700 dark:text-green-400">{successMessage}</p>
            </div>
          )}
          
          <div className="mb-4 flex justify-between items-center">
            <div>
              <span className="text-gray-700 dark:text-gray-300">
                {categories.length} categories found
              </span>
            </div>
            <div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleSelectAll}
                disabled={categories.length === 0}
              >
                {selectedCategories.length === categories.length && categories.length > 0
                  ? "Deselect All"
                  : "Select All"
                }
              </Button>
            </div>
          </div>
          
          {categories.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No categories found.
            </div>
          ) : (
            <div className="border rounded-md dark:border-gray-700 overflow-hidden">
              <div className="grid grid-cols-12 bg-gray-50 dark:bg-gray-700 px-4 py-2 border-b dark:border-gray-600">
                <div className="col-span-1">
                  {/* Select column */}
                </div>
                <div className="col-span-8 font-medium text-gray-700 dark:text-gray-300">
                  Category Name
                </div>
                <div className="col-span-3 font-medium text-gray-700 dark:text-gray-300 text-right">
                  Actions
                </div>
              </div>
              
              <div className="max-h-96 overflow-y-auto">
                {categories.map((category) => (
                  <div 
                    key={category}
                    className="grid grid-cols-12 px-4 py-3 border-b dark:border-gray-700 items-center hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <div className="col-span-1">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category)}
                        onChange={() => handleToggleSelect(category)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                      />
                    </div>
                    <div className="col-span-8 text-gray-800 dark:text-gray-200">
                      {category}
                    </div>
                    <div className="col-span-3 text-right">
                      <Button
                        variant="danger" 
                        size="xs"
                        onClick={() => confirmDeleteCategory(category)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
      
      {/* Confirmation Dialog */}
      <Modal 
        isOpen={showConfirmDialog} 
        onClose={() => setShowConfirmDialog(false)}
        size="sm"
      >
        <ModalHeader 
          modalTitle="Confirm Deletion" 
          onClose={() => setShowConfirmDialog(false)} 
        />
        <ModalBody>
          <p className="text-gray-700 dark:text-gray-300">
            Are you sure you want to delete the category <strong>"{categoryToDelete}"</strong>?
          </p>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            This will permanently remove the category from the database. If this category is used in any invoices, they will be updated to remove this category.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button 
            variant="outline" 
            onClick={() => setShowConfirmDialog(false)}
            className="mr-2"
          >
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDeleteCategory}
            isLoading={isLoading}
            loadingText="Deleting..."
          >
            Delete
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default CategoryManagementModal;