// src/context/InvoiceContext.tsx
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { fetchInvoices, fetchInvoiceById, updateInvoice, deleteInvoice } from '../services/api/invoiceService';

// Import types from the central types directory and create local versions if needed
import { Invoice } from '../types/invoice.types';

// Define the LineItem interface if it's not available in the types file
export interface LineItem {
  product_name: string;
  quantity: number;
  unit_price: number;
  product_link?: string;
  documentation?: string;
  condition?: string;
  paid_by?: string;
}

// Re-export the Invoice type for convenience
export type { Invoice };

// Define filters for invoice listing
export interface InvoiceFilters {
  status?: string;
  category?: string;
  searchTerm?: string;
  fromDate?: string;
  toDate?: string;
}

// Define the context props interface
export interface InvoiceContextProps {
  invoices: Invoice[];
  filteredInvoices: Invoice[];
  currentInvoice: Invoice | null;
  isLoading: boolean;
  error: string | null;
  filters: InvoiceFilters;
  fetchAllInvoices: () => Promise<void>;
  fetchInvoice: (id: number) => Promise<void>;
  updateInvoiceData: (id: number, data: Partial<Invoice>) => Promise<void>;
  removeInvoice: (id: number) => Promise<void>;
  setFilters: (filters: InvoiceFilters) => void;
  clearFilters: () => void;
  clearError: () => void;
}

// Create the context
export const InvoiceContext = createContext<InvoiceContextProps | undefined>(undefined);

// Define props for the provider component
interface InvoiceProviderProps {
  children: ReactNode;
}

export const InvoiceProvider: React.FC<InvoiceProviderProps> = ({ children }) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<InvoiceFilters>({
    status: 'All',
    category: 'All',
    searchTerm: '',
    fromDate: '',
    toDate: ''
  });

  // Fetch all invoices
  const fetchAllInvoices = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await fetchInvoices();
      setInvoices(data);
      applyFilters(data, filters);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to fetch invoices');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch a single invoice by ID
  const fetchInvoice = async (id: number): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await fetchInvoiceById(id);
      setCurrentInvoice(data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(`Failed to fetch invoice #${id}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Update an invoice
  const updateInvoiceData = async (id: number, data: Partial<Invoice>): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const updatedInvoice = await updateInvoice(id, data);
      
      // Update the invoice in the local state
      setInvoices(prevInvoices => 
        prevInvoices.map(invoice => 
          invoice.invoice_id === id ? { ...invoice, ...updatedInvoice } : invoice
        )
      );
      
      // Also update current invoice if it's the one being edited
      if (currentInvoice && currentInvoice.invoice_id === id) {
        setCurrentInvoice({ ...currentInvoice, ...updatedInvoice });
      }
      
      // Re-apply filters to update filtered invoices
      applyFilters(invoices, filters);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(`Failed to update invoice #${id}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Delete an invoice
  const removeInvoice = async (id: number): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      await deleteInvoice(id);
      
      // Remove the invoice from the local state
      setInvoices(prevInvoices => 
        prevInvoices.filter(invoice => invoice.invoice_id !== id)
      );
      
      // Clear current invoice if it's the one being deleted
      if (currentInvoice && currentInvoice.invoice_id === id) {
        setCurrentInvoice(null);
      }
      
      // Re-apply filters to update filtered invoices
      applyFilters(invoices.filter(invoice => invoice.invoice_id !== id), filters);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(`Failed to delete invoice #${id}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Apply filters to invoices
  const applyFilters = (invoiceData: Invoice[], filterOptions: InvoiceFilters): void => {
    let result = [...invoiceData];
    
    // Filter by status
    if (filterOptions.status && filterOptions.status !== 'All') {
      result = result.filter(invoice => invoice.status === filterOptions.status);
    }
    
    // Filter by category
    if (filterOptions.category && filterOptions.category !== 'All') {
      result = result.filter(invoice => 
        invoice.categories && invoice.categories.includes(filterOptions.category as string)
      );
    }
    
    // Filter by search term
    if (filterOptions.searchTerm) {
      const searchTerm = filterOptions.searchTerm.toLowerCase();
      result = result.filter(invoice => 
        (invoice.order_number && invoice.order_number.toLowerCase().includes(searchTerm)) ||
        (invoice.merchant_name && invoice.merchant_name.toLowerCase().includes(searchTerm)) ||
        (invoice.file_name && invoice.file_name.toLowerCase().includes(searchTerm)) ||
        (invoice.notes && invoice.notes.toLowerCase().includes(searchTerm))
      );
    }
    
    // Filter by date range
    if (filterOptions.fromDate) {
      result = result.filter(invoice => 
        invoice.purchase_date && new Date(invoice.purchase_date) >= new Date(filterOptions.fromDate as string)
      );
    }
    
    if (filterOptions.toDate) {
      result = result.filter(invoice => 
        invoice.purchase_date && new Date(invoice.purchase_date) <= new Date(filterOptions.toDate as string)
      );
    }
    
    setFilteredInvoices(result);
  };

  // Set filters and apply them
  const setFilters = (newFilters: InvoiceFilters): void => {
    const updatedFilters = { ...filters, ...newFilters };
    setFiltersState(updatedFilters);
    applyFilters(invoices, updatedFilters);
  };

  // Clear all filters
  const clearFilters = (): void => {
    const defaultFilters: InvoiceFilters = {
      status: 'All',
      category: 'All',
      searchTerm: '',
      fromDate: '',
      toDate: ''
    };
    setFiltersState(defaultFilters);
    applyFilters(invoices, defaultFilters);
  };

  // Clear error
  const clearError = (): void => {
    setError(null);
  };

  // Re-apply filters when invoices or filters change
  useEffect(() => {
    applyFilters(invoices, filters);
  }, [invoices, filters]);

  return (
    <InvoiceContext.Provider
      value={{
        invoices,
        filteredInvoices,
        currentInvoice,
        isLoading,
        error,
        filters,
        fetchAllInvoices,
        fetchInvoice,
        updateInvoiceData,
        removeInvoice,
        setFilters,
        clearFilters,
        clearError
      }}
    >
      {children}
    </InvoiceContext.Provider>
  );
};