// frontend/src/components/expense/ExpenseFilters.js
import React from 'react';

const ExpenseFilters = ({
  categories,
  selectedCategory,
  setSelectedCategory,
  dateFilter,
  setDateFilter,
  searchTerm,
  setSearchTerm,
  currentView,
  setCurrentView
}) => {
  return (
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
          Filter by item type
        </label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md"
        >
          {categories.map((category) => (
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
  );
};

export default ExpenseFilters;