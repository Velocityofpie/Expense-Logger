import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
// import axios from "axios";  // Remove if not used

export default function Dashboard() {
  // 🔹 Example chart data
  const [spendingTrends, setSpendingTrends] = useState([
    { month: "Jan", totalSpent: 200 },
    { month: "Feb", totalSpent: 300 },
    { month: "Mar", totalSpent: 150 },
  ]);
  const [monthlySpending, setMonthlySpending] = useState([
    { month: "Jan", amount: 500 },
    { month: "Feb", amount: 600 },
    { month: "Mar", amount: 700 },
  ]);
  const [categoryDistribution, setCategoryDistribution] = useState([
    { category: "Office", amount: 300 },
    { category: "Travel", amount: 200 },
    { category: "Food", amount: 100 },
  ]);

  // No need to fetch anything if you have no endpoint
  useEffect(() => {
    // If you had an actual endpoint, you could fetch it here
    // e.g., fetchDashboardData();
  }, []);

  // If you eventually create an endpoint, uncomment:
  // const fetchDashboardData = async () => {
  //   try {
  //     const response = await axios.get("/api/dashboard");
  //     setSpendingTrends(response.data.spendingTrends);
  //     setMonthlySpending(response.data.monthlySpending);
  //     setCategoryDistribution(response.data.categoryDistribution);
  //   } catch (error) {
  //     console.error("Error fetching dashboard data:", error);
  //   }
  // };

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  return (
    <div>
      <h2>Dashboard</h2>

      {/* Overall Spending Trends */}
      <div>
        <h3>Overall Spending Trends</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={spendingTrends}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="totalSpent" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly Spending */}
      <div>
        <h3>Monthly Spending</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlySpending}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="amount" stroke="#82ca9d" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Spending by Category */}
      <div>
        <h3>Spending by Category</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={categoryDistribution}
              dataKey="amount"
              nameKey="category"
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              label
            >
              {categoryDistribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

