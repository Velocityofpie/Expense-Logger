// src/features/expense/ExpenseTable.tsx
import React, { useState, useEffect } from 'react';
import { formatCurrency } from './expenseHelpers';

interface Product {
  name: string;
  quantity: number;
  unitPrice: number;
}

interface Expense {
  id: number;
  merchant: string;
  date: string;
  orderNumber: string;
  cardUsed: string;
  products: Product[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  category: string;
}

interface ExpenseTableProps {
  expenses?: Expense[];
  categoryTitle?: string;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}

const ExpenseTable: React.FC<ExpenseTableProps> = ({ 
  expenses = [], 
  categoryTitle = "Accessories",
  onEdit, 
  onDelete
}) => {
  // Calculate category total
  const categoryTotal = expenses.reduce((sum, expense) => sum + expense.total, 0);
  
  // Handle edit action
  const handleEdit = (id: number) => {
    if (onEdit) {
      onEdit(id);
    } else {
      console.log(`Edit expense with ID: ${id}`);
    }
  };
  
  // Handle delete action
  const handleDelete = (id: number) => {
    if (onDelete) {
      onDelete(id);
    }
  };

  // Initialize expandedExpenses with all expenses expanded by default
  const [expandedExpenses, setExpandedExpenses] = useState<Record<number, boolean>>({});
  
  // Initialize expandedExpenses based on whether products exist for each expense
  useEffect(() => {
    const initialExpanded: Record<number, boolean> = {};
    expenses.forEach(expense => {
      // Only expand expenses that have products
      initialExpanded[expense.id] = expense.products && expense.products.length > 0;
    });
    setExpandedExpenses(initialExpanded);
  }, [expenses]);
  
  const toggleExpenseDetails = (id: number) => {
    setExpandedExpenses(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className="max-w-[100rem] mx-auto px-4 sm:px-6 lg:px-8 py-6 bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        {/* Only show the header when the category is "All" */}
        {categoryTitle === 'All' && (
          <h2 className="text-xl md:text-2xl font-bold p-6 text-gray-800 dark:text-white border-b pb-4 border-gray-200 dark:border-gray-700">
            Expense Tracker
          </h2>
        )}
        
        {/* Category Section */}
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200">
              {categoryTitle} ({formatCurrency(categoryTotal)})
            </h3>
          </div>
        </div>
        
        {/* Expense List */}
        <div className="px-4 pb-6 space-y-4">
          {expenses.map((expense) => (
            <div 
              key={expense.id} 
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden transition-all hover:shadow-lg"
            >
              {/* Main transaction info - Always visible */}
              <div 
                className="grid grid-cols-12 gap-2 px-4 py-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 cursor-pointer"
                onClick={() => toggleExpenseDetails(expense.id)}
              >
                <div className="col-span-12 sm:col-span-3">
                  <div className="text-xs text-gray-500 dark:text-gray-400">Merchant</div>
                  <div className="font-medium text-gray-900 dark:text-white truncate">{expense.merchant}</div>
                </div>
                <div className="col-span-6 sm:col-span-2">
                  <div className="text-xs text-gray-500 dark:text-gray-400">Date</div>
                  <div className="font-medium text-gray-900 dark:text-white">{expense.date}</div>
                </div>
                <div className="col-span-6 sm:col-span-2">
                  <div className="text-xs text-gray-500 dark:text-gray-400">Order #</div>
                  <div className="font-medium text-gray-900 dark:text-white truncate">{expense.orderNumber}</div>
                </div>
                <div className="col-span-8 sm:col-span-2">
                  <div className="text-xs text-gray-500 dark:text-gray-400">Card Used</div>
                  <div className="font-medium text-gray-900 dark:text-white truncate">{expense.cardUsed}</div>
                </div>
                <div className="col-span-3 sm:col-span-2 text-right">
                  <div className="text-xs text-gray-500 dark:text-gray-400">Total</div>
                  <div className="font-medium text-gray-900 dark:text-white">{formatCurrency(expense.total)}</div>
                </div>
                <div className="col-span-1 sm:col-span-1 flex items-center justify-end">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(expense.id);
                    }}
                    className="text-blue-600 hover:text-blue-800"
                    title="Edit"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Expense details - Visible when expanded */}
              {expandedExpenses[expense.id] && (
                <div className="p-4">
                  {/* Products section */}
                  <div className="mb-4">
                    <div className="flex items-center mb-3">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 mr-2 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                        <span className="text-base font-semibold text-gray-700 dark:text-gray-300 leading-none">Products</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {expense.products.map((product, index) => (
                        <div 
                          key={index} 
                          className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg flex justify-between items-center transition-colors hover:bg-gray-200 dark:hover:bg-gray-600"
                        >
                          <div>
                            <div className="font-medium text-gray-800 dark:text-gray-200 mb-1">
                              <span className="mr-2 text-blue-600 dark:text-blue-400">•</span>
                              {product.name}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 space-x-2">
                              <span>Qty: {product.quantity}</span>
                              <span>|</span>
                              <span>Unit Price: {formatCurrency(product.unitPrice)}</span>
                            </div>
                          </div>
                          <div className="font-semibold text-gray-800 dark:text-gray-200">
                            {formatCurrency(product.quantity * product.unitPrice)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Products and Financial Summary in a flex layout */}
                  <div className="flex flex-col sm:flex-row justify-between mt-2">
                    {/* Products section takes more space */}
                    <div className="sm:w-3/4">
                      {/* This div intentionally left empty - products are already displayed above */}
                    </div>
                    
                    {/* Financial details on the right - more compact */}
                    <div className="mt-2 sm:mt-0 sm:w-1/4 sm:pl-2">
                      <div className="w-full">
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                            <span className="text-gray-800 dark:text-gray-200">{formatCurrency(expense.subtotal)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Shipping:</span>
                            <span className="text-gray-800 dark:text-gray-200">{formatCurrency(expense.shipping)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Tax:</span>
                            <span className="text-gray-800 dark:text-gray-200">{formatCurrency(expense.tax)}</span>
                          </div>
                          <div className="flex justify-between pt-1 mt-1 border-t border-gray-200 dark:border-gray-700">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total:</span>
                            <span className="text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(expense.total)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Category total */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <div className="text-lg font-medium text-gray-700 dark:text-gray-300">Total for {categoryTitle}:</div>
            <div className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(categoryTotal)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseTable;