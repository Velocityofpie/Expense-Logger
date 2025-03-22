// src/components/invoice/detail/InvoiceHeader.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../../../components/common/Button';
import { Invoice } from '../../../types/invoice.types';

interface InvoiceHeaderProps {
  invoice: Invoice;
  isLoading: boolean;
  onSave: () => Promise<void>;
  onDelete: () => void;
  isSaving: boolean;
  currentIndex: number;
  totalInvoices: number;
  onPrevious: () => void;
  onNext: () => void;
}

export const InvoiceHeader: React.FC<InvoiceHeaderProps> = ({
  invoice,
  isLoading,
  onSave,
  onDelete,
  isSaving,
  currentIndex,
  totalInvoices,
  onPrevious,
  onNext
}) => {
  // Get status badge color based on invoice status
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'Paid':
        return 'bg-green-500 text-white';
      case 'Open':
        return 'bg-blue-500 text-white';
      case 'Needs Attention':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-between animate-pulse">
        <div className="space-y-2">
          <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
        <div className="h-10 w-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
      <div>
        <nav className="flex mb-2" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link 
                to="/dashboard" 
                className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Dashboard
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                </svg>
                <Link 
                  to="/invoices" 
                  className="ml-1 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 md:ml-2"
                >
                  Invoices
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                </svg>
                <span className="ml-1 text-gray-500 dark:text-gray-400 md:ml-2">{invoice.invoice_id}</span>
              </div>
            </li>
          </ol>
        </nav>
        
        <div className="flex items-center">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mr-3">
            {invoice.merchant_name || "Invoice Details"}
          </h2>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(invoice.status)}`}>
            {invoice.status}
          </span>
        </div>
        
        {invoice.order_number && (
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Order #: {invoice.order_number}
          </p>
        )}
      </div>
      
      <div className="flex items-center space-x-2">
        {/* Navigation buttons */}
        <div className="flex rounded-md shadow-sm mr-2">
          <button 
            className={`relative inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-l-md ${
              currentIndex <= 0 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={onPrevious}
            disabled={currentIndex <= 0}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="sr-only">Previous</span>
          </button>
          <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300">
            {currentIndex + 1} / {totalInvoices}
          </span>
          <button 
            className={`relative inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-r-md ${
              currentIndex >= totalInvoices - 1 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={onNext}
            disabled={currentIndex >= totalInvoices - 1}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="sr-only">Next</span>
          </button>
        </div>
        
        <Link 
          to="/invoices"
          className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </Link>
        
        <Button
          variant="primary"
          onClick={onSave}
          isLoading={isSaving}
          disabled={isSaving}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          }
        >
          Save
        </Button>
        
        <Button
          variant="danger"
          onClick={onDelete}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          }
        >
          Delete
        </Button>
      </div>
    </div>
  );
};