// src/features/expense/ExpenseTracker.tsx - Updated
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ExpenseItem, 
  ExpenseGroup, 
  SortConfig, 
  formatCurrency, 
  filterDataByCategory, 
  filterDataByDate,
  filterDataBySearchTerm,
  sortExpenseItems
} from './expenseHelpers';
import { 
  fetchExpenseData, 
  fetchCategories 
} from './expensesApi';
import ExpenseFilters from './ExpenseFilters';
import ExpenseSummary from './ExpenseSummary';
import ExpenseGroups from './ExpenseGroups';
import ExpenseStats from './ExpenseStats';

interface ExpenseTrackerProps {
  initialData?: ExpenseGroup[];
  categories?: string[];
}

const ExpenseTracker: React.FC<ExpenseTrackerProps> = ({ initialData, categories = [] }) => {
  // State for active category tab - will be set from database
  const [activeMainTab, setActiveMainTab] = useState('All');
  
  // State for filters
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [dateFilter, setDateFilter] = useState('all');
  const [currentView, setCurrentView] = useState('itemType'); // 'itemType', 'store', 'date', 'card'
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'date',
    direction: 'desc'
  });
  
  // State for expense data
  const [groupedData, setGroupedData] = useState<ExpenseGroup[]>([]);
  const [filteredData, setFilteredData] = useState<ExpenseItem[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>(['All', 'Uncategorized']);
  
  // NEW STATE: For tracking expanded items - initially all are expanded
  const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>({});
  
  // Navigation hook for redirecting to edit page
  const navigate = useNavigate();

  // Credit card options - could also fetch these from the Cards model in the database
  const [creditCardOptions, setCreditCardOptions] = useState<string[]>([]);

  // Initialize on mount with API data if available
  useEffect(() => {
    // First load categories from backend
    loadCategories().then(() => {
      // Then load expense data with categories
      if (initialData && initialData.length > 0) {
        setGroupedData(initialData);
        applySearch(initialData);
        
        // NEW: Initialize expanded state for all items to be true (expanded)
        const newExpandedState: Record<number, boolean> = {};
        initialData.forEach(group => {
          group.items.forEach(item => {
            newExpandedState[item.id] = true; // Set to true to expand by default
          });
        });
        setExpandedItems(newExpandedState);
      } else {
        loadExpenseData();
      }
    });
  }, [initialData]);

  // Load categories and payment methods from API
  const loadCategories = async () => {
    try {
      // Fetch categories
      const fetchedCategories = await fetchCategories();
      
      // Make sure "All" is the first option and we always have "Uncategorized"
      const categoriesWithDefaults = ['All'];
      
      if (fetchedCategories && fetchedCategories.length > 0) {
        categoriesWithDefaults.push(...fetchedCategories);
        
        // Add Uncategorized only if it doesn't exist already
        if (!fetchedCategories.includes('Uncategorized')) {
          categoriesWithDefaults.push('Uncategorized');
        }
      } else {
        categoriesWithDefaults.push('Uncategorized');
      }
      
      setAvailableCategories(categoriesWithDefaults);
      
      // If no active category is set, use the first one
      if (activeMainTab === 'All' && categoriesWithDefaults.length > 0) {
        setActiveMainTab(categoriesWithDefaults[0]);
      }
    } catch (error) {
      console.error("Error loading categories:", error);
      // Default fallback for categories
      setAvailableCategories(['All', 'Uncategorized']);
    }
  };

  // Load expense data from API
  const loadExpenseData = async () => {
    try {
      setIsLoading(true);
      // Make sure we're using the correct parameter format
      const categoryParam = selectedCategory === 'All' ? '' : selectedCategory;
      console.log('Loading data with category:', categoryParam);
      const data = await fetchExpenseData(currentView, categoryParam, dateFilter);
      console.log('Received data:', data);
      setGroupedData(data);
      applySearch(data);
      
      // NEW: Initialize expanded state for all items to be true (expanded)
      const newExpandedState: Record<number, boolean> = {};
      data.forEach((group: ExpenseGroup) => {
        group.items.forEach((item: ExpenseItem) => {
          newExpandedState[item.id] = true; // Set to true to expand by default
        });
      });
      setExpandedItems(newExpandedState);
      
      setIsLoading(false);
    } catch (error) {
      console.error("Error loading expense data:", error);
      setIsLoading(false);
    }
  };

  // Effect to reload data when view or filters change
  useEffect(() => {
    loadExpenseData();
  }, [currentView, selectedCategory, dateFilter]);

  // MODIFIED: Effect to reload data when active main tab changes
  useEffect(() => {
    // When active main tab changes, update selectedCategory to match
    setSelectedCategory(activeMainTab);
  }, [activeMainTab]);

  // Apply search filter to grouped data
  const applySearch = (data: ExpenseGroup[]) => {
    if (!searchTerm) {
      setFilteredData(flattenGroupedData(data));
      return;
    }

    // Create a flattened array of all items from all groups
    const flatItems = flattenGroupedData(data);
    
    // Filter by search term
    const filtered = filterDataBySearchTerm(flatItems, searchTerm);
    
    setFilteredData(filtered);
  };

  // Flatten grouped data for filtering
  const flattenGroupedData = (groups: ExpenseGroup[]): ExpenseItem[] => {
    return groups.reduce((acc, group) => [...acc, ...group.items], [] as ExpenseItem[]);
  };

  // Effect to apply search when search term changes
  useEffect(() => {
    applySearch(groupedData);
  }, [searchTerm]);

  // Calculate stats for filtered data
  const calculateFilteredTotal = (): number => {
    return filteredData.reduce((sum, item) => sum + item.total, 0);
  };

  // Function to select a category tab
  const handleCategoryTabChange = (category: string) => {
    setActiveMainTab(category);
    // setSelectedCategory is now moved to the useEffect that watches activeMainTab
  };

  // Handler for sort button clicks
  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Handle edit item click
  const handleEditItem = (itemId: number) => {
    // Navigate to the invoice detail page
    navigate(`/invoice/${itemId}`);
  };
  
  // NEW: Toggle expense item expansion
  const toggleItemExpansion = (itemId: number) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  // Sort the grouped data based on the sort configuration
  const getSortedGroupedData = () => {
    // Sort items within each group
    return groupedData.map(group => {
      const sortedItems = sortExpenseItems(group.items, sortConfig);
      return { ...group, items: sortedItems };
    });
  };

  // Calculate the filtered total amount
  const filteredTotal = calculateFilteredTotal();
  
  // Calculate total across all data for percentage calculations
  const totalAllData = flattenGroupedData(groupedData).reduce((sum, item) => sum + item.total, 0);
  
  const tabPercentage = totalAllData > 0 ? (filteredTotal / totalAllData) * 100 : 0;

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-900 max-w-full overflow-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Expense Categories</h1>
      </div>
      
      {/* Main Category Tabs - generated from database categories */}
      <div className="border-b mb-6 bg-white dark:bg-dark-card rounded-lg shadow">
        <div className="flex flex-wrap space-x-1 p-1 overflow-x-auto">
          {availableCategories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryTabChange(category)}
              className={`px-4 py-2 text-sm font-medium border-b-2 focus:outline-none whitespace-nowrap ${
                activeMainTab === category
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
      
      {/* Filters */}
      <ExpenseFilters 
        categories={availableCategories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        currentView={currentView}
        setCurrentView={setCurrentView}
      />
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="flex justify-center items-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {!isLoading && (
        <>
          {/* Summary Stats */}
          <ExpenseSummary 
            filteredTotal={filteredTotal}
            purchaseCount={filteredData.length}
            tabPercentage={tabPercentage}
            filteredData={filteredData}
          />
          
          {/* Groups of expenses with edit button instead of delete */}
          <div className="space-y-6">
            {getSortedGroupedData().map((group, index) => (
              <div key={index} className="bg-white rounded-lg shadow overflow-hidden">
                {/* Group Header */}
                <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800 p-4 border-b">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{group.name}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {group.count} {group.count === 1 ? 'purchase' : 'purchases'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(group.total)}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {totalAllData > 0 
                        ? `${Math.round((group.total / totalAllData) * 100)}% of total`
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
                        width: totalAllData > 0 
                          ? `${Math.round((group.total / totalAllData) * 100)}%` 
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
                        <React.Fragment key={item.id}>
                          <tr 
                            className="hover:bg-gray-50 cursor-pointer"
                            onClick={() => toggleItemExpansion(item.id)}
                          >
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
                              {!expandedItems[item.id] && (
                                <span>{item.products.length} products</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                              <span className={item.total < 0 ? "text-red-600" : "text-gray-900"}>
                                {formatCurrency(item.total)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent row click from triggering
                                  handleEditItem(item.id);
                                }}
                                className="text-blue-600 hover:text-blue-900"
                                title="Edit"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                            </td>
                          </tr>
                          {/* Product Details - expanded by default, collapsed when clicked */}
                          {expandedItems[item.id] && (
                            <tr className="bg-gray-50">
                              <td colSpan={7} className="px-6 py-4">
                                <div className="flex flex-col md:flex-row justify-between">
                                  {/* Products List - Left side */}
                                  <div className="w-full md:w-2/3">
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
                                  </div>
                                  
                                  {/* Financial Summary - Right side */}
                                  <div className="mt-4 md:mt-0 md:ml-6">
                                    <div className="w-48 space-y-1">
                                      <div className="flex justify-between">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Subtotal:</span>
                                        <span className="text-sm text-gray-800 dark:text-gray-200">
                                          {formatCurrency(item.products.reduce((sum, p) => sum + (p.price * p.quantity), 0))}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Shipping:</span>
                                        <span className="text-sm text-gray-800 dark:text-gray-200">
                                          {formatCurrency(item.total * 0.05)} {/* Estimate as 5% */}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Tax:</span>
                                        <span className="text-sm text-gray-800 dark:text-gray-200">
                                          {formatCurrency(item.total * 0.08)} {/* Estimate as 8% */}
                                        </span>
                                      </div>
                                      <div className="flex justify-between pt-1 border-t border-gray-200 dark:border-gray-700">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total:</span>
                                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                                          {formatCurrency(item.total)}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
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
          
          {/* Export actions */}
          {groupedData.length > 0 && (
            <div className="mt-8 flex justify-end space-x-4">
              <button
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700"
              >
                <svg className="mr-2 -ml-1 h-5 w-5 text-gray-500 dark:text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Export CSV
              </button>
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setDateFilter('all');
                  setSearchTerm('');
                  setSortConfig({ key: 'date', direction: 'desc' });
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="mr-2 -ml-1 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reset All Filters
              </button>
            </div>
          )}
          
          {/* Footer with summary stats */}
          {groupedData.length > 0 && (
            <ExpenseStats 
              filteredData={filteredData}
              formatCurrency={formatCurrency}
            />
          )}
        </>
      )}
    </div>
  );
};

export default ExpenseTracker;