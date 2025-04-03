// src/features/invoiceDetails/components/TagManagementModal.tsx
import React, { useState, useEffect } from 'react';
import { fetchTags, deleteTag } from '../../invoices/invoicesApi';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from '../../../shared';

interface TagManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTagDeleted?: () => void;
}

const TagManagementModal: React.FC<TagManagementModalProps> = ({ 
  isOpen, 
  onClose,
  onTagDeleted 
}) => {
  const [tags, setTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [tagToDelete, setTagToDelete] = useState<string | null>(null);

  // Load tags when the modal opens
  useEffect(() => {
    if (isOpen) {
      loadTags();
    }
  }, [isOpen]);

  const loadTags = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await fetchTags();
      setTags(data);
    } catch (err) {
      setError('Failed to load tags. Please try again.');
      console.error('Error loading tags:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSelect = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleSelectAll = () => {
    if (selectedTags.length === tags.length) {
      // Deselect all
      setSelectedTags([]);
    } else {
      // Select all
      setSelectedTags([...tags]);
    }
  };

  const confirmDeleteTag = (tag: string) => {
    setTagToDelete(tag);
    setShowConfirmDialog(true);
  };

  const handleDeleteTag = async () => {
    if (!tagToDelete) return;
    
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      // URL encode the tag name to handle special characters
      const encodedTagName = encodeURIComponent(tagToDelete);
      await deleteTag(encodedTagName);
      
      // Update local state after successful delete
      setTags(prev => prev.filter(t => t !== tagToDelete));
      setSelectedTags(prev => prev.filter(t => t !== tagToDelete));
      
      // Show success message
      setSuccessMessage(`Tag "${tagToDelete}" has been deleted.`);
      
      // Notify parent component
      if (onTagDeleted) {
        onTagDeleted();
      }
      
      // Close confirmation dialog
      setShowConfirmDialog(false);
      setTagToDelete(null);
    } catch (err) {
      setError(`Failed to delete tag "${tagToDelete}". It may be in use by invoices.`);
      console.error('Error deleting tag:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalHeader modalTitle="Manage Tags" onClose={onClose} />
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
                {tags.length} tags found
              </span>
            </div>
            <div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleSelectAll}
                disabled={tags.length === 0}
              >
                {selectedTags.length === tags.length && tags.length > 0
                  ? "Deselect All"
                  : "Select All"
                }
              </Button>
            </div>
          </div>
          
          {tags.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No tags found.
            </div>
          ) : (
            <div className="border rounded-md dark:border-gray-700 overflow-hidden">
              <div className="grid grid-cols-12 bg-gray-50 dark:bg-gray-700 px-4 py-2 border-b dark:border-gray-600">
                <div className="col-span-1">
                  {/* Select column */}
                </div>
                <div className="col-span-8 font-medium text-gray-700 dark:text-gray-300">
                  Tag Name
                </div>
                <div className="col-span-3 font-medium text-gray-700 dark:text-gray-300 text-right">
                  Actions
                </div>
              </div>
              
              <div className="max-h-96 overflow-y-auto">
                {tags.map((tag) => (
                  <div 
                    key={tag}
                    className="grid grid-cols-12 px-4 py-3 border-b dark:border-gray-700 items-center hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <div className="col-span-1">
                      <input
                        type="checkbox"
                        checked={selectedTags.includes(tag)}
                        onChange={() => handleToggleSelect(tag)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                      />
                    </div>
                    <div className="col-span-8 text-gray-800 dark:text-gray-200">
                      {tag}
                    </div>
                    <div className="col-span-3 text-right">
                      <Button
                        variant="danger" 
                        size="xs"
                        onClick={() => confirmDeleteTag(tag)}
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
            Are you sure you want to delete the tag <strong>"{tagToDelete}"</strong>?
          </p>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            This will permanently remove the tag from the database. If this tag is used in any invoices, they will be updated to remove this tag.
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
            onClick={handleDeleteTag}
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

export default TagManagementModal;