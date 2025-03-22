// src/hooks/useInvoices.ts
import { useContext } from 'react';
import { InvoiceContext, InvoiceContextProps } from '../context/InvoiceContext';

export const useInvoices = (): InvoiceContextProps => {
  const context = useContext(InvoiceContext);
  
  if (context === undefined) {
    throw new Error('useInvoices must be used within an InvoiceProvider');
  }
  
  return context;
};

export default useInvoices;