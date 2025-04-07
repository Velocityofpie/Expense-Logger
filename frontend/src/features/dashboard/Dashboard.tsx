// src/features/dashboard/Dashboard.tsx - Fixed version
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from "recharts";
import { fetchInvoices, fetchCategories, fetchTags } from "../../services/api";
import "./dashboard.css";

// Define TypeScript interfaces
interface InvoiceItem {
  product_name: string;
  quantity: number;
  unit_price: number;
  item_type?: string;
}

interface Invoice {
  invoice_id: number;
  merchant_name: string;
  order_number?: string;
  purchase_date?: string;
  payment_method?: string;
  status: string;
  grand_total: number;
  categories?: string[];
  items?: InvoiceItem[];
  tags?: string[];
}

interface ChartDataPoint {
  name: string;
  value: number;
}

interface MonthlyDataPoint {
  month: string;
  amount: number;
}

interface DashboardStats {
  totalInvoices: number;
  totalAmount: number;
  openInvoices: number;
  paidInvoices: number;
  averageInvoiceAmount: number;
}

interface ChartData {
  monthly: MonthlyDataPoint[];
  category: ChartDataPoint[];
  status: ChartDataPoint[];
  paymentMethod: ChartDataPoint[];
}

// Colors for charts
const COLORS = [
  "#4f46e5", "#3730a3", "#6d28d9", "#be185d", "#0284c7", 
  "#0891b2", "#4338ca", "#db2777", "#0ea5e9", "#14b8a6"
];

const Dashboard = () => {
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

  // Format currency
  const formatCurrency = (value: number | string | undefined): string => {
    if (value === undefined) return '$0.00';
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(numValue);
  };

  // Format currency for tooltip
  const tooltipFormatter = (value: any) => {
    return formatCurrency(typeof value === 'number' ? value : 0);
  };

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Mock data for development - remove and use the API calls in production
      const mockInvoices = generateMockInvoices();
      setInvoices(mockInvoices);
      setFilteredInvoices(mockInvoices);
      
      // Set mock categories and tags
      setCategories(['Electronics', 'Office Supplies', 'Software', 'Travel', 'Utilities']);
      setTags(['Business', 'Personal', 'Tax Deductible', 'Recurring', 'One-time']);
      
      // Calculate statistics
      calculateStatistics(mockInvoices);
      
      // Generate chart data
      generateChartData(mockInvoices);
      
      setIsLoading(false);
    } catch (err) {
      console.error("Error loading dashboard data:", err);
      setError("Failed to load dashboard data. Please try again.");
      setIsLoading(false);
    }
  };

  // Generate mock invoices for development
  const generateMockInvoices = (): Invoice[] => {
    const statuses = ["Open", "Paid", "Needs Attention", "Draft"];
    const merchants = ["Amazon", "Walmart", "Best Buy", "Apple", "Microsoft", "Uber", "Staples"];
    const paymentMethods = ["Credit Card", "PayPal", "Bank Transfer", "Cash"];
    const categories = ["Electronics", "Office Supplies", "Software", "Travel", "Utilities"];
    
    const mockInvoices: Invoice[] = Array.from({ length: 20 }, (_, i) => {
      const year = Math.random() > 0.7 ? 2023 : 2024;
      const month = Math.floor(Math.random() * 12) + 1;
      const day = Math.floor(Math.random() * 28) + 1;
      
      return {
        invoice_id: i + 1,
        merchant_name: merchants[Math.floor(Math.random() * merchants.length)],
        order_number: `ORD-${year.toString().substring(2)}${month.toString().padStart(2, '0')}${(i + 100)}`,
        purchase_date: `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`,
        payment_method: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        grand_total: parseFloat((Math.random() * 1000 + 50).toFixed(2)),
        categories: [categories[Math.floor(Math.random() * categories.length)]],
        items: [{
          product_name: "Sample Product",
          quantity: 1,
          unit_price: 100
        }]
      };
    });
    
    return mockInvoices;
  };

  // Calculate statistics from invoice data
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
      averageInvoiceAmount: totalAmount / invoiceData.length
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

  // Filter invoices based on selected year and status
  const getFilteredInvoices = (): Invoice[] => {
    return invoices.filter((inv) => {
      // Year filter
      const invYear = inv.purchase_date ? new Date(inv.purchase_date).getFullYear() : null;
      const yearMatch = selectedYear === "All" || (invYear !== null && invYear === Number(selectedYear));
      
      // Status filter
      const statusMatch = selectedStatus === "All" || inv.status === selectedStatus;
      
      return yearMatch && statusMatch;
    });
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
  const displayInvoices = getFilteredInvoices();

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
      
      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm px-5 py-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="md:col-span-2">
            <label htmlFor="year" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Filter by Year
            </label>
            <select
              id="year"
              name="year"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            >
              <option value="All">All Years</option>
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Filter by Status
            </label>
            <select
              id="status"
              name="status"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            >
              <option value="All">All Statuses</option>
              <option value="Open">Open</option>
              <option value="Paid">Paid</option>
              <option value="Needs Attention">Needs Attention</option>
              <option value="Draft">Draft</option>
            </select>
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Chart Type
            </label>
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveChart('monthly')}
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-md ${
                  activeChart === 'monthly'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </button>
              <button
                onClick={() => setActiveChart('area')}
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-md ${
                  activeChart === 'area'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Total Invoices */}
        <div className="rounded-lg shadow-sm overflow-hidden bg-gradient-to-r from-indigo-500 to-indigo-600">
          <div className="p-5 text-center">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full mb-4 bg-white/20 text-white">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </div>
            <h3 className="text-3xl font-bold text-white">{stats.totalInvoices}</h3>
            <p className="text-white text-opacity-90 font-medium">Total Invoices</p>
          </div>
        </div>
        
        {/* Total Amount */}
        <div className="rounded-lg shadow-sm overflow-hidden bg-gradient-to-r from-purple-500 to-purple-600">
          <div className="p-5 text-center">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full mb-4 bg-white/20 text-white">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <h3 className="text-3xl font-bold text-white">{formatCurrency(stats.totalAmount)}</h3>
            <p className="text-white text-opacity-90 font-medium">Total Amount</p>
          </div>
        </div>
        
        {/* Average Invoice */}
        <div className="rounded-lg shadow-sm overflow-hidden bg-gradient-to-r from-pink-500 to-pink-600">
          <div className="p-5 text-center">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full mb-4 bg-white/20 text-white">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <circle cx="12" cy="14" r="2" />
              </svg>
            </div>
            <h3 className="text-3xl font-bold text-white">{formatCurrency(stats.averageInvoiceAmount)}</h3>
            <p className="text-white text-opacity-90 font-medium">Average Invoice</p>
          </div>
        </div>
        
        {/* Completion Rate */}
        <div className="rounded-lg shadow-sm overflow-hidden bg-gradient-to-r from-blue-500 to-blue-600">
          <div className="p-5 text-center">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full mb-4 bg-white/20 text-white">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h3 className="text-3xl font-bold text-white">
              {stats.totalInvoices > 0 
                ? Math.round((stats.paidInvoices / stats.totalInvoices) * 100) 
                : 0}%
            </h3>
            <p className="text-white text-opacity-90 font-medium">Completion Rate</p>
          </div>
        </div>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Spending Over Time</h2>
          </div>
          <div className="p-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              {activeChart === 'monthly' ? (
                <LineChart
                  data={chartData.monthly}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip formatter={tooltipFormatter} />
                  <Line 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#4f46e5" 
                    strokeWidth={3}
                    activeDot={{ r: 8 }} 
                  />
                </LineChart>
              ) : (
                <AreaChart
                  data={chartData.monthly}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip formatter={tooltipFormatter} />
                  <Area 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#4f46e5"
                    strokeWidth={2}
                    fillOpacity={0.3}
                    fill="#4f46e5" 
                  />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Invoice Status</h2>
          </div>
          <div className="p-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData.status}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.status.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={tooltipFormatter} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Spending by Category</h2>
          </div>
          <div className="p-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData.category.slice(0, 7)} // Show only top 7 categories
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.category.slice(0, 7).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={tooltipFormatter} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Payment Methods</h2>
          </div>
          <div className="p-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData.paymentMethod}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
              >
                <XAxis type="number" stroke="#6b7280" />
                <YAxis type="category" dataKey="name" stroke="#6b7280" />
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <Tooltip formatter={tooltipFormatter} />
                <Bar dataKey="value" fill="#3b82f6">
                  {chartData.paymentMethod.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Recent Invoices */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Recent Invoices</h2>
          <Link 
            to="/invoices" 
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-900 dark:text-indigo-200 dark:hover:bg-indigo-800"
          >
            View All
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Order #</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Merchant</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Categories</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {displayInvoices.length > 0 ? (
                displayInvoices.slice(0, 5).map((invoice) => (
                  <tr key={invoice.invoice_id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link 
                        to={`/invoice/${invoice.invoice_id}`} 
                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 font-medium"
                      >
                        {invoice.order_number || "-"}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {invoice.purchase_date ? new Date(invoice.purchase_date).toLocaleDateString() : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <div className="max-w-xs truncate">
                        {invoice.merchant_name || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                      {formatCurrency(invoice.grand_total || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        invoice.status === "Paid" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" :
                        invoice.status === "Open" ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" :
                        invoice.status === "Needs Attention" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" :
                        "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                      }`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {invoice.categories && invoice.categories.length > 0 ? (
                          invoice.categories.slice(0, 2).map((category, idx) => (
                            <span 
                              key={idx} 
                              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"
                            >
                              {category}
                            </span>
                          ))
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                            Uncategorized
                          </span>
                        )}
                        {invoice.categories && invoice.categories.length > 2 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                            +{invoice.categories.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-gray-500 dark:text-gray-400">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-10 w-10 mx-auto mb-2 text-gray-400 dark:text-gray-500" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={1} 
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" 
                      />
                    </svg>
                    <p className="mt-2">No invoices found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;