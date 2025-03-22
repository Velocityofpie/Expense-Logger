// src/components/wishlist/WishlistItem.tsx
import React, { useState } from 'react';
import { WishlistItem as WishlistItemType } from '../../containers/WishlistContainer';
import { Button } from '../common/Button';

interface WishlistItemProps {
  item: WishlistItemType;
  onRemove: (itemId: number) => Promise<void>;
  formatDate: (date: string) => string;
}

const WishlistItem: React.FC<WishlistItemProps> = ({ item, onRemove, formatDate }) => {
  const [isRemoving, setIsRemoving] = useState<boolean>(false);
  
  const handleRemove = async (): Promise<void> => {
    setIsRemoving(true);
    
    try {
      await onRemove(item.wishlist_id);
    } catch (error) {
      console.error('Error removing item:', error);
    } finally {
      setIsRemoving(false);
    }
  };
  
  return (
    <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-card hover:shadow-sm transition-shadow duration-200">
      <div className="flex-1 min-w-0">
        <h4 className="text-lg font-medium text-gray-900 dark:text-dark-text-primary truncate">
          {item.product_name}
        </h4>
        
        <div className="mt-1 flex flex-col sm:flex-row sm:items-center text-sm text-gray-500 dark:text-dark-text-secondary">
          <span className="mr-4">
            Added on {formatDate(item.added_at)}
          </span>
          
          {item.product_link && (
            <a 
              href={item.product_link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary-600 dark:text-primary-400 hover:underline mt-1 sm:mt-0"
            >
              View Product
            </a>
          )}
        </div>
      </div>
      
      <div className="ml-4 flex-shrink-0">
        <Button
          variant="danger"
          size="sm"
          onClick={handleRemove}
          isLoading={isRemoving}
          icon={
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
              />
            </svg>
          }
        >
          Remove
        </Button>
      </div>
    </div>
  );
};

export default WishlistItem;