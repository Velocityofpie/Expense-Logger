// src/features/invoices/invoiceDetail/components/InvoiceActions.tsx
import React from 'react';
import { Button } from '../../../shared';

interface InvoiceActionsProps {
  onSave: () => Promise<boolean | undefined>;
  onDelete: () => void;
  onPrev: (allInvoices: any[], currentIndex: number) => void;
  onNext: (allInvoices: any[], currentIndex: number) => void;
  canGoPrev: boolean;
  canGoNext: boolean;
  isSaving: boolean;
}

const InvoiceActions: React.FC<InvoiceActionsProps> = ({
  onSave,
  onDelete,
  onPrev,
  onNext,
  canGoPrev,
  canGoNext,
  isSaving
}) => {
  return (
    <div className="flex justify-end items-center mb-6">
      <div className="flex space-x-2">
        <Button
          variant="outline"
          disabled={!canGoPrev}
          onClick={() => onPrev([], 0)}
          className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          }
        >
          Previous
        </Button>
        
        <Button
          variant="outline"
          disabled={!canGoNext}
          onClick={() => onNext([], 0)}
          className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          }
        >
          Next
        </Button>
        
        <Button
          variant="outline"
          onClick={onDelete}
          className="text-red-600 hover:text-white hover:bg-red-600 border-red-300 hover:border-red-600 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900 dark:hover:text-white"
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M10 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          }
        >
          Delete
        </Button>
        
        <Button
          variant="primary"
          onClick={onSave}
          isLoading={isSaving}
          loadingText="Saving..."
          className="dark:bg-blue-600 dark:hover:bg-blue-700"
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16L21 8V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M17 21V13H7V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7 3V8H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          }
        >
          Save
        </Button>
      </div>
    </div>
  );
};

export default InvoiceActions;