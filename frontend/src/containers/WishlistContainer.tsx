// src/containers/WishlistContainer.tsx
import React, { useState, useEffect } from 'react';
import WishlistForm from '../components/wishlist/WishlistForm';
import WishlistItems from '../components/wishlist/WishlistItems';
import WishlistFeatures from '../components/wishlist/WishlistFeatures';
import RecentlyViewedProducts from '../components/wishlist/RecentlyViewedProducts';
import { Card, CardHeader, CardBody } from '../components/common/Card';
import { Alert } from '../components/common/Feedback/Alert';

// Define types for wishlist items
export interface WishlistItem {
  wishlist_id: number;
  product_name: string;
  product_link?: string;
  added_at: string;
}

// Mock data for wishlist items
const mockWishlistItems: WishlistItem[] = [
  {
    wishlist_id: 1,
    product_name: "Sony WH-1000XM4 Headphones",
    product_link: "https://www.example.com/headphones",
    added_at: "2023-05-15T10:30:00Z"
  },
  {
    wishlist_id: 2,
    product_name: "MacBook Pro M2",
    product_link: "https://www.example.com/macbook",
    added_at: "2023-06-20T14:45:00Z"
  },
  {
    wishlist_id: 3,
    product_name: "Kindle Paperwhite",
    product_link: "https://www.example.com/kindle",
    added_at: "2023-07-10T09:15:00Z"
  }
];

const WishlistContainer: React.FC = () => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>("");
  
  // Load wishlist data
  useEffect(() => {
    const fetchWishlist = async (): Promise<void> => {
      try {
        setIsLoading(true);
        setError(null);
        
        // In a real app, you would call your API
        // const items = await getWishlist();
        
        // For now, we'll use mock data
        setWishlistItems(mockWishlistItems);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching wishlist:", error);
        setError("Failed to load wishlist. Please try again.");
        setIsLoading(false);
      }
    };
    
    fetchWishlist();
  }, []);
  
  // Add item to wishlist
  const handleAddItem = async (productName: string, productLink: string): Promise<void> => {
    if (!productName) {
      setError("Please enter a product name.");
      return;
    }
    
    try {
      setError(null);
      
      // In a real app, you would call your API
      // const result = await addToWishlist(productName, productLink);
      
      // For mock, we'll simulate adding an item
      const newWishlistItem: WishlistItem = {
        wishlist_id: Math.floor(Math.random() * 1000) + 10,
        product_name: productName,
        product_link: productLink || undefined,
        added_at: new Date().toISOString()
      };
      
      setWishlistItems([...wishlistItems, newWishlistItem]);
      
      // Show success message
      setSuccessMessage("Item added to wishlist successfully!");
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      setError("Failed to add item to wishlist. Please try again.");
    }
  };
  
  // Remove item from wishlist
  const handleRemoveItem = async (itemId: number): Promise<void> => {
    try {
      // In a real app, you would call your API
      // await removeFromWishlist(itemId);
      
      // For mock, we'll filter out the removed item
      setWishlistItems(wishlistItems.filter(item => item.wishlist_id !== itemId));
      
      setSuccessMessage("Item removed from wishlist!");
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      setError("Failed to remove item from wishlist. Please try again.");
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };
  
  if (isLoading) {
    return <div className="text-center p-5">Loading wishlist...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-dark-text-primary">
          My Wishlist
        </h2>
      </div>
      
      {successMessage && (
        <Alert 
          type="success"
          title="Success"
          message={successMessage}
          onClose={() => setSuccessMessage("")}
        />
      )}
      
      {error && (
        <Alert 
          type="error"
          title="Error"
          message={error}
          onClose={() => setError(null)}
        />
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div>
          <WishlistForm onAddItem={handleAddItem} />
        </div>
        
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium">Wishlist Items</h3>
            </CardHeader>
            <CardBody>
              <WishlistItems 
                items={wishlistItems} 
                onRemoveItem={handleRemoveItem}
                formatDate={formatDate}
              />
            </CardBody>
          </Card>
        </div>
      </div>
      
      {/* Additional Features Section */}
      <WishlistFeatures />
      
      {/* Recently Viewed Products Section */}
      {wishlistItems.length > 0 && (
        <RecentlyViewedProducts items={wishlistItems.slice(0, 3)} formatDate={formatDate} />
      )}
    </div>
  );
};

export default WishlistContainer;