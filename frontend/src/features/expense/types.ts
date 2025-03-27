// src/features/expense/types.ts - Fixed
export interface Product {
  name: string;
  price: number;
  quantity: number;
  item_type?: string;
}

/**
 * Represents a single expense/purchase
 */
export interface ExpenseItem {
  id: number;
  store: string;
  orderNumber: string;
  date: string;
  category: string;
  creditCard: string;
  total: number;
  products: Product[];
  [key: string]: any; // Allow for dynamic access by string keys
}

/**
 * Expense group
 */
export interface ExpenseGroup {
  name: string;
  items: ExpenseItem[];
  count: number;
  total: number;
}

/**
 * Configuration for sorting expenses
 */
export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

/**
 * Form data for creating/editing an expense
 */
export interface ExpenseFormData {
  id?: number;
  store: string;
  category: string;
  creditCard: string;
  date: string;
  orderNumber?: string;
  total: number | string;
  products: Product[];
}

/**
 * Props for expense filter component
 */
export interface ExpenseFiltersProps {
  categories: string[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  dateFilter: string;
  setDateFilter: (filter: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  currentView: string;
  setCurrentView: (view: string) => void;
}

/**
 * Props for expense form component
 */
export interface ExpenseFormProps {
  onSubmit: (formData: ExpenseFormData) => void;
  categories: string[];
  creditCardOptions: string[];
  isLoading: boolean;
  initialData?: ExpenseFormData;
  isEditing?: boolean;
}

/**
 * Props for expense groups component
 */
export interface ExpenseGroupsProps {
  groupedData: ExpenseGroup[];
  handleSort: (key: string) => void;
  sortConfig: SortConfig;
  formatCurrency: (value: number) => string;
  onDeleteItem: (id: number) => void;
}

/**
 * Props for expense stats component
 */
export interface ExpenseStatsProps {
  filteredData: ExpenseItem[];
  formatCurrency: (value: number) => string;
}

/**
 * Props for expense summary component
 */
export interface ExpenseSummaryProps {
  filteredTotal: number;
  purchaseCount: number;
  tabPercentage: number;
  filteredData: ExpenseItem[];
}

/**
 * Props for main expense tracker component
 */
export interface ExpenseTrackerProps {
  initialData?: ExpenseGroup[];
  categories?: string[];
}

/**
 * API response for expense data
 */
export interface ExpenseDataResponse {
  groups: ExpenseGroup[];
  totalCount: number;
  totalAmount: number;
}

/**
 * API response for expense statistics
 */
export interface ExpenseStatsResponse {
  stats: {
    total: number;
    average: number;
    highest: number;
    lowest: number;
    count: number;
  };
  topCategories: { name: string; total: number }[];
  topStores: { name: string; total: number }[];
  topCards: { name: string; total: number }[];
}