// src/features/invoiceDetails/components/InvoiceHeader.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Invoice } from '../../invoices/types';
import { Button } from '../../../shared';

interface InvoiceHeaderProps {
  invoice: Invoice;
  onGoBack: () => void;
  onSave: () => Promise<boolean | undefined>;
  onDelete: () => void;
  onPrev: () => void;
  onNext: () => void;
  canGoPrev: boolean;
  canGoNext: boolean;
  isSaving: boolean;
  toggleSplitView: () => void;
  splitView: boolean;
}

const InvoiceHeader: React.FC<InvoiceHeaderProps> = ({ 
  invoice, 
  onGoBack,
  onSave,
  onDelete,
  onPrev,
  onNext,
  canGoPrev,
  canGoNext,
  isSaving,
  toggleSplitView,
  splitView
}) => {
  // Get status badge color
  const getStatusColor = (status: string) => {
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

  return (
    <div className="mb-8">
      {/* Breadcrumb navigation and top buttons row */}
      <div className="flex justify-between items-center mb-6">
        <nav className="flex" aria-label="Breadcrumb">
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
        
        {/* Top row action buttons */}
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            disabled={!canGoPrev}
            onClick={onPrev}
            className="flex items-center px-4 py-2 border rounded-md shadow-sm bg-white text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
            icon={
              <svg width="16" height="16" className="mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            }
          >
            Previous
          </Button>
          
          <Button
            variant="outline"
            disabled={!canGoNext}
            onClick={onNext}
            className="flex items-center px-4 py-2 border rounded-md shadow-sm bg-white text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
            icon={
              <svg width="16" height="16" className="mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            }
          >
            Next
          </Button>
          
          <Button
            variant="danger"
            onClick={onDelete}
            className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
            icon={
              <svg width="16" height="16" className="mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 6H5H21" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10 11V17" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 11V17" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            }
          >
            Delete
          </Button>
          
          <Button
            variant="primary"
            onClick={onSave}
            isLoading={isSaving}
            loadingText="Saving..."
            className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-blue-600 dark:hover:bg-blue-700"
            icon={
              <svg width="16" height="16" className="mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16L21 8V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M17 21V13H7V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M7 3V8H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            }
          >
            Save
          </Button>
        </div>
      </div>
      
      {/* Invoice title and Split View button row */}
      <div className="flex justify-between items-center mb-4">
        <div>
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
        
        {/* Split View button */}
        <Button
          variant={splitView ? "primary" : "outline"}
          onClick={toggleSplitView}
          className={`flex items-center px-4 py-2 border rounded-md shadow-sm ${
            splitView 
              ? "bg-indigo-600 border-transparent text-white hover:bg-indigo-700 dark:bg-blue-600 dark:hover:bg-blue-700" 
              : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
          }`}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          }
        >
          Split View
        </Button>
      </div>
    </div>
  );
};

export default InvoiceHeader;