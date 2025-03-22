// src/components/invoice/detail/InvoiceBasicInfoEditor.tsx
import React from 'react';
import { Invoice } from '../../../types/invoice.types';

interface InvoiceBasicInfoEditorProps {
  invoice: Invoice;
  onChange: (field: keyof Invoice, value: any) => void;
  statusOptions: string[];
}

export const InvoiceBasicInfoEditor: React.FC<InvoiceBasicInfoEditorProps> = ({
  invoice,
  onChange,
  statusOptions
}) => {
  // Handle date paste to normalize format
  const handleDatePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const normalizedDate = normalizeDateFormat(pastedText);
    onChange('purchase_date', normalizedDate);
  };

  // Function to normalize date formats
  const normalizeDateFormat = (dateString: string): string => {
    if (!dateString) return '';
    
    // Try to parse the date using different formats
    let parsedDate: Date | null = null;
    
    // Match common formats
    // MM/DD/YYYY, MM-DD-YYYY
    const usFormat = /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/;
    // YYYY/MM/DD, YYYY-MM-DD
    const isoFormat = /^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/;
    // DD/MM/YYYY, DD.MM.YYYY, DD-MM-YYYY
    const euFormat = /^(\d{1,2})[\/\.\-](\d{1,2})[\/\.\-](\d{4})$/;
    
    try {
      // Handle ISO format (YYYY-MM-DD)
      if (isoFormat.test(dateString)) {
        return dateString; // Already in ISO format
      }
      // Handle US format (MM/DD/YYYY)
      else if (usFormat.test(dateString)) {
        const matches = dateString.match(usFormat);
        if (matches) {
          const month = matches[1].padStart(2, '0');
          const day = matches[2].padStart(2, '0');
          const year = matches[3];
          return `${year}-${month}-${day}`;
        }
      }
      // Handle European format (DD/MM/YYYY)
      else if (euFormat.test(dateString)) {
        const matches = dateString.match(euFormat);
        if (matches) {
          const day = matches[1].padStart(2, '0');
          const month = matches[2].padStart(2, '0');
          const year = matches[3];
          return `${year}-${month}-${day}`;
        }
      }
      // Try to parse with Date constructor
      else {
        parsedDate = new Date(dateString);
        if (!isNaN(parsedDate.getTime())) {
          return parsedDate.toISOString().split('T')[0];
        }
      }
    } catch (e) {
      console.error('Error parsing date:', e);
    }
    
    // Return original string if parsing fails
    return dateString;
  };

  return (
    <div className="bg-white dark:bg-dark-card rounded-lg shadow-sm">
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Merchant Name
            </label>
            <input
              type="text"
              value={invoice.merchant_name || ''}
              onChange={(e) => onChange('merchant_name', e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border-0 rounded-md shadow-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
              placeholder="Enter merchant name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Order Number
            </label>
            <input
              type="text"
              value={invoice.order_number || ''}
              onChange={(e) => onChange('order_number', e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border-0 rounded-md shadow-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
              placeholder="Enter order number"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Purchase Date
            </label>
            <input
              type="date"
              value={invoice.purchase_date || ''}
              onChange={(e) => onChange('purchase_date', e.target.value)}
              onPaste={handleDatePaste}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border-0 rounded-md shadow-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              File Name
            </label>
            <input
              type="text"
              value={invoice.file_name || ''}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border-0 rounded-md shadow-sm text-gray-500 dark:text-gray-400"
              disabled
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              File will be renamed automatically based on merchant and order number
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Grand Total
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-3 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border-0 border-r-0 rounded-l-md">
                $
              </span>
              <input
                type="number"
                step="0.01"
                value={invoice.grand_total || ''}
                onChange={(e) => onChange('grand_total', parseFloat(e.target.value))}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border-0 rounded-r-md shadow-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                placeholder="0.00"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              value={invoice.status || 'Open'}
              onChange={(e) => onChange('status', e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border-0 rounded-md shadow-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Payment Method
            </label>
            <input
              type="text"
              value={invoice.payment_method || ''}
              onChange={(e) => onChange('payment_method', e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border-0 rounded-md shadow-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
              placeholder="Enter payment method"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes
            </label>
            <textarea
              rows={3}
              value={invoice.notes || ''}
              onChange={(e) => onChange('notes', e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border-0 rounded-md shadow-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
              placeholder="Enter notes"
            />
          </div>
        </div>
      </div>
    </div>
  );
};