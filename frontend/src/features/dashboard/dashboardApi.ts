// dashboard/dashboardApi.ts - Dashboard API calls

import { 
    Invoice, 
    ChartData, 
    CategoryChartData,
    StatusChartData,
    PaymentMethodChartData,
    DashboardStats 
  } from './types';
  
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";
  
  /**
   * Fetch dashboard summary statistics
   */
  export const fetchDashboardStats = async (): Promise<DashboardStats> => {
    try {
      const response = await fetch(`${API_URL}/dashboard/stats`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats');
      }
      
      return await response.json();
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      // Return default stats in case of error
      return {
        totalInvoices: 0,
        totalAmount: 0,
        openInvoices: 0,
        paidInvoices: 0,
        averageInvoiceAmount: 0
      };
    }
  };
  
  /**
   * Fetch recent invoices with optional limit
   */
  export const fetchRecentInvoices = async (limit: number = 5): Promise<Invoice[]> => {
    try {
      const response = await fetch(`${API_URL}/invoices/recent?limit=${limit}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch recent invoices');
      }
      
      return await response.json();
    } catch (error) {
      console.error("Error fetching recent invoices:", error);
      return [];
    }
  };
  
  /**
   * Fetch monthly spending data for charts
   */
  export const fetchMonthlySpending = async (year: number | string = 'current'): Promise<ChartData[]> => {
    try {
      const response = await fetch(`${API_URL}/dashboard/monthly-spending?year=${year}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch monthly spending data');
      }
      
      return await response.json();
    } catch (error) {
      console.error("Error fetching monthly spending:", error);
      return [];
    }
  };
  
  /**
   * Fetch spending by category for charts
   */
  export const fetchSpendingByCategory = async (): Promise<CategoryChartData[]> => {
    try {
      const response = await fetch(`${API_URL}/dashboard/spending-by-category`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch spending by category');
      }
      
      return await response.json();
    } catch (error) {
      console.error("Error fetching spending by category:", error);
      return [];
    }
  };
  
  /**
   * Fetch invoice status distribution for charts
   */
  export const fetchInvoiceStatusDistribution = async (): Promise<StatusChartData[]> => {
    try {
      const response = await fetch(`${API_URL}/dashboard/status-distribution`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch status distribution');
      }
      
      return await response.json();
    } catch (error) {
      console.error("Error fetching invoice status distribution:", error);
      return [];
    }
  };
  
  /**
   * Fetch payment method distribution for charts
   */
  export const fetchPaymentMethodDistribution = async (): Promise<PaymentMethodChartData[]> => {
    try {
      const response = await fetch(`${API_URL}/dashboard/payment-method-distribution`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch payment method distribution');
      }
      
      return await response.json();
    } catch (error) {
      console.error("Error fetching payment method distribution:", error);
      return [];
    }
  };
  
  /**
   * Format currency for display
   */
  export const formatCurrency = (value: number | string | undefined): string => {
    if (value === undefined || value === null) return "$0.00";
    
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(numValue);
  };