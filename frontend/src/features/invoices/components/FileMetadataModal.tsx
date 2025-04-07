// src/features/invoices/components/FileMetadataModal.tsx
import React, { useState } from 'react';
import { 
  Modal, ModalHeader, ModalBody, ModalFooter, 
  Button, Input, Select, Badge, ClickableBadge, Checkbox 
} from '../../../shared';

interface FileMetadataModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string | null;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedTags: string[];
  setSelectedTags: (tags: string[] | ((prevTags: string[]) => string[])) => void;
  availableCategories: string[];
  availableTags: string[];
  onSave: () => void;
  applyToAll: boolean;
  setApplyToAll: (value: boolean) => void;
}

const FileMetadataModal: React.FC<FileMetadataModalProps> = ({
  isOpen,
  onClose,
  fileName,
  selectedCategory,
  setSelectedCategory,
  selectedTags,
  setSelectedTags,
  availableCategories,
  availableTags,
  onSave,
  applyToAll,
  setApplyToAll
}) => {
  const [newCategory, setNewCategory] = useState<string>('');
  const [newTag, setNewTag] = useState<string>('');
  const [localCategories, setLocalCategories] = useState<string[]>([]);
  const [localTags, setLocalTags] = useState<string[]>([]);

  // Add a new category - FIXED implementation
  const addNewCategory = () => {
    if (newCategory) {
      // Always set the selected category
      setSelectedCategory(newCategory);
      
      // Add to local categories if it's not in availableCategories or localCategories
      if (!availableCategories.includes(newCategory) && 
          !localCategories.includes(newCategory)) {
        setLocalCategories(prev => [...prev, newCategory]);
      }
      
      // Clear the input field
      setNewCategory('');
    }
  };
  
  // Add a new tag
  const addNewTag = () => {
    if (newTag) {
      // Add to selected tags
      if (!selectedTags.includes(newTag)) {
        setSelectedTags([...selectedTags, newTag]);
      }
      
      // Add to local tags if needed
      if (!availableTags.includes(newTag) && 
          !localTags.includes(newTag)) {
        setLocalTags(prev => [...prev, newTag]);
      }
      
      // Clear the input field
      setNewTag('');
    }
  };
  
  // Handle tag selection - FIXED: with proper typing for setState callback
  const handleTagSelection = (tag: string) => {
    setSelectedTags((prevTags: string[]) => 
      prevTags.includes(tag) 
        ? prevTags.filter(t => t !== tag) 
        : [...prevTags, tag]
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
    >
      <ModalHeader 
        modalTitle={`Add Categories & Tags to ${fileName || 'All Files'}`} 
        onClose={onClose} 
      />
      <ModalBody>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="mb-2"
            >
              <option value="">Select a category</option>
              {availableCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
              {localCategories.map(category => (
                <option key={`local-${category}`} value={category}>{category}</option>
              ))}
            </Select>
            
            {/* New category input */}
            <div className="flex mt-2">
              <Input
                type="text"
                placeholder="Add new category"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="rounded-r-none"
              />
              <Button
                type="button"
                onClick={addNewCategory}
                disabled={!newCategory}
                className="rounded-l-none"
              >
                Add
              </Button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags
            </label>
            <div className="mb-2 flex flex-wrap gap-2">
              {availableTags.map(tag => (
                <ClickableBadge
                  key={tag}
                  onClick={() => handleTagSelection(tag)}
                  color={selectedTags.includes(tag) ? "primary" : "secondary"}
                >
                  {tag}
                </ClickableBadge>
              ))}
              {localTags.map(tag => (
                <ClickableBadge
                  key={`local-${tag}`}
                  onClick={() => handleTagSelection(tag)}
                  color={selectedTags.includes(tag) ? "primary" : "secondary"}
                >
                  {tag}
                </ClickableBadge>
              ))}
            </div>
            
            {/* New tag input */}
            <div className="flex mt-2">
              <Input
                type="text"
                placeholder="Add new tag"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                className="rounded-r-none"
              />
              <Button
                type="button"
                onClick={addNewTag}
                disabled={!newTag}
                className="rounded-l-none"
              >
                Add
              </Button>
            </div>
            
            {/* Display selected tags */}
            {selectedTags.length > 0 && (
              <div className="mt-3">
                <p className="text-sm text-gray-500 mb-1">Selected tags:</p>
                <div className="flex flex-wrap gap-1">
                  {selectedTags.map(tag => (
                    <Badge key={tag} color="primary" className="mr-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => setSelectedTags(tags => tags.filter(t => t !== tag))}
                        className="ml-1 text-xs font-bold"
                        aria-label={`Remove ${tag} tag`}
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {!fileName && (
            <div className="mt-4">
              <div className="flex items-center">
                <Checkbox
                  id="apply-to-all"
                  checked={applyToAll}
                  onChange={(e) => setApplyToAll(e.target.checked)}
                />
                <label htmlFor="apply-to-all" className="ml-2 text-sm text-gray-700">
                  Apply to all selected files
                </label>
              </div>
            </div>
          )}
        </div>
      </ModalBody>
      <ModalFooter>
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="mr-2"
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="primary"
          onClick={onSave}
        >
          Save
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default FileMetadataModal;