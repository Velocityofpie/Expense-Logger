import React, { useEffect, useState } from "react";
// If you have a custom fetchInvoices, import it:
// import { fetchInvoices } from "../api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const API_URL = "http://127.0.0.1:8000";

function Dashboard() {
  const [invoices, setInvoices] = useState([]);

  // 1) Fetch all invoices on mount
  useEffect(() => {
    async function loadInvoices() {
      try {
        // If you have a custom fetchInvoices function, use that:
        // const result = await fetchInvoices();
        // setInvoices(result.invoices || []);

        // Otherwise, call the endpoint directly:
        const response = await fetch(`${API_URL}/invoices/`);
        const data = await response.json();
        setInvoices(data.invoices || []);
      } catch (error) {
        console.error("Error fetching invoices:", error);
      }
    }
    loadInvoices();
  }, []);

  // ─────────────────────────────────────────────────────────
  // 2) Build data for the BAR chart (spending over time)
  //    We'll sum amounts by "date".
  // ─────────────────────────────────────────────────────────
  const dateMap = {};
  invoices.forEach((inv) => {
    const date = inv.date || "Unknown";
    const amt = parseFloat(inv.amount) || 0;
    if (!dateMap[date]) {
      dateMap[date] = 0;
    }
    dateMap[date] += amt;
  });
  // Convert to array for Recharts
  const barData = Object.keys(dateMap).map((date) => ({
    date,
    total: dateMap[date],
  }));

  // ─────────────────────────────────────────────────────────
  // 3) Build data for the PIE chart (spending by category)
  // ─────────────────────────────────────────────────────────
  const catMap = {};
  invoices.forEach((inv) => {
    const cat = inv.category || "Uncategorized";
    const amt = parseFloat(inv.amount) || 0;
    if (!catMap[cat]) {
      catMap[cat] = 0;
    }
    catMap[cat] += amt;
  });
  // Convert to array for Recharts
  const pieData = Object.keys(catMap).map((cat) => ({
    name: cat,
    value: catMap[cat],
  }));

  // Some color choices for the pie slices
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AA66CC", "#FF4444"];

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Dashboard</h2>

      {/* ─────────────────────────────────────────────────────────
          BAR CHART: Spending Over Time
      ───────────────────────────────────────────────────────── */}
      <h3>Spending Over Time</h3>
      <BarChart width={600} height={300} data={barData}>
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="total" fill="#8884d8" />
      </BarChart>

      {/* ─────────────────────────────────────────────────────────
          PIE CHART: Spending By Category
      ───────────────────────────────────────────────────────── */}
      <h3>Spending By Category</h3>
      <PieChart width={400} height={400}>
        <Pie
          data={pieData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={100}
          label
        >
          {pieData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={COLORS[index % COLORS.length]}
            />
          ))}
        </Pie>
        <Legend />
        <Tooltip />
      </PieChart>
    </div>
  );
}

export default Dashboard;
