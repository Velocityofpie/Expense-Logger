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
  // State for width mode
  const [widthMode, setWidthMode] = useState<'standard' | 'compact' | 'full'>(
    () => (localStorage.getItem('widthMode') as 'standard' | 'compact' | 'full') || 'compact'
  );
  
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
          <main className={`flex-grow py-6 ${
            widthMode === 'full' ? 'w-full px-4' : 
            widthMode === 'compact' ? 'w-full px-6 max-w-screen-lg mx-auto' : 
            'w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-24'
          }`}>
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