// src/App.tsx - Using centralized layout styles
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './layout/Navbar';
import Footer from './layout/Footer';
import Dashboard from './features/dashboard/Dashboard';
import { InvoiceExtractor } from './features/invoices';
import { InvoiceDetail } from './features/invoiceDetails';
import { Login, Profile, RequestPasswordReset, ResetPassword } from './features/auth';
import ExpenseTrackerPage from './features/expense/ExpenseTrackerPage';
import { Tools } from './features/tools';
import { loadWidthMode, getWidthModeClasses, WidthMode } from './utils/layoutStyles';

const App: React.FC = () => {
  // State for width mode
  const [widthMode, setWidthMode] = useState<WidthMode>(loadWidthMode);
  
  // Listen for width mode changes
  useEffect(() => {
    const handleWidthModeChange = (e: CustomEvent) => {
      setWidthMode(e.detail.widthMode);
    };
    
    window.addEventListener('widthmodechange', handleWidthModeChange as EventListener);
    
    return () => {
      window.removeEventListener('widthmodechange', handleWidthModeChange as EventListener);
    };
  }, []);

  return (
    <ThemeProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-dark-bg">
          <Navbar />
          <main className={`flex-grow py-6 ${getWidthModeClasses(widthMode)}`}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/invoices" element={<InvoiceExtractor />} />
              <Route path="/invoice/:id" element={<InvoiceDetail />} />
              <Route path="/expenses" element={<ExpenseTrackerPage />} />
              <Route path="/tools" element={<Tools />} />
              <Route path="/login" element={<Login />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/request-password-reset" element={<RequestPasswordReset />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </ThemeProvider>
  );
};

export default App;