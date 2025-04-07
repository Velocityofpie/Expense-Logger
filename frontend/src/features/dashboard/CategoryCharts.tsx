// src/features/dashboard/CategoryCharts.tsx
import React from 'react';
import { 
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts";
import { ChartDataPoint, CHART_COLORS, tooltipFormatter } from './types';

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
                label={(entry) => entry.name}
              >
                {categoryData.slice(0, 7).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={tooltipFormatter} />
              <Legend />
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
              <XAxis type="number" stroke="#6b7280" />
              <YAxis type="category" dataKey="name" stroke="#6b7280" />
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <Tooltip formatter={tooltipFormatter} />
              <Legend />
              <Bar dataKey="value" name="Amount" fill="#3b82f6">
                {paymentMethodData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Optional: Add Status Chart if you want to include it */}
      {/* 
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Invoice Status</h2>
        </div>
        <div className="p-6 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
                nameKey="name"
                label
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => value} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      */}
    </div>
  );
};

export default CategoryCharts;