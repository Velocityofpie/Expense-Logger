// ExpenseTrackerPage.tsx
// Main container page for the expense tracking feature
import React, { useState, useEffect } from 'react';
import ExpenseTracker from './ExpenseTracker';
import { fetchCategories } from './expensesApi';
import { transformInvoicesToExpenseTrackerFormat } from '../../utils';
import { ExpenseGroup } from './expenseHelpers';
import fetchInvoices from '../../services/api';

const ExpenseTrackerPage: React.FC = () => {
  const [expenseData, setExpenseData] = useState<ExpenseGroup[] | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        
        // Fetch invoices and categories in parallel
        const [invoicesData, categoriesData] = await Promise.all([
          fetchInvoices(),
          fetchCategories()
        ]);
        
        // Transform invoice data to the format expected by ExpenseTracker
        const transformedData = transformInvoicesToExpenseTrackerFormat(invoicesData);
        
        setExpenseData(transformedData);
        setCategories(categoriesData);
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading expense data:", error);
        setError("Failed to load expense data. Please try again.");
        setIsLoading(false);
      }
    }
    
    loadData();
  }, []);
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading expense tracker...</p>
        </div>
      </div>
    );
  }
  
  // Show error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-400 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-red-700 dark:text-red-200">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">Expense Tracker</h1>
      <ExpenseTracker initialData={expenseData || []} categories={categories} />
    </div>
  );
};

export default ExpenseTrackerPage;