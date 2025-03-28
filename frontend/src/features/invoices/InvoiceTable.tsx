// src/features/invoices/InvoiceTable.tsx
import React, { useState } from 'react';
import { 
  Table, 
  TableHead,
  TableBody,
  TableRow,
  TableHeader,
  TableCell,
  TableFooter,
  Badge, 
  Button, 
  Checkbox 
} from '../../shared';
import { Invoice } from './types';

interface InvoiceTableProps {
  invoices: Invoice[];
  isLoading: boolean;
  onView: (invoice: Invoice) => void;
  onEdit: (invoice: Invoice) => void;
  onDelete: (invoice: Invoice) => void;
  onBatchDelete: (invoiceIds: number[]) => void;
}

const InvoiceTable: React.FC<InvoiceTableProps> = ({
  invoices,
  isLoading,
  onView,
  onEdit,
  onDelete,
  onBatchDelete
}) => {
  // State for selected invoices (for batch actions)
  const [selectedInvoices, setSelectedInvoices] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);

  // Format currency
  const formatCurrency = (value?: number): string => {
    if (value === undefined || value === null) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  // Handle individual checkbox selection
  const handleSelectInvoice = (invoiceId: number) => {
    if (selectedInvoices.includes(invoiceId)) {
      setSelectedInvoices(selectedInvoices.filter(id => id !== invoiceId));
    } else {
      setSelectedInvoices([...selectedInvoices, invoiceId]);
    }
  };

  // Handle "select all" checkbox
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedInvoices([]);
    } else {
      setSelectedInvoices(invoices.map(inv => inv.invoice_id));
    }
    setSelectAll(!selectAll);
  };

  // Handle batch delete confirmation
  const confirmBatchDelete = () => {
    if (selectedInvoices.length > 0) {
      setShowDeleteAlert(true);
    }
  };

  // Execute batch delete
  const executeBatchDelete = () => {
    onBatchDelete(selectedInvoices);
    setSelectedInvoices([]);
    setSelectAll(false);
    setShowDeleteAlert(false);
  };

  // Cancel batch delete
  const cancelBatchDelete = () => {
    setShowDeleteAlert(false);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Batch Action Controls */}
      {selectedInvoices.length > 0 && (
        <div className="flex justify-between items-center mb-4 p-3 bg-gray-50 rounded-md">
          <div>
            <span className="font-medium">{selectedInvoices.length} items selected</span>
          </div>
          <Button 
            variant="danger" 
            size="sm"
            onClick={confirmBatchDelete}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            }
            iconPosition="left"
          >
            Delete Selected
          </Button>
        </div>
      )}

      {/* Delete Confirmation Alert */}
      {showDeleteAlert && (
        <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-md">
          <div className="flex justify-between">
            <div>
              <h4 className="text-lg font-medium text-red-700">Confirm Deletion</h4>
              <p className="text-red-700">
                Are you sure you want to delete {selectedInvoices.length} selected invoice(s)? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-start space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={cancelBatchDelete}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={executeBatchDelete}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-dark-border">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-border">
          <thead className="bg-gray-50 dark:bg-dark-card">
            <tr>
              <th className="w-12 px-6 py-3 text-xs font-medium text-gray-500 dark:text-dark-text-muted uppercase tracking-wider">
                <Checkbox 
                  checked={selectAll}
                  onChange={handleSelectAll}
                  aria-label="Select all invoices"
                />
              </th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-dark-text-muted uppercase tracking-wider text-left">
                Date
              </th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-dark-text-muted uppercase tracking-wider text-left">
                Order #
              </th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-dark-text-muted uppercase tracking-wider text-left">
                Merchant
              </th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-dark-text-muted uppercase tracking-wider text-right">
                Amount
              </th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-dark-text-muted uppercase tracking-wider text-left">
                Status
              </th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-dark-text-muted uppercase tracking-wider text-left">
                Categories
              </th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-dark-text-muted uppercase tracking-wider text-center">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-dark-card divide-y divide-gray-200 dark:divide-dark-border">
            {invoices.length > 0 ? (
              invoices.map(invoice => (
                <tr 
                  key={invoice.invoice_id} 
                  className={selectedInvoices.includes(invoice.invoice_id) ? "bg-primary-50" : ""}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-dark-text-secondary">
                    <Checkbox 
                      checked={selectedInvoices.includes(invoice.invoice_id)}
                      onChange={() => handleSelectInvoice(invoice.invoice_id)}
                      aria-label={`Select invoice ${invoice.invoice_id}`}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-dark-text-secondary">
                    {invoice.purchase_date ? new Date(invoice.purchase_date).toLocaleDateString() : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500 dark:text-dark-text-secondary">
                    {invoice.order_number || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-dark-text-secondary">
                    <div className="truncate max-w-xs" title={invoice.merchant_name || "-"}>
                      {invoice.merchant_name || "-"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500 dark:text-dark-text-secondary text-right">
                    {formatCurrency(invoice.grand_total)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-dark-text-secondary">
                    <Badge 
                      color={
                        invoice.status === "Paid" ? "success" :
                        invoice.status === "Open" ? "primary" :
                        invoice.status === "Needs Attention" ? "danger" :
                        "secondary"
                      }
                    >
                      {invoice.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-dark-text-secondary">
                    <div className="flex flex-wrap gap-1">
                      {invoice.categories && invoice.categories.length > 0 ? (
                        invoice.categories.slice(0, 2).map((category, index) => (
                          <Badge key={index} color="secondary">
                            {category}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                      {invoice.categories && invoice.categories.length > 2 && (
                        <Badge color="secondary">+{invoice.categories.length - 2}</Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-dark-text-secondary text-center">
                    <div className="flex justify-center space-x-2">
                      {invoice.file_name && (
                        <button
                          className="text-primary-600 hover:text-primary-800"
                          onClick={() => onView(invoice)}
                          title="View Document"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                      )}
                      <button
                        className="text-blue-600 hover:text-blue-800"
                        onClick={() => onEdit(invoice)}
                        title="Edit Invoice"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        className="text-red-600 hover:text-red-800"
                        onClick={() => onDelete(invoice)}
                        title="Delete Invoice"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="text-center py-12">
                  <div className="flex flex-col items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-lg text-gray-500">No invoices found</p>
                  <p className="text-sm text-gray-400 mt-1">Upload some invoices or add them manually</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);
};

export default InvoiceTable;