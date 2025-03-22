import { get, post, put, del } from './client';

/**
 * Fetch all available categories
 */
export const fetchCategories = async (): Promise<string[]> => {
  try {
    return await get<string[]>('/categories/');
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

/**
 * Add a new category
 */
export const addCategory = async (category: string): Promise<{ success: boolean; category: string }> => {
  try {
    return await post<{ success: boolean; category: string }>('/categories/', { category });
  } catch (error) {
    console.error('Error adding category:', error);
    throw error;
  }
};

/**
 * Delete a category
 */
export const deleteCategory = async (category: string): Promise<{ success: boolean; message: string }> => {
  try {
    return await del<{ success: boolean; message: string }>(`/categories/${encodeURIComponent(category)}`);
  } catch (error) {
    console.error(`Error deleting category ${category}:`, error);
    throw error;
  }
};

/**
 * Get invoices by category
 */
export const getInvoicesByCategory = async (category: string): Promise<any[]> => {
  try {
    return await get<any[]>(`/categories/${encodeURIComponent(category)}/invoices`);
  } catch (error) {
    console.error(`Error fetching invoices for category ${category}:`, error);
    throw error;
  }
};

/**
 * Get spending by category
 * Returns spending statistics grouped by category
 */
export const getSpendingByCategory = async (
  params?: {
    startDate?: string;
    endDate?: string;
    limit?: number;
  }
): Promise<{ category: string; total: number }[]> => {
  try {
    // Build query parameters
    const queryParams = new URLSearchParams();
    
    if (params) {
      if (params.startDate) queryParams.append('start_date', params.startDate);
      if (params.endDate) queryParams.append('end_date', params.endDate);
      if (params.limit !== undefined) queryParams.append('limit', params.limit.toString());
    }
    
    const queryString = queryParams.toString();
    const url = `/categories/spending${queryString ? `?${queryString}` : ''}`;
    
    return await get<{ category: string; total: number }[]>(url);
  } catch (error) {
    console.error('Error fetching spending by category:', error);
    throw error;
  }
};

export default {
  fetchCategories,
  addCategory,
  deleteCategory,
  getInvoicesByCategory,
  getSpendingByCategory
};