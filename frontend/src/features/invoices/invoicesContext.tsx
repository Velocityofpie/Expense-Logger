// src/features/invoices/invoicesContext.tsx
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { 
  fetchInvoices, 
  fetchInvoiceById, 
  addInvoiceEntry, 
  updateInvoice, 
  deleteInvoice, 
  uploadInvoice, 
  fetchTags, 
  fetchCategories 
} from './invoicesApi';
import { VALID_STATUSES } from '../../context/types';

// Define interfaces for the invoice data
interface LineItem {
  product_name: string;
  quantity: number;
  unit_price: number;
  product_link?: string;
  condition?: string;
  item_type?: string;
}

export interface Invoice {
  invoice_id: number;
  file_name?: string;
  merchant_name: string;
  order_number?: string;
  purchase_date?: string;
  payment_method?: string;
  grand_total: number;
  status: string;
  notes?: string;
  shipping_handling?: number;
  estimated_tax?: number;
  total_before_tax?: number;
  billing_address?: string;
  credit_card_transactions?: number;
  gift_card_amount?: number;
  refunded_amount?: number;
  items: LineItem[];
  tags: string[];
  categories: string[];
}

interface InvoiceFilters {
  status: string;
  category: string;
  searchTerm: string;
}

interface UploadStatus {
  inProgress: boolean;
  success: boolean;
  error: string | null;
  fileName: string;
}

// Define the context interface
interface InvoiceContextValue {
  invoices: Invoice[];
  filteredInvoices: Invoice[];
  currentInvoice: Invoice | null;
  isLoading: boolean;
  error: string | null;
  tags: string[];
  categories: string[];
  filters: InvoiceFilters;
  uploadStatus: UploadStatus;
  
  // Actions
  setFilters: (filters: Partial<InvoiceFilters>) => void;
  fetchInvoice: (id: number) => Promise<void>;
  addInvoice: (invoiceData: Omit<Invoice, 'invoice_id'>) => Promise<void>;
  editInvoice: (id: number, invoiceData: Partial<Invoice>) => Promise<void>;
  removeInvoice: (id: number) => Promise<void>;
  uploadFile: (file: File, useTemplates: boolean) => Promise<void>;
  resetUploadStatus: () => void;
  batchDeleteInvoices: (ids: number[]) => Promise<number>;
}

// Create the context
export const InvoicesContext = createContext<InvoiceContextValue | undefined>(undefined);

interface InvoicesProviderProps {
  children: ReactNode;
}

export const InvoicesProvider = ({ children }: InvoicesProviderProps) => {
  // State for invoices
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null);
  
  // State for loading and errors
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for metadata
  const [tags, setTags] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  
  // State for filters
  const [filters, setFilters] = useState<InvoiceFilters>({
    status: 'All',
    category: 'All',
    searchTerm: ''
  });
  
  // State for tracking file uploads
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({
    inProgress: false,
    success: false,
    error: null,
    fileName: ''
  });

  // Load invoices on component mount
  useEffect(() => {
    loadAllData();
  }, []);

  // Apply filters when invoices or filters change
  useEffect(() => {
    if (invoices.length > 0) {
      applyFilters();
    }
  }, [invoices, filters]);

  // Load all required data
  const loadAllData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch invoices, tags, and categories in parallel
      const [invoicesResponse, tagsData, categoriesData] = await Promise.all([
        fetchInvoices(),
        fetchTags(),
        fetchCategories()
      ]);
      
      setInvoices(Array.isArray(invoicesResponse) ? invoicesResponse : []);
      setTags(tagsData);
      setCategories(categoriesData);
      
      setIsLoading(false);
    } catch (err: any) {
      console.error("Error loading data:", err);
      setError("Failed to load invoice data. Please try again.");
      setInvoices([]);
      setFilteredInvoices([]);
      setIsLoading(false);
    }
  };

  // Apply filters to invoices
  const applyFilters = () => {
    const { status, category, searchTerm } = filters;
    
    const filtered = invoices.filter(invoice => {
      // Status filter
      const statusMatch = status === "All" || invoice.status === status;
      
      // Category filter
      const categoryMatch = category === "All" || 
        (invoice.categories && invoice.categories.includes(category));
      
      // Search term filter (searches in multiple fields)
      const search = searchTerm.toLowerCase();
      const searchMatch = !searchTerm || 
        (invoice.order_number && invoice.order_number.toLowerCase().includes(search)) ||
        (invoice.file_name && invoice.file_name.toLowerCase().includes(search)) ||
        (invoice.merchant_name && invoice.merchant_name.toLowerCase().includes(search)) ||
        (invoice.notes && invoice.notes.toLowerCase().includes(search)) ||
        (invoice.payment_method && invoice.payment_method.toLowerCase().includes(search));
      
      return statusMatch && categoryMatch && searchMatch;
    });
    
    setFilteredInvoices(filtered);
  };

  // Update filters
  const handleSetFilters = (newFilters: Partial<InvoiceFilters>) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      ...newFilters
    }));
  };

  // Fetch a single invoice by ID
  const fetchInvoice = async (id: number) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const invoice = await fetchInvoiceById(id);
      setCurrentInvoice(invoice);
      
      setIsLoading(false);
    } catch (err: any) {
      console.error("Error fetching invoice:", err);
      setError("Failed to fetch invoice details. Please try again.");
      setIsLoading(false);
      throw err;
    }
  };

  // Add a new invoice
  const addInvoice = async (invoiceData: Omit<Invoice, 'invoice_id'>) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Create a properly typed version of the data with condition handling
      const properlyTypedData = {
        ...invoiceData,
        items: invoiceData.items.map(item => ({
          ...item,
          // Convert condition to one of the allowed values or undefined
          condition: item.condition 
            ? (item.condition === 'New' || item.condition === 'Used' || item.condition === 'Refurbished' 
                ? item.condition 
                : 'Used') // Default to 'Used' if not one of the allowed values
            : undefined
        }))
      };
      
      await addInvoiceEntry(properlyTypedData);
      
      // Reload all invoices to get the updated list
      await loadAllData();
      
      setIsLoading(false);
    } catch (err: any) {
      console.error("Error adding invoice:", err);
      setError("Failed to add invoice. Please try again.");
      setIsLoading(false);
      throw err;
    }
  };

  // Edit an existing invoice
  const editInvoice = async (id: number, invoiceData: Partial<Invoice>) => {
    try {
      setIsLoading(true);
      setError(null);
      
      await updateInvoice(id, invoiceData);
      
      // If we're currently viewing this invoice, update it
      if (currentInvoice && currentInvoice.invoice_id === id) {
        setCurrentInvoice({
          ...currentInvoice,
          ...invoiceData
        } as Invoice);
      }
      
      // Reload all invoices to get the updated list
      await loadAllData();
      
      setIsLoading(false);
    } catch (err: any) {
      console.error("Error updating invoice:", err);
      setError("Failed to update invoice. Please try again.");
      setIsLoading(false);
      throw err;
    }
  };

  // Delete an invoice
  const removeInvoice = async (id: number) => {
    try {
      setIsLoading(true);
      setError(null);
      
      await deleteInvoice(id);
      
      // If we're currently viewing this invoice, clear it
      if (currentInvoice && currentInvoice.invoice_id === id) {
        setCurrentInvoice(null);
      }
      
      // Reload all invoices to get the updated list
      await loadAllData();
      
      setIsLoading(false);
    } catch (err: any) {
      console.error("Error deleting invoice:", err);
      setError("Failed to delete invoice. Please try again.");
      setIsLoading(false);
      throw err;
    }
  };

  // Upload invoice file
  const uploadFile = async (file: File, useTemplates: boolean) => {
    try {
      setUploadStatus({
        inProgress: true,
        success: false,
        error: null,
        fileName: file.name
      });
      
      const formData = new FormData();
      formData.append("file", file);
      formData.append("use_templates", String(useTemplates));
      
      await uploadInvoice(formData);
      
      // Set success status
      setUploadStatus({
        inProgress: false,
        success: true,
        error: null,
        fileName: file.name
      });
      
      // Reload all invoices to get the updated list
      await loadAllData();
    } catch (err: any) {
      console.error(`Error uploading ${file.name}:`, err);
      
      // Set error status
      setUploadStatus({
        inProgress: false,
        success: false,
        error: `Failed to upload ${file.name}. Please try again.`,
        fileName: file.name
      });
      
      throw err;
    }
  };

  // Reset upload status
  const resetUploadStatus = () => {
    setUploadStatus({
      inProgress: false,
      success: false,
      error: null,
      fileName: ''
    });
  };

  // Batch delete invoices
  const batchDeleteInvoices = async (ids: number[]) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Delete each invoice sequentially
      let successCount = 0;
      
      for (const id of ids) {
        try {
          await deleteInvoice(id);
          successCount++;
        } catch (err) {
          console.error(`Error deleting invoice ${id}:`, err);
        }
      }
      
      // Reload all invoices to get the updated list
      await loadAllData();
      
      setIsLoading(false);
      
      // Return success count to the caller
      return successCount;
    } catch (err: any) {
      console.error("Error during batch delete:", err);
      setError("Error during batch delete operation. Some invoices may not have been deleted.");
      setIsLoading(false);
      throw err;
    }
  };

  // Create the context value
  const contextValue: InvoiceContextValue = {
    invoices,
    filteredInvoices,
    currentInvoice,
    isLoading,
    error,
    tags,
    categories,
    filters,
    uploadStatus,
    
    // Actions
    setFilters: handleSetFilters,
    fetchInvoice,
    addInvoice,
    editInvoice,
    removeInvoice,
    uploadFile,
    resetUploadStatus,
    batchDeleteInvoices
  };

  return (
    <InvoicesContext.Provider value={contextValue}>
      {children}
    </InvoicesContext.Provider>
  );
};

// Custom hook for easier context consumption
export const useInvoices = () => {
  const context = React.useContext(InvoicesContext);
  
  if (context === undefined) {
    throw new Error('useInvoices must be used within an InvoicesProvider');
  }
  
  return context;
};