/**
 * Filter options for API requests
 */
export interface FilterOptions {
    status?: string;
    category?: string;
    searchTerm?: string;
    dateRange?: {
      start?: string;
      end?: string;
    };
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
    skip?: number;
    limit?: number;
  }
  
  /**
   * Dashboard statistics
   */
  export interface DashboardStats {
    totalInvoices: number;
    totalAmount: number;
    openInvoices: number;
    paidInvoices: number;
    averageInvoiceAmount: number;
  }
  
  /**
   * Payment information
   */
  export interface Payment {
    payment_id: number;
    invoice_id: number;
    card_number_id: number;
    amount: number;
    transaction_id: string;
    payment_date: string;
    status: 'Completed' | 'Pending' | 'Failed';
  }
  
  /**
   * Card information
   */
  export interface Card {
    card_id: number;
    card_name: string;
    created_at: string;
    card_numbers: CardNumber[];
  }
  
  /**
   * Card number information
   */
  export interface CardNumber {
    card_number_id: number;
    last_four: string;
    expiration_date: string;
    added_at: string;
  }
  
  /**
   * OCR extraction template
   */
  export interface OcrTemplate {
    template_id: number;
    name: string;
    vendor?: string;
    version?: string;
    description?: string;
    template_data: {
      identification: {
        markers: Array<{
          text: string;
          required: boolean;
        }>;
      };
      fields: Array<{
        field_name: string;
        display_name?: string;
        data_type: 'string' | 'date' | 'currency' | 'integer' | 'float' | 'boolean' | 'address';
        extraction: {
          regex: string;
          alternative_regex?: string;
        };
        validation?: {
          required?: boolean;
        };
      }>;
    };
    created_at?: string;
    updated_at?: string;
  }
  
  /**
   * Wishlist item
   */
  export interface WishlistItem {
    wishlist_id: number;
    product_name: string;
    product_link?: string;
    added_at: string;
    target_price?: number;
    current_price?: number;
    priority?: 'Low' | 'Medium' | 'High';
    notes?: string;
  }

  // Updated src/utils/types.ts
/**
 * API response format
 */
export interface ApiResponse<T = any> {
  data?: T;
  results?: T;
  error?: string;
  detail?: string;
  message?: string;
  success?: boolean;
  status?: string | number;
}

/**
 * Item / Line item interface
 */
export interface Item {
  product_name: string;
  quantity: number;
  unit_price: number;
  product_link?: string;
  documentation?: string;
  condition?: string;
  paid_by?: string;
  item_type?: string;
}

/**
 * Invoice interface
 */
export interface Invoice {
  invoice_id: number;
  merchant_name: string;
  order_number?: string;
  purchase_date?: string;
  payment_method?: string;
  grand_total: number;
  status: string;
  notes?: string;
  shipping_handling?: number;
  estimated_tax?: number;
  total_before_tax?: number;
  billing_address?: string;
  credit_card_transactions?: number;
  gift_card_amount?: number;
  refunded_amount?: number;
  file_name?: string;
  items: Item[];
  tags: string[];
  categories: string[];
}

/**
 * Product for expense tracker
 */
export interface Product {
  name: string;
  price: number;
  quantity: number;
  item_type?: string;
}

/**
 * Expense item
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
 * Grouped expenses by category
 */
export interface GroupedExpenses {
  [category: string]: ExpenseItem[];
}

/**
 * Data point for charts
 */
export interface DataPoint {
  name: string;
  value: number;
}

/**
 * Chart data
 */
export interface ChartData {
  data: DataPoint[];
}

/**
 * User information
 */
export interface User {
  id?: number;
  user_id?: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  created_at: string;
  last_login?: string;
  is_active?: boolean;
}

/**
 * Filter options for API requests
 */
export interface FilterOptions {
  status?: string;
  category?: string;
  searchTerm?: string;
  dateRange?: {
    start?: string;
    end?: string;
  };
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  skip?: number;
  limit?: number;
}