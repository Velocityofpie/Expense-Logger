// types.ts
export interface Invoice {
  invoice_id: number;
  merchant_name: string;
  order_number?: string;
  purchase_date?: string;
  payment_method?: string;
  grand_total: number;
  status: string; // Change from union type to string
  notes?: string;
  shipping_handling?: number;
  estimated_tax?: number;
  total_before_tax?: number;
  billing_address?: string;
  credit_card_transactions?: number;
  gift_card_amount?: number;
  refunded_amount?: number;
  file_name?: string;
  items: LineItem[];
  tags: string[];
  categories: string[];
}
  
  export interface LineItem {
    product_name: string;
    quantity: number;
    unit_price: number;
    product_link?: string;
    documentation?: string;
    condition?: string; // Allow any string value
    paid_by?: string;
    item_type?: string; 
  }
  
  export interface InvoiceFormData {
    merchant_name: string;
    order_number?: string;
    purchase_date?: string;
    payment_method?: string;
    grand_total: number | string;
    status: string;
    notes?: string;
    items: {
      product_name: string;
      quantity: number;
      unit_price: number;
      product_link?: string;
      documentation?: string;
      condition?: string; // Make this a string instead of union type
      paid_by?: string;
      item_type?: string;
    }[];
    tags: string[];
    categories: string[];
    shipping_handling?: number | string;
    estimated_tax?: number | string;
    billing_address?: string;
  }
  
  export interface InvoiceFilters {
    status: string;
    category: string;
    searchTerm: string;
  }
  
  export interface UploadResult {
    success: boolean;
    invoice_id?: number;
    error?: string;
    fileName?: string;
  }