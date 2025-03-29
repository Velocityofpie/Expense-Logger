// InvoiceExtractor.tsx with debug toggle and file size limit check
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardBody, Button, Input, Select, Badge, Checkbox } from '../../shared';
import { InvoiceTable } from './';
import { InvoiceForm } from './';
import { fetchInvoices, deleteInvoice, fetchTags, fetchCategories } from './invoicesApi';
import { Invoice, InvoiceFilters } from './types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Maximum file size in bytes (1MB)
const MAX_FILE_SIZE = 1 * 1024 * 1024;

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
  
  // State for file upload
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [uploadResults, setUploadResults] = useState<{ success: string[]; failed: string[] }>({ success: [], failed: [] });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadDebug, setUploadDebug] = useState<string | null>(null);
  
  // State for OCR template toggle
  const [useOcrTemplates, setUseOcrTemplates] = useState(true);
  
  // State for debug toggle
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  
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
  
  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      setUploadDebug("No files selected");
      return;
    }
    
    // Convert FileList to array
    const newFiles = Array.from(e.target.files);
    
    // Check file sizes and filter out files that are too large
    const validFiles: File[] = [];
    const oversizedFiles: File[] = [];
    
    newFiles.forEach(file => {
      if (file.size <= MAX_FILE_SIZE) {
        validFiles.push(file);
      } else {
        oversizedFiles.push(file);
      }
    });
    
    // Add valid files to selectedFiles
    setSelectedFiles(prevFiles => [...prevFiles, ...validFiles]);
    
    // Log debug information
    let debugMsg = `Selected ${newFiles.length} file(s):\n`;
    debugMsg += validFiles.map(f => `- ${f.name} (${formatFileSize(f.size)})`).join('\n');
    
    // Add warning for oversized files
    if (oversizedFiles.length > 0) {
      setUploadError(`${oversizedFiles.length} file(s) exceed the maximum size limit of ${formatFileSize(MAX_FILE_SIZE)} and were skipped.`);
      debugMsg += '\n\nSkipped oversized files:\n';
      debugMsg += oversizedFiles.map(f => `- ${f.name} (${formatFileSize(f.size)})`).join('\n');
    }
    
    setUploadDebug(debugMsg);
    
    // Reset upload results
    setUploadResults({ success: [], failed: [] });
  };
  
  // Format file size to human-readable format
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  // Remove a file from the selected files
  const removeFile = (index: number) => {
    setSelectedFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };
  
  // Upload all selected files
  const handleUploadAll = async () => {
    if (selectedFiles.length === 0) {
      setUploadError("Please select files to upload");
      return;
    }
    
    setIsUploading(true);
    setUploadError(null);
    setUploadResults({ success: [], failed: [] });
    setUploadDebug(`Starting upload of ${selectedFiles.length} file(s)...`);
    
    const successfulUploads: string[] = [];
    const failedUploads: string[] = [];
    
    // Process files sequentially
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      setUploadDebug(prev => `${prev}\nUploading file ${i+1}/${selectedFiles.length}: ${file.name}`);
      
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("use_templates", useOcrTemplates.toString());
        
        // Update progress
        setUploadProgress(prev => ({
          ...prev,
          [file.name]: 0
        }));
        
        try {
          const response = await fetch(`${API_URL}/upload/`, {
            method: 'POST',
            body: formData,
          });
          
          setUploadDebug(prev => `${prev}\n- Response status: ${response.status}`);
          
          if (response.ok) {
            const data = await response.json();
            setUploadDebug(prev => `${prev}\n- Upload successful`);
            successfulUploads.push(file.name);
            // Update progress to 100%
            setUploadProgress(prev => ({
              ...prev,
              [file.name]: 100
            }));
          } else {
            const errorText = await response.text();
            setUploadDebug(prev => `${prev}\n- Upload failed: ${response.status} ${response.statusText}`);
            setUploadDebug(prev => `${prev}\n- Error response: ${errorText}`);
            failedUploads.push(file.name);
            
            // Handle specific errors
            if (response.status === 413) {
              setUploadError("File size too large. The server has a size limit on uploads. Try reducing the file size or using the manual entry form.");
            }
          }
        } catch (fetchError) {
          console.error(`Error uploading ${file.name}:`, fetchError);
          setUploadDebug(prev => `${prev}\n- Network error: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`);
          failedUploads.push(file.name);
        }
      } catch (error) {
        console.error(`Error processing ${file.name}:`, error);
        setUploadDebug(prev => `${prev}\n- Processing error: ${error instanceof Error ? error.message : String(error)}`);
        failedUploads.push(file.name);
      }
    }
    
    // Update final results
    setUploadResults({
      success: successfulUploads,
      failed: failedUploads
    });
    
    // Final summary
    setUploadDebug(prev => `${prev}\n\nUpload complete: ${successfulUploads.length} successful, ${failedUploads.length} failed`);
    
    // Refresh data if any files were uploaded successfully
    if (successfulUploads.length > 0) {
      await fetchAllData();
    }
    
    setIsUploading(false);
  };
  
  // Clear all selected files
  const handleClearFiles = () => {
    setSelectedFiles([]);
    setUploadProgress({});
    setUploadResults({ success: [], failed: [] });
    setUploadError(null);
    setUploadDebug(null);
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
            <div className="py-6">
              <div className="text-center mb-6">
                <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="mt-2 text-sm text-gray-600">Drag and drop files here, or click to select files</p>
                <div className="mt-4">
                  <input
                    type="file"
                    className="hidden"
                    id="file-upload"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={handleFileSelect}
                    multiple
                  />
                  <label
                    htmlFor="file-upload"
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                  >
                    Select Invoice Files
                  </label>
                  <p className="mt-2 text-xs text-gray-500">Maximum file size: {formatFileSize(MAX_FILE_SIZE)}</p>
                </div>
              </div>
              
              {/* Selected files list */}
              {selectedFiles.length > 0 && (
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-medium text-gray-700">Selected Files ({selectedFiles.length})</h3>
                    <div className="space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleClearFiles}
                        disabled={isUploading}
                      >
                        Clear All
                      </Button>
                      <Button 
                        variant="primary" 
                        size="sm" 
                        onClick={handleUploadAll}
                        disabled={isUploading || selectedFiles.length === 0}
                        isLoading={isUploading}
                        loadingText="Uploading..."
                      >
                        Upload All
                      </Button>
                    </div>
                  </div>
                  <div className="border border-gray-200 rounded-md overflow-hidden">
                    <ul className="divide-y divide-gray-200 max-h-60 overflow-y-auto">
                      {selectedFiles.map((file, index) => (
                        <li 
                          key={`${file.name}-${index}`} 
                          className={`px-4 py-3 flex items-center justify-between text-sm ${
                            uploadResults.success.includes(file.name) 
                              ? 'bg-green-50' 
                              : uploadResults.failed.includes(file.name) 
                                ? 'bg-red-50' 
                                : ''
                          }`}
                        >
                          <div className="flex items-center flex-grow">
                            <svg className="flex-shrink-0 h-5 w-5 text-gray-400 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                            </svg>
                            <div className="flex-grow truncate">
                              <span className="truncate">{file.name}</span>
                              <span className="ml-2 text-xs text-gray-500">{formatFileSize(file.size)}</span>
                            </div>
                          </div>
                          
                          {/* Status indicators */}
                          {uploadResults.success.includes(file.name) && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                              Uploaded
                            </span>
                          )}
                          
                          {uploadResults.failed.includes(file.name) && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                              Failed
                            </span>
                          )}
                          
                          {!isUploading && !uploadResults.success.includes(file.name) && !uploadResults.failed.includes(file.name) && (
                            <button 
                              type="button"
                              onClick={() => removeFile(index)} 
                              className="text-red-600 hover:text-red-900 p-1"
                            >
                              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </button>
                          )}
                          
                          {isUploading && uploadProgress[file.name] !== undefined && (
                            <div className="ml-2 w-16 bg-gray-200 rounded-full h-2.5">
                              <div 
                                className="bg-primary-600 h-2.5 rounded-full" 
                                style={{ width: `${uploadProgress[file.name]}%` }}
                              ></div>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
              
              {/* Toggle section with OCR and Debug options */}
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8">
                <div className="flex items-center">
                  <Checkbox
                    id="use-ocr-templates"
                    checked={useOcrTemplates}
                    onChange={(e) => setUseOcrTemplates(e.target.checked)}
                  />
                  <label htmlFor="use-ocr-templates" className="ml-2 block text-sm text-gray-900">
                    Use OCR Templates for extraction
                  </label>
                </div>
                
                <div className="flex items-center">
                  <Checkbox
                    id="show-debug-info"
                    checked={showDebugInfo}
                    onChange={(e) => setShowDebugInfo(e.target.checked)}
                  />
                  <label htmlFor="show-debug-info" className="ml-2 block text-sm text-gray-900">
                    Show Debug Information
                  </label>
                </div>
              </div>
              
              {/* Upload status and debug info */}
              {isUploading && (
                <div className="mt-4 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-600">
                    Uploading {uploadResults.success.length + uploadResults.failed.length} of {selectedFiles.length} files...
                  </p>
                </div>
              )}
              
              {uploadError && (
                <div className="mt-4 p-3 bg-red-100 text-red-800 rounded text-sm">
                  <div className="font-medium">Error:</div>
                  <div>{uploadError}</div>
                </div>
              )}
              
              {/* Debug info - only shown when toggle is enabled */}
              {showDebugInfo && uploadDebug && (
                <div className="mt-4 p-3 bg-gray-100 text-gray-800 rounded text-sm text-left whitespace-pre-wrap overflow-auto max-h-64">
                  <div className="font-medium mb-1">Debug Info:</div>
                  {uploadDebug}
                </div>
              )}
              
              {/* Upload summary */}
              {(uploadResults.success.length > 0 || uploadResults.failed.length > 0) && !isUploading && (
                <div className="mt-4 p-3 bg-gray-50 rounded-md">
                  <h3 className="text-sm font-medium text-gray-700">Upload Summary</h3>
                  <div className="flex mt-2">
                    <div className="mr-6">
                      <span className="text-sm text-gray-500">Successful:</span>
                      <span className="ml-2 text-sm font-medium text-green-600">{uploadResults.success.length}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Failed:</span>
                      <span className="ml-2 text-sm font-medium text-red-600">{uploadResults.failed.length}</span>
                    </div>
                  </div>
                </div>
              )}
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