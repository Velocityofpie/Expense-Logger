// dashboard/types.ts - TypeScript types for dashboard

export interface Invoice {
    invoice_id: number;
    order_number?: string;
    purchase_date?: string;
    file_name?: string;
    merchant_name?: string;
    payment_method?: string;
    grand_total?: number;
    status?: string;
    notes?: string;
    shipping_handling?: number;
    estimated_tax?: number;
    total_before_tax?: number;
    billing_address?: string;
    credit_card_transactions?: number;
    gift_card_amount?: number;
    refunded_amount?: number;
    items?: InvoiceItem[];
    tags?: string[];
    categories?: string[];
  }
  
  export interface InvoiceItem {
    product_name: string;
    quantity: number;
    unit_price: number;
    product_link?: string;
    documentation?: string;
    condition?: string;
    paid_by?: string;
  }
  
  export interface ChartData {
    month: string; 
    amount: number;
  }
  
  export interface CategoryChartData {
    name: string;
    value: number;
  }
  
  export interface StatusChartData {
    name: string;
    value: number;
  }
  
  export interface PaymentMethodChartData {
    name: string;
    value: number;
  }
  
  export interface DashboardStats {
    totalInvoices: number;
    totalAmount: number;
    openInvoices: number;
    paidInvoices: number;
    averageInvoiceAmount: number;
  }
  
  export interface DashboardCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: "blue" | "indigo" | "purple" | "pink";
    percentage?: number;
    trend?: "up" | "down";
  }