// src/utils/expenseTransformers.ts
import { ExpenseItem, ExpenseGroup } from './types';

/**
 * Interface for raw expense data format (as provided in the sample)
 */
export interface RawExpense {
  id: number;
  merchant: string;
  date: string;
  orderNumber: string;
  cardUsed: string;
  products: {
    name: string;
    quantity: number;
    unitPrice: number;
  }[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  category: string;
}

/**
 * Transform raw expense data to the application's ExpenseItem format
 * @param rawExpenses - Array of raw expense objects
 * @returns Array of ExpenseItem objects
 */
export const transformRawExpensesToAppFormat = (
  rawExpenses: RawExpense[]
): ExpenseItem[] => {
  return rawExpenses.map(raw => ({
    id: raw.id,
    store: raw.merchant,
    orderNumber: raw.orderNumber,
    date: raw.date,
    category: raw.category,
    creditCard: raw.cardUsed,
    total: raw.total,
    products: raw.products.map(p => ({
      name: p.name,
      price: p.unitPrice,
      quantity: p.quantity,
      item_type: raw.category
    }))
  }));
};

/**
 * Transform app format expenses to raw expense format
 * @param expenses - Array of ExpenseItem objects
 * @returns Array of RawExpense objects
 */
export const transformAppExpensesToRawFormat = (
  expenses: ExpenseItem[]
): RawExpense[] => {
  return expenses.map(item => ({
    id: item.id,
    merchant: item.store,
    date: item.date,
    orderNumber: item.orderNumber,
    cardUsed: item.creditCard,
    category: item.category,
    products: item.products.map(p => ({
      name: p.name,
      quantity: p.quantity,
      unitPrice: p.price
    })),
    subtotal: item.products.reduce((sum, p) => sum + (p.price * p.quantity), 0),
    shipping: 0, // We'll default to 0 if not available in app format
    tax: 0, // We'll default to 0 if not available in app format
    total: item.total
  }));
};

/**
 * Group expenses by category
 * @param expenses - Array of ExpenseItem objects
 * @returns Object with expenses grouped by category
 */
export const groupExpensesByCategory = (
  expenses: ExpenseItem[]
): Record<string, ExpenseItem[]> => {
  return expenses.reduce((groups, expense) => {
    const category = expense.category || 'Uncategorized';
    
    if (!groups[category]) {
      groups[category] = [];
    }
    
    groups[category].push(expense);
    return groups;
  }, {} as Record<string, ExpenseItem[]>);
};

/**
 * Convert grouped expenses to ExpenseGroup array format
 * @param groupedExpenses - Expenses grouped by category
 * @returns Array of ExpenseGroup objects
 */
export const convertGroupedToExpenseGroups = (
  groupedExpenses: Record<string, ExpenseItem[]>
): ExpenseGroup[] => {
  return Object.entries(groupedExpenses).map(([category, items]) => ({
    name: category,
    items,
    count: items.length,
    total: items.reduce((sum, item) => sum + item.total, 0)
  }));
};

/**
 * Process the sample expense data into the application format
 * @param sampleData - Raw sample expense data
 * @returns ExpenseGroup array ready for use in the app
 */
export const processSampleData = (
  sampleData: RawExpense[]
): ExpenseGroup[] => {
  // Transform to app format
  const appFormatExpenses = transformRawExpensesToAppFormat(sampleData);
  
  // Group by category
  const groupedByCategory = groupExpensesByCategory(appFormatExpenses);
  
  // Convert to ExpenseGroup array
  return convertGroupedToExpenseGroups(groupedByCategory);
};