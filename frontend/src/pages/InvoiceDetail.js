// Updated InvoiceDetail.js with improved split view and date formatting

import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { fetchInvoiceById, fetchInvoices, updateInvoice, deleteInvoice, fetchTags, fetchCategories, addPayment } from "../api";

const API_URL = "http://localhost:8000";

// Valid statuses for the dropdown
const VALID_STATUSES = ["Open", "Paid", "Draft", "Needs Attention", "Resolved"];

// Function to normalize date formats - accepts various common date formats
const normalizeDateFormat = (dateString) => {
  if (!dateString) return "";
  
  // Try to parse the date using different formats
  let parsedDate;
  
  // Match common formats
  // MM/DD/YYYY, MM-DD-YYYY
  const usFormat = /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/;
  // YYYY/MM/DD, YYYY-MM-DD
  const isoFormat = /^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/;
  // DD/MM/YYYY, DD.MM.YYYY, DD-MM-YYYY
  const euFormat = /^(\d{1,2})[\/\.\-](\d{1,2})[\/\.\-](\d{4})$/;
  // Month name formats: Jan 1, 2023 or January 1, 2023
  const nameFormat = /^([a-zA-Z]{3,9})\s+(\d{1,2}),?\s+(\d{4})$/;
  
  try {
    // Handle ISO format (YYYY-MM-DD)
    if (isoFormat.test(dateString)) {
      return dateString; // Already in ISO format
    }
    // Handle US format (MM/DD/YYYY)
    else if (usFormat.test(dateString)) {
      const matches = dateString.match(usFormat);
      const month = matches[1].padStart(2, '0');
      const day = matches[2].padStart(2, '0');
      const year = matches[3];
      return `${year}-${month}-${day}`;
    }
    // Handle European format (DD/MM/YYYY)
    else if (euFormat.test(dateString)) {
      const matches = dateString.match(euFormat);
      const day = matches[1].padStart(2, '0');
      const month = matches[2].padStart(2, '0');
      const year = matches[3];
      return `${year}-${month}-${day}`;
    }
    // Handle month name format (Jan 1, 2023)
    else if (nameFormat.test(dateString)) {
      parsedDate = new Date(dateString);
      if (!isNaN(parsedDate)) {
        return parsedDate.toISOString().split('T')[0];
      }
    }
    // Last resort: Try to parse with Date constructor
    else {
      parsedDate = new Date(dateString);
      if (!isNaN(parsedDate)) {
        return parsedDate.toISOString().split('T')[0];
      }
    }
  } catch (e) {
    console.error("Error parsing date:", e);
  }
  
  // Return original string if parsing fails
  return dateString;
};

export default function InvoiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // State for the invoice data
  const [invoice, setInvoice] = useState({});
  const [items, setItems] = useState([]);
  const [pdfUrl, setPdfUrl] = useState("");
  
  // State for tags and categories
  const [tags, setTags] = useState([]);
  const [categories, setCategories] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);
  
  // State for adding new tags and categories
  const [newTag, setNewTag] = useState("");
  const [newCategory, setNewCategory] = useState("");
  
  // State for payment
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [cardNumberId, setCardNumberId] = useState("");
  const [transactionId, setTransactionId] = useState("");
  
  // Confirm delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Saving state
  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");
  
  // Loading state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Active tab state
  const [activeTab, setActiveTab] = useState("details");
  
  // Split view state
  const [splitView, setSplitView] = useState(false);
  
  // Navigation state
  const [allInvoices, setAllInvoices] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  // Fetch all invoices for navigation and the current invoice details
  useEffect(() => {
    async function loadInvoicesAndOptions() {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch all invoices for navigation
        const invoicesData = await fetchInvoices();
        setAllInvoices(invoicesData);
        
        // Find current invoice index
        const index = invoicesData.findIndex(inv => inv.invoice_id === parseInt(id));
        setCurrentIndex(index);
        
        // Fetch invoice details
        await loadInvoiceDetails(id);
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading invoices:", error);
        setError("Failed to load invoice data. Please try again.");
        setIsLoading(false);
      }
    }
    
    if (id) {
      loadInvoicesAndOptions();
    }
  }, [id]);

  // Separate function to load invoice details
  const loadInvoiceDetails = async (invoiceId) => {
    try {
      // Fetch invoice details
      const refreshedData = await fetchInvoiceById(id);
      setInvoice({
        ...refreshedData,
        merchant_name: refreshedData.merchant_name || invoice.merchant_name || ""
      });
      setItems(invoiceData.items || []);
      setTags(invoiceData.tags || []);
      setCategories(invoiceData.categories || []);
      
      // Set PDF URL if filename exists
      if (invoiceData.file_name) {
        setPdfUrl(`${API_URL}/uploads/${encodeURIComponent(invoiceData.file_name)}`);
      } else {
        setPdfUrl("");
      }
      
      // Fetch available tags and categories
      const [tagsData, categoriesData] = await Promise.all([
        fetchTags(),
        fetchCategories()
      ]);
      
      setAvailableTags(tagsData);
      setAvailableCategories(categoriesData);
      
    } catch (error) {
      console.error("Error loading invoice:", error);
      throw error;
    }
  };

  // Navigate to previous invoice
  const goToPrevInvoice = () => {
    if (currentIndex > 0) {
      navigate(`/invoice/${allInvoices[currentIndex - 1].invoice_id}`);
    }
  };

  // Navigate to next invoice
  const goToNextInvoice = () => {
    if (currentIndex < allInvoices.length - 1) {
      navigate(`/invoice/${allInvoices[currentIndex + 1].invoice_id}`);
    }
  };

  // Handle changes to invoice fields with date normalization
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Apply date normalization for purchase_date
    if (name === "purchase_date") {
      const normalizedDate = normalizeDateFormat(value);
      setInvoice({ ...invoice, [name]: normalizedDate });
    } else {
      setInvoice({ ...invoice, [name]: value });
    }
  };

  // Handle paste event for the purchase_date field to auto-format pasted dates
  const handleDatePaste = (e) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const normalizedDate = normalizeDateFormat(pastedText);
    setInvoice({ ...invoice, purchase_date: normalizedDate });
  };

  // Handle changes to line items
  const handleItemChange = (index, field, value) => {
    const updatedItems = [...items];
    updatedItems[index][field] = value;
    setItems(updatedItems);
  };

  // Add a new line item
  const addItem = () => {
    setItems([...items, {
      product_name: "",
      quantity: 1,
      unit_price: 0,
      product_link: "",
      documentation: "",
      condition: "New",
      paid_by: "",
    }]);
  };

  // Remove a line item
  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  // Handle tag selection
  const handleTagChange = (e) => {
    const value = Array.from(e.target.selectedOptions, option => option.value);
    setTags(value);
  };

  // Handle category selection
  const handleCategoryChange = (e) => {
    const value = Array.from(e.target.selectedOptions, option => option.value);
    setCategories(value);
  };
  
  // Add a new tag
  const handleAddTag = () => {
    if (!newTag.trim()) return;
    
    // Check if tag already exists
    if (availableTags.includes(newTag.trim())) {
      // If it exists, just select it
      if (!tags.includes(newTag.trim())) {
        setTags([...tags, newTag.trim()]);
      }
    } else {
      // If it doesn't exist, add it to the available tags and select it
      const updatedTags = [...availableTags, newTag.trim()];
      setAvailableTags(updatedTags);
      setTags([...tags, newTag.trim()]);
    }
    
    // Clear the input
    setNewTag("");
  };
  
  // Add a new category
  const handleAddCategory = () => {
    if (!newCategory.trim()) return;
    
    // Check if category already exists
    if (availableCategories.includes(newCategory.trim())) {
      // If it exists, just select it
      if (!categories.includes(newCategory.trim())) {
        setCategories([...categories, newCategory.trim()]);
      }
    } else {
      // If it doesn't exist, add it to the available categories and select it
      const updatedCategories = [...availableCategories, newCategory.trim()];
      setAvailableCategories(updatedCategories);
      setCategories([...categories, newCategory.trim()]);
    }
    
    // Clear the input
    setNewCategory("");
  };
  
  // Remove a tag
  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  // Remove a category
  const removeCategory = (categoryToRemove) => {
    setCategories(categories.filter(category => category !== categoryToRemove));
  };

  // Generate filename based on merchant and order number
  const generateFileName = (merchantName, orderNumber, originalFileName) => {
    // If both merchant and order number are filled
    if (merchantName && orderNumber) {
      // Get the file extension from the original filename
      const originalExt = originalFileName ? 
        originalFileName.substring(originalFileName.lastIndexOf('.')) : '';
      
      // Create new filename with format Merchant-Order#_OrderNumber.ext
      return `${merchantName}-Order#_${orderNumber}${originalExt}`;
    }
    
    // If either merchant or order number is missing, return the original filename
    return originalFileName;
  };

  // The saveInvoice function should be updated to use the merchant_name field
  // but keep it separate from file_name handling

// Update invoice fields
  const saveInvoice = async () => {
    try {
      setIsSaving(true);
      
      // Generate the new filename ONLY if both merchant_name and order_number exist
      let newFileName = invoice.file_name;
      if (invoice.merchant_name && invoice.order_number) {
        newFileName = generateFileName(
          invoice.merchant_name,
          invoice.order_number,
          invoice.file_name
        );
      }
      
      const updatedInvoice = {
        // Keep the merchant_name separate from file_name
        file_name: newFileName,
        merchant_name: invoice.merchant_name, // Ensure this is included in the update payload
        order_number: invoice.order_number,
        purchase_date: invoice.purchase_date,
        payment_method: invoice.payment_method,
        grand_total: parseFloat(invoice.grand_total),
        status: invoice.status,
        notes: invoice.notes,
        shipping_handling: parseFloat(invoice.shipping_handling) || null,
        estimated_tax: parseFloat(invoice.estimated_tax) || null,
        total_before_tax: parseFloat(invoice.total_before_tax) || null,
        billing_address: invoice.billing_address,
        credit_card_transactions: parseFloat(invoice.credit_card_transactions) || null,
        gift_card_amount: parseFloat(invoice.gift_card_amount) || null,
        refunded_amount: parseFloat(invoice.refunded_amount) || null,
        items: items,
        tags: tags,
        categories: categories
      };

      await updateInvoice(invoice.invoice_id, updatedInvoice);
      
      setSavedMessage("Invoice updated successfully!");
      setTimeout(() => setSavedMessage(""), 3000);
      
      // Refresh data
      const refreshedData = await fetchInvoiceById(id);
      setInvoice({
        ...refreshedData,
        merchant_name: refreshedData.merchant_name || ""
      });
      setItems(refreshedData.items || []);
      setTags(refreshedData.tags || []);
      setCategories(refreshedData.categories || []);
      
      // Update PDF URL with new filename if changed
      if (refreshedData.file_name) {
        setPdfUrl(`${API_URL}/uploads/${encodeURIComponent(refreshedData.file_name)}`);
      }
      
      setIsSaving(false);
    } catch (error) {
      console.error("Error saving invoice:", error);
      setError("Failed to update invoice. Please try again.");
      setIsSaving(false);
    }
  };

  // Toggle split view
  const toggleSplitView = () => {
    setSplitView(!splitView);
  };

  // Format currency
  const formatCurrency = (value) => {
    if (!value) return "$0.00";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  // Payment submission handler
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    
    if (!cardNumberId) {
      alert("Please enter a card number ID.");
      return;
    }
    
    if (!transactionId) {
      alert("Please enter a transaction ID.");
      return;
    }
    
    try {
      const result = await addPayment(
        invoice.invoice_id,
        cardNumberId,
        paymentAmount || invoice.grand_total,
        transactionId
      );
      
      // Reset form
      setCardNumberId("");
      setTransactionId("");
      setPaymentAmount("");
      setShowPaymentForm(false);
      
      // Refresh invoice data to show updated payment status
      await loadInvoiceDetails(id);
      
      // Show success message
      setSavedMessage("Payment added successfully!");
      setTimeout(() => setSavedMessage(""), 3000);
      
    } catch (error) {
      console.error("Error adding payment:", error);
      setError("Failed to add payment. Please try again.");
    }
  };

  // Handle delete invoice
  const handleDelete = async () => {
    try {
      // Close the modal first
      setShowDeleteModal(false);
      
      // Call the API to delete the invoice
      await deleteInvoice(invoice.invoice_id);
      
      // Show a confirmation and navigate back to invoices list
      alert("Invoice deleted successfully.");
      navigate("/invoices");
      
    } catch (error) {
      console.error("Error deleting invoice:", error);
      setError("Failed to delete invoice. Please try again.");
      setShowDeleteModal(false);
    }
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch(status) {
      case "Paid":
        return "bg-green-500";
      case "Open":
        return "bg-blue-500";
      case "Needs Attention":
        return "bg-red-500";
      case "Draft":
        return "bg-gray-500";
      default:
        return "bg-gray-400";
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading invoice data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="bg-white border border-red-300 rounded-lg shadow-md">
          <div className="text-center p-8">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="mt-2 text-red-600">{error}</p>
            <button 
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-200"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col sm:flex-row justify-between mb-6">
        <div>
          <nav className="flex mb-2" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <Link to="/" className="text-gray-600 hover:text-blue-500">
                  Dashboard
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                  </svg>
                  <Link to="/invoices" className="ml-1 text-gray-600 hover:text-blue-500 md:ml-2">
                    Invoices
                  </Link>
                </div>
              </li>
              <li aria-current="page">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                  </svg>
                  <span className="ml-1 text-gray-500 md:ml-2">Invoice #{invoice.invoice_id}</span>
                </div>
              </li>
            </ol>
          </nav>
          <h2 className="text-2xl font-semibold mb-1">
            {invoice.merchant_name || "Invoice Details"}
          </h2>
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 text-xs font-medium text-white rounded-full ${getStatusColor(invoice.status)}`}>
              {invoice.status}
            </span>
            {invoice.order_number && (
              <span className="text-gray-500">Order #: {invoice.order_number}</span>
            )}
          </div>
        </div>
        
        <div className="mt-4 sm:mt-0 flex items-center space-x-2">
          {/* Navigation buttons */}
          <button 
            className={`flex items-center px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 ${currentIndex <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={goToPrevInvoice}
            disabled={currentIndex <= 0}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Prev
          </button>
          
          <button 
            className={`flex items-center px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 ${currentIndex >= allInvoices.length - 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={goToNextInvoice}
            disabled={currentIndex >= allInvoices.length - 1}
          >
            Next
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          
          <button 
            className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            onClick={() => navigate("/invoices")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>
          <button 
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300"
            onClick={saveInvoice} 
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Save
              </>
            )}
          </button>
          <button 
            className="flex items-center px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            onClick={() => setShowDeleteModal(true)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        </div>
      </div>
      
      {savedMessage && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">{savedMessage}</p>
            </div>
            <button 
              className="ml-auto pl-3" 
              onClick={() => setSavedMessage("")}
            >
              <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Split View Toggle */}
      <div className="mb-4 flex justify-end">
        <button
          className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
            splitView 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          onClick={toggleSplitView}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
          {splitView ? "Exit Split View" : "Split View"}
        </button>
      </div>

      {/* Tabs - Always visible now, regardless of split view */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              className={`py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === "details"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("details")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Details
            </button>
            <button
              className={`py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === "items"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("items")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Line Items
            </button>
            <button
              className={`py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === "payments"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("payments")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              Payments
            </button>
            <button
              className={`py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === "document"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("document")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Document
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content Area - Split or Regular View */}
      <div className={`${splitView ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : ''}`}>
        {/* Left Side (Details/Items/Payments) */}
        <div className={splitView ? 'col-span-1' : ''}>
          {/* Left Panel Content - Now we'll show only the active tab content */}
          <div className="bg-white rounded-lg shadow-sm">
            {/* Details Tab */}
            {activeTab === "details" && (
              <div className="p-6">
                <h3 className="text-lg font-medium mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Order Number</label>
                      <input
                        type="text"
                        name="order_number"
                        value={invoice.order_number || ""}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-gray-50 border-0 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="Enter order number"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Purchase Date</label>
                      <input
                        type="date"
                        name="purchase_date"
                        value={invoice.purchase_date || ""}
                        onChange={handleInputChange}
                        onPaste={handleDatePaste}
                        className="w-full px-3 py-2 bg-gray-50 border-0 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    
                    {/* Separate Merchant and File Name fields */}
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Merchant Name</label>
                      <input
                        type="text"
                        name="merchant_name"
                        value={invoice.merchant_name || ""}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-gray-50 border-0 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="Enter merchant name"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">File Name</label>
                      <input
                        type="text"
                        name="file_name"
                        value={invoice.file_name || ""}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-gray-50 border-0 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="Original file name"
                        disabled
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        File will be renamed automatically if merchant and order number are provided
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Grand Total</label>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 bg-gray-50 text-gray-500 border-0 border-r-0 rounded-l-md">$</span>
                        <input
                          type="number"
                          step="0.01"
                          name="grand_total"
                          value={invoice.grand_total || ""}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 bg-gray-50 border-0 rounded-r-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                      <select
                        name="status"
                        value={invoice.status || "Open"}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-gray-50 border-0 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      >
                        {VALID_STATUSES.map((status) => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-gray-500 mb-1">Payment Method</label>
                      <input
                        type="text"
                        name="payment_method"
                        value={invoice.payment_method || ""}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-gray-50 border-0 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="Enter payment method"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-gray-500 mb-1">Notes</label>
                      <textarea
                        rows={3}
                        name="notes"
                        value={invoice.notes || ""}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-gray-50 border-0 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="Enter notes"
                      />
                    </div>
                  </div>

                  <h3 className="text-lg font-medium mt-6 mb-4">Additional Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Shipping & Handling</label>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 bg-gray-50 text-gray-500 border-0 border-r-0 rounded-l-md">$</span>
                        <input
                          type="number"
                          step="0.01"
                          name="shipping_handling"
                          value={invoice.shipping_handling || ""}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 bg-gray-50 border-0 rounded-r-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Estimated Tax</label>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 bg-gray-50 text-gray-500 border-0 border-r-0 rounded-l-md">$</span>
                        <input
                          type="number"
                          step="0.01"
                          name="estimated_tax"
                          value={invoice.estimated_tax || ""}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 bg-gray-50 border-0 rounded-r-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-gray-500 mb-1">Billing Address</label>
                      <textarea
                        rows={2}
                        name="billing_address"
                        value={invoice.billing_address || ""}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-gray-50 border-0 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="Enter billing address"
                      />
                    </div>
                  </div>

                  <h3 className="text-lg font-medium mt-6 mb-4">Tags & Categories</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Tags Section with Add/Remove functionality */}
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-2">Tags</label>
                      
                      {/* Selected tags with remove option */}
                      <div className="flex flex-wrap gap-2 mb-2">
                        {tags.map((tag) => (
                          <div 
                            key={tag} 
                            className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center"
                          >
                            {tag}
                            <button 
                              className="ml-1 text-blue-600 hover:text-blue-800 focus:outline-none"
                              onClick={() => removeTag(tag)}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                      
                      {/* Add new tag */}
                      <div className="flex">
                        <input
                          type="text"
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          className="flex-1 px-3 py-2 bg-gray-50 border-0 rounded-l-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          placeholder="Add a new tag"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddTag();
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={handleAddTag}
                          className="px-3 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600 focus:outline-none"
                        >
                          Add
                        </button>
                      </div>
                      
                      <label className="block text-xs font-medium text-gray-500 mt-3 mb-1">Available Tags</label>
                      <select
                        multiple
                        value={tags}
                        onChange={handleTagChange}
                        className="w-full px-3 py-2 bg-gray-50 border-0 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        style={{ height: "100px" }}
                      >
                        {availableTags.map((tag) => (
                          <option key={tag} value={tag}>
                            {tag}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        Hold Ctrl (or Cmd on Mac) to select multiple tags
                      </p>
                    </div>
                    
                    {/* Categories Section with Add/Remove functionality */}
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-2">Categories</label>
                      
                      {/* Selected categories with remove option */}
                      <div className="flex flex-wrap gap-2 mb-2">
                        {categories.map((category) => (
                          <div 
                            key={category} 
                            className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm flex items-center"
                          >
                            {category}
                            <button 
                              className="ml-1 text-green-600 hover:text-green-800 focus:outline-none"
                              onClick={() => removeCategory(category)}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                      
                      {/* Add new category */}
                      <div className="flex">
                        <input
                          type="text"
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value)}
                          className="flex-1 px-3 py-2 bg-gray-50 border-0 rounded-l-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          placeholder="Add a new category"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddCategory();
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={handleAddCategory}
                          className="px-3 py-2 bg-green-500 text-white rounded-r-md hover:bg-green-600 focus:outline-none"
                        >
                          Add
                        </button>
                      </div>
                      
                      <label className="block text-xs font-medium text-gray-500 mt-3 mb-1">Available Categories</label>
                      <select
                        multiple
                        value={categories}
                        onChange={handleCategoryChange}
                        className="w-full px-3 py-2 bg-gray-50 border-0 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        style={{ height: "100px" }}
                      >
                        {availableCategories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        Hold Ctrl (or Cmd on Mac) to select multiple categories
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Items Tab */}
              {activeTab === "items" && (
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Line Items</h3>
                    <button 
                      className="flex items-center px-3 py-2 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600"
                      onClick={addItem}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Item
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Product Name
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">
                            Quantity
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/8">
                            Unit Price ($)
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/8">
                            Total
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/8">
                            Product Link
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/8">
                            Condition
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {items.length > 0 ? (
                          items.map((item, index) => (
                            <tr key={index}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <input
                                  type="text"
                                  value={item.product_name || ""}
                                  onChange={(e) => handleItemChange(index, "product_name", e.target.value)}
                                  className="w-full px-2 py-1 bg-transparent border-b border-gray-200 focus:border-blue-500 focus:ring-0 focus:outline-none"
                                  placeholder="Product name"
                                />
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <input
                                  type="number"
                                  min="0" // Allow 0 quantity
                                  value={item.quantity !== null && item.quantity !== undefined ? item.quantity : ""}
                                  onChange={(e) => handleItemChange(index, "quantity", e.target.value === "" ? null : parseInt(e.target.value))}
                                  className="w-full px-2 py-1 bg-transparent border-b border-gray-200 focus:border-blue-500 focus:ring-0 focus:outline-none"
                                />
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <span className="text-gray-500 mr-1">$</span>
                                  <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={item.unit_price !== null && item.unit_price !== undefined ? item.unit_price : ""}
                                    onChange={(e) => handleItemChange(index, "unit_price", e.target.value === "" ? null : parseFloat(e.target.value))}
                                    className="w-full px-2 py-1 bg-transparent border-b border-gray-200 focus:border-blue-500 focus:ring-0 focus:outline-none"
                                  />
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right">
                                {item.quantity !== null && item.unit_price !== null 
                                  ? formatCurrency((item.quantity || 0) * (item.unit_price || 0))
                                  : "-"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <input
                                  type="text"
                                  value={item.product_link || ""}
                                  onChange={(e) => handleItemChange(index, "product_link", e.target.value)}
                                  className="w-full px-2 py-1 bg-transparent border-b border-gray-200 focus:border-blue-500 focus:ring-0 focus:outline-none"
                                  placeholder="Product URL"
                                />
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <select
                                  value={item.condition || "New"}
                                  onChange={(e) => handleItemChange(index, "condition", e.target.value)}
                                  className="w-full px-2 py-1 bg-transparent border-b border-gray-200 focus:border-blue-500 focus:ring-0 focus:outline-none"
                                >
                                  <option value="New">New</option>
                                  <option value="Used">Used</option>
                                  <option value="Refurbished">Refurbished</option>
                                </select>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button 
                                  className="p-1 text-red-600 hover:text-red-900 focus:outline-none"
                                  onClick={() => removeItem(index)}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="7" className="px-6 py-10 text-center text-gray-500">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto mb-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                              </svg>
                              No line items found. Click "Add Item" to add products.
                            </td>
                          </tr>
                        )}
                      </tbody>
                      {items.length > 0 && (
                        <tfoot className="bg-gray-50">
                          <tr>
                            <td colSpan="3" className="px-6 py-4 text-right font-medium">Subtotal:</td>
                            <td className="px-6 py-4 text-right font-medium">
                              {formatCurrency(items.reduce((sum, item) => {
                                const quantity = item.quantity !== null ? item.quantity : 0;
                                const unitPrice = item.unit_price !== null ? item.unit_price : 0;
                                return sum + (quantity * unitPrice);
                              }, 0))}
                            </td>
                            <td colSpan="3"></td>
                          </tr>
                        </tfoot>
                      )}
                    </table>
                  </div>
                </div>
              )}

              {/* Payments Tab */}
              {activeTab === "payments" && (
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Payment Information</h3>
                    <button 
                      className={`flex items-center px-3 py-2 text-sm rounded-md ${
                        showPaymentForm 
                          ? "bg-gray-500 text-white hover:bg-gray-600" 
                          : "bg-blue-500 text-white hover:bg-blue-600"
                      }`}
                      onClick={() => setShowPaymentForm(!showPaymentForm)}
                    >
                      {showPaymentForm ? (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Cancel
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Add Payment
                        </>
                      )}
                    </button>
                  </div>

                  {showPaymentForm && (
                    <div className="bg-gray-50 rounded-lg mb-6 p-6">
                      <h5 className="text-lg font-medium mb-4">Add New Payment</h5>
                      <form onSubmit={handlePaymentSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Card Number ID</label>
                            <input
                              type="number"
                              value={cardNumberId}
                              onChange={(e) => setCardNumberId(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                              placeholder="Card ID"
                              required
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Enter the ID of the card to use
                            </p>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Transaction ID</label>
                            <input
                              type="text"
                              value={transactionId}
                              onChange={(e) => setTransactionId(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                              placeholder="Transaction ID"
                              required
                            />
                          </div>
                          <div className="md:col-span-3 flex justify-end">
                            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Submit Payment
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-gray-50 rounded-lg p-6 text-center">
                      <h6 className="text-sm text-gray-500 mb-1">Total Due</h6>
                      <p className="text-3xl font-bold">{formatCurrency(invoice.grand_total || 0)}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-6 text-center">
                      <h6 className="text-sm text-gray-500 mb-1">Amount Paid</h6>
                      <p className="text-3xl font-bold text-green-500">$0.00</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-6 text-center">
                      <h6 className="text-sm text-gray-500 mb-1">Balance</h6>
                      <p className="text-3xl font-bold text-red-500">{formatCurrency(invoice.grand_total || 0)}</p>
                    </div>
                  </div>

                  <h6 className="font-medium mb-3">Payment History</h6>
                  <div className="overflow-x-auto border rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Transaction ID
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Card
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                          <td colSpan="5" className="px-6 py-10 text-center text-gray-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto mb-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                          </svg>
                          <p className="mt-2">No payment history available yet</p>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side (PDF Document in Split View or if Document tab is active) */}
        {(splitView || (!splitView && activeTab === "document")) && (
          <div className={splitView ? 'col-span-1' : ''}>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Invoice Document</h3>
                {pdfUrl && (
                  <a 
                    href={`${API_URL}/download/${encodeURIComponent(invoice.file_name)}`}
                    className="flex items-center px-3 py-2 border border-blue-500 text-blue-500 text-sm rounded-md hover:bg-blue-50"
                    download
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download
                  </a>
                )}
              </div>
              
              <div className="mt-4">
                {pdfUrl ? (
                  <div className="aspect-w-16 aspect-h-9 border rounded-lg overflow-hidden shadow-sm">
                    <iframe
                      src={pdfUrl}
                      title="Invoice PDF"
                      className="w-full h-full"
                      style={{ height: splitView ? '800px' : '600px', backgroundColor: '#f9fafb' }}
                    ></iframe>
                  </div>
                ) : (
                  <div className="text-center p-12 border rounded-lg bg-gray-50">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-gray-500 mb-4">No document available for this invoice</p>
                    <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      Upload Document
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-red-600">
                      Confirm Deletion
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete this invoice?
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button 
                  type="button" 
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleDelete}
                >
                  Delete Invoice
                </button>
                <button 
                  type="button" 
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}