// src/features/invoices/invoiceDetail/components/InvoiceSummary.tsx
import React from 'react';
import { Invoice } from '../../invoices/types';
import { formatCurrency } from '../utils/invoiceCalculations';

interface InvoiceSummaryProps {
  invoice: Invoice;
  paidAmount: number;
}

const InvoiceSummary: React.FC<InvoiceSummaryProps> = ({ 
  invoice, 
  paidAmount 
}) => {
  // Calculate balance
  const balance = (invoice.grand_total || 0) - paidAmount;
  
  // Determine balance color: red if positive, green if zero or negative (overpaid)
  const balanceColorClass = balance > 0 ? 'text-red-500' : 'text-green-500';

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <h6 className="text-sm text-gray-500 mb-1">Total Due</h6>
        <p className="text-3xl font-bold">{formatCurrency(invoice.grand_total)}</p>
      </div>
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <h6 className="text-sm text-gray-500 mb-1">Amount Paid</h6>
        <p className="text-3xl font-bold text-green-500">{formatCurrency(paidAmount)}</p>
      </div>
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <h6 className="text-sm text-gray-500 mb-1">Balance</h6>
        <p className={`text-3xl font-bold ${balanceColorClass}`}>{formatCurrency(balance)}</p>
      </div>
    </div>
  );
};

export default InvoiceSummary;