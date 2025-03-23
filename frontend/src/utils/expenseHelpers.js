// frontend/src/utils/expenseHelpers.js

/**
 * Format a number as currency
 * @param {number} value - The value to format
 * @returns {string} Formatted currency value
 */
export const formatCurrency = (value) => {
    if (!value && value !== 0) return "$0.00";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };
  
  /**
   * Filter data by category
   * @param {Array} data - The data to filter
   * @param {string} category - The category to filter by
   * @returns {Array} Filtered data
   */
  export const filterDataByCategory = (data, category) => {
    if (category === 'All') return data;
    return data.filter(purchase => purchase.category === category);
  };
  
  /**
   * Filter data by date range
   * @param {Array} data - The data to filter
   * @param {string} dateFilter - The date filter to apply ('all', '3months', '6months', '1year')
   * @returns {Array} Filtered data
   */
  export const filterDataByDate = (data, dateFilter) => {
    if (dateFilter === 'all') return data;
    
    const now = new Date();
    const monthsToSubtract = {
      '3months': 3,
      '6months': 6,
      '1year': 12
    }[dateFilter] || 0;
    
    if (monthsToSubtract === 0) return data;
    
    const cutoffDate = new Date();
    cutoffDate.setMonth(now.getMonth() - monthsToSubtract);
    
    return data.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate >= cutoffDate;
    });
  };