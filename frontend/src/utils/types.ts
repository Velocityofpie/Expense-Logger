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