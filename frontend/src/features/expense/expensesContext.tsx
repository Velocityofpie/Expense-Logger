// src/features/expenses/expensesContext.tsx
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { fetchExpenseData, addExpense, updateExpense, deleteInvoice, fetchCategories } from '../../api';
import { formatCurrency, filterDataByCategory, filterDataByDate } from '../../utils/expenseHelpers';

// Define interfaces for the expense data
interface Product {
  name: string;
  price: number;
  quantity: number;
  item_type?: string;
}

interface Expense {
  id: number;
  store: string;
  orderNumber: string;
  date: string;
  category: string;
  creditCard: string;
  total: number;
  products: Product[];
}

interface ExpenseGroup {
  name: string;
  count: number;
  total: number;
  items: Expense[];
}

// Define view types and filter types
type ViewBy = 'itemType' | 'store' | 'date' | 'card';

interface ExpenseContextValue {
  // State
  groupedData: ExpenseGroup[];
  filteredData: Expense[];
  activeMainTab: string;
  selectedCategory: string;
  dateFilter: string;
  currentView: ViewBy;
  searchTerm: string;
  isLoading: boolean;
  error: string | null;
  categoriesByTab: Record<string, string[]>;
  creditCardOptions: string[];
  
  // Actions
  setActiveMainTab: (tab: string) => void;
  setSelectedCategory: (category: string) => void;
  setDateFilter: (filter: string) => void;
  setCurrentView: (view: ViewBy) => void;
  setSearchTerm: (term: string) => void;
  loadExpenseData: () => Promise<void>;
  createExpense: (expenseData: Omit<Expense, 'id'>) => Promise<boolean>;
  updateExpenseItem: (id: number, expenseData: Partial<Expense>) => Promise<boolean>;
  removeExpense: (id: number) => Promise<boolean>;
}

// Create the context
export const ExpensesContext = createContext<ExpenseContextValue | undefined>(undefined);

interface ExpensesProviderProps {
  children: ReactNode;
}

export const ExpensesProvider = ({ children }: ExpensesProviderProps) => {
  // State for active main tab (Camera, Server, Home Network)
  const [activeMainTab, setActiveMainTab] = useState<string>('Camera');
  
  // State for filters
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [currentView, setCurrentView] = useState<ViewBy>('itemType'); // 'itemType', 'store', 'date', 'card'
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // State for expense data
  const [groupedData, setGroupedData] = useState<ExpenseGroup[]>([]);
  const [filteredData, setFilteredData] = useState<Expense[]>([]);
  const [rawData, setRawData] = useState<Expense[]>([]);
  
  // State for error handling
  const [error, setError] = useState<string | null>(null);
  
  // Categories for each tab - this would ideally come from API
  const [categoriesByTab, setCategoriesByTab] = useState<Record<string, string[]>>({
    'Camera': ['All', 'Cameras', 'Lenses', 'Accessories', 'Storage', 'Tripods'],
    'Server': ['All', 'CPUs', 'Storage', 'RAM', 'Cases', 'Cooling'],
    'Home Network': ['All', 'Routers', 'Switches', 'Access Points', 'Cables', 'Security']
  });

  // Credit card options - these could be fetched from your backend Cards model
  const [creditCardOptions, setCreditCardOptions] = useState<string[]>([
    'Amazon.com Visa Signature ending in 0000',
    'Capital one Venture X ending in 0000',
    'United Visa ending in 0000'
  ]);

  // Load expense data from API
  const loadExpenseData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await fetchExpenseData(currentView, selectedCategory, dateFilter);
      setGroupedData(data);
      applySearch(data);
      
      // Also store the raw data (flattened)
      const rawExpenses = flattenGroupedData(data);
      setRawData(rawExpenses);
      
      setIsLoading(false);
    } catch (error: any) {
      console.error("Error loading expense data:", error);
      setError("Failed to load expense data. Please try again.");
      setIsLoading(false);
    }
  };

  // Effect to load data initially
  useEffect(() => {
    loadExpenseData();
    loadCategories();
  }, []);

  // Effect to reload data when view or filters change
  useEffect(() => {
    loadExpenseData();
  }, [currentView, selectedCategory, dateFilter, activeMainTab]);

  // Load categories from API
  const loadCategories = async () => {
    try {
      const categories = await fetchCategories();
      
      // Update the categories for the active tab
      if (categories && categories.length > 0) {
        setCategoriesByTab(prev => ({
          ...prev,
          'Camera': ['All', ...categories]
        }));
      }
    } catch (error) {
      console.error("Error loading categories:", error);
      // Don't set an error state here to avoid disrupting the UI for a non-critical feature
    }
  };

  // Flatten grouped data for filtering
  const flattenGroupedData = (groups: ExpenseGroup[]): Expense[] => {
    return groups.reduce((acc, group) => [...acc, ...group.items], [] as Expense[]);
  };

  // Apply search filter to data
  const applySearch = (data: ExpenseGroup[]) => {
    if (!searchTerm) {
      setFilteredData(flattenGroupedData(data));
      return;
    }

    const search = searchTerm.toLowerCase();
    
    // Create a flattened array of all items from all groups
    const flatItems = flattenGroupedData(data);
    
    // Filter by search term
    const filtered = flatItems.filter(item => 
      item.store.toLowerCase().includes(search) ||
      (item.orderNumber && item.orderNumber.toLowerCase().includes(search)) ||
      (item.category && item.category.toLowerCase().includes(search)) ||
      (item.creditCard && item.creditCard.toLowerCase().includes(search)) ||
      (item.products && item.products.some(p => p.name.toLowerCase().includes(search)))
    );
    
    setFilteredData(filtered);
  };

  // Effect to apply search when search term changes
  useEffect(() => {
    applySearch(groupedData);
  }, [searchTerm]);
  
  // Create a new expense
  const createExpense = async (expenseData: Omit<Expense, 'id'>) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Call backend API to add expense
      await addExpense(expenseData);
      
      // Reload data
      await loadExpenseData();
      
      setIsLoading(false);
      return true;
    } catch (error: any) {
      console.error("Error adding expense:", error);
      setError("Error adding expense: " + error.message);
      setIsLoading(false);
      return false;
    }
  };
  
  // Update an existing expense
  const updateExpenseItem = async (id: number, expenseData: Partial<Expense>) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Call backend API to update expense
      await updateExpense(id, expenseData);
      
      // Reload data
      await loadExpenseData();
      
      setIsLoading(false);
      return true;
    } catch (error: any) {
      console.error("Error updating expense:", error);
      setError("Error updating expense: " + error.message);
      setIsLoading(false);
      return false;
    }
  };
  
  // Delete an expense
  const removeExpense = async (id: number) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Call the backend API to delete the invoice
      await deleteInvoice(id);
      
      // Reload data
      await loadExpenseData();
      
      setIsLoading(false);
      return true;
    } catch (error: any) {
      console.error("Error deleting expense:", error);
      setError("Error deleting expense: " + error.message);
      setIsLoading(false);
      return false;
    }
  };
  
  // Create context value
  const contextValue: ExpenseContextValue = {
    // State
    groupedData,
    filteredData,
    activeMainTab,
    selectedCategory,
    dateFilter,
    currentView,
    searchTerm,
    isLoading,
    error,
    categoriesByTab,
    creditCardOptions,
    
    // Actions
    setActiveMainTab,
    setSelectedCategory,
    setDateFilter,
    setCurrentView,
    setSearchTerm,
    loadExpenseData,
    createExpense,
    updateExpenseItem,
    removeExpense
  };

  return (
    <ExpensesContext.Provider value={contextValue}>
      {children}
    </ExpensesContext.Provider>
  );
};

// Custom hook for easier context consumption
export const useExpenses = () => {
  const context = React.useContext(ExpensesContext);
  
  if (context === undefined) {
    throw new Error('useExpenses must be used within an ExpensesProvider');
  }
  
  return context;
};