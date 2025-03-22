// src/components/invoice/detail/InvoiceStatusPanel.tsx
import React from 'react';
import { formatCurrency } from '../../../services/formatters/currencyFormatter';
import { formatDate } from '../../../services/formatters/dateFormatter';

interface InvoiceStatusPanelProps {
  invoice: {
    status: string;
    grand_total: number;
    purchase_date?: string;
    payment_method?: string;
    created_at?: string;
    updated_at?: string;
  };
}

export const InvoiceStatusPanel: React.FC<InvoiceStatusPanelProps> = ({
  invoice
}) => {
  // Get status color based on invoice status
  const getStatusColorClass = (status: string): string => {
    switch (status) {
      case 'Paid':
        return 'text-green-800 bg-green-100 dark:text-green-200 dark:bg-green-900';
      case 'Open':
        return 'text-blue-800 bg-blue-100 dark:text-blue-200 dark:bg-blue-900';
      case 'Needs Attention':
        return 'text-red-800 bg-red-100 dark:text-red-200 dark:bg-red-900';
      case 'Draft':
        return 'text-gray-800 bg-gray-100 dark:text-gray-200 dark:bg-gray-900';
      default:
        return 'text-gray-800 bg-gray-100 dark:text-gray-200 dark:bg-gray-900';
    }
  };

  return (
    <div className="bg-white dark:bg-dark-card rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Invoice Status</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</h4>
          <div className="mt-1">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColorClass(invoice.status)}`}>
              {invoice.status}
            </span>
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Amount</h4>
          <p className="mt-1 text-base font-semibold text-gray-900 dark:text-white">
            {formatCurrency(invoice.grand_total)}
          </p>
        </div>
        
        {invoice.purchase_date && (
          <div>
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Purchase Date</h4>
            <p className="mt-1 text-base text-gray-900 dark:text-white">
              {formatDate(invoice.purchase_date)}
            </p>
          </div>
        )}
        
        {invoice.payment_method && (
          <div>
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Payment Method</h4>
            <p className="mt-1 text-base text-gray-900 dark:text-white">
              {invoice.payment_method}
            </p>
          </div>
        )}
        
        {invoice.created_at && (
          <div>
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Created</h4>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {formatDate(invoice.created_at, true)}
            </p>
          </div>
        )}
        
        {invoice.updated_at && (
          <div>
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Updated</h4>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {formatDate(invoice.updated_at, true)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};