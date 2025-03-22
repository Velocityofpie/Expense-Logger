// Interface for wishlist item
export interface WishlistItem {
    wishlist_id: number;
    product_name: string;
    product_link?: string;
    price?: number;
    priority?: 'low' | 'medium' | 'high';
    notes?: string;
    added_at: string;
    updated_at?: string;
  }
  
  // Interface for wishlist item creation
  export interface WishlistItemCreate {
    product_name: string;
    product_link?: string;
    price?: number;
    priority?: 'low' | 'medium' | 'high';
    notes?: string;
  }
  
  // Interface for wishlist update
  export interface WishlistItemUpdate {
    product_name?: string;
    product_link?: string;
    price?: number;
    priority?: 'low' | 'medium' | 'high';
    notes?: string;
  }
  
  // Interface for wishlist response
  export interface WishlistResponse {
    items: WishlistItem[];
    total: number;
  }
  
  // Interface for recently viewed product
  export interface RecentlyViewedProduct {
    product_id: string;
    product_name: string;
    product_link?: string;
    price?: number;
    viewed_at: string;
  }