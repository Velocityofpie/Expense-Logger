// src/features/dashboard/Dashboard.tsx
import React, { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { ThemeContext } from "../../context/ThemeContext";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Area, AreaChart
} from "recharts";
import DashboardCard from "./DashboardCard";
import RecentInvoices from "./RecentInvoices";
import SpendingChart from "./SpendingChart";
import { fetchInvoices, fetchCategories, fetchTags } from "../../services/api";
import "./dashboard.css";

// Colors for charts
const COLORS = [
  "#4f46e5", "#3730a3", "#6d28d9", "#be185d", "#0284c7", 
  "#0891b2", "#4338ca", "#db2777", "#0ea5e9", "#14b8a6"
];

interface DashboardProps {
  userId?: string;
}

interface DashboardStats {
  totalInvoices: number;
  totalAmount: number;
  openInvoices: number;
  paidInvoices: number;
  averageInvoiceAmount: number;
}

interface ChartData {
  monthly: {
    month: string;
    amount: number;
  }[];
  category: {
    name: string;
    value: number;
  }[];
  status: {
    name: string;
    value: number;
  }[];
  paymentMethod: {
    name: string;
    value: number;
  }[];
}

const Dashboard: React.FC<DashboardProps> = ({ userId }) => {
  const { darkMode } = useContext(ThemeContext);
  const [invoices, setInvoices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeChart, setActiveChart] = useState('monthly');
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
  }, [userId]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch data from API
      const [invoicesData, categoriesData, tagsData] = await Promise.all([
        fetchInvoices(0, 100, userId),
        fetchCategories(),
        fetchTags()
      ]);
      
      setInvoices(invoicesData);
      setCategories(categoriesData);
      setTags(tagsData);
      
      // Calculate statistics
      calculateStatistics(invoicesData);
      
      // Generate chart data
      generateChartData(invoicesData);
      
      setLoading(false);
    } catch (err) {
      console.error("Error loading dashboard data:", err);
      setError("Failed to load dashboard data. Please try again.");
      setLoading(false);
    }
  };

  // Calculate statistics from invoice data
  const calculateStatistics = (invoiceData: any[]) => {
    if (!invoiceData || invoiceData.length === 0) {
      return;
    }
    
    const totalAmount = invoiceData.reduce((sum, inv) => {
      return sum + (parseFloat(inv.grand_total) || 0);
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
  const generateChartData = (invoiceData: any[]) => {
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
        monthlyData[monthYear] += parseFloat(inv.grand_total) || 0;
      }
    });
    
    // Category data
    const categoryData: Record<string, number> = {};
    invoiceData.forEach(inv => {
      if (inv.categories && inv.categories.length > 0) {
        inv.categories.forEach((cat: string) => {
          if (!categoryData[cat]) {
            categoryData[cat] = 0;
          }
          categoryData[cat] += parseFloat(inv.grand_total) || 0;
        });
      } else {
        if (!categoryData["Uncategorized"]) {
          categoryData["Uncategorized"] = 0;
        }
        categoryData["Uncategorized"] += parseFloat(inv.grand_total) || 0;
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
      paymentMethodData[method] += parseFloat(inv.grand_total) || 0;
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

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  // Get unique years from invoices for the filter
  const getYears = () => {
    const yearSet = new Set<number>();
    invoices.forEach((inv: any) => {
      if (inv.purchase_date) {
        const year = new Date(inv.purchase_date).getFullYear();
        yearSet.add(year);
      }
    });
    return Array.from(yearSet).sort((a, b) => b - a); // Sort descending
  };

  // Filter invoices based on selected year and status
  const getFilteredInvoices = () => {
    return invoices.filter((inv: any) => {
      // Year filter
      const invYear = inv.purchase_date ? new Date(inv.purchase_date).getFullYear() : null;
      const yearMatch = selectedYear === "All" || invYear === parseInt(selectedYear as unknown as string);
      
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
  const filteredInvoices = getFilteredInvoices();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Dashboard</h1>
        <div className="flex space-x-3">
          <button 
            onClick={() => loadDashboardData()}
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
              onChange={(e) => setSelectedYear(e.target.value as unknown as number)}
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
              <option value="Resolved">Resolved</option>
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
        <DashboardCard 
          title="Total Invoices" 
          value={stats.totalInvoices.toString()} 
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          } 
          color="indigo"
        />
        
        <DashboardCard 
          title="Total Amount" 
          value={formatCurrency(stats.totalAmount)} 
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          } 
          color="purple"
        />
        
        <DashboardCard 
          title="Average Invoice" 
          value={formatCurrency(stats.averageInvoiceAmount)} 
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          } 
          color="pink"
        />
        
        <DashboardCard 
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
        />
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <div className="dashboard-chart-container">
            <div className="dashboard-chart-header">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Spending Over Time</h2>
            </div>
            <div className="dashboard-chart-body">
              <ResponsiveContainer width="100%" height="100%">
                {activeChart === 'monthly' ? (
                  <LineChart
                    data={chartData.monthly}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#374151" : "#f0f0f0"} />
                    <XAxis dataKey="month" stroke={darkMode ? "#9CA3AF" : "#6b7280"} />
                    <YAxis stroke={darkMode ? "#9CA3AF" : "#6b7280"} />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} contentStyle={{backgroundColor: darkMode ? '#1F2937' : '#fff', borderColor: darkMode ? '#374151' : '#e5e7eb'}} />
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
                    <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#374151" : "#f0f0f0"} />
                    <XAxis dataKey="month" stroke={darkMode ? "#9CA3AF" : "#6b7280"} />
                    <YAxis stroke={darkMode ? "#9CA3AF" : "#6b7280"} />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} contentStyle={{backgroundColor: darkMode ? '#1F2937' : '#fff', borderColor: darkMode ? '#374151' : '#e5e7eb'}} />
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
        </div>
        
        <div>
          <div className="dashboard-chart-container">
            <div className="dashboard-chart-header">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Invoice Status</h2>
            </div>
            <div className="dashboard-chart-body">
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
                  <Tooltip formatter={(value) => value} contentStyle={{backgroundColor: darkMode ? '#1F2937' : '#fff', borderColor: darkMode ? '#374151' : '#e5e7eb'}} />
                  <Legend 
                    formatter={(value) => <span style={{color: darkMode ? '#E5E7EB' : '#374151'}}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="dashboard-chart-container">
          <div className="dashboard-chart-header">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Spending by Category</h2>
          </div>
          <div className="dashboard-chart-body">
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
                <Tooltip formatter={(value) => formatCurrency(value as number)} contentStyle={{backgroundColor: darkMode ? '#1F2937' : '#fff', borderColor: darkMode ? '#374151' : '#e5e7eb'}} />
                <Legend 
                  formatter={(value) => <span style={{color: darkMode ? '#E5E7EB' : '#374151'}}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="dashboard-chart-container">
          <div className="dashboard-chart-header">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Payment Methods</h2>
          </div>
          <div className="dashboard-chart-body">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData.paymentMethod}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
              >
                <XAxis type="number" stroke={darkMode ? "#9CA3AF" : "#6b7280"} />
                <YAxis type="category" dataKey="name" stroke={darkMode ? "#9CA3AF" : "#6b7280"} />
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#374151" : "#f0f0f0"} />
                <Tooltip formatter={(value) => formatCurrency(value as number)} contentStyle={{backgroundColor: darkMode ? '#1F2937' : '#fff', borderColor: darkMode ? '#374151' : '#e5e7eb'}} />
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
        <RecentInvoices invoices={filteredInvoices.slice(0, 5)} />
      </div>
    </div>
  );
};

export default Dashboard;