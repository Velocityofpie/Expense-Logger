// src/types/invoice.types.ts

/**
 * Interface for line item in an invoice
 */
export interface LineItem {
  item_id?: number;
  invoice_id?: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  product_link?: string;
  documentation?: string;
  condition?: string;
  paid_by?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Interface for payment record
 */
export interface Payment {
  payment_id: number;
  invoice_id: number;
  card_number_id: number;
  amount: number;
  transaction_id: string;
  payment_date: string;
  created_at: string;
  updated_at?: string;
}

/**
 * Interface for invoice status
 */
export type InvoiceStatus = 'Open' | 'Paid' | 'Draft' | 'Needs Attention' | 'Resolved';

/**
 * Interface for invoice data
 */
export interface Invoice {
  invoice_id: number;
  user_id?: number;
  file_name?: string;
  merchant_name?: string;
  order_number?: string;
  purchase_date?: string;
  payment_method?: string;
  grand_total?: number | string;
  shipping_handling?: number | string;
  estimated_tax?: number | string;
  total_before_tax?: number | string;
  billing_address?: string;
  credit_card_transactions?: number | string;
  gift_card_amount?: number | string;
  refunded_amount?: number | string;
  status: InvoiceStatus;
  notes?: string;
  categories?: string[];
  tags?: string[];
  items?: LineItem[];
  payments?: Payment[];
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

/**
 * Interface for invoice filter options
 */
export interface InvoiceFilters {
  status?: string;
  category?: string;
  searchTerm?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
}

/**
 * Interface for invoice list API response
 */
export interface InvoiceListResponse {
  invoices: Invoice[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Interface for invoice creation response
 */
export interface InvoiceCreateResponse {
  invoice_id: number;
  message: string;
  success: boolean;
}

/**
 * Interface for invoice update response
 */
export interface InvoiceUpdateResponse {
  invoice_id: number;
  message: string;
  success: boolean;
}

/**
 * Interface for invoice deletion response
 */
export interface InvoiceDeleteResponse {
  invoice_id: number;
  message: string;
  success: boolean;
}

/**
 * Interface for invoice upload request
 */
export interface InvoiceUploadRequest {
  file: File;
  use_templates?: boolean;
}

/**
 * Interface for manual invoice entry
 */
export interface InvoiceEntryRequest {
  merchant_name: string;
  order_number?: string;
  purchase_date?: string;
  payment_method?: string;
  grand_total: number;
  status: InvoiceStatus;
  notes?: string;
  categories?: string[];
  tags?: string[];
  items?: Omit<LineItem, 'item_id' | 'invoice_id' | 'created_at' | 'updated_at'>[];
}