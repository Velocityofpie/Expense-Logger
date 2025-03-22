import { get, post, put, del } from './client';
import { Invoice, InvoiceListResponse, InvoiceFilterParams, InvoiceUploadResponse, Payment } from '../../types/invoice.types';

const BASE_URL = '';  // Base URL is already set in the client

/**
 * Fetch all invoices with optional pagination and filters
 */
export const fetchInvoices = async (
  params?: {
    skip?: number;
    limit?: number;
    userId?: string;
  } & InvoiceFilterParams
): Promise<Invoice[]> => {
  try {
    // Build query parameters
    const queryParams = new URLSearchParams();
    
    if (params) {
      if (params.skip !== undefined) queryParams.append('skip', params.skip.toString());
      if (params.limit !== undefined) queryParams.append('limit', params.limit.toString());
      if (params.userId) queryParams.append('user_id', params.userId);
      if (params.status) queryParams.append('status', params.status);
      if (params.category) queryParams.append('category', params.category);
      if (params.searchTerm) queryParams.append('search', params.searchTerm);
      if (params.startDate) queryParams.append('start_date', params.startDate);
      if (params.endDate) queryParams.append('end_date', params.endDate);
      if (params.tag) queryParams.append('tag', params.tag);
      if (params.minAmount !== undefined) queryParams.append('min_amount', params.minAmount.toString());
      if (params.maxAmount !== undefined) queryParams.append('max_amount', params.maxAmount.toString());
    }
    
    const queryString = queryParams.toString();
    const url = `/invoices/${queryString ? `?${queryString}` : ''}`;
    
    const response = await get<InvoiceListResponse | Invoice[]>(url);
    
    // Handle both response formats (array or object with invoices property)
    if (Array.isArray(response)) {
      return response;
    } else {
      return response.invoices || [];
    }
  } catch (error) {
    console.error('Error fetching invoices:', error);
    throw error;
  }
};

/**
 * Fetch a single invoice by ID
 */
export const fetchInvoiceById = async (id: string | number): Promise<Invoice> => {
  try {
    return await get<Invoice>(`/invoice/${id}`);
  } catch (error) {
    console.error(`Error fetching invoice ${id}:`, error);
    throw error;
  }
};

/**
 * Upload an invoice file
 */
export const uploadInvoice = async (formData: FormData): Promise<InvoiceUploadResponse> => {
  try {
    console.log(`Attempting to upload to: /upload/`);
    
    // Use post without Content-Type header (browser will set it with boundary)
    return await post<InvoiceUploadResponse, FormData>(
      '/upload/',
      formData,
      {
        headers: {
          // Remove default Content-Type header for FormData
          'Content-Type': undefined,
        },
      }
    );
  } catch (error) {
    console.error('Error uploading invoice:', error);
    throw error;
  }
};

/**
 * Add a new invoice entry (no file)
 */
export const addInvoiceEntry = async (invoiceData: Partial<Invoice>): Promise<Invoice> => {
  try {
    return await post<Invoice, Partial<Invoice>>('/add-entry/', invoiceData);
  } catch (error) {
    console.error('Error adding invoice entry:', error);
    throw error;
  }
};

/**
 * Update an invoice
 */
export const updateInvoice = async (
  id: string | number,
  invoiceData: Partial<Invoice>
): Promise<Invoice> => {
  try {
    return await put<Invoice, Partial<Invoice>>(`/update/${id}`, invoiceData);
  } catch (error) {
    console.error(`Error updating invoice ${id}:`, error);
    throw error;
  }
};

/**
 * Delete an invoice
 */
export const deleteInvoice = async (id: string | number): Promise<{ success: boolean; message: string }> => {
  try {
    return await del<{ success: boolean; message: string }>(`/delete/${id}`);
  } catch (error) {
    console.error(`Error deleting invoice ${id}:`, error);
    throw error;
  }
};

/**
 * Add a payment for an invoice
 */
export const addPayment = async (
  invoiceId: number,
  cardNumberId: number,
  amount: number,
  transactionId: string
): Promise<Payment> => {
  try {
    const paymentData = {
      invoice_id: invoiceId,
      card_number_id: cardNumberId,
      amount,
      transaction_id: transactionId,
    };
    
    return await post<Payment>('/payments/', paymentData);
  } catch (error) {
    console.error('Error adding payment:', error);
    throw error;
  }
};

/**
 * Batch delete multiple invoices
 */
export const batchDeleteInvoices = async (
  invoiceIds: number[]
): Promise<{ success: boolean; message: string; deletedCount: number }> => {
  try {
    return await post<
      { success: boolean; message: string; deletedCount: number },
      { invoice_ids: number[] }
    >('/batch-delete/', { invoice_ids: invoiceIds });
  } catch (error) {
    console.error('Error batch deleting invoices:', error);
    throw error;
  }
};

export default {
  fetchInvoices,
  fetchInvoiceById,
  uploadInvoice,
  addInvoiceEntry,
  updateInvoice,
  deleteInvoice,
  addPayment,
  batchDeleteInvoices
};