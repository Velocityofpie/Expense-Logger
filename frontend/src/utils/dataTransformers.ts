/**
 * Utility functions for transforming data between different formats and structures
 */

import { 
    Invoice, 
    Item, 
    ExpenseItem, 
    ExpenseGroup,
    User,
    GroupedExpenses,
    ChartData,
    ApiResponse
  } from './types';
  
  /**
   * Transform invoice data from API format to expense tracker format
   * @param invoices - Array of invoice objects from API
   * @returns Object containing expense data grouped by category
   */
  export const transformInvoicesToExpenseTrackerFormat = (
    invoices: Invoice[]
  ): Record<string, ExpenseItem[]> => {
    // Ensure we have an array to work with
    if (!Array.isArray(invoices)) {
      console.error('transformInvoicesToExpenseTrackerFormat: Input is not an array', invoices);
      return {};
    }
    
    // Group invoices by main category (Camera, Server, Home Network, etc.)
    const categorizedData: Record<string, ExpenseItem[]> = {};
    
    invoices.forEach(invoice => {
      // Get the primary category
      let mainCategory = "Other";
      if (invoice.categories && invoice.categories.length > 0) {
        // Use first category as main category
        mainCategory = invoice.categories[0];
      }
      
      // Initialize category if it doesn't exist
      if (!categorizedData[mainCategory]) {
        categorizedData[mainCategory] = [];
      }
      
      // Transform invoice to expense format
      const expense: ExpenseItem = {
        id: invoice.invoice_id,
        store: invoice.merchant_name || "",
        orderNumber: invoice.order_number || `Order # ${mainCategory.substring(0, 3).toUpperCase()}-${String(invoice.invoice_id).padStart(3, '0')}`,
        date: invoice.purchase_date || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        category: invoice.categories && invoice.categories.length > 0 ? invoice.categories[0] : "Uncategorized",
        creditCard: invoice.payment_method || "Unknown",
        total: invoice.grand_total || 0,
        products: (invoice.items || []).map(item => ({
          name: item.product_name || '',
          price: item.unit_price || 0,
          quantity: item.quantity || 1,
          item_type: item.item_type || mainCategory
        }))
      };
      
      // Add to the appropriate category
      categorizedData[mainCategory].push(expense);
    });
    
    return categorizedData;
  };
  
  /**
   * Group expense items by a specified criterion for display in the expense tracker
   * @param expenses - Array of expense items to group
   * @param groupBy - Field to group expenses by
   * @returns Array of expense groups
   */
  export const groupExpensesByField = (
    expenses: ExpenseItem[],
    groupBy: 'category' | 'store' | 'date' | 'creditCard' = 'category'
  ): ExpenseGroup[] => {
    // Map to keys for easy reference
    const keyMap: Record<string, string> = {
      'category': 'category',
      'store': 'store',
      'date': 'date',
      'creditCard': 'creditCard'
    };
    
    // Get the field to group by
    const field = keyMap[groupBy] || 'category';
    
    // Group expenses
    const groupedData: Record<string, ExpenseItem[]> = {};
    
    expenses.forEach(expense => {
      const key = expense[field] as string || 'Unknown';
      
      if (!groupedData[key]) {
        groupedData[key] = [];
      }
      
      groupedData[key].push(expense);
    });
    
    // Transform into array of group objects
    return Object.entries(groupedData).map(([name, items]) => {
      // Calculate totals and counts
      const total = items.reduce((sum, item) => sum + item.total, 0);
      
      return {
        name,
        items,
        total,
        count: items.length
      };
    }).sort((a, b) => b.total - a.total); // Sort by total in descending order
  };
  
  /**
   * Transform invoice data for chart display
   * @param invoices - Array of invoices
   * @param chartType - Type of chart to prepare data for
   * @returns Formatted chart data
   */
  export const prepareChartData = (
    invoices: Invoice[],
    chartType: 'monthly' | 'category' | 'status' | 'paymentMethod' = 'monthly'
  ): ChartData => {
    if (!Array.isArray(invoices)) {
      console.error('prepareChartData: Input is not an array', invoices);
      return { data: [] };
    }
    
    switch (chartType) {
      case 'monthly': {
        // Monthly spending data
        const monthlyData: Record<string, number> = {};
        
        invoices.forEach(inv => {
          if (inv.purchase_date) {
            const date = new Date(inv.purchase_date);
            const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
            
            if (!monthlyData[monthYear]) {
              monthlyData[monthYear] = 0;
            }
            monthlyData[monthYear] += parseFloat(String(inv.grand_total || 0));
          }
        });
        
        return {
          data: Object.keys(monthlyData)
            .map(month => ({
              name: month,
              value: monthlyData[month]
            }))
            .sort((a, b) => a.name.localeCompare(b.name))
        };
      }
      
      case 'category': {
        // Category data
        const categoryData: Record<string, number> = {};
        
        invoices.forEach(inv => {
          if (inv.categories && inv.categories.length > 0) {
            inv.categories.forEach(cat => {
              if (!categoryData[cat]) {
                categoryData[cat] = 0;
              }
              categoryData[cat] += parseFloat(String(inv.grand_total || 0));
            });
          } else {
            if (!categoryData["Uncategorized"]) {
              categoryData["Uncategorized"] = 0;
            }
            categoryData["Uncategorized"] += parseFloat(String(inv.grand_total || 0));
          }
        });
        
        return {
          data: Object.keys(categoryData)
            .map(category => ({
              name: category,
              value: categoryData[category]
            }))
            .sort((a, b) => b.value - a.value)
        };
      }
      
      case 'status': {
        // Status data
        const statusData: Record<string, number> = {};
        
        invoices.forEach(inv => {
          const status = inv.status || "Unknown";
          if (!statusData[status]) {
            statusData[status] = 0;
          }
          statusData[status] += 1;
        });
        
        return {
          data: Object.keys(statusData)
            .map(status => ({
              name: status,
              value: statusData[status]
            }))
        };
      }
      
      case 'paymentMethod': {
        // Payment method data
        const paymentMethodData: Record<string, number> = {};
        
        invoices.forEach(inv => {
          const method = inv.payment_method || "Unknown";
          if (!paymentMethodData[method]) {
            paymentMethodData[method] = 0;
          }
          paymentMethodData[method] += parseFloat(String(inv.grand_total || 0));
        });
        
        return {
          data: Object.keys(paymentMethodData)
            .map(method => ({
              name: method,
              value: paymentMethodData[method]
            }))
            .sort((a, b) => b.value - a.value)
        };
      }
      
      default:
        return { data: [] };
    }
  };
  
  /**
   * Transform API response data to a standardized format
   * @param response - API response object
   * @returns Normalized data structure
   */
  export const normalizeApiResponse = <T>(response: ApiResponse<T>): T | null => {
    // Check if response is valid
    if (!response) return null;
    
    // Handle error responses
    if (response.error) {
      console.error('API Error:', response.error);
      return null;
    }
    
    // Return data or an empty result based on response structure
    if (response.data !== undefined) {
      return response.data;
    } else if (response.results !== undefined) {
      return response.results as unknown as T;
    } else if (Object.keys(response).length > 0 && !('status' in response)) {
      // If response has keys but no explicit data/results field, return the whole object
      return response as unknown as T;
    }
    
    return null;
  };
  
  /**
   * Transform a flat array of items into a hierarchical tree structure
   * @param items - Flat array of items
   * @param options - Configuration for building the tree
   * @returns Tree structure
   */
  export const buildTree = <T extends { [key: string]: any }>(
    items: T[],
    options: {
      idField?: string;
      parentIdField?: string;
      childrenField?: string;
      rootParentId?: any;
    } = {}
  ): T[] => {
    const {
      idField = 'id',
      parentIdField = 'parent_id',
      childrenField = 'children',
      rootParentId = null
    } = options;
    
    // Create a map for quick lookup
    const itemMap: Record<string | number, T & { [key: string]: any }> = {};
    
    // First pass: add all items to the map
    items.forEach(item => {
      const id = item[idField];
      
      if (id !== undefined) {
        // Clone the item and initialize children array
        itemMap[id] = { 
          ...item, 
          [childrenField]: [] 
        };
      }
    });
    
    // Second pass: build the tree structure
    const rootItems: T[] = [];
    
    Object.values(itemMap).forEach(item => {
      const parentId = item[parentIdField];
      
      if (parentId === rootParentId) {
        // This is a root item
        rootItems.push(item);
      } else if (parentId !== undefined && itemMap[parentId]) {
        // Add as child to parent
        itemMap[parentId][childrenField].push(item);
      } else {
        // No valid parent found, add to root
        rootItems.push(item);
      }
    });
    
    return rootItems;
  };
  
  /**
   * Transform user data for display or storage
   * @param user - User object from API
   * @returns Transformed user object
   */
  export const transformUserData = (user: User): Partial<User> => {
    // Return a sanitized version of the user object
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      // Don't include sensitive data like password hash, tokens, etc.
      created_at: user.created_at,
      last_login: user.last_login
    };
  };
  
  /**
   * Convert form data to API format for invoice creation or update
   * @param formData - Frontend form data
   * @returns Invoice data in API format
   */
  export const transformFormToInvoice = (
    formData: any
  ): Partial<Invoice> => {
    // Basic validation
    if (!formData) return {};
    
    // Transform to invoice format
    return {
      merchant_name: formData.store || formData.merchant_name,
      order_number: formData.orderNumber || formData.order_number,
      purchase_date: formData.date || formData.purchase_date,
      payment_method: formData.creditCard || formData.payment_method,
      grand_total: parseFloat(formData.total || formData.grand_total || 0),
      status: formData.status || "Open",
      categories: formData.category ? [formData.category] : formData.categories || [],
      items: (formData.products || formData.items || []).map((product: any) => ({
        product_name: product.name || product.product_name,
        quantity: product.quantity || 1,
        unit_price: product.price || product.unit_price || 0,
        item_type: product.item_type || formData.category || "Uncategorized"
      }))
    };
  };