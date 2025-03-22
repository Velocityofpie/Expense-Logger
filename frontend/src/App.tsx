// src/App.tsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/navigation/Navbar";
import DashboardContainer from "./containers/DashboardContainer";
import InvoiceExtractor from "./pages/InvoiceExtractor";
import InvoiceDetail from "./pages/InvoiceDetail";
import PaymentCards from "./components/PaymentCards";
import Wishlist from "./components/Wishlist";
import Tools from "./pages/Tools";
import { ThemeProvider } from "./context/ThemeContext";

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <div className="min-h-screen transition-colors duration-200">
        <Router>
          <Navbar />
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Routes>
              <Route path="/" element={<DashboardContainer />} />
              <Route path="/dashboard" element={<DashboardContainer />} />
              <Route path="/invoices" element={<InvoiceExtractor />} />
              <Route path="/invoice/:id" element={<InvoiceDetail />} />
              <Route path="/payment-cards" element={<PaymentCards />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/tools" element={<Tools />} />
            </Routes>
          </div>
        </Router>
      </div>
    </ThemeProvider>
  );
};

export default App;