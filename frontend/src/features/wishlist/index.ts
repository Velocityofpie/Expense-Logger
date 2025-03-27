// src/features/wishlist/index.ts

// Export types
export * from './types';

// Export components
export { default as Wishlist } from './Wishlist';
export { default as WishlistItem } from './WishlistItem';

// Export API functions
export {
  fetchWishlist,
  fetchWishlistItem,
  addToWishlist,
  updateWishlistItem,
  removeFromWishlist,
  fetchPriceHistory,
  markAsPurchased,
  enablePriceTracking
} from './wishlistApi';