// src/features/dashboard/SpendingCharts.tsx
import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from "recharts";
import { MonthlyDataPoint, tooltipFormatter } from './types';

interface SpendingChartsProps {
  chartData: MonthlyDataPoint[];
  activeChartType: 'monthly' | 'area';
}

const SpendingCharts: React.FC<SpendingChartsProps> = ({ 
  chartData, 
  activeChartType 
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      <div className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Spending Over Time</h2>
        </div>
        <div className="p-6 h-80">
          <ResponsiveContainer width="100%" height="100%">
            {activeChartType === 'monthly' ? (
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip formatter={tooltipFormatter} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  name="Monthly Spending"
                  stroke="#4f46e5" 
                  strokeWidth={3}
                  activeDot={{ r: 8 }} 
                />
              </LineChart>
            ) : (
              <AreaChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip formatter={tooltipFormatter} />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="amount" 
                  name="Monthly Spending"
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
  );
};

export default SpendingCharts;