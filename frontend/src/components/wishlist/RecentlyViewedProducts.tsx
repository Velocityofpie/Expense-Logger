// src/components/wishlist/RecentlyViewedProducts.tsx
import React from 'react';
import { Card, CardHeader, CardBody } from '../common/Card';
import { Button } from '../common/Button';
import { WishlistItem } from '../../containers/WishlistContainer';

interface RecentlyViewedProductsProps {
  items: WishlistItem[];
  formatDate: (date: string) => string;
}

const RecentlyViewedProducts: React.FC<RecentlyViewedProductsProps> = ({ items, formatDate }) => {
  // This would be implemented in a real app
  const handleAddToCart = (item: WishlistItem): void => {
    alert(`Added ${item.product_name} to cart!`);
  };
  
  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-medium">Recently Viewed Products</h3>
      </CardHeader>
      <CardBody>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {items.map(item => (
            <ProductCard 
              key={item.wishlist_id} 
              item={item} 
              formatDate={formatDate}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      </CardBody>
    </Card>
  );
};

interface ProductCardProps {
  item: WishlistItem;
  formatDate: (date: string) => string;
  onAddToCart: (item: WishlistItem) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ item, formatDate, onAddToCart }) => {
  return (
    <div className="border border-gray-200 dark:border-dark-border rounded-lg overflow-hidden bg-white dark:bg-dark-card hover:shadow-md transition-shadow duration-200">
      <div className="h-40 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-16 w-16 text-gray-400 dark:text-gray-500" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1} 
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
          />
        </svg>
      </div>
      
      <div className="p-4">
        <h4 className="text-lg font-medium text-gray-900 dark:text-dark-text-primary mb-1 truncate">
          {item.product_name}
        </h4>
        
        <p className="text-sm text-gray-500 dark:text-dark-text-secondary mb-4">
          Viewed on {formatDate(item.added_at)}
        </p>
        
        <div className="flex justify-between">
          {item.product_link ? (
            <Button
              variant="outline"
              size="sm"
              as="a"
              href={item.product_link}
              target="_blank"
              rel="noopener noreferrer"
            >
              View
            </Button>
          ) : (
            <div></div> // Empty div to maintain spacing when no link
          )}
          
          <Button
            variant="primary"
            size="sm"
            onClick={() => onAddToCart(item)}
          >
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RecentlyViewedProducts;