import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import InvoiceExtractor from "./pages/InvoiceExtractor";
import InvoiceDetail from "./pages/InvoiceDetail";
import PaymentCards from "./components/PaymentCards";
import Wishlist from "./components/Wishlist";

export default function App() {
    return (
        <Router>
            <Navbar />
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/invoices" element={<InvoiceExtractor />} />
                <Route path="/invoice/:id" element={<InvoiceDetail />} />
                <Route path="/payment-cards" element={<PaymentCards />} />
                <Route path="/wishlist" element={<Wishlist />} />
            </Routes>
        </Router>
    );
}