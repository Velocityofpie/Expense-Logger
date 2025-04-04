import React from 'react';
import { useNavigate } from 'react-router-dom';
import ExpenseTable from './ExpenseTable';
import { ExpenseGroup } from './expenseHelpers';
import { deleteExpense } from './expensesApi';

interface ExpenseTrackerIntegrationProps {
  groupedData: ExpenseGroup[];
  onDataChange?: () => void;
}

// This is a wrapper component that adapts the grouped data from your existing
// ExpenseTrackerPage to the new EnhancedExpenseTable format
const ExpenseTrackerIntegration: React.FC<ExpenseTrackerIntegrationProps> = ({ 
  groupedData,
  onDataChange
}) => {
  const navigate = useNavigate();

  // Transform expense data for the EnhancedExpenseTable format
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

  // Handle edit action - navigate to invoice detail page
  const handleEditExpense = (id: number) => {
    navigate(`/invoice/${id}`);
  };

  // Handle delete action - call the API and notify parent on success
  const handleDeleteExpense = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await deleteExpense(id);
        if (onDataChange) {
          onDataChange(); // Trigger data reload in parent component
        }
      } catch (err) {
        console.error('Error deleting expense:', err);
        alert('Failed to delete expense. Please try again.');
      }
    }
  };

  return (
    <div className="space-y-6">
      {groupedData.map((group, index) => (
        <ExpenseTable
          key={index}
          expenses={transformExpenseDataForTable(group)}
          categoryTitle={group.name}
          onEdit={handleEditExpense}
          onDelete={handleDeleteExpense}
        />
      ))}
      
      {groupedData.length === 0 && (
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
    </div>
  );
};

export default ExpenseTrackerIntegration;