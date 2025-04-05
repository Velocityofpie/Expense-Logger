// expensesApi.ts
// API calls for the expenses feature

import { ExpenseItem, Product } from './expenseHelpers';

// Define API_URL from environment or fallback to localhost
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

// Updating the fetchExpenseData function in expensesApi.ts

/**
 * Fetch expense data with optional filters
 * @param viewBy Group view parameter ('itemType', 'store', 'date', 'card')
 * @param category Category filter (optional)
 * @param dateFilter Date range filter (optional)
 * @returns Promise that resolves to expense data
 */
export async function fetchExpenseData(
  viewBy: string = 'itemType', 
  category: string = '', 
  dateFilter: string = 'all'
): Promise<any> {
  try {
    // Build the query string based on parameters
    let url = `${API_URL}/expenses/summary/?view_by=${viewBy}`;
    
    // Only add category parameter if it's not 'All' and not empty
    if (category && category !== 'All') {
      url += `&category=${encodeURIComponent(category)}`;
    }
    
    if (dateFilter && dateFilter !== 'all') {
      url += `&date_filter=${dateFilter}`;
    }
    
    console.log(`Fetching expense data with URL: ${url}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to fetch expense data');
    }
    
    return response.json();
  } catch (error) {
    console.error("Error fetching expense data:", error);
    throw error;
  }
}
/**
 * Add a new expense
 * @param expenseData Expense data to add
 * @returns Promise that resolves to the added expense
 */
export async function addExpense(expenseData: {
  store: string;
  category: string;
  creditCard: string;
  date?: string;
  orderNumber?: string;
  total: number;
  products: Product[];
}): Promise<any> {
  try {
    // Transform to the format expected by your backend
    const invoiceData = {
      merchant_name: expenseData.store,
      order_number: expenseData.orderNumber || "",
      purchase_date: expenseData.date || new Date().toISOString().split('T')[0],
      payment_method: expenseData.creditCard,
      grand_total: expenseData.total,
      status: "Open",
      categories: [expenseData.category],
      items: expenseData.products.map(product => ({
        product_name: product.name,
        quantity: product.quantity,
        unit_price: product.price,
        item_type: product.item_type || expenseData.category  // Set item_type from product or default to category
      }))
    };
    
    // Call your existing addInvoiceEntry function from the base API
    const response = await fetch(`${API_URL}/add-entry/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(invoiceData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to add expense');
    }
    
    return response.json();
  } catch (error) {
    console.error("Error adding expense:", error);
    throw error;
  }
}

/**
 * Update an existing expense
 * @param id ID of the expense to update
 * @param expenseData Updated expense data
 * @returns Promise that resolves to the updated expense
 */
export async function updateExpense(
  id: number, 
  expenseData: {
    store: string;
    category: string;
    creditCard: string;
    date?: string;
    orderNumber?: string;
    total: number;
    products: Product[];
  }
): Promise<any> {
  try {
    // Transform to the format expected by your backend
    const invoiceData = {
      merchant_name: expenseData.store,
      order_number: expenseData.orderNumber || "",
      purchase_date: expenseData.date || new Date().toISOString().split('T')[0],
      payment_method: expenseData.creditCard,
      grand_total: expenseData.total,
      categories: [expenseData.category],
      items: expenseData.products.map(product => ({
        product_name: product.name,
        quantity: product.quantity,
        unit_price: product.price,
        item_type: product.item_type || expenseData.category  // Set item_type from product or default to category
      }))
    };
    
    // Call the API endpoint to update the expense
    const response = await fetch(`${API_URL}/update/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(invoiceData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to update expense');
    }
    
    return response.json();
  } catch (error) {
    console.error("Error updating expense:", error);
    throw error;
  }
}

/**
 * Delete an expense
 * @param id ID of the expense to delete
 * @returns Promise that resolves when the expense is deleted
 */
export async function deleteExpense(id: number): Promise<any> {
  try {
    const response = await fetch(`${API_URL}/delete/${id}`, {
      method: "DELETE",
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to delete expense');
    }
    
    return response.json();
  } catch (error) {
    console.error("Error deleting expense:", error);
    throw error;
  }
}

/**
 * Fetch available categories for expenses
 * @returns Promise that resolves to an array of categories
 */
export async function fetchCategories(): Promise<string[]> {
  try {
    const response = await fetch(`${API_URL}/categories/`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to fetch categories');
    }
    
    return response.json();
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
}

/**
 * Fetch expense statistics
 * @param category Optional category filter
 * @param dateRange Optional date range filter
 * @returns Promise that resolves to expense statistics
 */
export async function fetchExpenseStatistics(
  category: string = 'All',
  dateRange: string = 'all'
): Promise<any> {
  try {
    let url = `${API_URL}/expenses/stats/`;
    
    // Add query parameters if provided
    const params = new URLSearchParams();
    if (category && category !== 'All') {
      params.append('category', category);
    }
    if (dateRange && dateRange !== 'all') {
      params.append('date_filter', dateRange);
    }
    
    // Append params to URL if any exist
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to fetch expense statistics');
    }
    
    return response.json();
  } catch (error) {
    console.error("Error fetching expense statistics:", error);
    throw error;
  }
}