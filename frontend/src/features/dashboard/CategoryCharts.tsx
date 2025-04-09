// src/features/dashboard/CategoryCharts.tsx
import React, { useContext, useState } from 'react';
import { 
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts";
import { ThemeContext } from '../../context/ThemeContext';
import { ChartDataPoint } from './types';

// Define explicit chart colors - these will override any inherited styles
const CHART_COLORS = [
  "#4f46e5", // indigo
  "#3b82f6", // blue
  "#06b6d4", // cyan
  "#10b981", // emerald
  "#f59e0b", // amber
  "#ef4444", // red
  "#ec4899", // pink
  "#8b5cf6", // violet
  "#f97316", // orange
  "#84cc16"  // lime
];

// Format currency for display
const formatCurrency = (value: any) => {
  if (value === undefined || value === null) return '$0.00';
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(numValue);
};

// Format percentage for display
const formatPercentage = (value: any, total: number) => {
  if (value === undefined || value === null || total === 0) return '0%';
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return `${((numValue / total) * 100).toFixed(1)}%`;
};

// Default demo data
const DEFAULT_CATEGORY_DATA = [
  { name: 'PC Setup', value: 2500 },
  { name: 'Camera', value: 1200 },
  { name: 'Software', value: 800 },
  { name: 'Travel', value: 500 }
];

const DEFAULT_PAYMENT_DATA = [
  { name: 'Visa ending in 7786', value: 1400 },
  { name: 'Visa ending in 3393', value: 700 },
  { name: 'Unknown', value: 3000 }
];

const DEFAULT_STATUS_DATA = [
  { name: 'Open', value: 5 },
  { name: 'Paid', value: 10 },
  { name: 'Draft', value: 2 }
];

interface CategoryChartsProps {
  categoryData?: ChartDataPoint[];
  statusData?: ChartDataPoint[];
  paymentMethodData?: ChartDataPoint[];
}

const CategoryCharts: React.FC<CategoryChartsProps> = ({ 
  categoryData = DEFAULT_CATEGORY_DATA, 
  statusData = DEFAULT_STATUS_DATA,
  paymentMethodData = DEFAULT_PAYMENT_DATA
}) => {
  const { darkMode } = useContext(ThemeContext);
  // Separate state for each chart's display mode
  const [showPiePercentage, setShowPiePercentage] = useState<boolean>(false);
  const [showBarPercentage, setShowBarPercentage] = useState<boolean>(false);
  
  // Calculate totals for percentage display
  const categoryTotal = categoryData.reduce((sum, item) => sum + item.value, 0);
  const paymentTotal = paymentMethodData.reduce((sum, item) => sum + item.value, 0);
  
  // Define colors based on theme
  const textColor = darkMode ? "#E5E7EB" : "#374151";
  const gridColor = darkMode ? "#374151" : "#E5E7EB";
  const backgroundColor = darkMode ? "#1F2937" : "#FFFFFF";
  const borderColor = darkMode ? "#374151" : "#E5E7EB";
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {/* Category Spending Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Spending by Category</h2>
          <div className="flex items-center">
            <button
              onClick={() => setShowPiePercentage(!showPiePercentage)}
              className="px-3 py-1 text-xs font-medium rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              {showPiePercentage ? 'Show Values' : 'Show Percentages'}
            </button>
          </div>
        </div>
        <div className="p-6" style={{ height: '320px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
                nameKey="name"
                stroke="#FFFFFF"
                strokeWidth={1}
              >
                {categoryData.map((entry, index) => {
                  // Use modulo to cycle through colors if there are more data points than colors
                  const colorIndex = index % CHART_COLORS.length;
                  return (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={CHART_COLORS[colorIndex]}
                      stroke={CHART_COLORS[colorIndex]}
                      style={{ fill: CHART_COLORS[colorIndex] }} 
                    />
                  );
                })}
              </Pie>
              <Tooltip 
                formatter={(value) => 
                  showPiePercentage 
                    ? formatPercentage(value, categoryTotal) 
                    : formatCurrency(value)
                } 
                contentStyle={{ 
                  backgroundColor: backgroundColor, 
                  borderColor: borderColor,
                  color: textColor
                }}
              />
              <Legend 
                formatter={(value, entry, index) => {
                  const item = categoryData[index % categoryData.length];
                  return (
                    <span style={{ color: textColor }}>
                      {value} {showPiePercentage 
                        ? ` (${formatPercentage(item.value, categoryTotal)})` 
                        : ` (${formatCurrency(item.value)})`}
                    </span>
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Payment Methods Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Payment Methods</h2>
          <div className="flex items-center">
            <button
              onClick={() => setShowBarPercentage(!showBarPercentage)}
              className="px-3 py-1 text-xs font-medium rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              {showBarPercentage ? 'Show Values' : 'Show Percentages'}
            </button>
          </div>
        </div>
        <div className="p-6" style={{ height: '320px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={paymentMethodData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis 
                type="number" 
                tick={{ fill: textColor }}
                tickFormatter={(value) => showBarPercentage 
                  ? formatPercentage(value, paymentTotal) 
                  : formatCurrency(value)
                }
              />
              <YAxis 
                type="category" 
                dataKey="name" 
                tick={{ fill: textColor }}
                width={120}
              />
              <Tooltip 
                formatter={(value) => 
                  showBarPercentage 
                    ? formatPercentage(value, paymentTotal) 
                    : formatCurrency(value)
                } 
                contentStyle={{ 
                  backgroundColor: backgroundColor, 
                  borderColor: borderColor,
                  color: textColor
                }}
              />
              <Bar dataKey="value">
                {paymentMethodData.map((entry, index) => {
                  const colorIndex = index % CHART_COLORS.length;
                  return (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={CHART_COLORS[colorIndex]}
                      style={{ fill: CHART_COLORS[colorIndex] }} 
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default CategoryCharts;