// src/components/invoice/detail/InvoicePaymentPanel.tsx
import React, { useState } from 'react';
import Button from '../../../components/common/Button';
import { formatCurrency } from '../../../services/formatters/currencyFormatter';
import { formatDate } from '../../../services/formatters/dateFormatter';

interface Payment {
  payment_id: number;
  transaction_id: string;
  card_number_id: number;
  amount: number;
  payment_date: string;
  last_four?: string;
  status: string;
}

interface InvoicePaymentPanelProps {
  invoiceId: number;
  grandTotal: number;
  payments: Payment[];
  onAddPayment: (cardNumberId: string, amount: number, transactionId: string) => Promise<void>;
}

export const InvoicePaymentPanel: React.FC<InvoicePaymentPanelProps> = ({
  invoiceId,
  grandTotal,
  payments,
  onAddPayment
}) => {
  const [showPaymentForm, setShowPaymentForm] = useState<boolean>(false);
  const [cardNumberId, setCardNumberId] = useState<string>('');
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [transactionId, setTransactionId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  // Calculate total paid
  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
  // Calculate balance
  const balance = grandTotal - totalPaid;
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cardNumberId) {
      alert('Please enter a card number ID');
      return;
    }
    
    if (!transactionId) {
      alert('Please enter a transaction ID');
      return;
    }
    
    const amount = paymentAmount ? parseFloat(paymentAmount) : grandTotal;
    
    try {
      setIsSubmitting(true);
      await onAddPayment(cardNumberId, amount, transactionId);
      
      // Reset form
      setCardNumberId('');
      setPaymentAmount('');
      setTransactionId('');
      setShowPaymentForm(false);
      setIsSubmitting(false);
    } catch (error) {
      console.error('Error adding payment:', error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-dark-card rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Payment Information</h3>
        <Button
          variant={showPaymentForm ? 'secondary' : 'primary'}
          onClick={() => setShowPaymentForm(!showPaymentForm)}
          size="sm"
        >
          {showPaymentForm ? 'Cancel' : 'Add Payment'}
        </Button>
      </div>
      
      {showPaymentForm && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg mb-6 p-6">
          <h4 className="text-base font-medium text-gray-900 dark:text-white mb-4">Add New Payment</h4>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Card Number ID
                </label>
                <input
                  type="text"
                  value={cardNumberId}
                  onChange={(e) => setCardNumberId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:outline-none"
                  placeholder="Card ID"
                  required
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Enter the ID of the card to use
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Amount (Optional)
                </label>
                <div className="relative rounded-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 dark:text-gray-400 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max={grandTotal}
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="w-full pl-7 pr-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:outline-none"
                    placeholder={grandTotal.toString()}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Leave empty to pay the full amount
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Transaction ID
                </label>
                <input
                  type="text"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:outline-none"
                  placeholder="Transaction ID"
                  required
                />
              </div>
              
              <div className="md:col-span-3 flex justify-end mt-2">
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isSubmitting}
                  disabled={isSubmitting}
                >
                  Submit Payment
                </Button>
              </div>
            </div>
          </form>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 text-center">
          <h5 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Due</h5>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(grandTotal)}</p>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 text-center">
          <h5 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Amount Paid</h5>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(totalPaid)}</p>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 text-center">
          <h5 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Balance</h5>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{formatCurrency(balance)}</p>
        </div>
      </div>
      
      <h4 className="text-base font-medium text-gray-900 dark:text-white mb-3">Payment History</h4>
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Transaction ID
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Card
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Amount
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {payments.length > 0 ? (
              payments.map((payment) => (
                <tr key={payment.payment_id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {formatDate(payment.payment_date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {payment.transaction_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {payment.last_four ? `**** ${payment.last_four}` : `Card ID: ${payment.card_number_id}`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                    {formatCurrency(payment.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      payment.status === 'Completed' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}>
                      {payment.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto mb-2 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  <p className="mt-2">No payment history available yet</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};