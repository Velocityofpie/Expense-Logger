// src/features/expense/expenseHelpers.ts
// Utility functions for the expense tracking feature

/**
 * Types for expense tracking
 */
export interface Product {
  name: string;
  price: number;
  quantity: number;
  item_type?: string;
}

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

export interface ExpenseGroup {
  name: string;
  items: ExpenseItem[];
  count: number;
  total: number;
}

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

/**
 * Format a number as currency
 * @param value - The value to format
 * @returns Formatted currency string
 */
export const formatCurrency = (value: number): string => {
  if (value === undefined || value === null) return "$0.00";
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

/**
 * Filter expenses by category
 * @param data - Array of expense items
 * @param category - Category to filter by
 * @returns Filtered array of expense items
 */
export const filterDataByCategory = (data: ExpenseItem[], category: string): ExpenseItem[] => {
  if (!category || category === 'All') return data;
  return data.filter(item => item.category === category);
};

/**
 * Filter expenses by date range
 * @param data - Array of expense items
 * @param dateFilter - Date filter string ('all', '3months', '6months', '1year')
 * @returns Filtered array of expense items
 */
export const filterDataByDate = (data: ExpenseItem[], dateFilter: string): ExpenseItem[] => {
  if (!dateFilter || dateFilter === 'all') return data;
  
  const now = new Date();
  const cutoffDate = new Date();
  
  switch (dateFilter) {
    case '3months':
      cutoffDate.setMonth(now.getMonth() - 3);
      break;
    case '6months':
      cutoffDate.setMonth(now.getMonth() - 6);
      break;
    case '1year':
      cutoffDate.setFullYear(now.getFullYear() - 1);
      break;
    default:
      return data;
  }
  
  return data.filter(item => {
    const itemDate = new Date(item.date);
    return itemDate >= cutoffDate;
  });
};

/**
 * Filter expenses by search term
 * @param data - Array of expense items
 * @param searchTerm - Search term to filter by
 * @returns Filtered array of expense items
 */
export const filterDataBySearchTerm = (data: ExpenseItem[], searchTerm: string): ExpenseItem[] => {
  if (!searchTerm) return data;
  
  const search = searchTerm.toLowerCase();
  
  return data.filter(item => 
    item.store.toLowerCase().includes(search) ||
    item.orderNumber.toLowerCase().includes(search) ||
    item.category.toLowerCase().includes(search) ||
    item.creditCard.toLowerCase().includes(search) ||
    (item.products && item.products.some(p => p.name.toLowerCase().includes(search)))
  );
};

/**
 * Group expenses by different criteria
 * @param data - Array of expense items
 * @param groupBy - Grouping criteria ('itemType', 'store', 'date', 'card')
 * @returns Array of expense groups
 */
export const groupExpenseData = (data: ExpenseItem[], groupBy: string): ExpenseGroup[] => {
  const groups: Record<string, ExpenseItem[]> = {};
  
  // Group data
  data.forEach(item => {
    let groupKey = '';
    
    switch(groupBy) {
      case 'itemType':
        groupKey = item.category || 'Uncategorized';
        break;
      case 'store':
        groupKey = item.store || 'Unknown Store';
        break;
      case 'date':
        // Group by month
        const date = new Date(item.date);
        groupKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
        break;
      case 'card':
        groupKey = item.creditCard || 'Unknown Card';
        break;
      default:
        groupKey = 'All';
    }
    
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    
    groups[groupKey].push(item);
  });
  
  // Convert to array and calculate totals
  const result: ExpenseGroup[] = Object.keys(groups).map(key => {
    const items = groups[key];
    const total = items.reduce((sum, item) => sum + item.total, 0);
    
    return {
      name: key,
      items,
      count: items.length,
      total
    };
  });
  
  // Sort groups by total (descending)
  return result.sort((a, b) => b.total - a.total);
};

/**
 * Sort expense items
 * @param data - Array of expense items
 * @param sortConfig - Sort configuration
 * @returns Sorted array of expense items
 */
export const sortExpenseItems = (data: ExpenseItem[], sortConfig: SortConfig): ExpenseItem[] => {
  return [...data].sort((a, b) => {
    let aValue: any = a[sortConfig.key as keyof ExpenseItem];
    let bValue: any = b[sortConfig.key as keyof ExpenseItem];
    
    // Handle special cases
    if (sortConfig.key === 'date') {
      aValue = new Date(a.date);
      bValue = new Date(b.date);
    }
    
    // Handle string comparisons
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    
    if (aValue < bValue) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });
};

/**
 * Calculate statistics from expense data
 * @param data - Array of expense items
 * @returns Statistics object
 */
export const calculateExpenseStatistics = (data: ExpenseItem[]) => {
  if (!data || data.length === 0) {
    return {
      total: 0,
      average: 0,
      highest: 0,
      lowest: 0,
      count: 0
    };
  }
  
  const total = data.reduce((sum, item) => sum + item.total, 0);
  const sortedByAmount = [...data].sort((a, b) => a.total - b.total);
  const lowest = sortedByAmount[0].total;
  const highest = sortedByAmount[sortedByAmount.length - 1].total;
  
  return {
    total,
    average: total / data.length,
    highest,
    lowest,
    count: data.length
  };
};

/**
 * Get top spending categories
 * @param data - Array of expense items
 * @param limit - Maximum number of categories to return
 * @returns Array of category stats
 */
export const getTopCategories = (data: ExpenseItem[], limit: number = 3) => {
  const categories: Record<string, number> = {};
  
  data.forEach(item => {
    const category = item.category || 'Uncategorized';
    if (!categories[category]) {
      categories[category] = 0;
    }
    categories[category] += item.total;
  });
  
  return Object.entries(categories)
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, limit);
};

/**
 * Get top merchants/stores
 * @param data - Array of expense items
 * @param limit - Maximum number of stores to return
 * @returns Array of store stats
 */
export const getTopStores = (data: ExpenseItem[], limit: number = 3) => {
  const stores: Record<string, number> = {};
  
  data.forEach(item => {
    const store = item.store || 'Unknown Store';
    if (!stores[store]) {
      stores[store] = 0;
    }
    stores[store] += item.total;
  });
  
  return Object.entries(stores)
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, limit);
};

/**
 * Get top payment methods/cards
 * @param data - Array of expense items
 * @param limit - Maximum number of cards to return
 * @returns Array of card stats
 */
export const getTopPaymentMethods = (data: ExpenseItem[], limit: number = 3) => {
  const cards: Record<string, number> = {};
  
  data.forEach(item => {
    const card = item.creditCard || 'Unknown Card';
    if (!cards[card]) {
      cards[card] = 0;
    }
    cards[card] += item.total;
  });
  
  return Object.entries(cards)
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, limit);
};