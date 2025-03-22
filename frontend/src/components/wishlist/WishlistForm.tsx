// src/components/wishlist/WishlistForm.tsx
import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '../common/Card';
import { Button } from '../common/Button';

interface WishlistFormProps {
  onAddItem: (productName: string, productLink: string) => Promise<void>;
}

const WishlistForm: React.FC<WishlistFormProps> = ({ onAddItem }) => {
  const [productName, setProductName] = useState<string>('');
  const [productLink, setProductLink] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    if (!productName.trim()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await onAddItem(productName, productLink);
      
      // Reset form
      setProductName('');
      setProductLink('');
    } catch (error) {
      console.error('Error submitting wishlist item:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-medium">Add New Item</h3>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
              Product Name
            </label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-dark-card dark:text-dark-text-primary"
              placeholder="Enter product name"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
              Product Link (Optional)
            </label>
            <input
              type="url"
              value={productLink}
              onChange={(e) => setProductLink(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-dark-card dark:text-dark-text-primary"
              placeholder="https://example.com/product"
            />
          </div>
          
          <Button
            variant="primary"
            type="submit"
            isLoading={isSubmitting}
            disabled={!productName.trim() || isSubmitting}
            className="w-full"
          >
            Add to Wishlist
          </Button>
        </form>
      </CardBody>
    </Card>
  );
};

export default WishlistForm;