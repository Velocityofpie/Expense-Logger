import React, { useEffect, useState } from "react";
import { fetchInvoices } from "../api";
import { LineChart, Line, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from "recharts";

const API_URL = "http://127.0.0.1:8000";
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#FF4567", "#A28BEA"];

export default function Dashboard() {
    const [invoices, setInvoices] = useState([]);
    
    useEffect(() => {
        async function loadInvoices() {
            const response = await fetch(`${API_URL}/invoices/`);
            const data = await response.json();
            setInvoices(data.invoices);
        }
        loadInvoices();
    }, []);

    // 🔹 Transform data for the line chart (Overall Spending Trend)
    const lineChartData = invoices.reduce((acc, invoice) => {
        if (!invoice.date) return acc;
        const date = invoice.date.substring(0, 7); // Extract YYYY-MM for monthly aggregation
        if (!acc[date]) acc[date] = { date, total: 0 };
        acc[date].total += parseFloat(invoice.amount || 0);
        return acc;
    }, {});

    const formattedLineData = Object.values(lineChartData).sort((a, b) => a.date.localeCompare(b.date));

    // 🔹 Transform data for the pie chart (Spending by Category)
    const categoryData = invoices.reduce((acc, invoice) => {
        if (!invoice.category) return acc;
        if (!acc[invoice.category]) acc[invoice.category] = { name: invoice.category, value: 0 };
        acc[invoice.category].value += parseFloat(invoice.amount || 0);
        return acc;
    }, {});

    const formattedPieData = Object.values(categoryData);

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">Spending Dashboard</h2>

            {/* 🔹 Line Chart: Monthly Spending Trend */}
            <h3 className="text-lg font-bold mt-4">Overall Spending Trend</h3>
            <LineChart width={600} height={300} data={formattedLineData}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="total" stroke="#8884d8" />
            </LineChart>

            {/* 🔹 Pie Chart: Spending Distribution by Category */}
            <h3 className="text-lg font-bold mt-4">Spending by Category</h3>
            <PieChart width={400} height={400}>
                <Pie data={formattedPieData} cx="50%" cy="50%" outerRadius={100} label>
                    {formattedPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Legend />
            </PieChart>
        </div>
    );
}
