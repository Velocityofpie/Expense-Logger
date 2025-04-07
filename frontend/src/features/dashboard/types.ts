// src/features/dashboard/types.ts

export interface InvoiceItem {
  product_name: string;
  quantity: number;
  unit_price: number;
  item_type?: string;
}

export interface Invoice {
  invoice_id: number;
  merchant_name: string;
  order_number?: string;
  purchase_date?: string;
  payment_method?: string;
  status: string;
  grand_total: number;
  categories?: string[];
  items?: InvoiceItem[];
  tags?: string[];
}

export interface ChartDataPoint {
  name: string;
  value: number;
}

export interface MonthlyDataPoint {
  month: string;
  amount: number;
}

export interface DashboardStats {
  totalInvoices: number;
  totalAmount: number;
  openInvoices: number;
  paidInvoices: number;
  averageInvoiceAmount: number;
}

export interface ChartData {
  monthly: MonthlyDataPoint[];
  category: ChartDataPoint[];
  status: ChartDataPoint[];
  paymentMethod: ChartDataPoint[];
}

export const CHART_COLORS = [
  "#4f46e5", "#3730a3", "#6d28d9", "#be185d", "#0284c7", 
  "#0891b2", "#4338ca", "#db2777", "#0ea5e9", "#14b8a6"
];

// Helper function for formatting currency
export const formatCurrency = (value: number | string | undefined): string => {
  if (value === undefined) return '$0.00';
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(numValue);
};

// Helper for tooltips
export const tooltipFormatter = (value: any) => {
  return formatCurrency(typeof value === 'number' ? value : 0);
};