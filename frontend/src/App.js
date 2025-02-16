import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import InvoiceExtractor from "./pages/InvoiceExtractor"; // Make sure this path is correct
import InvoiceDetail from "./pages/InvoiceDetail"; // Ensure this file exists

export default function App() {
    return (
        <Router>
            <Navbar />
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/upload" element={<Upload />} />
                <Route path="/invoices" element={<InvoiceExtractor />} />
                <Route path="/invoice/:id" element={<InvoiceDetail />} />
            </Routes>
        </Router>
    );
}

