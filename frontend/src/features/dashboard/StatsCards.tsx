// src/features/dashboard/StatsCards.tsx
import React from 'react';
import { DashboardStats, formatCurrency } from './types';

interface StatsCardsProps {
  stats: DashboardStats;
}

const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  // Calculate completion rate percentage
  const completionRate = stats.totalInvoices > 0 
    ? Math.round((stats.paidInvoices / stats.totalInvoices) * 100) 
    : 0;

  return (
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
          <h3 className="text-3xl font-bold text-white">{completionRate}%</h3>
          <p className="text-white text-opacity-90 font-medium">Completion Rate</p>
          <div className="mt-3 bg-white/10 h-1.5 rounded-full w-full overflow-hidden">
            <div 
              className="h-full bg-white rounded-full" 
              style={{ width: `${completionRate}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsCards;