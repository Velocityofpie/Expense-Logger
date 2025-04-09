// src/App.tsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './layout/Navbar';
import Footer from './layout/Footer';
import Dashboard from './features/dashboard/Dashboard';
import { InvoiceExtractor } from './features/invoices';
import { InvoiceDetail } from './features/invoiceDetails'; // Updated import
import { Login, Profile, RequestPasswordReset, ResetPassword } from './features/auth';
import ExpenseTrackerPage from './features/expense/ExpenseTrackerPage';
import { Tools } from './features/tools';

const App: React.FC = () => {
  // State for wide mode
  const [wideMode, setWideMode] = useState(true);
  
  // Listen for wide mode changes
  useEffect(() => {
    const handleWideModeChange = (e: CustomEvent) => {
      setWideMode(e.detail.wideMode);
    };
    
    window.addEventListener('widemodechange', handleWideModeChange as EventListener);
    
    return () => {
      window.removeEventListener('widemodechange', handleWideModeChange as EventListener);
    };
  }, []);

  return (
    <ThemeProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-dark-bg">
          <Navbar />
          <main className={`flex-grow ${wideMode ? 'w-full px-4' : 'container mx-auto px-6'} py-6`}>
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