// dashboard/SpendingChart.tsx - Spending chart component
import React, { useState, useContext } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { ThemeContext } from '../../context/ThemeContext';
import { ChartData } from './types';
import { formatCurrency } from './dashboardApi';
import './dashboard.css';

interface SpendingChartProps {
  data: ChartData[];
  title?: string;
}

const SpendingChart: React.FC<SpendingChartProps> = ({ 
  data,
  title = "Spending Over Time"
}) => {
  const { darkMode } = useContext(ThemeContext);
  const [chartType, setChartType] = useState<'line' | 'area'>('line');
  
  // Select years from data for the dropdown
  const getYearsFromData = (): number[] => {
    const years = new Set<number>();
    data.forEach(item => {
      const year = parseInt(item.month.split('-')[0]);
      if (!isNaN(year)) {
        years.add(year);
      }
    });
    return Array.from(years).sort((a, b) => b - a); // Sort descending
  };
  
  const years = getYearsFromData();
  const [selectedYear, setSelectedYear] = useState<number | string>(
    years.length > 0 ? years[0] : 'All'
  );
  
  // Filter data by selected year
  const filteredData = selectedYear === 'All' 
    ? data
    : data.filter(item => item.month.startsWith(`${selectedYear}-`));
  
  // Custom tooltip formatter for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded shadow-lg">
          <p className="text-gray-600 dark:text-gray-300">{label}</p>
          <p className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="dashboard-chart-container">
      <div className="dashboard-chart-header flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">{title}</h2>
        
        <div className="flex space-x-4">
          {/* Year filter */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="year-select rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm"
          >
            <option value="All">All Years</option>
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          
          {/* Chart type toggle */}
          <div className="chart-controls">
            <button
              className={`chart-toggle-button ${chartType === 'line' ? 'active' : ''}`}
              onClick={() => setChartType('line')}
            >
              Line
            </button>
            <button
              className={`chart-toggle-button ${chartType === 'area' ? 'active' : ''}`}
              onClick={() => setChartType('area')}
            >
              Area
            </button>
          </div>
        </div>
      </div>
      
      <div className="dashboard-chart-body">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'line' ? (
            <LineChart
              data={filteredData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke={darkMode ? "#374151" : "#f0f0f0"} 
              />
              <XAxis 
                dataKey="month" 
                stroke={darkMode ? "#9CA3AF" : "#6b7280"} 
                padding={{ left: 10, right: 10 }}
              />
              <YAxis 
                stroke={darkMode ? "#9CA3AF" : "#6b7280"}
                tickFormatter={(value) => formatCurrency(value).substring(0, 2) + formatCurrency(value).substring(2)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="amount" 
                stroke="#4f46e5" 
                strokeWidth={3}
                activeDot={{ r: 8 }} 
                dot={{ r: 4 }}
              />
            </LineChart>
          ) : (
            <AreaChart
              data={filteredData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke={darkMode ? "#374151" : "#f0f0f0"} 
              />
              <XAxis 
                dataKey="month" 
                stroke={darkMode ? "#9CA3AF" : "#6b7280"} 
                padding={{ left: 10, right: 10 }}
              />
              <YAxis 
                stroke={darkMode ? "#9CA3AF" : "#6b7280"}
                tickFormatter={(value) => formatCurrency(value).substring(0, 2) + formatCurrency(value).substring(2)}
              />
              <Tooltip content={<CustomTooltip />} />
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
  );
};

export default SpendingChart;