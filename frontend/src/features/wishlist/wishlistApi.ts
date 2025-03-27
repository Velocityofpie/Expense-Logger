// src/features/wishlist/wishlistApi.ts
import { 
    WishlistItem, 
    WishlistResponse, 
    CreateWishlistItemRequest, 
    UpdateWishlistItemRequest,
    WishlistFilters,
    PriceHistory
  } from './types';
  
  // Define API_URL
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";
  
  /**
   * Fetch all wishlist items with optional filters
   */
  export async function fetchWishlist(filters?: WishlistFilters): Promise<WishlistItem[]> {
    try {
      // Build query parameters if filters are provided
      let queryParams = '';
      if (filters) {
        const params = new URLSearchParams();
        
        if (filters.search) params.append('search', filters.search);
        if (filters.category) params.append('category', filters.category);
        if (filters.priority) params.append('priority', filters.priority);
        if (filters.price_range?.min) params.append('min_price', filters.price_range.min.toString());
        if (filters.price_range?.max) params.append('max_price', filters.price_range.max.toString());
        if (filters.sort_by) params.append('sort_by', filters.sort_by);
        if (filters.sort_direction) params.append('sort_direction', filters.sort_direction);
        
        queryParams = `?${params.toString()}`;
      }
      
      const response = await fetch(`${API_URL}/wishlist/${queryParams}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch wishlist items');
      }
      
      const data: WishlistResponse = await response.json();
      return data.items;
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      
      // For demo purposes, return mock data if API fails
      return getMockWishlistItems();
    }
  }
  
  /**
   * Fetch a single wishlist item by ID
   */
  export async function fetchWishlistItem(id: number): Promise<WishlistItem> {
    try {
      const response = await fetch(`${API_URL}/wishlist/${id}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Failed to fetch wishlist item #${id}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching wishlist item #${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Add item to wishlist
   */
  export async function addToWishlist(item: CreateWishlistItemRequest): Promise<WishlistItem> {
    try {
      const response = await fetch(`${API_URL}/wishlist/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(item),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to add item to wishlist');
      }
      
      return await response.json();
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      
      // For demo purposes, return a mock response with a generated ID
      return {
        wishlist_id: Math.floor(Math.random() * 1000) + 10,
        product_name: item.product_name,
        product_link: item.product_link,
        price: item.price,
        desired_price: item.desired_price,
        priority: item.priority,
        notes: item.notes,
        image_url: item.image_url,
        category: item.category,
        added_at: new Date().toISOString(),
      };
    }
  }
  
  /**
   * Update a wishlist item
   */
  export async function updateWishlistItem(item: UpdateWishlistItemRequest): Promise<WishlistItem> {
    try {
      const response = await fetch(`${API_URL}/wishlist/${item.wishlist_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(item),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Failed to update wishlist item #${item.wishlist_id}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error updating wishlist item #${item.wishlist_id}:`, error);
      throw error;
    }
  }
  
  /**
   * Remove an item from the wishlist
   */
  export async function removeFromWishlist(id: number): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/wishlist/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Failed to remove wishlist item #${id}`);
      }
    } catch (error) {
      console.error(`Error removing wishlist item #${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Fetch price history for a wishlist item
   */
  export async function fetchPriceHistory(id: number): Promise<PriceHistory> {
    try {
      const response = await fetch(`${API_URL}/wishlist/${id}/price-history`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Failed to fetch price history for item #${id}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching price history for item #${id}:`, error);
      
      // Mock price history data
      return {
        wishlist_id: id,
        price_points: [
          { date: '2023-01-01', price: 249.99 },
          { date: '2023-02-01', price: 229.99 },
          { date: '2023-03-01', price: 239.99 },
          { date: '2023-04-01', price: 219.99 },
          { date: '2023-05-01', price: 199.99 },
        ]
      };
    }
  }
  
  /**
   * Mark item as purchased
   */
  export async function markAsPurchased(id: number): Promise<WishlistItem> {
    try {
      const response = await fetch(`${API_URL}/wishlist/${id}/purchased`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Failed to mark item #${id} as purchased`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error marking item #${id} as purchased:`, error);
      throw error;
    }
  }
  
  /**
   * Enable price tracking for an item
   */
  export async function enablePriceTracking(id: number, desiredPrice?: number): Promise<WishlistItem> {
    try {
      const response = await fetch(`${API_URL}/wishlist/${id}/track-price`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ desired_price: desiredPrice }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Failed to enable price tracking for item #${id}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error enabling price tracking for item #${id}:`, error);
      throw error;
    }
  }
  
  // Helper function to get mock wishlist items for demo purposes
  function getMockWishlistItems(): WishlistItem[] {
    return [
      {
        wishlist_id: 1,
        product_name: "Sony WH-1000XM4 Headphones",
        product_link: "https://www.example.com/headphones",
        price: 299.99,
        desired_price: 249.99,
        priority: "high",
        added_at: "2023-05-15T10:30:00Z",
        notes: "Waiting for Black Friday sale",
        image_url: "https://example.com/images/headphones.jpg",
        status: "available",
        category: "Electronics"
      },
      {
        wishlist_id: 2,
        product_name: "MacBook Pro M2",
        product_link: "https://www.example.com/macbook",
        price: 1999.99,
        desired_price: 1799.99,
        priority: "medium",
        added_at: "2023-06-20T14:45:00Z",
        notes: "Wait for next generation",
        image_url: "https://example.com/images/macbook.jpg",
        status: "available",
        category: "Computers"
      },
      {
        wishlist_id: 3,
        product_name: "Kindle Paperwhite",
        product_link: "https://www.example.com/kindle",
        price: 129.99,
        desired_price: 99.99,
        priority: "low",
        added_at: "2023-07-10T09:15:00Z",
        status: "price_drop",
        category: "Electronics"
      }
    ];
  }