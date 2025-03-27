// src/features/wishlist/types.ts

/**
 * Wishlist item interface
 */
export interface WishlistItem {
    wishlist_id: number;
    product_name: string;
    product_link?: string;
    price?: number;
    desired_price?: number;
    priority?: 'low' | 'medium' | 'high';
    added_at: string;
    notes?: string;
    image_url?: string;
    status?: 'available' | 'out_of_stock' | 'price_drop';
    category?: string;
  }
  
  /**
   * Price history point interface
   */
  export interface PricePoint {
    date: string;
    price: number;
  }
  
  /**
   * Price history for a wishlist item
   */
  export interface PriceHistory {
    wishlist_id: number;
    price_points: PricePoint[];
  }
  
  /**
   * API response for wishlist items
   */
  export interface WishlistResponse {
    items: WishlistItem[];
    total_count: number;
  }
  
  /**
   * Create wishlist item request
   */
  export interface CreateWishlistItemRequest {
    product_name: string;
    product_link?: string;
    price?: number;
    desired_price?: number;
    priority?: 'low' | 'medium' | 'high';
    notes?: string;
    image_url?: string;
    category?: string;
  }
  
  /**
   * Update wishlist item request
   */
  export interface UpdateWishlistItemRequest extends Partial<CreateWishlistItemRequest> {
    wishlist_id: number;
  }
  
  /**
   * Wishlist filter options
   */
  export interface WishlistFilters {
    search?: string;
    category?: string;
    priority?: 'low' | 'medium' | 'high';
    price_range?: {
      min?: number;
      max?: number;
    };
    sort_by?: 'name' | 'price' | 'priority' | 'date_added';
    sort_direction?: 'asc' | 'desc';
  }