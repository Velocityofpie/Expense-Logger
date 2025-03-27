// invoicesApi.ts
import axios from 'axios';
import { Invoice, InvoiceFormData, UploadResult } from './types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Fetch all invoices with optional pagination
export const fetchInvoices = async (skip = 0, limit = 100, userId = null): Promise<Invoice[]> => {
  let url = `${API_URL}/invoices/?skip=${skip}&limit=${limit}`;
  if (userId) {
    url += `&user_id=${userId}`;
  }
  const response = await axios.get(url);
  return response.data;
};

// Fetch a single invoice by ID
export const fetchInvoiceById = async (id: number | string): Promise<Invoice> => {
  const response = await axios.get(`${API_URL}/invoice/${id}`);
  return response.data;
};

// Upload an invoice file
export const uploadInvoice = async (formData: FormData): Promise<UploadResult> => {
  try {
    console.log(`Attempting to upload to: ${API_URL}/upload/`);
    const response = await axios.post(`${API_URL}/upload/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
};

// Add a new invoice entry (no file)
export const addInvoiceEntry = async (invoiceData: InvoiceFormData): Promise<Invoice> => {
  try {
    const response = await axios.post(`${API_URL}/add-entry/`, invoiceData);
    return response.data;
  } catch (error) {
    console.error("Error adding invoice entry:", error);
    throw error;
  }
};

// Update an invoice
export const updateInvoice = async (id: number | string, invoiceData: Partial<Invoice>): Promise<Invoice> => {
  try {
    const response = await axios.put(`${API_URL}/update/${id}`, invoiceData);
    return response.data;
  } catch (error) {
    console.error("Error updating invoice:", error);
    throw error;
  }
};

// Soft delete an invoice
export const deleteInvoice = async (id: number | string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await axios.delete(`${API_URL}/delete/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting invoice:", error);
    throw error;
  }
};

// Fetch tags and categories
export const fetchTags = async (): Promise<string[]> => {
  try {
    const response = await axios.get(`${API_URL}/tags/`);
    return response.data;
  } catch (error) {
    console.error("Error fetching tags:", error);
    throw error;
  }
};

export const fetchCategories = async (): Promise<string[]> => {
  try {
    const response = await axios.get(`${API_URL}/categories/`);
    return response.data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};

// Add a payment for an invoice
export const addPayment = async (
  invoiceId: number | string,
  cardNumberId: number | string,
  amount: number | string,
  transactionId: string
): Promise<{ success: boolean; payment_id: number }> => {
  try {
    const response = await axios.post(`${API_URL}/payments/`, {
      invoice_id: invoiceId,
      card_number_id: cardNumberId,
      amount: amount,
      transaction_id: transactionId,
    });
    
    return response.data;
  } catch (error) {
    console.error("Error adding payment:", error);
    throw error;
  }
};