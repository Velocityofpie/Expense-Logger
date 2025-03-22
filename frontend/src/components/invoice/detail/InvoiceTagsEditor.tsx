// src/components/invoice/detail/InvoiceTagsEditor.tsx
import React, { useState } from 'react';
import Button from '../../../components/common/Button';

interface InvoiceTagsEditorProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  availableTags: string[];
  onAddNewTag: (tag: string) => void;
}

export const InvoiceTagsEditor: React.FC<InvoiceTagsEditorProps> = ({
  tags,
  onTagsChange,
  availableTags,
  onAddNewTag
}) => {
  const [newTag, setNewTag] = useState<string>('');
  
  const handleTagSelect = (tag: string) => {
    if (!tags.includes(tag)) {
      onTagsChange([...tags, tag]);
    }
  };
  
  const handleTagRemove = (tag: string) => {
    onTagsChange(tags.filter(t => t !== tag));
  };
  
  const handleAddNewTag = () => {
    if (!newTag.trim()) return;
    
    if (!availableTags.includes(newTag.trim())) {
      // Add to available tags
      onAddNewTag(newTag.trim());
    }
    
    // Add to selected tags
    handleTagSelect(newTag.trim());
    
    // Reset input
    setNewTag('');
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddNewTag();
    }
  };

  return (
    <div className="bg-white dark:bg-dark-card rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Tags</h3>
      
      {/* Selected tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {tags.length > 0 ? (
          tags.map((tag) => (
            <div 
              key={tag} 
              className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm flex items-center"
            >
              {tag}
              <button 
                type="button"
                onClick={() => handleTagRemove(tag)}
                className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 focus:outline-none"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))
        ) : (
          <div className="text-gray-500 dark:text-gray-400">No tags selected</div>
        )}
      </div>
      
      {/* Add new tag */}
      <div className="flex mb-4">
        <input
          type="text"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-l-md shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:outline-none"
          placeholder="Add a new tag"
        />
        <Button
          type="button"
          variant="primary"
          onClick={handleAddNewTag}
          className="rounded-l-none"
        >
          Add
        </Button>
      </div>
      
      {/* Available tags */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Available Tags
        </h4>
        <div className="flex flex-wrap gap-2">
          {availableTags
            .filter(tag => !tags.includes(tag))
            .map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() => handleTagSelect(tag)}
                className="bg-gray-100 dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-blue-900 text-gray-800 dark:text-gray-200 hover:text-blue-800 dark:hover:text-blue-200 px-3 py-1 rounded-md text-sm transition-colors"
              >
                {tag}
              </button>
            ))}
        </div>
      </div>
    </div>
  );
};