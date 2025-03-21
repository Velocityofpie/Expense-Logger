// frontend/src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import InvoiceExtractor from "./pages/InvoiceExtractor";
import InvoiceDetail from "./pages/InvoiceDetail";
import PaymentCards from "./components/PaymentCards";
import Wishlist from "./components/Wishlist";
import Tools from "./pages/Tools"; // Import the new Tools page
import { ThemeProvider } from "./context/ThemeContext";

export default function App() {
    return (
        <ThemeProvider>
            <div className="min-h-screen transition-colors duration-200">
                <Router>
                    <Navbar />
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <Routes>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/invoices" element={<InvoiceExtractor />} />
                            <Route path="/invoice/:id" element={<InvoiceDetail />} />
                            <Route path="/payment-cards" element={<PaymentCards />} />
                            <Route path="/wishlist" element={<Wishlist />} />
                            <Route path="/tools" element={<Tools />} /> {/* New Tools route */}
                        </Routes>
                    </div>
                </Router>
            </div>
        </ThemeProvider>
    );
}