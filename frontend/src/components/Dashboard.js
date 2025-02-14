import React, { useEffect, useState } from "react";
import { fetchInvoices } from "../api";
import { LineChart, Line, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from "recharts";

function Dashboard() {
    const [data, setData] = useState([]);

    useEffect(() => {
        async function loadInvoices() {
            const result = await fetchInvoices();
            setData(result.invoices);
        }
        loadInvoices();
    }, []);

    // Transform data for the line chart (spending over time)
    const lineChartData = data.reduce((acc, invoice) => {
        const date = invoice.date;
        if (!acc[date]) acc[date] = { date, total: 0 };
        acc[date].total += invoice.amount;
        return acc;
    }, {});

    const formattedLineData = Object.values(lineChartData);

    // Transform data for the pie chart (spending by category)
    const categoryData = data.reduce((acc, invoice) => {
        if (!acc[invoice.category]) acc[invoice.category] = { name: invoice.category, value: 0 };
        acc[invoice.category].value += invoice.amount;
        return acc;
    }, {});

    const formattedPieData = Object.values(categoryData);

    const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#FF4567"];

    return (
        <div>
            <h2>Spending Dashboard</h2>
            
            {/* Line Chart: Overall Spending Trend */}
            <h3>Overall Spending Trend</h3>
            <LineChart width={600} height={300} data={formattedLineData}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="total" stroke="#8884d8" />
            </LineChart>

            {/* Pie Chart: Spending by Category */}
            <h3>Spending Distribution by Category</h3>
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

export default Dashboard;
