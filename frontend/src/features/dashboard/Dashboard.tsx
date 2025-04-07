// src/features/dashboard/Dashboard.tsx
import React, { useEffect, useState } from "react";
import { fetchInvoices, fetchCategories, fetchTags } from "../../services/api";
import DashboardFilters from "./DashboardFilters";
import StatsCards from "./StatsCards";
import SpendingCharts from "./SpendingCharts";
import CategoryCharts from "./CategoryCharts";
import RecentInvoices from "./RecentInvoices";
import "./dashboard.css";

// Define TypeScript interfaces
import { Invoice, ChartData, DashboardStats } from "./types";

const Dashboard: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | string>(new Date().getFullYear());
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [loading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeChart, setActiveChart] = useState<'monthly' | 'area'>('monthly');
  const [stats, setStats] = useState<DashboardStats>({
    totalInvoices: 0,
    totalAmount: 0,
    openInvoices: 0,
    paidInvoices: 0,
    averageInvoiceAmount: 0
  });
  const [chartData, setChartData] = useState<ChartData>({
    monthly: [],
    category: [],
    status: [],
    paymentMethod: []
  });

  // Fetch all data on mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Load dashboard data from API
  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch real data from the API
      const invoiceData = await fetchInvoices();
      setInvoices(invoiceData);
      
      // Fetch categories and tags
      const categoriesData = await fetchCategories();
      const tagsData = await fetchTags();
      
      setCategories(categoriesData);
      setTags(tagsData);
      
      // Apply filters to get filtered invoices
      const filtered = filterInvoices(invoiceData, selectedYear, selectedStatus);
      setFilteredInvoices(filtered);
      
      // Calculate statistics
      calculateStatistics(invoiceData);
      
      // Generate chart data
      generateChartData(invoiceData);
      
      setIsLoading(false);
    } catch (err) {
      console.error("Error loading dashboard data:", err);
      setError("Failed to load dashboard data. Please try again.");
      setIsLoading(false);
    }
  };

  // Filter invoices based on selected year and status
  const filterInvoices = (invoices: Invoice[], year: string | number, status: string): Invoice[] => {
    return invoices.filter((inv) => {
      // Year filter
      const invYear = inv.purchase_date ? new Date(inv.purchase_date).getFullYear() : null;
      const yearMatch = year === "All" || (invYear !== null && invYear === Number(year));
      
      // Status filter
      const statusMatch = status === "All" || inv.status === status;
      
      return yearMatch && statusMatch;
    });
  };

  // Handle filter changes
  const handleFiltersChange = (year: string | number, status: string) => {
    setSelectedYear(year);
    setSelectedStatus(status);
    
    // Apply the new filters
    const filtered = filterInvoices(invoices, year, status);
    setFilteredInvoices(filtered);
    
    // Regenerate chart data with filtered invoices
    generateChartData(filtered);
  };

  // Calculate dashboard statistics
  const calculateStatistics = (invoiceData: Invoice[]): void => {
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
      totalAmount,
      openInvoices,
      paidInvoices,
      averageInvoiceAmount: totalAmount / invoiceData.length || 0
    });
  };

  // Generate chart data from invoice data
  const generateChartData = (invoiceData: Invoice[]): void => {
    if (!invoiceData || invoiceData.length === 0) {
      return;
    }
    
    // Monthly spending data
    const monthlyData: Record<string, number> = {};
    invoiceData.forEach(inv => {
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
    invoiceData.forEach(inv => {
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
    invoiceData.forEach(inv => {
      const status = inv.status || "Unknown";
      if (!statusData[status]) {
        statusData[status] = 0;
      }
      statusData[status] += 1;
    });
    
    // Payment method data
    const paymentMethodData: Record<string, number> = {};
    invoiceData.forEach(inv => {
      const method = inv.payment_method || "Unknown";
      if (!paymentMethodData[method]) {
        paymentMethodData[method] = 0;
      }
      paymentMethodData[method] += parseFloat(String(inv.grand_total)) || 0;
    });
    
    setChartData({
      monthly: Object.keys(monthlyData).map(month => ({
        month,
        amount: monthlyData[month]
      })).sort((a, b) => a.month.localeCompare(b.month)),
      
      category: Object.keys(categoryData).map(category => ({
        name: category,
        value: categoryData[category]
      })).sort((a, b) => b.value - a.value),
      
      status: Object.keys(statusData).map(status => ({
        name: status,
        value: statusData[status]
      })),
      
      paymentMethod: Object.keys(paymentMethodData).map(method => ({
        name: method,
        value: paymentMethodData[method]
      })).sort((a, b) => b.value - a.value)
    });
  };

  // Get unique years from invoices for the filter
  const getYears = (): number[] => {
    const yearSet = new Set<number>();
    invoices.forEach((inv) => {
      if (inv.purchase_date) {
        const year = new Date(inv.purchase_date).getFullYear();
        yearSet.add(year);
      }
    });
    return Array.from(yearSet).sort((a, b) => b - a); // Sort descending
  };

  if (loading) {
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
                  onClick={() => loadDashboardData()} 
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

  const years = getYears();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Dashboard</h1>
        <div className="flex space-x-3">
          <button 
            onClick={() => loadDashboardData()}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4 mr-1" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
              strokeWidth="2" 
            >
              <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
          <button 
            type="button" 
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4 mr-1" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
              strokeWidth="2" 
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export
          </button>
        </div>
      </div>
      
      {/* Filters Component */}
      <DashboardFilters 
        years={years} 
        selectedYear={selectedYear}
        selectedStatus={selectedStatus}
        activeChart={activeChart}
        onYearChange={(year) => handleFiltersChange(year, selectedStatus)}
        onStatusChange={(status) => handleFiltersChange(selectedYear, status)}
        onChartTypeChange={setActiveChart}
      />
      
      {/* Stats Cards Component */}
      <StatsCards stats={stats} />
      
      {/* Spending Charts Component */}
      <SpendingCharts 
        chartData={chartData.monthly} 
        activeChartType={activeChart} 
      />
      
      {/* Category Charts Component */}
      <CategoryCharts 
        categoryData={chartData.category} 
        statusData={chartData.status}
        paymentMethodData={chartData.paymentMethod}
      />
      
      {/* Recent Invoices Component */}
      <RecentInvoices invoices={filteredInvoices.slice(0, 5)} />
    </div>
  );
};

export default Dashboard;