// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './layout/Navbar';
import Footer from './layout/Footer';
import Dashboard from './features/dashboard/Dashboard';
import { InvoiceExtractor } from './features/invoices';
import InvoiceDetail from './features/invoices/InvoiceDetail';
import { Login, Profile, RequestPasswordReset, ResetPassword } from './features/auth';
import ExpenseTrackerPage from './features/expense/ExpenseTrackerPage';
import { Tools } from './features/tools';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-dark-bg">
          <Navbar />
          <main className="flex-grow container mx-auto px-4 py-6">
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