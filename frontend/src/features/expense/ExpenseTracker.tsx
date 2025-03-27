// ExpenseTracker.tsx
// Core expense tracking component that integrates all other components
import React, { useState, useEffect } from 'react';
import { Modal } from 'react-bootstrap'; // Using Bootstrap's Modal
import { 
  ExpenseItem, 
  ExpenseGroup, 
  SortConfig, 
  formatCurrency, 
  groupExpenseData, 
  filterDataByCategory, 
  filterDataByDate, 
  filterDataBySearchTerm,
  sortExpenseItems
} from './expenseHelpers';
import { 
  fetchExpenseData, 
  addExpense, 
  updateExpense, 
  deleteExpense 
} from './expensesApi';
import ExpenseFilters from './ExpenseFilters';
import ExpenseSummary from './ExpenseSummary';
import ExpenseGroups from './ExpenseGroups';
import ExpenseForm from './ExpenseForm';
import ExpenseStats from './ExpenseStats';

interface ExpenseTrackerProps {
  initialData?: ExpenseGroup[];
  categories?: string[];
}

const ExpenseTracker: React.FC<ExpenseTrackerProps> = ({ initialData, categories = [] }) => {
  // State for active main tab (Camera, Server, Home Network)
  const [activeMainTab, setActiveMainTab] = useState('Camera');
  
  // State for filters
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [dateFilter, setDateFilter] = useState('all');
  const [currentView, setCurrentView] = useState('itemType'); // 'itemType', 'store', 'date', 'card'
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'date',
    direction: 'desc'
  });
  
  // State for expense data
  const [groupedData, setGroupedData] = useState<ExpenseGroup[]>([]);
  const [filteredData, setFilteredData] = useState<ExpenseItem[]>([]);
  
  // Confirmation modal state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);

  // Categories for each tab
  const [categoriesByTab, setCategoriesByTab] = useState({
    'Camera': ['All', 'Cameras', 'Lenses', 'Accessories', 'Storage', 'Tripods'],
    'Server': ['All', 'CPUs', 'Storage', 'RAM', 'Cases', 'Cooling'],
    'Home Network': ['All', 'Routers', 'Switches', 'Access Points', 'Cables', 'Security']
  });

  // Credit card options - these could be fetched from your backend Cards model
  const [creditCardOptions, setCreditCardOptions] = useState([
    'Amazon.com Visa Signature ending in 0000',
    'Capital one Venture X ending in 0000',
    'United Visa ending in 0000'
  ]);

  // Initialize on mount with API data if available
  useEffect(() => {
    if (initialData && initialData.length > 0) {
      setGroupedData(initialData);
      applySearch(initialData);
    } else {
      loadExpenseData();
    }
    
    // If categories are provided, update the Camera categories
    if (categories && categories.length > 0) {
      setCategoriesByTab(prev => ({
        ...prev,
        'Camera': ['All', ...categories]
      }));
    }
  }, [initialData, categories]);

  // Load expense data from API
  const loadExpenseData = async () => {
    try {
      setIsLoading(true);
      const data = await fetchExpenseData(currentView, selectedCategory, dateFilter);
      setGroupedData(data);
      applySearch(data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error loading expense data:", error);
      setIsLoading(false);
    }
  };

  // Effect to reload data when view or filters change
  useEffect(() => {
    loadExpenseData();
  }, [currentView, selectedCategory, dateFilter, activeMainTab]);

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

  // Function to reset category when changing main tabs
  const handleMainTabChange = (tab: string) => {
    setActiveMainTab(tab);
    setSelectedCategory('All');
    setSearchTerm('');
    // Will trigger the useEffect to reload data
  };

  // Handler for sort button clicks
  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Open delete confirmation modal
  const confirmDeleteItem = (itemId: number) => {
    setItemToDelete(itemId);
    setShowDeleteConfirm(true);
  };

  // Delete an item
  const handleDeleteItem = async () => {
    if (!itemToDelete) return;
    
    try {
      setIsLoading(true);
      
      // Call the backend API to delete the invoice
      await deleteExpense(itemToDelete);
      
      // Reload the data
      await loadExpenseData();
      
      setShowDeleteConfirm(false);
      setItemToDelete(null);
      setIsLoading(false);
    } catch (error) {
      console.error('Error deleting expense:', error);
      setIsLoading(false);
    }
  };

  // Handle form submission of new expense
  const handleAddItem = async (formData: any) => {
    try {
      setIsLoading(true);
      
      // Call backend API to add expense
      await addExpense(formData);
      
      // Reload data
      await loadExpenseData();
      
      // Reset UI state
      setShowAddForm(false);
      setIsLoading(false);
    } catch (error) {
      console.error("Error adding expense:", error);
      setIsLoading(false);
      alert("Error adding expense: " + (error as Error).message);
    }
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
      {/* Header with Add Button */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Expense Categories</h1>
        
        {/* Quick add button */}
        <button
          onClick={() => setShowAddForm(prev => !prev)}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
        >
          {isLoading ? (
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
            </svg>
          )}
          {showAddForm ? 'Cancel' : 'Add Item'}
        </button>
      </div>
      
      {/* Add Item Form */}
      {showAddForm && (
        <ExpenseForm 
          onSubmit={handleAddItem} 
          categories={categoriesByTab[activeMainTab].filter(cat => cat !== 'All')}
          creditCardOptions={creditCardOptions}
          isLoading={isLoading}
        />
      )}
      
      {/* Main Tabs for Camera, Server, Home Network */}
      <div className="border-b mb-6 bg-white dark:bg-dark-card rounded-lg shadow">
        <div className="flex space-x-1 p-1">
          {Object.keys(categoriesByTab).map((tab) => (
            <button
              key={tab}
              onClick={() => handleMainTabChange(tab)}
              className={`px-4 py-2 text-sm font-medium border-b-2 focus:outline-none ${
                activeMainTab === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
      
      {/* Filters */}
      <ExpenseFilters 
        categories={categoriesByTab[activeMainTab]}
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
          
          {/* Groups of expenses */}
          <ExpenseGroups 
            groupedData={getSortedGroupedData()}
            handleSort={handleSort}
            sortConfig={sortConfig}
            formatCurrency={formatCurrency}
            onDeleteItem={confirmDeleteItem}
          />
          
          {/* No results message */}
          {groupedData.length === 0 && !isLoading && (
            <div className="bg-white dark:bg-dark-card rounded-lg shadow p-6 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600"
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
              <h3 className="mt-2 text-xl font-medium text-gray-900 dark:text-white">No data found</h3>
              <p className="mt-1 text-gray-500 dark:text-gray-400">
                No expenses match your current filter criteria.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => {
                    setSelectedCategory('All');
                    setDateFilter('all');
                    setSearchTerm('');
                  }}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          )}
          
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
      
      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteConfirm} onHide={() => setShowDeleteConfirm(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this item? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <button
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
            onClick={() => setShowDeleteConfirm(false)}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 ml-2"
            onClick={handleDeleteItem}
          >
            Delete
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ExpenseTracker;