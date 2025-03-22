// frontend/src/components/ExpenseTracker.js
import React, { useState, useEffect } from 'react';
import _ from 'lodash';

const ExpenseTracker = () => {
  // State for active main tab (Camera, Server, Home Network)
  const [activeMainTab, setActiveMainTab] = useState('Camera');
  
  // State for filters
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [dateFilter, setDateFilter] = useState('all');
  const [currentView, setCurrentView] = useState('itemType'); // 'itemType', 'store', 'date', 'card'
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({
    store: '',
    category: '',
    creditCard: '',
    total: 0,
    productName: '',
    productPrice: 0,
    productQuantity: 1
  });
  const [sortConfig, setSortConfig] = useState({
    key: 'date',
    direction: 'desc'
  });

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
  
  // Apply search filter
  const searchFiltered = currentTabData.filter(item => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    
    // Search in store (merchant_name), category, products, and order number
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
  
  // Filter purchases based on selected category
  const categoryFiltered = searchFiltered.filter(purchase => 
    selectedCategory === 'All' || purchase.category === selectedCategory
  );

  // Filter purchases based on date range
  const getDateFilteredData = () => {
    if (dateFilter === 'all') return categoryFiltered;
    
    const now = new Date();
    const monthsToSubtract = {
      '3months': 3,
      '6months': 6,
      '1year': 12
    }[dateFilter] || 0;
    
    if (monthsToSubtract === 0) return categoryFiltered;
    
    const cutoffDate = new Date();
    cutoffDate.setMonth(now.getMonth() - monthsToSubtract);
    
    return categoryFiltered.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate >= cutoffDate;
    });
  };
  
  const dateFilteredPurchases = getDateFilteredData();

  // Apply sorting
  const sortedData = _.orderBy(
    dateFilteredPurchases, 
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

  // Calculate the sum of filtered items
  const filteredTotal = sortedData.reduce((sum, item) => sum + item.total, 0);

  // Calculate total across all tabs for percentage calculations
  const totalAllTabs = Object.values(mockDataByTab)
    .flatMap(tab => tab)
    .reduce((sum, item) => sum + item.total, 0);
  
  const tabPercentage = totalAllTabs > 0 ? (filteredTotal / totalAllTabs) * 100 : 0;

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  // Get data for current view
  const getViewData = () => {
    if (currentView === 'itemType') {
      // Group by item type (using a mapping of product names to item types)
      return _.chain(sortedData)
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
      return _.chain(sortedData)
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
      return _.chain(sortedData)
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
      return _.chain(sortedData)
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

  // Function to handle input changes in the add form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Convert to number if appropriate
    const parsedValue = ['total', 'productPrice', 'productQuantity'].includes(name)
      ? parseFloat(value) || 0
      : value;
      
    setNewItem(prev => ({
      ...prev,
      [name]: parsedValue
    }));
  };

  // Function to add a new item - this would save to your backend in a real implementation
  const handleFormSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Create new item from form data
    const newId = Math.max(...(mockDataByTab[activeMainTab].map(item => item.id) || [0])) + 1;
    const itemToAdd = {
      id: newId,
      store: newItem.store, // This will be saved as merchant_name in your backend
      orderNumber: `Order# ${activeMainTab.substring(0, 3).toUpperCase()}-${String(newId).padStart(3, '0')}`,
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      category: newItem.category || categoriesByTab[activeMainTab][1],
      creditCard: newItem.creditCard || creditCardOptions[0],
      total: newItem.total,
      products: [
        { 
          name: newItem.productName || 'New Product', 
          price: newItem.productPrice || newItem.total, 
          quantity: newItem.productQuantity || 1 
        }
      ]
    };
    
    // In a real implementation, you would save to your backend:
    /*
    try {
      // Transform to your API format
      const invoiceData = {
        merchant_name: newItem.store,
        order_number: itemToAdd.orderNumber,
        purchase_date: new Date().toISOString().split('T')[0],
        payment_method: newItem.creditCard,
        grand_total: newItem.total,
        status: "Open",
        categories: [newItem.category],
        items: [{
          product_name: newItem.productName,
          quantity: newItem.productQuantity,
          unit_price: newItem.productPrice
        }]
      };
      
      // Call your API
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(invoiceData)
      });
      
      const result = await response.json();
      
      // Update the local state with the new data from the server
      // You might want to refetch all data instead
    } catch (error) {
      console.error('Error adding expense:', error);
    }
    */
    
    // Update state for the demo
    setMockDataByTab(prev => ({
      ...prev,
      [activeMainTab]: [...prev[activeMainTab], itemToAdd]
    }));
    
    // Clear form and hide it
    setNewItem({
      store: '',
      category: '',
      creditCard: '',
      total: 0,
      productName: '',
      productPrice: 0,
      productQuantity: 1
    });
    
    // Simulate API delay
    setTimeout(() => {
      setIsLoading(false);
      setShowAddForm(false);
    }, 500);
  };

  // Delete an item - in a real implementation, this would call your backend API
  const handleDeleteItem = (itemId) => {
    if (confirm('Are you sure you want to delete this item?')) {
      setMockDataByTab(prev => ({
        ...prev,
        [activeMainTab]: prev[activeMainTab].filter(item => item.id !== itemId)
      }));
      
      // In a real implementation:
      /*
      try {
        await fetch(`/api/invoices/${itemId}`, {
          method: 'DELETE'
        });
        
        // Update local state or refetch data
      } catch (error) {
        console.error('Error deleting expense:', error);
      }
      */
    }
  };

  // Export CSV functionality
  const exportCSV = () => {
    alert('CSV Export functionality would be implemented here');
  };

  // Calculate stats
  const averagePurchase = dateFilteredPurchases.length > 0 
    ? filteredTotal / dateFilteredPurchases.length 
    : 0;
    
  const highestExpense = dateFilteredPurchases.length > 0 
    ? Math.max(...dateFilteredPurchases.map(item => item.total))
    : 0;
    
  const lowestExpense = dateFilteredPurchases.length > 0 
    ? Math.min(...dateFilteredPurchases.map(item => item.total))
    : 0;

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
        <div className="bg-white rounded-lg shadow mb-6 p-4">
          <h2 className="text-lg font-medium mb-4">Add New Expense</h2>
          <form onSubmit={handleFormSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Merchant Name
                </label>
                <input
                  type="text"
                  name="store"
                  value={newItem.store}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Merchant name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  name="category"
                  value={newItem.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Select a category</option>
                  {currentCategories.filter(cat => cat !== 'All').map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method
                </label>
                <select
                  name="creditCard"
                  value={newItem.creditCard}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Select a payment method</option>
                  {creditCardOptions.map(card => (
                    <option key={card} value={card}>{card}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  name="total"
                  value={newItem.total}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  name="productName"
                  value={newItem.productName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Product name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Price
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  name="productPrice"
                  value={newItem.productPrice}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  step="1"
                  min="1"
                  name="productQuantity"
                  value={newItem.productQuantity}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="1"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {isLoading ? 'Adding...' : 'Add Expense'}
              </button>
            </div>
          </form>
        </div>
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
      
      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products, merchants..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Filter by Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md"
          >
            {currentCategories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date Range
          </label>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md"
          >
            <option value="all">All Time</option>
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="1year">Last Year</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Group By
          </label>
          <div className="flex space-x-1">
            <button
              onClick={() => setCurrentView('itemType')}
              className={`flex-1 px-2 py-2 text-xs border text-sm font-medium rounded-md ${
                currentView === 'itemType'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Item Type
            </button>
            <button
              onClick={() => setCurrentView('store')}
              className={`flex-1 px-2 py-2 text-xs border text-sm font-medium rounded-md ${
                currentView === 'store'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Merchant
            </button>
            <button
              onClick={() => setCurrentView('date')}
              className={`flex-1 px-2 py-2 text-xs border text-sm font-medium rounded-md ${
                currentView === 'date'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Date
            </button>
            <button
              onClick={() => setCurrentView('card')}
              className={`flex-1 px-2 py-2 text-xs border text-sm font-medium rounded-md ${
                currentView === 'card'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Card
            </button>
          </div>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-medium text-gray-500">Total Expenses</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {formatCurrency(filteredTotal)}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {dateFilter === 'all' ? 'All time' : `Last ${dateFilter}`}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-medium text-gray-500">Number of Purchases</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {dateFilteredPurchases.length}
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
            {groupedData.length > 0 ? groupedData[0].name : 'None'}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {groupedData.length > 0 ? `${groupedData[0].count} purchases (${Math.round((groupedData[0].total / filteredTotal) * 100)}%)` : 'No data'}
          </p>
        </div>
      </div>
      
      {/* Main Content - Category/Store/Date/Card Groups */}
      <div className="space-y-6">
        {groupedData.map((group, index) => (
          <div key={index} className="bg-white rounded-lg shadow overflow-hidden">
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
                  {Math.round((group.total / filteredTotal) * 100)}% of {selectedCategory === 'All' ? activeMainTab : selectedCategory} total
                </p>
              </div>
            </div>
            
            {/* Add progress bar visualization */}
            <div className="px-4 py-2 bg-gray-50 border-b">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${Math.round((group.total / filteredTotal) * 100)}%` }}
                  

                  ></div>
              </div>
            </div>
            
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
                  {group.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
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
                          onClick={() => handleDeleteItem(item.id)}
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
                    <td colSpan="5" className="px-6 py-3 text-right text-sm font-medium text-gray-500">
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
      </div>
      
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
      
      {/* Export and Print Buttons */}
      <div className="mt-8 flex justify-end space-x-4">
        <button
          onClick={exportCSV}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg className="mr-2 -ml-1 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          Export CSV
        </button>
        <button
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg className="mr-2 -ml-1 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
          </svg>
          Export Excel
        </button>
        <button
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          onClick={() => window.print()}
        >
          <svg className="mr-2 -ml-1 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
          </svg>
          Print
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
      <div className="mt-8 bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-medium mb-2">Spending Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h4 className="text-sm font-medium text-gray-500">By Item Type</h4>
            <ul className="mt-2 space-y-2">
              {_.chain(sortedData)
                .groupBy(item => {
                  // Map product names to appropriate item types
                  const productName = item.products[0]?.name || '';
                  if (productName.includes('Camera') || productName.includes('Alpha')) {
                    return 'Cameras';
                  } else if (productName.includes('Lens') || productName.includes('SONY E')) {
                    return 'Lenses';
                  } else if (productName.includes('Storage') || productName.includes('SDXC') || productName.includes('SSD') || productName.includes('NVMe')) {
                    return 'Storage';
                  } else if (productName.includes('Cage') || productName.includes('SmallRig')) {
                    return 'Accessories';
                  } else if (productName.includes('CPU') || productName.includes('Ryzen') || productName.includes('Intel')) {
                    return 'CPUs';
                  } else if (productName.includes('RAM') || productName.includes('Memory')) {
                    return 'RAM';
                  } else if (productName.includes('Router') || productName.includes('Wi-Fi')) {
                    return 'Routers';
                  } else if (productName.includes('Switch')) {
                    return 'Switches';
                  } else if (productName.includes('Access Point') || productName.includes('UniFi')) {
                    return 'Access Points';
                  } else if (productName.includes('Cable') || productName.includes('Ethernet')) {
                    return 'Cables';
                  } else if (productName.includes('Case') || productName.includes('Meshify')) {
                    return 'Cases';
                  } else if (productName.includes('Fan') || productName.includes('Cooling')) {
                    return 'Cooling';
                  } else if (productName.includes('Warranty')) {
                    return 'Warranties';
                  } else {
                    // Try to match with categories as fallback
                    const category = item.category;
                    return category !== 'All' ? category : 'Other';
                  }
                })
                .map((items, itemType) => ({
                  name: itemType,
                  total: _.sumBy(items, 'total')
                }))
                .orderBy(['total'], ['desc'])
                .take(3)
                .value()
                .map((item, i) => (
                  <li key={i} className="flex justify-between">
                    <span>{item.name}</span>
                    <span>{formatCurrency(item.total)}</span>
                  </li>
                ))
              }
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500">By Merchant</h4>
            <ul className="mt-2 space-y-2">
              {_.chain(sortedData)
                .groupBy('store')
                .map((items, store) => ({
                  name: store,
                  total: _.sumBy(items, 'total')
                }))
                .orderBy(['total'], ['desc'])
                .take(3)
                .value()
                .map((item, i) => (
                  <li key={i} className="flex justify-between">
                    <span>{item.name}</span>
                    <span>{formatCurrency(item.total)}</span>
                  </li>
                ))
              }
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500">By Credit Card</h4>
            <ul className="mt-2 space-y-2">
              {_.chain(sortedData)
                .groupBy('creditCard')
                .map((items, card) => ({
                  name: card,
                  total: _.sumBy(items, 'total')
                }))
                .orderBy(['total'], ['desc'])
                .take(3)
                .value()
                .map((item, i) => (
                  <li key={i} className="flex justify-between">
                    <span>{item.name.split(" ").slice(0, 2).join(" ")}</span>
                    <span>{formatCurrency(item.total)}</span>
                  </li>
                ))
              }
            </ul>
          </div>
        </div>
      </div>
      
      {/* Item Type Breakdown */}
      <div className="mt-8 bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-medium mb-4">Item Type Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            {_.chain(sortedData)
              .groupBy(item => {
                // Map product names to appropriate item types (same mapping as above)
                const productName = item.products[0]?.name || '';
                if (productName.includes('Camera') || productName.includes('Alpha')) {
                  return 'Cameras';
                } else if (productName.includes('Lens') || productName.includes('SONY E')) {
                  return 'Lenses';
                } else if (productName.includes('Storage') || productName.includes('SDXC') || productName.includes('SSD') || productName.includes('NVMe')) {
                  return 'Storage';
                } // more conditions...
                else {
                  // Try to match with categories as fallback
                  const category = item.category;
                  return category !== 'All' ? category : 'Other';
                }
              })
              .map((items, itemType) => ({
                name: itemType,
                count: items.length,
                total: _.sumBy(items, 'total')
              }))
              .orderBy(['total'], ['desc'])
              .take(5)
              .value()
              .map((item, i) => {
                const percentage = (item.total / filteredTotal) * 100;
                return (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{item.name}</span>
                      <span>{formatCurrency(item.total)} ({percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            }
          </div>
          <div className="flex items-center justify-center p-4">
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2">Top Item Type</p>
              <p className="text-3xl font-bold">
                {_.chain(sortedData)
                  .groupBy(item => {
                    // Map product names to appropriate item types (same mapping again)
                    const productName = item.products[0]?.name || '';
                    if (productName.includes('Camera') || productName.includes('Alpha')) {
                      return 'Cameras';
                    } // more conditions...
                    else {
                      const category = item.category;
                      return category !== 'All' ? category : 'Other';
                    }
                  })
                  .map((items, itemType) => ({
                    name: itemType,
                    total: _.sumBy(items, 'total')
                  }))
                  .orderBy(['total'], ['desc'])
                  .first()
                  .value()?.name || 'None'}
              </p>
              <p className="text-lg font-medium mt-2">
                {formatCurrency(_.chain(sortedData)
                  .groupBy(item => {
                    const productName = item.products[0]?.name || '';
                    const words = productName.split(' ');
                    return words.length > 2 ? `${words[0]} ${words[1]}` : words[0];
                  })
                  .map((items, itemType) => ({
                    total: _.sumBy(items, 'total')
                  }))
                  .orderBy(['total'], ['desc'])
                  .first()
                  .value()?.total || 0)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseTracker;