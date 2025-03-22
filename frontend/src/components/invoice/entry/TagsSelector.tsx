// src/components/invoice/entry/TagsSelector.tsx
import React, { useState } from 'react';
import Button from '../../../components/common/Button';

interface TagsSelectorProps {
  selectedTags: string[];
  availableTags: string[];
  onChange: (tags: string[]) => void;
}

export const TagsSelector: React.FC<TagsSelectorProps> = ({
  selectedTags,
  availableTags,
  onChange
}) => {
  const [newTag, setNewTag] = useState<string>('');
  
  const handleTagSelect = (tag: string) => {
    // Add to selected if not already selected
    if (!selectedTags.includes(tag)) {
      onChange([...selectedTags, tag]);
    }
  };
  
  const handleTagRemove = (tag: string) => {
    onChange(selectedTags.filter(t => t !== tag));
  };
  
  const handleAddNewTag = () => {
    if (!newTag.trim()) return;
    
    // Check if tag already exists
    if (!availableTags.includes(newTag.trim())) {
      // Would typically call an API to add the tag here
      // For this example, just add it to the selection
      handleTagSelect(newTag.trim());
    } else {
      handleTagSelect(newTag.trim());
    }
    
    setNewTag('');
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddNewTag();
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Tags
      </label>
      
      {/* Selected tags */}
      <div className="flex flex-wrap gap-2 mb-3">
        {selectedTags.map(tag => (
          <div 
            key={tag} 
            className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-sm flex items-center"
          >
            {tag}
            <button 
              type="button"
              onClick={() => handleTagRemove(tag)}
              className="ml-1 text-blue-600 dark:text