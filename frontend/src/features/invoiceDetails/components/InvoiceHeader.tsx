// src/features/invoices/invoiceDetail/components/InvoiceHeader.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Invoice } from '../../invoices/types';

interface InvoiceHeaderProps {
  invoice: Invoice;
  onGoBack: () => void;
}

const InvoiceHeader: React.FC<InvoiceHeaderProps> = ({ invoice, onGoBack }) => {
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
    </div>
  );
};

export default InvoiceHeader;