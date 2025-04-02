// src/features/invoices/invoiceDetail/utils/invoiceCalculations.ts
import { LineItem } from '../../invoices/types';

/**
 * Format a number as currency with dollar sign
 * @param value - Number to format as currency
 * @returns Formatted currency string
 */
export const formatCurrency = (value?: number | string | null): string => {
  if (value === undefined || value === null) return "$0.00";
  
  // Convert string to number if needed
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  // Check if the conversion resulted in a valid number
  if (isNaN(numValue)) return "$0.00";
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(numValue);
};

/**
 * Calculate the total price for a line item
 * @param item - Line item object
 * @returns Total price for the item
 */
export const calculateItemTotal = (item: LineItem): number => {
  const quantity = item.quantity !== null && item.quantity !== undefined ? item.quantity : 0;
  const unitPrice = item.unit_price !== null && item.unit_price !== undefined ? item.unit_price : 0;
  
  return quantity * unitPrice;
};

/**
 * Calculate the subtotal of all line items
 * @param items - Array of line items
 * @returns Total sum of all items
 */
export const calculateSubtotal = (items: LineItem[]): number => {
  return items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
};

/**
 * Get CSS color class for an invoice status
 * @param status - Invoice status
 * @returns CSS class for the status color
 */
export const getStatusColor = (status: string): string => {
  switch(status) {
    case "Paid":
      return "bg-green-500";
    case "Open":
      return "bg-blue-500";
    case "Needs Attention":
      return "bg-red-500";
    case "Draft":
      return "bg-gray-500";
    default:
      return "bg-gray-400";
  }
};

/**
 * Calculate the remaining balance on an invoice
 * @param totalAmount - Total invoice amount
 * @param paidAmount - Amount already paid
 * @returns Remaining balance
 */
export const calculateBalance = (totalAmount: number, paidAmount: number): number => {
  return totalAmount - paidAmount;
};