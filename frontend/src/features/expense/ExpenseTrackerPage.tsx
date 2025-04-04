// src/features/expense/ExpenseTrackerPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ExpenseTable from './ExpenseTable';
import { ExpenseGroup } from './expenseHelpers';
import { transformInvoicesToExpenseTrackerFormat } from '../../utils';
import { apiClient } from '../../services/api';
import ExpenseFilters from './ExpenseFilters';
import ExpenseSummary from './ExpenseSummary';
import ExpenseStats from './ExpenseStats';
import { fetchExpenseData, fetchCategories, deleteExpense } from './expensesApi';

// Utility function to convert Record<string, ExpenseItem[]> to ExpenseGroup[]
const convertToExpenseGroups = (
  groupedData: Record<string, any[]>
): ExpenseGroup[] => {
  return Object.entries(groupedData).map(([name, items]) => ({
    name,
    items,
    count: items.length,
    total: items.reduce((sum, item) => sum + item.total, 0)
  }));
};

const ExpenseTrackerPage: React.FC = () => {
  const navigate = useNavigate();
  const [expenseData, setExpenseData] = useState<ExpenseGroup[] | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter state
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [currentView, setCurrentView] = useState<string>('itemType');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Function to handle category tab change
  const handleCategoryTabChange = (category: string) => {
    setSelectedCategory(category);
    // This will trigger a reload of data via the useEffect below
  };
  
  // Transform expense data for the enhanced table component
  const transformExpenseDataForTable = (group: ExpenseGroup) => {
    return group.items.map(item => ({
      id: item.id,
      merchant: item.store,
      date: item.date,
      orderNumber: item.orderNumber,
      cardUsed: item.creditCard,
      products: item.products.map(p => ({
        name: p.name,
        quantity: p.quantity,
        unitPrice: p.price
      })),
      subtotal: item.products.reduce((sum, p) => sum + (p.price * p.quantity), 0),
      shipping: 0, // Add if available in your data model
      tax: 0, // Add if available in your data model
      total: item.total,
      category: item.category
    }));
  };

  // Function to load data from API
  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch invoices and categories in parallel
      const categoriesData = await fetchCategories();
      const invoicesData = await apiClient.get('/invoices/');
      
      // Transform invoice data to the format expected by ExpenseTracker
      const rawTransformedData = transformInvoicesToExpenseTrackerFormat(invoicesData);

      // Convert the Record<string, ExpenseItem[]> to ExpenseGroup[]
      const transformedData = convertToExpenseGroups(rawTransformedData);
      
      setExpenseData(transformedData);
      setCategories(['All', ...categoriesData]);
      setIsLoading(false);
    } catch (error) {
      console.error("Error loading expense data:", error);
      setError("Failed to load expense data. Please try again.");
      setIsLoading(false);
    }
  };
  
  // Load data on mount and when filters change
  useEffect(() => {
    loadData();
  }, [selectedCategory, dateFilter, currentView]);

  // Handle edit expense
  const handleEditExpense = (id: number) => {
    navigate(`/invoice/${id}`);
  };
  
  // Handle delete expense
  const handleDeleteExpense = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await deleteExpense(id);
        // Reload data after successful deletion
        loadData();
      } catch (err) {
        console.error('Error deleting expense:', err);
        setError('Failed to delete expense. Please try again.');
      }
    }
  };
  
  // Apply search filter
  useEffect(() => {
    if (searchTerm && expenseData) {
      // Filter the data based on search term
      const filteredGroups = expenseData.map(group => {
        const filteredItems = group.items.filter(item => 
          item.store.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.products.some(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        
        return {
          ...group,
          items: filteredItems,
          count: filteredItems.length,
          total: filteredItems.reduce((sum, item) => sum + item.total, 0)
        };
      }).filter(group => group.items.length > 0);
      
      setExpenseData(filteredGroups);
    } else {
      // If search is cleared, reload data
      loadData();
    }
  }, [searchTerm]);
  
  // Calculate summary statistics for filtered data
  const calculateSummaryStats = () => {
    if (!expenseData) return { 
      filteredTotal: 0, 
      purchaseCount: 0, 
      tabPercentage: 0, 
      filteredData: [] 
    };
    
    const allItems = expenseData.flatMap(group => group.items);
    const filteredItems = allItems;
    
    const filteredTotal = filteredItems.reduce((sum, item) => sum + item.total, 0);
    const totalAllData = allItems.reduce((sum, item) => sum + item.total, 0);
    const tabPercentage = totalAllData > 0 ? (filteredTotal / totalAllData) * 100 : 0;
    
    return {
      filteredTotal,
      purchaseCount: filteredItems.length,
      tabPercentage,
      filteredData: filteredItems
    };
  };
  
  // Get stats for display
  const summaryStats = calculateSummaryStats();
  
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
      
      {/* Main Category Tabs - ORIGINAL LOCATION AT THE TOP */}
      <div className="border-b mb-6 bg-white dark:bg-dark-card rounded-lg shadow">
        <div className="flex flex-wrap space-x-1 p-1 overflow-x-auto">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryTabChange(category)}
              className={`px-4 py-2 text-sm font-medium border-b-2 focus:outline-none whitespace-nowrap ${
                selectedCategory === category
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
      
      {/* Filters - after category tabs */}
      <ExpenseFilters 
        categories={categories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        currentView={currentView}
        setCurrentView={setCurrentView}
      />
      
      {/* Summary */}
      <ExpenseSummary 
        filteredTotal={summaryStats.filteredTotal}
        purchaseCount={summaryStats.purchaseCount}
        tabPercentage={summaryStats.tabPercentage}
        filteredData={summaryStats.filteredData}
      />
      
      {/* Enhanced Expense Tables by Category */}
      {expenseData && expenseData.length > 0 ? (
        <div className="space-y-8">
          {expenseData.map((group, index) => (
            <ExpenseTable
              key={index}
              expenses={transformExpenseDataForTable(group)}
              categoryTitle={group.name}
              onEdit={handleEditExpense}
              onDelete={handleDeleteExpense}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No expenses found</h3>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            Try adjusting your filters to see more results.
          </p>
        </div>
      )}
      
      {/* Statistics */}
      {expenseData && expenseData.length > 0 && (
        <ExpenseStats 
          filteredData={summaryStats.filteredData}
          formatCurrency={x => x.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
        />
      )}
    </div>
  );
};

export default ExpenseTrackerPage;