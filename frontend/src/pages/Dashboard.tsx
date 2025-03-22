// src/pages/Dashboard.tsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Area, AreaChart
} from "recharts";

// Typed imports
import { useTheme } from "../hooks/useTheme";
import { fetchInvoices } from "../services/api/invoiceService";
import { fetchCategories } from "../services/api/categoryService";
import { fetchTags } from "../services/api/tagService";
import { Invoice } from "../types/invoice.types";
import { ChartData } from "../types/common.types";
import DashboardCard from "../components/dashboard/StatCard";
import PageContainer from "../components/common/PageContainer";

// Colors for charts
const COLORS = [
  "#4f46e5", "#3730a3", "#6d28d9", "#be185d", "#0284c7", 
  "#0891b2", "#4338ca", "#db2777", "#0ea5e9", "#14b8a6"
];

const Dashboard: React.FC = () => {
  const { darkMode } = useTheme();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<string | number>(new Date().getFullYear());
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
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
        setLoading(true);
        setError(null);
        
        // Fetch invoices, categories, and tags
        const [invoicesData, categoriesData, tagsData] = await Promise.all([
          fetchInvoices(),
          fetchCategories(),
          fetchTags()
        ]);
        
        setInvoices(invoicesData || []);
        setCategories(categoriesData || []);
        setTags(tagsData || []);
        
        // Calculate dashboard statistics
        calculateStatistics(invoicesData || []);
        
        setLoading(false);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        setError("Failed to load dashboard data. Please try again.");
        setLoading(false);
      }
    }
    
    loadDashboardData();
  }, []);

  // Calculate statistics from invoice data
  const calculateStatistics = (invoiceData: Invoice[]) => {
    if (!invoiceData || invoiceData.length === 0) {
      return;
    }
    
    const totalAmount = invoiceData.reduce((sum, inv) => {
      return sum + (parseFloat(inv.grand_total?.toString() || "0") || 0);
    }, 0);
    
    const openInvoices = invoiceData.filter(inv => inv.status === "Open").length;
    const paidInvoices = invoiceData.filter(inv => inv.status === "Paid").length;
    
    setStats({
      totalInvoices: invoiceData.length,
      totalAmount,
      openInvoices,
      paidInvoices,
      averageInvoiceAmount: invoiceData.length > 0 ? totalAmount / invoiceData.length : 0
    });
  };

  // Filter invoices based on selected year and status
  const getFilteredInvoices = (): Invoice[] => {
    return invoices.filter(inv => {
      // Year filter
      const invYear = inv.purchase_date ? new Date(inv.purchase_date).getFullYear() : null;
      const yearMatch = selectedYear === "All" || invYear === parseInt(selectedYear.toString());
      
      // Status filter
      const statusMatch = selectedStatus === "All" || inv.status === selectedStatus;
      
      return yearMatch && statusMatch;
    });
  };

  // Prepare data for charts
  const getChartData = (): {
    monthly: ChartData[];
    category: ChartData[];
    status: ChartData[];
    paymentMethod: ChartData[];
  } => {
    const filteredInvoices = getFilteredInvoices();
    
    // Monthly spending data
    const monthlyData: Record<string, number> = {};
    filteredInvoices.forEach(inv => {
      if (inv.purchase_date) {
        const date = new Date(inv.purchase_date);
        const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        
        if (!monthlyData[monthYear]) {
          monthlyData[monthYear] = 0;
        }
        monthlyData[monthYear] += parseFloat(inv.grand_total?.toString() || "0") || 0;
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
          categoryData[cat] += parseFloat(inv.grand_total?.toString() || "0") || 0;
        });
      } else {
        if (!categoryData["Uncategorized"]) {
          categoryData["Uncategorized"] = 0;
        }
        categoryData["Uncategorized"] += parseFloat(inv.grand_total?.toString() || "0") || 0;
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
    
    // Payment method data
    const paymentMethodData: Record<string, number> = {};
    filteredInvoices.forEach(inv => {
      const method = inv.payment_method || "Unknown";
      if (!paymentMethodData[method]) {
        paymentMethodData[method] = 0;
      }
      paymentMethodData[method] += parseFloat(inv.grand_total?.toString() || "0") || 0;
    });
    
    return {
      monthly: Object.keys(monthlyData).map(month => ({
        name: month,
        value: monthlyData[month]
      })).sort((a, b) => a.name.localeCompare(b.name)),
      
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
    };
  };

  // Get unique years from invoices for the filter
  const getYears = (): number[] => {
    const yearSet = new Set<number>();
    invoices.forEach(inv => {
      if (inv.purchase_date) {
        const year = new Date(inv.purchase_date).getFullYear();
        yearSet.add(year);
      }
    });
    return Array.from(yearSet).sort((a, b) => b - a); // Sort descending
  };

  // Get unique statuses from invoices for the filter
  const getStatuses = (): string[] => {
    const statusSet = new Set<string>();
    invoices.forEach(inv => {
      if (inv.status) {
        statusSet.add(inv.status);
      }
    });
    return Array.from(statusSet);
  };

  // Format currency
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
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

  const chartData = getChartData();
  const years = getYears();
  const statuses = getStatuses();

  return (
    <PageContainer title="Dashboard">
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
      
      {/* Rest of dashboard components */}
      {/* Note: For brevity, I've included just the stat cards section */}
    </PageContainer>
  );
};

export default Dashboard;