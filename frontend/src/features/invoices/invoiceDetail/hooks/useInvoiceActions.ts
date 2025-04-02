// src/features/invoices/invoiceDetail/hooks/useInvoiceActions.ts
import { useState } from 'react';
import { NavigateFunction } from 'react-router-dom';
import { updateInvoice, deleteInvoice as apiDeleteInvoice, addPayment as apiAddPayment, deleteCategory as apiDeleteCategory } from '../../invoicesApi';
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
      
      // Convert null values to undefined for type compatibility
      const updatedInvoice = {
        file_name: newFileName,
        merchant_name: invoice.merchant_name,
        order_number: invoice.order_number,
        purchase_date: invoice.purchase_date,
        payment_method: invoice.payment_method,
        grand_total: parseFloat(String(invoice.grand_total)),
        status: invoice.status,
        notes: invoice.notes,
        shipping_handling: invoice.shipping_handling ? parseFloat(String(invoice.shipping_handling)) : undefined,
        estimated_tax: invoice.estimated_tax ? parseFloat(String(invoice.estimated_tax)) : undefined,
        total_before_tax: invoice.total_before_tax ? parseFloat(String(invoice.total_before_tax)) : undefined,
        billing_address: invoice.billing_address,
        credit_card_transactions: invoice.credit_card_transactions ? parseFloat(String(invoice.credit_card_transactions)) : undefined,
        gift_card_amount: invoice.gift_card_amount ? parseFloat(String(invoice.gift_card_amount)) : undefined,
        refunded_amount: invoice.refunded_amount ? parseFloat(String(invoice.refunded_amount)) : undefined,
        items: items,
        tags: tags,
        categories: categories
      };

      const updatedData = await updateInvoice(invoice.invoice_id, updatedInvoice);
      
      // Set success message
      if (window.dispatchEvent) {
        // Dispatch a custom event to signal data refresh
        window.dispatchEvent(new CustomEvent('invoice-updated', { 
          detail: { invoiceId: invoice.invoice_id } 
        }));
      }
      
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

  // Delete category
  const deleteCategory = async (categoryName: string) => {
    try {
      const result = await apiDeleteCategory(categoryName);
      
      // Dispatch an event to notify that a category was deleted
      if (window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('category-deleted', {
          detail: { categoryName }
        }));
      }
      
      return result;
    } catch (error) {
      console.error("Error deleting category:", error);
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
    deleteCategory,
    addPayment,
    goToPrevInvoice,
    goToNextInvoice,
    isSubmitting
  };
};