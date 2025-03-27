// ExpenseStats.tsx
// Statistics component for expense tracker
import React from 'react';
import { ExpenseItem, getTopCategories, getTopStores, getTopPaymentMethods } from './expenseHelpers';

interface ExpenseStatsProps {
  filteredData: ExpenseItem[];
  formatCurrency: (value: number) => string;
}

const ExpenseStats: React.FC<ExpenseStatsProps> = ({ filteredData, formatCurrency }) => {
  // Get top spending categories
  const topCategories = getTopCategories(filteredData, 3);
  
  // Get top merchants/stores
  const topStores = getTopStores(filteredData, 3);
  
  // Get top payment methods/cards
  const topPaymentMethods = getTopPaymentMethods(filteredData, 3);
  
  return (
    <div className="mt-8 bg-white dark:bg-dark-card rounded-lg shadow p-4">
      <h3 className="text-lg font-medium mb-2">Spending Summary</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* By Category */}
        <div>
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">By Item Type</h4>
          <ul className="mt-2 space-y-2">
            {topCategories.length > 0 ? (
              topCategories.map((item, i) => (
                <li key={i} className="flex justify-between">
                  <span className="text-gray-700 dark:text-gray-300">{item.name}</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatCurrency(item.total)}
                  </span>
                </li>
              ))
            ) : (
              <li className="text-gray-500 dark:text-gray-400">No data available</li>
            )}
          </ul>
        </div>
        
        {/* By Merchant */}
        <div>
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">By Merchant</h4>
          <ul className="mt-2 space-y-2">
            {topStores.length > 0 ? (
              topStores.map((item, i) => (
                <li key={i} className="flex justify-between">
                  <span className="text-gray-700 dark:text-gray-300">{item.name}</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatCurrency(item.total)}
                  </span>
                </li>
              ))
            ) : (
              <li className="text-gray-500 dark:text-gray-400">No data available</li>
            )}
          </ul>
        </div>
        
        {/* By Credit Card */}
        <div>
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">By Credit Card</h4>
          <ul className="mt-2 space-y-2">
            {topPaymentMethods.length > 0 ? (
              topPaymentMethods.map((item, i) => (
                <li key={i} className="flex justify-between">
                  <span className="text-gray-700 dark:text-gray-300">
                    {/* Display simplified card name if too long */}
                    {item.name.length > 20 
                      ? item.name.split(" ").slice(0, 2).join(" ") + "..."
                      : item.name}
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatCurrency(item.total)}
                  </span>
                </li>
              ))
            ) : (
              <li className="text-gray-500 dark:text-gray-400">No data available</li>
            )}
          </ul>
        </div>
      </div>
      
      {/* Trends and Insights Section */}
      {filteredData.length > 5 && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Trends & Insights
          </h4>
          <div className="text-sm text-gray-600 dark:text-gray-300">
            {(() => {
              // Generate some insights based on the data
              const totalSpent = filteredData.reduce((sum, item) => sum + item.total, 0);
              const avgPurchase = totalSpent / filteredData.length;
              const largestPurchase = Math.max(...filteredData.map(item => item.total));
              const recentPurchases = filteredData
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 3);
              
              return (
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    Average purchase amount is {formatCurrency(avgPurchase)}
                  </li>
                  <li>
                    Largest single purchase was {formatCurrency(largestPurchase)}
                  </li>
                  <li>
                    Most recent purchase was from {recentPurchases[0]?.store || "unknown"} 
                    {recentPurchases[0]?.date ? ` on ${recentPurchases[0].date}` : ""}
                  </li>
                  {topCategories.length > 0 && (
                    <li>
                      {topCategories[0].name} is your top spending category at {
                        Math.round((topCategories[0].total / totalSpent) * 100)
                      }% of total expenses
                    </li>
                  )}
                </ul>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseStats;