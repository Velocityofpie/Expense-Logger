// dashboard/RecentInvoices.tsx - Recent invoices component
import React from 'react';
import { Link } from 'react-router-dom';
import { Invoice } from './types';
import { formatCurrency } from './dashboardApi';
import './dashboard.css';

interface RecentInvoicesProps {
  invoices: Invoice[];
  title?: string;
}

const RecentInvoices: React.FC<RecentInvoicesProps> = ({ 
  invoices,
  title = "Recent Invoices"
}) => {
  // Get status badge color
  const getStatusColor = (status?: string): string => {
    switch(status) {
      case "Paid":
        return "status-badge-paid";
      case "Open":
        return "status-badge-open";
      case "Needs Attention":
        return "status-badge-attention";
      default:
        return "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300";
    }
  };
  
  // Format date
  const formatDate = (dateString?: string): string => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">{title}</h2>
        <Link 
          to="/invoices" 
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-900 dark:text-indigo-200 dark:hover:bg-indigo-800"
        >
          View All
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-4 w-4 ml-1" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9 5l7 7-7 7" 
            />
          </svg>
        </Link>
      </div>
      
      <div className="overflow-x-auto">
        <table className="recent-invoices-table">
          <thead>
            <tr>
              <th>Order #</th>
              <th>Date</th>
              <th>Merchant</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Categories</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length > 0 ? (
              invoices.map((invoice) => (
                <tr key={invoice.invoice_id}>
                  <td>
                    <Link 
                      to={`/invoice/${invoice.invoice_id}`} 
                      className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 font-medium"
                    >
                      {invoice.order_number || "-"}
                    </Link>
                  </td>
                  <td>{formatDate(invoice.purchase_date)}</td>
                  <td>
                    <div className="max-w-xs truncate">
                      {invoice.merchant_name || "-"}
                    </div>
                  </td>
                  <td className="font-medium text-gray-900 dark:text-gray-100">
                    {formatCurrency(invoice.grand_total || 0)}
                  </td>
                  <td>
                    <span className={`status-badge ${getStatusColor(invoice.status)}`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex flex-wrap gap-1">
                      {invoice.categories && invoice.categories.length > 0 ? (
                        invoice.categories.slice(0, 2).map((category, idx) => (
                          <span 
                            key={idx} 
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"
                          >
                            {category}
                          </span>
                        ))
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                          Uncategorized
                        </span>
                      )}
                      {invoice.categories && invoice.categories.length > 2 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                          +{invoice.categories.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-10 text-gray-500 dark:text-gray-400">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-10 w-10 mx-auto mb-2 text-gray-400 dark:text-gray-500" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={1} 
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" 
                    />
                  </svg>
                  <p className="mt-2">No invoices found</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentInvoices;