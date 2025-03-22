// frontend/src/pages/ExpenseTrackerPage.js
import React, { useState, useEffect } from 'react';
import ExpenseTracker from '../components/ExpenseTracker';
import { fetchInvoices, fetchCategories } from '../api';
import { transformInvoicesToExpenseTrackerFormat } from '../utils/dataTransformers';

export default function ExpenseTrackerPage() {
  const [expenseData, setExpenseData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        
        // Fetch invoices and categories
        const [invoicesData, categoriesData] = await Promise.all([
          fetchInvoices(),
          fetchCategories()
        ]);
        
        // Transform data to format expected by ExpenseTracker
        const transformedData = transformInvoicesToExpenseTrackerFormat(invoicesData);
        
        setExpenseData(transformedData);
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading expense data:", error);
        setError("Failed to load expense data. Please try again.");
        setIsLoading(false);
      }
    }
    
    loadData();
  }, []);
  
  if (isLoading) {
    return <div>Loading expense tracker...</div>;
  }
  
  if (error) {
    return <div>Error: {error}</div>;
  }
  
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold mb-6">Expense Tracker</h1>
      <ExpenseTracker initialData={expenseData} />
    </div>
  );
}