// src/features/invoices/invoiceDetail/InvoiceDetailContainer.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// Components
import InvoiceHeader from './components/InvoiceHeader';
import InvoiceTabs from './components/InvoiceTabs';
import InvoiceBasicInfo from './components/InvoiceBasicInfo';
import InvoiceLineItems from './components/InvoiceLineItems';
import InvoicePayment from './components/InvoicePayment';
import InvoiceDocumentViewer from './components/InvoiceDocumentViewer';
import InvoiceActions from './components/InvoiceActions';
import InvoiceDeleteModal from './components/InvoiceDeleteModal';

// Hooks
import { useInvoiceData } from './hooks/useInvoiceData';
import { useInvoiceActions } from './hooks/useInvoiceActions';

// Types
import { TabType } from './types';

const InvoiceDetailContainer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Get invoice data and state
  const { 
    invoice, 
    items, 
    tags, 
    categories,
    isLoading, 
    error, 
    setItems,
    setTags,
    setCategories,
    handleInputChange,
    handleDatePaste,
    allInvoices,
    currentIndex,
    pdfUrl,
    availableTags,
    availableCategories,
    isSaving,
    savedMessage,
    setSavedMessage
  } = useInvoiceData(id);
  
  // Actions
  const {
    saveInvoice,
    deleteInvoice,
    addPayment,
    goToPrevInvoice,
    goToNextInvoice,
  } = useInvoiceActions(invoice, items, tags, categories, navigate, id);
  
  // Local state
  const [activeTab, setActiveTab] = useState<TabType>('details');
  const [splitView, setSplitView] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  
  // Early return states
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

  if (!invoice) {
    return <div>Invoice not found</div>;
  }

  // Toggle split view
  const toggleSplitView = () => {
    setSplitView(!splitView);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header with breadcrumbs and navigation */}
      <InvoiceHeader 
        invoice={invoice} 
        onGoBack={() => navigate('/invoices')}
      />
      
      {/* Action buttons */}
      <InvoiceActions
        onSave={saveInvoice}
        onDelete={() => setShowDeleteModal(true)}
        onPrev={goToPrevInvoice}
        onNext={goToNextInvoice}
        canGoPrev={currentIndex > 0}
        canGoNext={currentIndex < allInvoices.length - 1}
        isSaving={isSaving}
      />
      
      {/* Success message banner */}
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

      {/* Tabs */}
      <InvoiceTabs 
        activeTab={activeTab} 
        onChange={setActiveTab} 
      />

      {/* Content area */}
      <div className={`grid ${splitView ? 'grid-cols-1 lg:grid-cols-2 gap-6' : 'grid-cols-1'}`}>
        {/* Main content area */}
        <div className={activeTab !== 'document' || splitView ? 'block' : 'hidden'}>
          {activeTab === 'details' && (
            <InvoiceBasicInfo 
              invoice={invoice}
              handleInputChange={handleInputChange}
              handleDatePaste={handleDatePaste}
              tags={tags}
              categories={categories}
              availableTags={availableTags}
              availableCategories={availableCategories}
              setTags={setTags}
              setCategories={setCategories}
            />
          )}

          {activeTab === 'items' && (
            <InvoiceLineItems 
              items={items} 
              onChange={setItems} 
            />
          )}

          {activeTab === 'payments' && (
            <InvoicePayment 
              invoice={invoice}
              showPaymentForm={showPaymentForm}
              setShowPaymentForm={setShowPaymentForm}
              onAddPayment={addPayment}
            />
          )}
        </div>

        {/* Document viewer */}
        {(activeTab === 'document' || splitView) && (
          <InvoiceDocumentViewer pdfUrl={pdfUrl} />
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <InvoiceDeleteModal 
          onConfirm={deleteInvoice}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  );
};

export default InvoiceDetailContainer;