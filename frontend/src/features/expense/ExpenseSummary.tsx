// ExpenseSummary.tsx
// Summary component for expense tracker
import React from 'react';
import { ExpenseItem, formatCurrency } from './expenseHelpers';

interface ExpenseSummaryProps {
  filteredTotal: number;
  purchaseCount: number;
  tabPercentage: number;
  filteredData: ExpenseItem[];
}

const ExpenseSummary: React.FC<ExpenseSummaryProps> = ({
  filteredTotal,
  purchaseCount,
  tabPercentage,
  filteredData
}) => {
  // Calculate statistics
  const averagePurchase = purchaseCount > 0 ? filteredTotal / purchaseCount : 0;
    
  const highestExpense = purchaseCount > 0 
    ? Math.max(...filteredData.map(item => item.total))
    : 0;
    
  const lowestExpense = purchaseCount > 0 
    ? Math.min(...filteredData.map(item => item.total))
    : 0;

  // Find top category
  const getCategoryWithMostPurchases = (): { name: string, count: number } => {
    if (filteredData.length === 0) {
      return { name: 'None', count: 0 };
    }
    
    const categoryCounts: Record<string, number> = {};
    
    filteredData.forEach(item => {
      const category = item.category || 'Uncategorized';
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });
    
    let topCategory = '';
    let maxCount = 0;
    
    Object.entries(categoryCounts).forEach(([category, count]) => {
      if (count > maxCount) {
        topCategory = category;
        maxCount = count;
      }
    });
    
    return { name: topCategory, count: maxCount };
  };
  
  const topCategory = getCategoryWithMostPurchases();

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {/* Total Expenses */}
      <div className="bg-white dark:bg-dark-card rounded-lg shadow p-4">
        <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">Total Expenses</h3>
        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
          {formatCurrency(filteredTotal)}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          All selected expenses
        </p>
      </div>
      
      {/* Number of Purchases */}
      <div className="bg-white dark:bg-dark-card rounded-lg shadow p-4">
        <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">Number of Purchases</h3>
        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
          {purchaseCount}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {Math.round(tabPercentage)}% of total spending
        </p>
      </div>
      
      {/* Average Purchase */}
      <div className="bg-white dark:bg-dark-card rounded-lg shadow p-4">
        <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">Average Purchase</h3>
        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
          {formatCurrency(averagePurchase)}
        </p>
        <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-1">
          <span>Low: {formatCurrency(lowestExpense)}</span>
          <span>High: {formatCurrency(highestExpense)}</span>
        </div>
      </div>
      
      {/* Top Category */}
      <div className="bg-white dark:bg-dark-card rounded-lg shadow p-4">
        <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">Top Category</h3>
        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
          {topCategory.name}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {topCategory.count} {topCategory.count === 1 ? 'purchase' : 'purchases'}
        </p>
      </div>
    </div>
  );
};

export default ExpenseSummary;