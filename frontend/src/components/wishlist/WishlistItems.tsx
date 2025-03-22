// src/components/wishlist/WishlistItems.tsx
import React from 'react';
import { WishlistItem } from '../../containers/WishlistContainer';
import { Button } from '../common/Button';
import WishlistItem from './WishlistItem';

interface WishlistItemsProps {
  items: WishlistItem[];
  onRemoveItem: (itemId: number) => Promise<void>;
  formatDate: (date: string) => string;
}

const WishlistItems: React.FC<WishlistItemsProps> = ({ items, onRemoveItem, formatDate }) => {
  if (items.length === 0) {
    return (
      <div className="text-center py-8">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-12 w-12 mx-auto text-gray-400 mb-4" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1} 
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
          />
        </svg>
        <p className="text-lg text-gray-600 dark:text-dark-text-secondary mb-2">Your wishlist is empty</p>
        <p className="text-gray-500 dark:text-dark-text-muted">Add some items to your wishlist!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map(item => (
        <WishlistItem 
          key={item.wishlist_id}
          item={item}
          onRemove={onRemoveItem}
          formatDate={formatDate}
        />
      ))}
    </div>
  );
};

export default WishlistItems;