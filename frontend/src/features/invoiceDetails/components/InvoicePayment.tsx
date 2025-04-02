// src/features/invoices/invoiceDetail/components/InvoicePayment.tsx
import React, { useState } from 'react';
import { Invoice } from '../../invoices/types';

interface InvoicePaymentProps {
  invoice: Invoice;
  showPaymentForm: boolean;
  setShowPaymentForm: (show: boolean) => void;
  onAddPayment: (cardNumberId: string, amount: string, transactionId: string) => Promise<boolean | undefined>;
}

const InvoicePayment: React.FC<InvoicePaymentProps> = ({
  invoice,
  showPaymentForm,
  setShowPaymentForm,
  onAddPayment
}) => {
  // State for payment form
  const [paymentAmount, setPaymentAmount] = useState('');
  const [cardNumberId, setCardNumberId] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Format currency
  const formatCurrency = (value?: number): string => {
    if (value === undefined || value === null) return "$0.00";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  // Handle payment form submission
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cardNumberId) {
      alert("Please enter a card number ID.");
      return;
    }
    
    if (!transactionId) {
      alert("Please enter a transaction ID.");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await onAddPayment(cardNumberId, paymentAmount, transactionId);
      
      // Reset form
      setCardNumberId('');
      setTransactionId('');
      setPaymentAmount('');
      setShowPaymentForm(false);
      
    } catch (error) {
      console.error("Error adding payment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium dark:text-white">Payment Information</h3>
          <button 
            className={`flex items-center px-3 py-2 text-sm rounded-md ${
              showPaymentForm 
                ? "bg-gray-500 text-white hover:bg-gray-600 dark:bg-gray-700" 
                : "bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
            }`}
            onClick={() => setShowPaymentForm(!showPaymentForm)}
          >
            {showPaymentForm ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Payment
              </>
            )}
          </button>
        </div>

        {showPaymentForm && (
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg mb-6 p-6">
            <h5 className="text-lg font-medium mb-4 dark:text-white">Add New Payment</h5>
            <form onSubmit={handlePaymentSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Card Number ID</label>
                  <input
                    type="number"
                    value={cardNumberId}
                    onChange={(e) => setCardNumberId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                    placeholder="Card ID"
                    required
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Enter the ID of the card to use
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Transaction ID</label>
                  <input
                    type="text"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                    placeholder="Transaction ID"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Amount (Optional)</label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 dark:text-gray-400 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      className="w-full px-3 py-2 pl-7 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                      placeholder={invoice.grand_total ? invoice.grand_total.toString() : '0.00'}
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Leave blank to use full invoice amount
                  </p>
                </div>
                <div className="md:col-span-3 flex justify-end">
                  <button 
                    type="submit" 
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Submit Payment
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 text-center">
            <h6 className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Due</h6>
            <p className="text-3xl font-bold dark:text-white">{formatCurrency(invoice.grand_total || 0)}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 text-center">
            <h6 className="text-sm text-gray-500 dark:text-gray-400 mb-1">Amount Paid</h6>
            <p className="text-3xl font-bold text-green-500 dark:text-green-400">$0.00</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 text-center">
            <h6 className="text-sm text-gray-500 dark:text-gray-400 mb-1">Balance</h6>
            <p className="text-3xl font-bold text-red-500 dark:text-red-400">{formatCurrency(invoice.grand_total || 0)}</p>
          </div>
        </div>

        <h6 className="font-medium mb-3 dark:text-white">Payment History</h6>
        <div className="overflow-x-auto border rounded-lg dark:border-gray-700">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Transaction ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Card
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Amount
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto mb-2 text-gray-400 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  <p className="mt-2 dark:text-gray-400">No payment history available yet</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InvoicePayment;