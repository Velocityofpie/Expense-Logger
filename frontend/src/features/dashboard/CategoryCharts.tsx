// src/features/dashboard/CategoryCharts.tsx
import React, { useContext } from 'react';
import { 
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts";
import { ThemeContext } from '../../context/ThemeContext';
import { ChartDataPoint, CHART_COLORS } from './types';

// Format currency for display
const formatCurrency = (value: any) => {
  if (value === undefined || value === null) return '$0.00';
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(numValue);
};

interface CategoryChartsProps {
  categoryData: ChartDataPoint[];
  statusData: ChartDataPoint[];
  paymentMethodData: ChartDataPoint[];
}

const CategoryCharts: React.FC<CategoryChartsProps> = ({ 
  categoryData, 
  statusData,
  paymentMethodData
}) => {
  const { darkMode } = useContext(ThemeContext);
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {/* Category Spending Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Spending by Category</h2>
        </div>
        <div className="p-6 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData.slice(0, 7)} // Show only top 7 categories
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
                nameKey="name"
              >
                {categoryData.slice(0, 7).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => formatCurrency(value)} 
                contentStyle={{ 
                  backgroundColor: darkMode ? '#1F2937' : '#fff', 
                  borderColor: darkMode ? '#374151' : '#e5e7eb' 
                }} 
              />
              <Legend 
                formatter={(value) => (
                  <span style={{ color: darkMode ? '#E5E7EB' : '#374151' }}>
                    {value}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Payment Methods Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Payment Methods</h2>
        </div>
        <div className="p-6 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={paymentMethodData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
            >
              <XAxis 
                type="number" 
                stroke={darkMode ? "#9CA3AF" : "#6b7280"} 
              />
              <YAxis 
                type="category" 
                dataKey="name" 
                stroke={darkMode ? "#9CA3AF" : "#6b7280"} 
              />
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke={darkMode ? "#374151" : "#f0f0f0"} 
              />
              <Tooltip 
                formatter={(value) => formatCurrency(value)} 
                contentStyle={{ 
                  backgroundColor: darkMode ? '#1F2937' : '#fff', 
                  borderColor: darkMode ? '#374151' : '#e5e7eb' 
                }} 
              />
              <Bar dataKey="value" fill="#3b82f6">
                {paymentMethodData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default CategoryCharts;