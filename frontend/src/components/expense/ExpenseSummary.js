// frontend/src/components/expense/ExpenseSummary.js
import React from 'react';
import { formatCurrency } from '../../utils/expenseHelpers';

const ExpenseSummary = ({ filteredTotal, purchaseCount, tabPercentage, filteredData }) => {
  // Calculate stats
  const averagePurchase = purchaseCount > 0 ? filteredTotal / purchaseCount : 0;
    
  const highestExpense = purchaseCount > 0 
    ? Math.max(...filteredData.map(item => item.total))
    : 0;
    
  const lowestExpense = purchaseCount > 0 
    ? Math.min(...filteredData.map(item => item.total))
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-medium text-gray-500">Total Expenses</h3>
        <p className="text-3xl font-bold text-gray-900 mt-2">
          {formatCurrency(filteredTotal)}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          All selected expenses
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-medium text-gray-500">Number of Purchases</h3>
        <p className="text-3xl font-bold text-gray-900 mt-2">
          {purchaseCount}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          {Math.round(tabPercentage)}% of total spending
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-medium text-gray-500">Average Purchase</h3>
        <p className="text-3xl font-bold text-gray-900 mt-2">
          {formatCurrency(averagePurchase)}
        </p>
        <div className="flex justify-between text-sm text-gray-500 mt-1">
          <span>Low: {formatCurrency(lowestExpense)}</span>
          <span>High: {formatCurrency(highestExpense)}</span>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-medium text-gray-500">Top Category</h3>
        <p className="text-3xl font-bold text-gray-900 mt-2">
          {filteredData.length > 0 
            ? [...filteredData].sort((a, b) => b.total - a.total)[0].category
            : 'None'}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          {filteredData.length > 0 
            ? `${purchaseCount} purchases`
            : 'No data'}
        </p>
      </div>
    </div>
  );
};

export default ExpenseSummary;