// src/features/invoiceDetails/types.ts
import { Invoice, LineItem } from '../invoices/types';

// Tab types
export type TabType = 'details' | 'items' | 'payments' | 'document';

// Payment form data
export interface PaymentFormData {
  cardNumberId: string;
  transactionId: string;
  amount: string;
}

// New tag or category input form data
export interface TagCategoryInput {
  newTag: string;
  newCategory: string;
}

// Line item input methods
export interface LineItemInputMethods {
  handleItemChange: (index: number, field: string, value: any) => void;
  addItem: () => void;
  removeItem: (index: number) => void;
}

// Tag and category input methods
export interface TagCategoryInputMethods {
  handleTagChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleCategoryChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleAddTag: () => void;
  handleAddCategory: () => void;
  removeTag: (tag: string) => void;
  removeCategory: (category: string) => void;
}

// Navigation state for invoice traversal
export interface InvoiceNavigation {
  currentIndex: number;
  invoicesCount: number;
  canGoPrev: boolean;
  canGoNext: boolean;
  goToPrevInvoice: () => void;
  goToNextInvoice: () => void;
}

// Re-export Invoice and LineItem types so components can import from here
export type { Invoice, LineItem };