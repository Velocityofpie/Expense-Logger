// src/hooks/index.ts - Hook exports and documentation

// Authentication hook
export { default as useAuth } from './useAuth';

// Context-based hooks
export { default as useInvoices } from './useInvoices';
export { default as useNotifications } from './useNotifications';
export { default as useTheme } from './useTheme';

// Data management hooks
export { default as useCategories } from './useCategories';
export { default as useTags } from './useTags';
export { default as useTemplates } from './useTemplates';
export { default as usePaymentCards } from './usePaymentCards';
export { default as useOcr } from './useOcr';

// Utility hooks
export { default as useDebounce } from './useDebounce';
export { default as useLocalStorage } from './useLocalStorage';
export { default as useMediaQuery, useIsMobile, useIsTablet, useIsDesktop, useIsDarkMode } from './useMediaQuery';
export { default as useOutsideClick } from './useOutsideClick';

/**
 * HOOK DOCUMENTATION
 * 
 * CONTEXT HOOKS:
 * 
 * useAuth - Provides authentication functionality
 * - Login/logout/register methods
 * - Current user information
 * - Authentication state (loading, error, authenticated)
 * 
 * useInvoices - Provides invoice management
 * - Fetch all invoices or a specific invoice
 * - Create, update, delete invoices 
 * - Filter invoices based on various criteria
 * 
 * useNotifications - Provides application notifications
 * - Add/remove/clear notifications
 * - Support for different notification types (success, error, etc.)
 * - Auto-dismiss functionality
 * 
 * useTheme - Provides theme management
 * - Toggle between light and dark mode
 * - Persists preference in localStorage
 * - Syncs with system preferences
 * 
 * DATA MANAGEMENT HOOKS:
 * 
 * useCategories - Manage invoice categories
 * - Fetch available categories
 * - Add new categories
 * 
 * useTags - Manage invoice tags
 * - Fetch available tags
 * - Add new tags
 * 
 * useTemplates - Manage OCR templates
 * - CRUD operations for templates
 * - Import/export templates
 * - Test templates with invoices
 * 
 * usePaymentCards - Manage payment cards
 * - Fetch available cards and card numbers
 * - Add/delete cards and card numbers
 * 
 * useOcr - Handle OCR operations
 * - Extract text from PDF files
 * - Configure OCR settings
 * - Format extracted text
 * 
 * UTILITY HOOKS:
 * 
 * useDebounce - Debounce a value
 * - Useful for preventing too many API calls on input changes
 * 
 * useLocalStorage - Persist state in localStorage
 * - Typed interface for localStorage
 * - Syncs with other tabs/windows
 * 
 * useMediaQuery - Check if a media query matches
 * - Helper hooks for common queries (mobile, tablet, desktop)
 * - Also provides useIsDarkMode for system dark mode preference
 * 
 * useOutsideClick - Handle clicks outside a component
 * - Useful for closing dropdowns, modals, etc.
 */