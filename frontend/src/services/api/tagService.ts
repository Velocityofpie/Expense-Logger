import { get, post, del } from './client';

/**
 * Fetch all available tags
 */
export const fetchTags = async (): Promise<string[]> => {
  try {
    return await get<string[]>('/tags/');
  } catch (error) {
    console.error('Error fetching tags:', error);
    throw error;
  }
};

/**
 * Add a new tag
 */
export const addTag = async (tag: string): Promise<{ success: boolean; tag: string }> => {
  try {
    return await post<{ success: boolean; tag: string }>('/tags/', { tag });
  } catch (error) {
    console.error('Error adding tag:', error);
    throw error;
  }
};

/**
 * Delete a tag
 */
export const deleteTag = async (tag: string): Promise<{ success: boolean; message: string }> => {
  try {
    return await del<{ success: boolean; message: string }>(`/tags/${encodeURIComponent(tag)}`);
  } catch (error) {
    console.error(`Error deleting tag ${tag}:`, error);
    throw error;
  }
};

/**
 * Get invoices by tag
 */
export const getInvoicesByTag = async (tag: string): Promise<any[]> => {
  try {
    return await get<any[]>(`/tags/${encodeURIComponent(tag)}/invoices`);
  } catch (error) {
    console.error(`Error fetching invoices for tag ${tag}:`, error);
    throw error;
  }
};

/**
 * Get most used tags
 * Returns tags sorted by usage frequency
 */
export const getMostUsedTags = async (limit?: number): Promise<{ tag: string; count: number }[]> => {
  try {
    const url = limit ? `/tags/most-used?limit=${limit}` : '/tags/most-used';
    return await get<{ tag: string; count: number }[]>(url);
  } catch (error) {
    console.error('Error fetching most used tags:', error);
    throw error;
  }
};

export default {
  fetchTags,
  addTag,
  deleteTag,
  getInvoicesByTag,
  getMostUsedTags
};