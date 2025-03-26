// src/context/types.ts

// User related types
export interface User {
    id: string;
    email: string;
    username: string;
    role: string;
  }
  
  // Theme related types
  export interface ThemeContextType {
    darkMode: boolean;
    toggleDarkMode: () => void;
  }
  
  // Interface for styled components props
  export interface ThemedProps {
    darkMode?: boolean;
  }
  
  // Define status options for invoices
  export type InvoiceStatus = 'Open' | 'Paid' | 'Draft' | 'Needs Attention' | 'Resolved';
  
  // Valid statuses array
  export const VALID_STATUSES: InvoiceStatus[] = ['Open', 'Paid', 'Draft', 'Needs Attention', 'Resolved'];