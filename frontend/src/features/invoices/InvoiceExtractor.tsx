// InvoiceExtractor.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardBody, Button, Input, Select, Badge } from '../shared';
import { InvoiceTable } from './';
import { InvoiceForm } from './';
import { fetchInvoices, deleteInvoice, fetchTags, fetchCategories } from './invoicesApi';
import { Invoice, InvoiceFilters } from './types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const InvoiceExtractor: React.FC = () => {
  const navigate = useNavigate();
  
  // State for invoice list and filters
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // State for showing manual entry form
  const [showManualEntry, setShowManualEntry] = useState(false);
  
  // State for filters
  const [filters, setFilters] = useState<InvoiceFilters>({
    status: 'All',
    category: 'All',
    searchTerm: ''
  });
  
  // State for available tags and categories
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  
  // Fetch data on component mount
  useEffect(() => {
    fetchAllData();
  }, []);
  
  // Apply filters when invoices or filters change
  useEffect(() => {
    applyFilters();
  }, [invoices, filters]);
  
  // Fetch all necessary data
  const fetchAllData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch invoices, tags, and categories
      const [invoicesData, tagsData, categoriesData] = await Promise.all([
        fetchInvoices(),
        fetchTags(),
        fetchCategories()
      ]);
      
      setInvoices(invoicesData);
      setFilteredInvoices(invoicesData);
      setAvailableTags(tagsData);
      setAvailableCategories(categoriesData);
      
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
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
        (invoice.merchant_name && invoice.merchant_name.toLowerCase().includes(search)) ||
        (invoice.notes && invoice.notes.toLowerCase().includes(search)) ||
        (invoice.payment_method && invoice.payment_method.toLowerCase().includes(search));
      
      return statusMatch && categoryMatch && searchMatch;
    });
    
    setFilteredInvoices(filtered);
  };
  
  // Toggle manual entry form
  const toggleManualEntry = () => {
    setShowManualEntry(!showManualEntry);
  };
  
  // Handle filter changes
  const handleFilterChange = (field: keyof InvoiceFilters, value: string) => {
    setFilters({
      ...filters,
      [field]: value
    });
  };
  
  // View invoice document/PDF
  const viewInvoiceDocument = (invoice: Invoice) => {
    if (invoice.file_name) {
      window.open(`${API_URL}/uploads/${encodeURIComponent(invoice.file_name)}`, '_blank');
    } else {
      alert("No document available for this invoice.");
    }
  };
  
  // Navigate to invoice details
  const viewInvoiceDetails = (invoice: Invoice) => {
    navigate(`/invoice/${invoice.invoice_id}`);
  };
  
  // Delete an invoice
  const handleDeleteInvoice = async (invoice: Invoice) => {
    if (!window.confirm(`Are you sure you want to delete invoice ${invoice.order_number || invoice.invoice_id}?`)) {
      return;
    }
    
    try {
      await deleteInvoice(invoice.invoice_id);
      fetchAllData();
    } catch (error) {
      console.error("Error deleting invoice:", error);
      alert("Error deleting invoice. Please try again.");
    }
  };
  
  // Batch delete invoices
  const handleBatchDelete = async (invoiceIds: number[]) => {
    if (!window.confirm(`Are you sure you want to delete ${invoiceIds.length} selected invoices? This action cannot be undone.`)) {
      return;
    }
    
    try {
      // Delete each invoice sequentially
      let successCount = 0;
      
      for (const id of invoiceIds) {
        try {
          await deleteInvoice(id);
          successCount++;
        } catch (error) {
          console.error(`Error deleting invoice ${id}:`, error);
        }
      }
      
      // Refresh the invoice list
      fetchAllData();
      
      // Show success message
      alert(`Successfully deleted ${successCount} of ${invoiceIds.length} invoices.`);
    } catch (error) {
      console.error("Error during batch delete:", error);
      alert("An error occurred during the batch delete operation.");
    }
  };

  // Handle form submission success
  const handleFormSuccess = () => {
    setShowManualEntry(false);
    fetchAllData();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Invoice Management</h1>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium">Upload Invoices</h2>
            <Button 
              variant={showManualEntry ? "secondary" : "primary"}
              onClick={toggleManualEntry}
            >
              {showManualEntry ? "Hide Manual Entry" : "Add Invoice Manually"}
            </Button>
          </div>
        </CardHeader>
        <CardBody>
          {showManualEntry ? (
            <InvoiceForm 
              onSuccess={handleFormSuccess}
              availableCategories={availableCategories}
              availableTags={availableTags}
            />
          ) : (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="mt-2 text-sm text-gray-600">Drag and drop files here, or click to select files</p>
              <div className="mt-4">
                <input
                  type="file"
                  className="hidden"
                  id="file-upload"
                  multiple
                  accept=".pdf,.png,.jpg,.jpeg"
                />
                <label
                  htmlFor="file-upload"
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                >
                  Upload Invoice Files
                </label>
              </div>
            </div>
          )}
        </CardBody>
      </Card>
      
      <Card>
        <CardHeader>
          <h2 className="text-lg font-medium">Invoice List</h2>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <Input
                type="text"
                placeholder="Search by order #, merchant, etc."
                value={filters.searchTerm}
                onChange={(e) => handleFilterChange("searchTerm", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <Select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="Open">Open</option>
                <option value="Paid">Paid</option>
                <option value="Draft">Draft</option>
                <option value="Needs Attention">Needs Attention</option>
                <option value="Resolved">Resolved</option>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <Select
                value={filters.category}
                onChange={(e) => handleFilterChange("category", e.target.value)}
              >
                <option value="All">All Categories</option>
                {availableCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </Select>
            </div>
          </div>
          
          <InvoiceTable 
            invoices={filteredInvoices}
            isLoading={isLoading}
            onView={viewInvoiceDocument}
            onEdit={viewInvoiceDetails}
            onDelete={handleDeleteInvoice}
            onBatchDelete={handleBatchDelete}
          />
        </CardBody>
      </Card>
    </div>
  );
};

export default InvoiceExtractor;