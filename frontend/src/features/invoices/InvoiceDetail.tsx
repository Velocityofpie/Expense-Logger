// InvoiceDetail.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardHeader, CardBody, Table, Badge, Button, Tabs, Tab } from '../shared';
import { LineItemEditor } from './';
import { fetchInvoiceById, updateInvoice, deleteInvoice, addPayment } from './invoicesApi';
import { Invoice, LineItem } from './types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const InvoiceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // State for the invoice data
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [items, setItems] = useState<LineItem[]>([]);
  const [pdfUrl, setPdfUrl] = useState('');
  
  // State for tags and categories
  const [tags, setTags] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  
  // State for payment
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [cardNumberId, setCardNumberId] = useState('');
  const [transactionId, setTransactionId] = useState('');
  
  // Confirm delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Saving state
  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');
  
  // Loading state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active tab state
  const [activeTab, setActiveTab] = useState<string>('details');
  
  // Split view state
  const [splitView, setSplitView] = useState(false);

  // Fetch the invoice details
  useEffect(() => {
    const loadInvoiceDetails = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const data = await fetchInvoiceById(id);
        
        setInvoice(data);
        setItems(data.items || []);
        setTags(data.tags || []);
        setCategories(data.categories || []);
        
        if (data.file_name) {
          setPdfUrl(`${API_URL}/uploads/${encodeURIComponent(data.file_name)}`);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading invoice:', error);
        setError('Failed to load invoice data. Please try again.');
        setIsLoading(false);
      }
    };
    
    loadInvoiceDetails();
  }, [id]);

  // Handle changes to invoice fields
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (!invoice) return;
    
    setInvoice({ ...invoice, [name]: value });
  };

  // Handle changes to line items
  const handleItemsChange = (updatedItems: LineItem[]) => {
    setItems(updatedItems);
  };

  // Format currency
  const formatCurrency = (value?: number): string => {
    if (value === undefined || value === null) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  // Save invoice changes
  const saveInvoice = async () => {
    if (!invoice) return;
    
    try {
      setIsSaving(true);
      
      const updatedInvoice = {
        ...invoice,
        items: items,
        tags: tags,
        categories: categories
      };

      await updateInvoice(invoice.invoice_id, updatedInvoice);
      
      setSavedMessage('Invoice updated successfully!');
      setTimeout(() => setSavedMessage(''), 3000);
      setIsSaving(false);
    } catch (error) {
      console.error('Error saving invoice:', error);
      setError('Failed to update invoice. Please try again.');
      setIsSaving(false);
    }
  };

  // Handle payment submission
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!invoice) return;
    
    if (!cardNumberId) {
      alert('Please enter a card number ID.');
      return;
    }
    
    if (!transactionId) {
      alert('Please enter a transaction ID.');
      return;
    }
    
    try {
      await addPayment(
        invoice.invoice_id,
        cardNumberId,
        paymentAmount || invoice.grand_total,
        transactionId
      );
      
      // Reset form
      setCardNumberId('');
      setTransactionId('');
      setPaymentAmount('');
      setShowPaymentForm(false);
      
      // Show success message
      setSavedMessage('Payment added successfully!');
      setTimeout(() => setSavedMessage(''), 3000);
      
    } catch (error) {
      console.error('Error adding payment:', error);
      setError('Failed to add payment. Please try again.');
    }
  };

  // Handle delete invoice
  const handleDelete = async () => {
    if (!invoice) return;
    
    try {
      setShowDeleteModal(false);
      await deleteInvoice(invoice.invoice_id);
      navigate('/invoices');
    } catch (error) {
      console.error('Error deleting invoice:', error);
      setError('Failed to delete invoice. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-red-700">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 text-sm font-medium text-red-700 hover:text-red-600"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return <div>No invoice found.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header with breadcrumbs and actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <nav className="flex items-center text-sm">
            <Link to="/" className="text-gray-600 hover:text-primary-600">Dashboard</Link>
            <svg className="h-4 w-4 mx-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            <Link to="/invoices" className="text-gray-600 hover:text-primary-600">Invoices</Link>
            <svg className="h-4 w-4 mx-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            <span className="text-gray-500">Invoice #{invoice.invoice_id}</span>
          </nav>
          <h1 className="text-2xl font-semibold mt-2">{invoice.merchant_name || 'Invoice Details'}</h1>
          <div className="flex items-center mt-1">
            <Badge color={invoice.status === 'Paid' ? 'success' : invoice.status === 'Open' ? 'primary' : 'warning'}>
              {invoice.status}
            </Badge>
            {invoice.order_number && (
              <span className="ml-2 text-gray-500">Order #: {invoice.order_number}</span>
            )}
          </div>
        </div>
        
        <div className="flex space-x-2 mt-4 sm:mt-0">
          <Button 
            variant="outline" 
            onClick={() => navigate('/invoices')}
            iconLeft={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            }
          >
            Back
          </Button>
          <Button 
            variant="primary" 
            onClick={saveInvoice} 
            isLoading={isSaving}
            loadingText="Saving..."
            iconLeft={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            }
          >
            Save
          </Button>
          <Button 
            variant="danger" 
            onClick={() => setShowDeleteModal(true)}
            iconLeft={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            }
          >
            Delete
          </Button>
        </div>
      </div>
      
      {savedMessage && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-green-700">{savedMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Split View Toggle */}
      <div className="flex justify-end">
        <Button 
          variant={splitView ? "primary" : "outline"}
          onClick={() => setSplitView(!splitView)}
          iconLeft={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          }
        >
          {splitView ? "Exit Split View" : "Split View"}
        </Button>
      </div>

      {/* Tabs */}
      <Tabs activeTab={activeTab} onChange={setActiveTab}>
        <Tab id="details" label="Details" icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        } />
        <Tab id="items" label="Line Items" icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        } />
        <Tab id="payments" label="Payments" icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        } />
        <Tab id="document" label="Document" icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        } />
      </Tabs>

      {/* Content based on active tab */}
      <div className={`grid ${splitView ? 'grid-cols-1 lg:grid-cols-2 gap-6' : 'grid-cols-1'}`}>
        {/* Main content area */}
        <div className={activeTab !== 'document' || splitView ? 'block' : 'hidden'}>
          {activeTab === 'details' && (
            <Card>
              <CardBody>
                <h3 className="text-lg font-medium mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Invoice details form fields here */}
                  {/* This would include merchant name, order number, date, amount, etc. */}
                </div>
              </CardBody>
            </Card>
          )}

          {activeTab === 'items' && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Line Items</h3>
                  <Button 
                    variant="primary" 
                    size="sm"
                    onClick={() => {
                      setItems([...items, {
                        product_name: '',
                        quantity: 1,
                        unit_price: 0
                      }]);
                    }}
                  >
                    Add Item
                  </Button>
                </div>
              </CardHeader>
              <CardBody>
                <LineItemEditor 
                  items={items} 
                  onChange={handleItemsChange} 
                />
              </CardBody>
            </Card>
          )}

          {activeTab === 'payments' && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Payment Information</h3>
                  <Button 
                    variant={showPaymentForm ? "secondary" : "primary"}
                    size="sm"
                    onClick={() => setShowPaymentForm(!showPaymentForm)}
                  >
                    {showPaymentForm ? "Cancel" : "Add Payment"}
                  </Button>
                </div>
              </CardHeader>
              <CardBody>
                {/* Payment form and history would go here */}
              </CardBody>
            </Card>
          )}
        </div>

        {/* Document viewer */}
        {(activeTab === 'document' || splitView) && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Invoice Document</h3>
                {pdfUrl && (
                  <a 
                    href={pdfUrl}
                    className="text-primary-600 hover:text-primary-700 font-medium flex items-center"
                    download
                  >
                    <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download
                  </a>
                )}
              </div>
            </CardHeader>
            <CardBody>
              {pdfUrl ? (
                <div className="h-[600px] border rounded-lg overflow-hidden">
                  <iframe
                    src={pdfUrl}
                    title="Invoice PDF"
                    className="w-full h-full"
                  ></iframe>
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center bg-gray-50 border border-dashed rounded-lg">
                  <svg className="h-12 w-12 text-gray-400 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-500">No document available</p>
                </div>
              )}
            </CardBody>
          </Card>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-red-600 mb-4">Confirm Deletion</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this invoice? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <Button 
                variant="outline" 
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </Button>
              <Button 
                variant="danger" 
                onClick={handleDelete}
              >
                Delete Invoice
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceDetail;