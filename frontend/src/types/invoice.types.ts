// src/types/invoice.types.ts
export interface InvoiceItem {
    item_id?: number;
    product_name: string;
    quantity: number;
    unit_price: number;
    product_link?: string;
    documentation?: string;
    condition?: string;
    paid_by?: string;
  }
  
  export interface Payment {
    payment_id: number;
    invoice_id: number;
    card_number_id: number;
    amount: number;
    payment_date: string;
    transaction_id: string;
    status: string;
    last_four?: string;
  }
  
  export interface Invoice {
    invoice_id: number;
    user_id?: number;
    merchant_name: string;
    file_name?: string;
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
    categories?: string[];
    tags?: string[];
    items?: InvoiceItem[];
    payments?: Payment[];
    created_at?: string;
    updated_at?: string;
  }
  
  export interface InvoiceFilters {
    status: string;
    category: string;
    searchTerm: string;
  }