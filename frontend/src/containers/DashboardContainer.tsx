// src/containers/DashboardContainer.tsx
import React, { useState, useEffect, useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';

// Import components
import { 
  StatCard, 
  DashboardFilters, 
  RecentInvoicesTable,
  SpendingChart,
  CategoryDistribution, 
  StatusDistribution,
  SpendingDataPoint,
  CategoryDataPoint,
  StatusDataPoint,
  Invoice
} from '../components/dashboard';

// Import API functions
import { fetchInvoices, fetchCategories, fetchTags } from '../api';

const DashboardContainer: React.FC = () => {
  const { darkMode } = useContext(ThemeContext);
  
  // State for data
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  
  // State for loading
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for filters
  const [selectedYear, setSelectedYear] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [activeChart, setActiveChart] = useState<'monthly' | 'area'>('monthly');
  
  // Dashboard statistics
  const [stats, setStats] = useState({
    totalInvoices: 0,
    totalAmount: 0,
    openInvoices: 0,
    paidInvoices: 0,
    averageInvoiceAmount: 0
  });

  // Fetch all data on mount
  useEffect(() => {
    async function loadDashboardData() {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch invoices, categories, and tags
        const [invoicesData, categoriesData, tagsData] = await Promise.all([
          fetchInvoices(),
          fetchCategories(),
          fetchTags()
        ]);
        
        setInvoices(invoicesData || []);
        setFilteredInvoices(invoicesData || []);
        setCategories(categoriesData || []);
        setTags(tagsData || []);
        
        // Calculate dashboard statistics
        calculateStatistics(invoicesData || []);
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        setError("Failed to load dashboard data. Please try again.");
        setIsLoading(false);
      }
    }
    
    loadDashboardData();
  }, []);

  // Apply filters when invoices or filters change
  useEffect(() => {
    applyFilters();
  }, [invoices, selectedYear, selectedStatus]);

  // Calculate statistics from invoice data
  const calculateStatistics = (invoiceData: Invoice[]) => {
    if (!invoiceData || invoiceData.length === 0) {
      return;
    }
    
    const totalAmount = invoiceData.reduce((sum, inv) => {
      return sum + (parseFloat(String(inv.grand_total)) || 0);
    }, 0);
    
    const openInvoices = invoiceData.filter(inv => inv.status === "Open").length;
    const paidInvoices = invoiceData.filter(inv => inv.status === "Paid").length;
    
    setStats({
      totalInvoices: invoiceData.length,
      totalAmount: totalAmount,
      openInvoices,
      paidInvoices,
      averageInvoiceAmount: (totalAmount / invoiceData.length)
    });
  };

  // Filter invoices based on selected filters
  const applyFilters = () => {
    let filtered = [...invoices];
    
    // Year filter
    if (selectedYear !== "All") {
      filtered = filtered.filter(inv => {
        const invYear = inv.purchase_date 
          ? new Date(inv.purchase_date).getFullYear().toString() 
          : null;
        return invYear === selectedYear;
      });
    }
    
    // Status filter
    if (selectedStatus !== "All") {
      filtered = filtered.filter(inv => inv.status === selectedStatus);
    }
    
    setFilteredInvoices(filtered);
  };

  // Prepare data for charts
  const getChartData = () => {
    // Monthly spending data
    const monthlyData: Record<string, number> = {};
    filteredInvoices.forEach(inv => {
      if (inv.purchase_date) {
        const date = new Date(inv.purchase_date);
        const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        
        if (!monthlyData[monthYear]) {
          monthlyData[monthYear] = 0;
        }
        monthlyData[monthYear] += parseFloat(String(inv.grand_total)) || 0;
      }
    });
    
    // Category data
    const categoryData: Record<string, number> = {};
    filteredInvoices.forEach(inv => {
      if (inv.categories && inv.categories.length > 0) {
        inv.categories.forEach(cat => {
          if (!categoryData[cat]) {
            categoryData[cat] = 0;
          }
          categoryData[cat] += parseFloat(String(inv.grand_total)) || 0;
        });
      } else {
        if (!categoryData["Uncategorized"]) {
          categoryData["Uncategorized"] = 0;
        }
        categoryData["Uncategorized"] += parseFloat(String(inv.grand_total)) || 0;
      }
    });
    
    // Status data
    const statusData: Record<string, number> = {};
    filteredInvoices.forEach(inv => {
      const status = inv.status || "Unknown";
      if (!statusData[status]) {
        statusData[status] = 0;
      }
      statusData[status] += 1;
    });
    
    // Format data for charts
    const spendingChartData: SpendingDataPoint[] = Object.keys(monthlyData).map(month => ({
      month,
      amount: monthlyData[month]
    })).sort((a, b) => a.month.localeCompare(b.month));
    
    const categoryChartData: CategoryDataPoint[] = Object.keys(categoryData).map(category => ({
      name: category,
      value: categoryData[category]
    })).sort((a, b) => b.value - a.value);
    
    const statusChartData: StatusDataPoint[] = Object.keys(statusData).map(status => ({
      name: status,
      value: statusData[status]
    }));
    
    return {
      spending: spendingChartData,
      category: categoryChartData,
      status: statusChartData
    };
  };

  // Get unique years from invoices for the filter
  const getYearOptions = () => {
    const yearSet = new Set<string>();
    yearSet.add("All");
    
    invoices.forEach(inv => {
      if (inv.purchase_date) {
        const year = new Date(inv.purchase_date).getFullYear().toString();
        yearSet.add(year);
      }
    });
    
    const years = Array.from(yearSet);
    years.sort((a, b) => {
      if (a === "All") return -1;
      if (b === "All") return 1;
      return parseInt(b) - parseInt(a); // Sort years in descending order
    });
    
    return years.map(year => ({
      value: year,
      label: year === "All" ? "All Years" : year
    }));
  };

  // Get unique statuses from invoices for the filter
  const getStatusOptions = () => {
    const statusSet = new Set<string>();
    statusSet.add("All");
    
    invoices.forEach(inv => {
      if (inv.status) {
        statusSet.add(inv.status);
      }
    });
    
    return Array.from(statusSet).map(status => ({
      value: status,
      label: status === "All" ? "All Statuses" : status
    }));
  };

  // Format currency
  const formatCurrency = (value?: number): string => {
    if (value === undefined || value === null) return "$0.00";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  // Chart data
  const chartData = getChartData();
  const yearOptions = getYearOptions();
  const statusOptions = getStatusOptions();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-3 text-gray-600 dark:text-gray-400">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-400 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-red-700 dark:text-red-200">{error}</p>
              <div className="mt-2">
                <button 
                  onClick={() => window.location.reload()} 
                  className="bg-red-100 hover:bg-red-200 dark:bg-red-800 dark:hover:bg-red-700 text-red-800 dark:text-red-200 px-3 py-1 rounded-md text-sm font-medium"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Dashboard</h1>
        <div className="flex space-x-3">
          <button 
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
          <button 
            type="button" 
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700"
            id="export-menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export
          </button>
        </div>
      </div>
      
      {/* Filters */}
      <DashboardFilters 
        yearOptions={yearOptions}
        statusOptions={statusOptions}
        selectedYear={selectedYear}
        selectedStatus={selectedStatus}
        onYearChange={setSelectedYear}
        onStatusChange={setSelectedStatus}
        onChartTypeChange={setActiveChart}
        activeChart={activeChart}
      />
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard 
          title="Total Invoices" 
          value={stats.totalInvoices} 
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
          color="indigo"
        />
        
        <StatCard 
          title="Total Amount" 
          value={formatCurrency(stats.totalAmount)} 
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="purple"
        />
        
        <StatCard 
          title="Average Invoice" 
          value={formatCurrency(stats.averageInvoiceAmount)} 
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          }
          color="pink"
        />
        
        <StatCard 
          title="Completion Rate" 
          value={`${stats.totalInvoices > 0 
            ? Math.round((stats.paidInvoices / stats.totalInvoices) * 100) 
            : 0}%`} 
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="blue"
          percentage={stats.paidInvoices > 0 ? Math.round((stats.paidInvoices / stats.totalInvoices) * 100) : 0}
          trend="up"
        />
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <SpendingChart 
            data={chartData.spending}
            chartType={activeChart}
            formatCurrency={formatCurrency}
          />
        </div>
        
        <div>
          <StatusDistribution data={chartData.status} />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <CategoryDistribution 
          data={chartData.category}
          formatCurrency={formatCurrency}
        />
        
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
          {/* This could hold another chart or widget in the future */}
          <div className="p-6 text-center">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Payment Methods</h2>
            <p className="text-gray-500 dark:text-gray-400">
              Payment method analytics will be available soon.
            </p>
          </div>
        </div>
      </div>
      
      {/* Recent Invoices Table */}
      <RecentInvoicesTable 
        invoices={filteredInvoices.slice(0, 5)}
        formatCurrency={formatCurrency}
      />
    </div>
  );
};

export default DashboardContainer;