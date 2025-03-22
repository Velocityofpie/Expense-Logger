// src/components/invoice/table/InvoiceTable.tsx
import React, { useState } from 'react';
import { TableRow } from './InvoiceTableRow';
import { InvoiceBatchActions } from './InvoiceBatchActions';
import { Invoice } from '../../../types/invoice.types';

interface InvoiceTableProps {
  invoices: Invoice[];
  isLoading: boolean;
  onView: (invoice: Invoice) => void;
  onEdit: (invoice: Invoice) => void;
  onDelete: (invoice: Invoice) => void;
  onBatchDelete: (invoiceIds: number[]) => void;
}

export const InvoiceTable: React.FC<InvoiceTableProps> = ({
  invoices,
  isLoading,
  onView,
  onEdit,
  onDelete,
  onBatchDelete
}) => {
  const [selectedInvoices, setSelectedInvoices] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState<boolean>(false);
  
  // Handle selecting individual invoices
  const handleSelectInvoice = (invoiceId: number) => {
    if (selectedInvoices.includes(invoiceId)) {
      setSelectedInvoices(selectedInvoices.filter(id => id !== invoiceId));
    } else {
      setSelectedInvoices([...selectedInvoices, invoiceId]);
    }
  };
  
  // Handle select all toggle
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedInvoices([]);
    } else {
      setSelectedInvoices(invoices.map(inv => inv.invoice_id));
    }
    setSelectAll(!selectAll);
  };
  
  // Clear selections after batch actions
  const handleBatchDelete = () => {
    onBatchDelete(selectedInvoices);
    setSelectedInvoices([]);
    setSelectAll(false);
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        <p className="ml-3 text-gray-600 dark:text-gray-400">Loading invoices...</p>
      </div>
    );
  }
  
  return (
    <div>
      {selectedInvoices.length > 0 && (
        <InvoiceBatchActions 
          selectedCount={selectedInvoices.length}
          onDelete={handleBatchDelete}
        />
      )}
      
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-dark-border">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-border">
          <thead className="bg-gray-50 dark:bg-dark-card">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-muted uppercase tracking-wider w-12">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-muted uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-muted uppercase tracking-wider">Order #</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-muted uppercase tracking-wider">Merchant</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-muted uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-muted uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-muted uppercase tracking-wider">Categories</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-muted uppercase tracking-wider">Tags</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-dark-text-muted uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-dark-card divide-y divide-gray-200 dark:divide-dark-border">
            {invoices.length > 0 ? (
              invoices.map(invoice => (
                <TableRow
                  key={invoice.invoice_id}
                  invoice={invoice}
                  isSelected={selectedInvoices.includes(invoice.invoice_id)}
                  onSelect={() => handleSelectInvoice(invoice.invoice_id)}
                  onView={() => onView(invoice)}
                  onEdit={() => onEdit(invoice)}
                  onDelete={() => onDelete(invoice)}
                />
              ))
            ) : (
              <tr>
                <td colSpan={9} className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
                  <div className="flex flex-col items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 dark:text-gray-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-lg font-medium">No invoices found</p>
                    <p className="text-sm mt-1">Upload some invoices or add them manually</p>
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