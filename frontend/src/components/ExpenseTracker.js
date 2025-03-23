// frontend/src/components/ExpenseTracker.js
import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import _ from 'lodash';
import { formatCurrency, filterDataByCategory, filterDataByDate } from '../utils/expenseHelpers';
import ExpenseFilters from './expense/ExpenseFilters';
import ExpenseSummary from './expense/ExpenseSummary';
import ExpenseGroups from './expense/ExpenseGroups';
import ExpenseForm from './expense/ExpenseForm';
import ExpenseStats from './expense/ExpenseStats';

const ExpenseTracker = ({ initialData }) => {
  // State for active main tab (Camera, Server, Home Network)
  const [activeMainTab, setActiveMainTab] = useState('Camera');
  
  // State for filters
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [dateFilter, setDateFilter] = useState('all');
  const [currentView, setCurrentView] = useState('itemType'); // 'itemType', 'store', 'date', 'card'
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [sortConfig, setSortConfig] = useState({
    key: 'date',
    direction: 'desc'
  });
  
  // Confirmation modal state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Categories for each tab - these could be fetched from your backend
  const categoriesByTab = {
    'Camera': ['All', 'Cameras', 'Lenses', 'Accessories', 'Storage', 'Tripods'],
    'Server': ['All', 'CPUs', 'Storage', 'RAM', 'Cases', 'Cooling'],
    'Home Network': ['All', 'Routers', 'Switches', 'Access Points', 'Cables', 'Security']
  };

  // Credit card options - these could be fetched from your backend Cards model
  const creditCardOptions = [
    'Amazon.com Visa Signature ending in 0000',
    'Capital one Venture X ending in 0000',
    'United Visa ending in 0000'
  ];

  // Mock Data for each tab - this would be replaced with data from your backend
  const [mockDataByTab, setMockDataByTab] = useState({
    'Camera': [],
    'Server': [],
    'Home Network': []
  });

  // New item state
  const [newItem, setNewItem] = useState({
    store: '',
    category: '',
    creditCard: '',
    total: 0,
    products: []
  });

  // Fetch data from backend when component mounts
  useEffect(() => {
    const fetchExpenseData = async () => {
      try {
        setIsLoading(true);
        
        // In a real implementation, you would fetch data from your API
        // Example:
        // const response = await fetch('/api/expenses');
        // const data = await response.json();
        
        // For now, we'll use mock data
        const mockData = {
          'Camera': [
            {
              id: 1,
              store: 'Amazon', // This will be merchant_name from your model
              orderNumber: 'Order # CAM-001',
              date: 'July 21, 2024',
              category: 'Accessories',
              creditCard: 'United Visa ending in 0000',
              total: 59.99,
              products: [
                { name: 'SmallRig Cage Kit for Sony A670', price: 59.99, quantity: 1 }
              ]
            },
            // More camera items...
          ],
          'Server': [
            // Server items...
          ],
          'Home Network': [
            // Network items...
          ]
        };
        
        setMockDataByTab(mockData);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching expense data:', error);
        setIsLoading(false);
      }
    };
    
    fetchExpenseData();
  }, []);

  // Get the currently active data based on the main tab selection
  const currentTabData = mockDataByTab[activeMainTab] || [];
  const currentCategories = categoriesByTab[activeMainTab] || [];
  
  // Apply filters
  const applyFilters = () => {
    // Apply search filter
    const searchFiltered = currentTabData.filter(item => {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      
      // Search in store, category, products, and order number
      return (
        item.store.toLowerCase().includes(searchLower) ||
        item.category.toLowerCase().includes(searchLower) ||
        item.orderNumber.toLowerCase().includes(searchLower) ||
        item.creditCard.toLowerCase().includes(searchLower) ||
        item.products.some(product => 
          product.name.toLowerCase().includes(searchLower)
        )
      );
    });
    
    // Filter by category
    const categoryFiltered = filterDataByCategory(searchFiltered, selectedCategory);
    
    // Filter by date range
    const dateFiltered = filterDataByDate(categoryFiltered, dateFilter);
    
    // Apply sorting
    return _.orderBy(
      dateFiltered, 
      [item => {
        if (sortConfig.key === 'date') {
          return new Date(item.date);
        }
        if (sortConfig.key === 'total') {
          return parseFloat(item.total);
        }
        if (typeof item[sortConfig.key] === 'string') {
          return item[sortConfig.key].toLowerCase();
        }
        return item[sortConfig.key];
      }],
      [sortConfig.direction]
    );
  };
  
  const filteredData = applyFilters();
  
  // Calculate the sum of filtered items
  const filteredTotal = filteredData.reduce((sum, item) => sum + item.total, 0);

  // Calculate total across all tabs for percentage calculations
  const totalAllTabs = Object.values(mockDataByTab)
    .flatMap(tab => tab)
    .reduce((sum, item) => sum + item.total, 0);
  
  const tabPercentage = totalAllTabs > 0 ? (filteredTotal / totalAllTabs) * 100 : 0;

  // Get data for current view
  const getViewData = () => {
    if (currentView === 'itemType') {
      // Group by item type (using a mapping of product names to item types)
      return _.chain(filteredData)
        .groupBy(item => {
          // Map product names to appropriate item types
          const productName = item.products[0]?.name || '';
          // Logic to determine item type based on product name
          if (productName.includes('Camera') || productName.includes('Alpha')) {
            return 'Cameras';
          } else if (productName.includes('Lens') || productName.includes('SONY E')) {
            return 'Lenses';
          } else if (productName.includes('Storage') || productName.includes('SDXC') || productName.includes('SSD')) {
            return 'Storage';
          }
          // More mappings...
          else {
            // Try to match with categories as fallback
            const category = item.category;
            return category !== 'All' ? category : 'Other';
          }
        })
        .map((items, itemType) => ({
          name: itemType,
          count: items.length,
          total: _.sumBy(items, 'total'),
          items: items
        }))
        .orderBy(['total'], ['desc'])
        .value();
    } else if (currentView === 'store') {
      // Group by store (merchant_name)
      return _.chain(filteredData)
        .groupBy('store')
        .map((items, store) => ({
          name: store,
          count: items.length,
          total: _.sumBy(items, 'total'),
          items: items
        }))
        .orderBy(['total'], ['desc'])
        .value();
    } else if (currentView === 'date') {
      // Group by month
      return _.chain(filteredData)
        .groupBy(item => {
          const dateParts = item.date.split(' ');
          return `${dateParts[0]} ${dateParts[2] || ''}`;
        })
        .map((items, month) => ({
          name: month,
          count: items.length,
          total: _.sumBy(items, 'total'),
          items: items
        }))
        .orderBy(['name'], ['desc'])
        .value();
    } else if (currentView === 'card') {
      // Group by credit card
      return _.chain(filteredData)
        .groupBy('creditCard')
        .map((items, card) => ({
          name: card,
          count: items.length,
          total: _.sumBy(items, 'total'),
          items: items
        }))
        .orderBy(['total'], ['desc'])
        .value();
    }
    
    return [];
  };
  
  const groupedData = getViewData();

  // Function to reset category when changing main tabs
  const handleMainTabChange = (tab) => {
    setActiveMainTab(tab);
    setSelectedCategory('All');
    setSearchTerm('');
  };

  // Handler for sort button clicks
  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Open delete confirmation modal
  const confirmDeleteItem = (itemId) => {
    setItemToDelete(itemId);
    setShowDeleteConfirm(true);
  };

  // Delete an item
  const handleDeleteItem = () => {
    if (!itemToDelete) return;
    
    setMockDataByTab(prev => ({
      ...prev,
      [activeMainTab]: prev[activeMainTab].filter(item => item.id !== itemToDelete)
    }));
    
    // In a real implementation:
    /*
    try {
      await fetch(`/api/invoices/${itemToDelete}`, {
        method: 'DELETE'
      });
      
      // Update local state or refetch data
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
    */
    
    setShowDeleteConfirm(false);
    setItemToDelete(null);
  };

  // Handle form submission of new expense
  const handleAddItem = (formData) => {
    setIsLoading(true);
    
    // Create new item from form data
    const newId = Math.max(...(mockDataByTab[activeMainTab].map(item => item.id) || [0])) + 1;
    const itemToAdd = {
      id: newId,
      store: formData.store,
      orderNumber: `Order# ${activeMainTab.substring(0, 3).toUpperCase()}-${String(newId).padStart(3, '0')}`,
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      category: formData.category || categoriesByTab[activeMainTab][1],
      creditCard: formData.creditCard || creditCardOptions[0],
      total: formData.total,
      products: formData.products
    };
    
    // Update state for the demo
    setMockDataByTab(prev => ({
      ...prev,
      [activeMainTab]: [...prev[activeMainTab], itemToAdd]
    }));
    
    // Simulate API delay
    setTimeout(() => {
      setIsLoading(false);
      setShowAddForm(false);
    }, 500);
  };

  return (
    <div className="p-4 bg-gray-50 max-w-full overflow-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Expense Categories</h1>
        
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
          categories={currentCategories.filter(cat => cat !== 'All')}
          creditCardOptions={creditCardOptions}
          isLoading={isLoading}
        />
      )}
      
      {/* Main Tabs for Camera, Server, Home Network */}
      <div className="border-b mb-6 bg-white rounded-lg shadow">
        <div className="flex space-x-1 p-1">
          {Object.keys(mockDataByTab).map((tab) => (
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
        categories={currentCategories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        currentView={currentView}
        setCurrentView={setCurrentView}
      />
      
      {/* Summary Stats */}
      <ExpenseSummary 
        filteredTotal={filteredTotal}
        purchaseCount={filteredData.length}
        tabPercentage={tabPercentage}
        filteredData={filteredData}
      />
      
      {/* Groups of expenses */}
      <ExpenseGroups 
        groupedData={groupedData}
        handleSort={handleSort}
        sortConfig={sortConfig}
        formatCurrency={formatCurrency}
        onDeleteItem={confirmDeleteItem}
      />
      
      {/* No results message */}
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
      <div className="mt-8 flex justify-end space-x-4">
        <button
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg className="mr-2 -ml-1 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
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
      
      {/* Footer with summary stats */}
      <ExpenseStats 
        filteredData={filteredData}
        formatCurrency={formatCurrency}
      />
      
      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteConfirm} onHide={() => setShowDeleteConfirm(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this item? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteItem}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ExpenseTracker;