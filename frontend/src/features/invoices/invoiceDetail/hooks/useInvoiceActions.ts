// src/features/invoices/invoiceDetail/hooks/useInvoiceActions.ts
import { useState } from 'react';
import { NavigateFunction } from 'react-router-dom';
import { updateInvoice, deleteInvoice as apiDeleteInvoice, addPayment as apiAddPayment } from '../../invoicesApi';
import { Invoice, LineItem } from '../../types';
import { generateFileName } from '../utils/fileNameGenerator';

export const useInvoiceActions = (
  invoice: Invoice | null,
  items: LineItem[],
  tags: string[],
  categories: string[],
  navigate: NavigateFunction,
  id: string | undefined
) => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Update invoice
  const saveInvoice = async () => {
    if (!invoice || !id) return;
    
    try {
      setIsSubmitting(true);
      
      // Generate the new filename ONLY if both merchant_name and order_number exist
      let newFileName = invoice.file_name;
      if (invoice.merchant_name && invoice.order_number) {
        newFileName = generateFileName(
          invoice.merchant_name,
          invoice.order_number,
          invoice.file_name
        );
      }
      
      const updatedInvoice = {
        file_name: newFileName,
        merchant_name: invoice.merchant_name,
        order_number: invoice.order_number,
        purchase_date: invoice.purchase_date,
        payment_method: invoice.payment_method,
        grand_total: parseFloat(String(invoice.grand_total)),
        status: invoice.status,
        notes: invoice.notes,
        shipping_handling: invoice.shipping_handling ? parseFloat(String(invoice.shipping_handling)) : null,
        estimated_tax: invoice.estimated_tax ? parseFloat(String(invoice.estimated_tax)) : null,
        total_before_tax: invoice.total_before_tax ? parseFloat(String(invoice.total_before_tax)) : null,
        billing_address: invoice.billing_address,
        credit_card_transactions: invoice.credit_card_transactions ? parseFloat(String(invoice.credit_card_transactions)) : null,
        gift_card_amount: invoice.gift_card_amount ? parseFloat(String(invoice.gift_card_amount)) : null,
        refunded_amount: invoice.refunded_amount ? parseFloat(String(invoice.refunded_amount)) : null,
        items: items,
        tags: tags,
        categories: categories
      };

      await updateInvoice(invoice.invoice_id, updatedInvoice);
      
      setIsSubmitting(false);
      return true;
    } catch (error) {
      console.error("Error saving invoice:", error);
      setIsSubmitting(false);
      throw error;
    }
  };

  // Delete invoice
  const deleteInvoice = async () => {
    if (!invoice) return;
    
    try {
      await apiDeleteInvoice(invoice.invoice_id);
      navigate('/invoices');
      return true;
    } catch (error) {
      console.error("Error deleting invoice:", error);
      throw error;
    }
  };

  // Add payment
  const addPayment = async (cardNumberId: string, amount: string, transactionId: string) => {
    if (!invoice) return;
    
    try {
      await apiAddPayment(
        invoice.invoice_id,
        cardNumberId,
        amount || invoice.grand_total,
        transactionId
      );
      
      return true;
    } catch (error) {
      console.error("Error adding payment:", error);
      throw error;
    }
  };

  // Navigation functions
  const goToPrevInvoice = (allInvoices: Invoice[], currentIndex: number) => {
    if (currentIndex > 0) {
      navigate(`/invoice/${allInvoices[currentIndex - 1].invoice_id}`);
    }
  };

  const goToNextInvoice = (allInvoices: Invoice[], currentIndex: number) => {
    if (currentIndex < allInvoices.length - 1) {
      navigate(`/invoice/${allInvoices[currentIndex + 1].invoice_id}`);
    }
  };

  return {
    saveInvoice,
    deleteInvoice,
    addPayment,
    goToPrevInvoice,
    goToNextInvoice,
    isSubmitting
  };
};