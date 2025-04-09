// Updated InvoiceExtractor.tsx to work with the enhanced pagination
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardBody, Input, Select } from '../../shared';
import { InvoiceTable } from './';
import { fetchInvoices, deleteInvoice, fetchTags, fetchCategories } from './invoicesApi';
import { Invoice, InvoiceFilters } from './types';
import InvoiceUploadSection from './InvoiceUploadSection';

const InvoiceExtractor: React.FC = () => {
  const navigate = useNavigate();
  
  // State for invoice list and filters
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // State for showing manual entry form
  const [showManualEntry, setShowManualEntry] = useState(false);
  
  // State for showing/hiding upload section
  const [showUploadSection, setShowUploadSection] = useState(true);
  
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
  
  // Toggle upload section visibility
  const toggleUploadSection = () => {
    setShowUploadSection(!showUploadSection);
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
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
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

  // Listen for wide mode changes
  const [wideMode, setWideMode] = useState(true);
  
  useEffect(() => {
    const handleWideModeChange = (e: CustomEvent) => {
      setWideMode(e.detail.wideMode);
    };
    
    window.addEventListener('widemodechange', handleWideModeChange as EventListener);
    
    return () => {
      window.removeEventListener('widemodechange', handleWideModeChange as EventListener);
    };
  }, []);

  return (
    <div className={`space-y-6 ${wideMode ? 'w-full' : 'max-w-screen-xl mx-auto'}`}>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Invoice Management</h1>
      </div>
      
      {/* Upload/Manual Entry Section */}
      <InvoiceUploadSection
        availableCategories={availableCategories}
        availableTags={availableTags}
        onUploadSuccess={fetchAllData}
        showManualEntry={showManualEntry}
        toggleManualEntry={toggleManualEntry}
        showUploadSection={showUploadSection}
        toggleUploadSection={toggleUploadSection}
        wideMode={wideMode}
      />
      
      {/* Invoice List with Filters */}
      <Card className={wideMode ? 'w-full' : 'max-w-screen-xl mx-auto'}>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <h2 className="text-lg font-medium">Invoice List</h2>
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-4 w-full md:w-auto">
              <div className="w-full md:w-48">
                <Input
                  type="text"
                  placeholder="Search invoices..."
                  value={filters.searchTerm}
                  onChange={(e) => handleFilterChange("searchTerm", e.target.value)}
                  className="text-sm"
                />
              </div>
              <div className="w-full md:w-40">
                <Select
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  className="text-sm"
                >
                  <option value="All">All Statuses</option>
                  <option value="Open">Open</option>
                  <option value="Paid">Paid</option>
                  <option value="Draft">Draft</option>
                  <option value="Needs Attention">Needs Attention</option>
                  <option value="Resolved">Resolved</option>
                </Select>
              </div>
              <div className="w-full md:w-40">
                <Select
                  value={filters.category}
                  onChange={(e) => handleFilterChange("category", e.target.value)}
                  className="text-sm"
                >
                  <option value="All">All Categories</option>
                  {availableCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          
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