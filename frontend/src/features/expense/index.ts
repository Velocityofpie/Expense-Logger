// index.ts
// Barrel exports for the expense tracking feature

// Export components
export { default as ExpenseTracker } from './ExpenseTracker';
export { default as ExpenseTrackerPage } from './ExpenseTrackerPage';
export { default as ExpenseFilters } from './ExpenseFilters';
export { default as ExpenseForm } from './ExpenseForm';
export { default as ExpenseGroups } from './ExpenseGroups';
export { default as ExpenseStats } from './ExpenseStats';
export { default as ExpenseSummary } from './ExpenseSummary';

// Export utility functions
export {
  formatCurrency,
  filterDataByCategory,
  filterDataByDate,
  filterDataBySearchTerm,
  groupExpenseData,
  sortExpenseItems,
  calculateExpenseStatistics,
  getTopCategories,
  getTopStores,
  getTopPaymentMethods
} from './expenseHelpers';

// Export API functions
export {
  fetchExpenseData,
  addExpense,
  updateExpense,
  deleteExpense,
  fetchCategories,
  fetchExpenseStatistics
} from './expensesApi';

// Export types
export type {
  Product,
  ExpenseItem,
  ExpenseGroup,
  SortConfig,
  ExpenseStats,
  ExpenseSummaryItem,
  ExpenseFilters,
  ExpenseFiltersProps,
  ExpenseFormProps,
  ExpenseFormData,
  ExpenseGroupsProps,
  ExpenseStatsProps,
  ExpenseSummaryProps,
  ExpenseTrackerProps,
  ExpenseDataResponse,
  ExpenseStatsResponse
} from './types';