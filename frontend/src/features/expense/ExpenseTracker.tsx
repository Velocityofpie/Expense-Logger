// src/features/expense/ExpenseTracker.tsx
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
  
  // For tracking expanded items - initially all are expanded
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
        
        // Initialize expanded state for all items to be true (expanded)
        const newExpandedState: Record<number, boolean> = {};
        initialData.forEach((group: ExpenseGroup) => {
          group.items.forEach((item: ExpenseItem) => {
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
      // This is the key fix: use activeMainTab instead of selectedCategory
      const categoryParam = activeMainTab === 'All' ? '' : activeMainTab;
      console.log('Loading data with category:', categoryParam);
      
      const data = await fetchExpenseData(currentView, categoryParam, dateFilter);
      console.log('Received data:', data);
      
      // If you need additional client-side filtering, you can add it here
      let filteredData = data;
      if (activeMainTab !== 'All') {
        // Additional client-side filtering if necessary
        filteredData = data.map((group: ExpenseGroup) => ({
          ...group,
          items: group.items.filter((item: ExpenseItem) => item.category === activeMainTab),
          count: group.items.filter((item: ExpenseItem) => item.category === activeMainTab).length,
          total: group.items
            .filter((item: ExpenseItem) => item.category === activeMainTab)
            .reduce((sum: number, item: ExpenseItem) => sum + item.total, 0)
        })).filter((group: ExpenseGroup) => group.count > 0);
      }
      
      setGroupedData(filteredData);
      applySearch(filteredData);
      
      // Initialize expanded state for all items to be true (expanded)
      const newExpandedState: Record<number, boolean> = {};
      filteredData.forEach((group: ExpenseGroup) => {
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
  }, [currentView, dateFilter]);

  // Effect to reload data when active main tab changes
  useEffect(() => {
    // When active main tab changes, update selectedCategory to match
    setSelectedCategory(activeMainTab);
    // Don't call loadExpenseData() here - it will be called by the
    // handleCategoryTabChange function directly
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
    return groups.reduce((acc: ExpenseItem[], group) => [...acc, ...group.items], [] as ExpenseItem[]);
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
    // This immediate data reload is the key fix
    // Instead of waiting for useEffect to trigger
    loadExpenseData();
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
  
  // Toggle expense item expansion
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

  // Handle delete item
  const handleDeleteItem = (id: number) => {
    // This would actually call the API to delete the item
    console.log(`Delete item with ID: ${id}`);
  };

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-900 max-w-full overflow-auto">
      {/* Header */}
      <h1 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">
        {selectedCategory === 'All' 
          ? 'Expense Tracker' 
          : `${selectedCategory} (${filteredTotal.toLocaleString('en-US', { style: 'currency', currency: 'USD' })})`}
      </h1>
      
      {/* Main Category Tabs - enhanced with stronger visual indication */}
      <div className="border-b mb-6 bg-white dark:bg-dark-card rounded-lg shadow overflow-hidden">
        <div className="flex flex-wrap p-1 overflow-x-auto">
          {availableCategories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryTabChange(category)}
              className={`px-4 py-3 text-sm font-medium focus:outline-none whitespace-nowrap transition-all duration-200 
                ${activeMainTab === category 
                  ? 'bg-blue-600 text-white border-blue-600 rounded-t-lg shadow-inner' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 border-transparent'
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
          
          {/* Display category name as a section title before the expenses list */}
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white border-b-2 border-blue-600 pb-2 inline-block">
              {activeMainTab === 'All' ? 'All Expenses' : `${activeMainTab} Expenses`}
            </h3>
          </div>
          
          {/* Groups of expenses with edit button instead of delete */}
          <ExpenseGroups
            groupedData={getSortedGroupedData()}
            handleSort={handleSort}
            sortConfig={sortConfig}
            formatCurrency={formatCurrency}
            onDeleteItem={handleDeleteItem}
          />
          
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