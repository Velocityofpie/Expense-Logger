// ExpenseGroups.tsx
// Component for displaying grouped expenses
import React from 'react';
import { ExpenseGroup, SortConfig } from './expenseHelpers';

interface ExpenseGroupsProps {
  groupedData: ExpenseGroup[];
  handleSort: (key: string) => void;
  sortConfig: SortConfig;
  formatCurrency: (value: number) => string;
  onDeleteItem: (id: number) => void;
}

const ExpenseGroups: React.FC<ExpenseGroupsProps> = ({
  groupedData,
  handleSort,
  sortConfig,
  formatCurrency,
  onDeleteItem
}) => {
  // Calculate total across all groups for percentage calculation
  const totalAllGroups = groupedData.reduce((sum, group) => sum + group.total, 0);

  return (
    <div className="space-y-6">
      {groupedData.map((group, index) => (
        <div key={index} className="bg-white rounded-lg shadow overflow-hidden">
          {/* Group Header */}
          <div className="flex justify-between items-center bg-gray-50 p-4 border-b">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{group.name}</h2>
              <p className="text-sm text-gray-500">
                {group.count} {group.count === 1 ? 'purchase' : 'purchases'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(group.total)}
              </p>
              <p className="text-sm text-gray-500">
                {totalAllGroups > 0 
                  ? `${Math.round((group.total / totalAllGroups) * 100)}% of total`
                  : '0% of total'}
              </p>
            </div>
          </div>
          
          {/* Progress bar visualization */}
          <div className="px-4 py-2 bg-gray-50 border-b">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ 
                  width: totalAllGroups > 0 
                    ? `${Math.round((group.total / totalAllGroups) * 100)}%` 
                    : '0%' 
                }}
              ></div>
            </div>
          </div>
          
          {/* Expense Items Table */}
          <div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button 
                      onClick={() => handleSort('store')}
                      className="flex items-center hover:text-gray-700"
                    >
                      Merchant
                      {sortConfig.key === 'store' && (
                        <svg 
                          className="w-4 h-4 ml-1" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24" 
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          {sortConfig.direction === 'asc' ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          )}
                        </svg>
                      )}
                    </button>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button 
                      onClick={() => handleSort('date')}
                      className="flex items-center hover:text-gray-700"
                    >
                      Date
                      {sortConfig.key === 'date' && (
                        <svg 
                          className="w-4 h-4 ml-1" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24" 
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          {sortConfig.direction === 'asc' ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          )}
                        </svg>
                      )}
                    </button>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order #
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Card Used
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Products
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button 
                      onClick={() => handleSort('total')}
                      className="flex items-center justify-end w-full hover:text-gray-700"
                    >
                      Total
                      {sortConfig.key === 'total' && (
                        <svg 
                          className="w-4 h-4 ml-1" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24" 
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          {sortConfig.direction === 'asc' ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          )}
                        </svg>
                      )}
                    </button>
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {group.items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.store}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.orderNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.creditCard}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <ul className="list-disc pl-5">
                        {item.products.map((product, prodIdx) => (
                          <li key={prodIdx} className={product.quantity < 0 ? "text-red-500" : ""}>
                            {product.name} 
                            {product.quantity !== 1 && ` (×${product.quantity})`}
                            <span className="ml-1 font-medium">
                              {formatCurrency(product.price)}
                            </span>
                            {product.quantity < 0 && " (Return)"}
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                      <span className={item.total < 0 ? "text-red-600" : "text-gray-900"}>
                        {formatCurrency(item.total)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      <button
                        onClick={() => onDeleteItem(item.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={5} className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                    Total for {group.name}
                  </td>
                  <td className="px-6 py-3 text-right text-sm font-bold text-gray-900">
                    {formatCurrency(group.total)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      ))}

      {/* Empty state */}
      {groupedData.length === 0 && (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <h3 className="mt-2 text-xl font-medium text-gray-900">No data found</h3>
          <p className="mt-1 text-gray-500">
            No expenses match your current filter criteria.
          </p>
        </div>
      )}
    </div>
  );
};

export default ExpenseGroups;