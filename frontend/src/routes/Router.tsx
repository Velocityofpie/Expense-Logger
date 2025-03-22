// src/routes/Router.tsx
import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Layout Component
import NavbarContainer from '../components/navigation/NavbarContainer';
import PageContainer from '../components/common/PageContainer';

// Lazy-loaded page components
const Dashboard = lazy(() => import('../pages/Dashboard'));
const InvoiceExtractor = lazy(() => import('../pages/InvoiceExtractor'));
const InvoiceDetail = lazy(() => import('../pages/InvoiceDetail'));
const Tools = lazy(() => import('../pages/Tools'));
const Login = lazy(() => import('../pages/Login'));
const CategoryPage = lazy(() => import('../pages/CategoryPage'));
const PaymentCardsContainer = lazy(() => import('../containers/PaymentCardsContainer'));
const TemplateManagerContainer = lazy(() => import('../containers/TemplateManagerContainer'));
const WishlistContainer = lazy(() => import('../containers/WishlistContainer'));

// Route guard for authenticated routes
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Loading fallback
const LoadingFallback = () => (
  <div className="flex justify-center items-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
  </div>
);

const Router: React.FC = () => {
  return (
    <BrowserRouter>
      <NavbarContainer />
      <Suspense fallback={<LoadingFallback />}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            
            {/* Protected routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/invoices" element={
              <ProtectedRoute>
                <InvoiceExtractor />
              </ProtectedRoute>
            } />
            <Route path="/invoice/:id" element={
              <ProtectedRoute>
                <InvoiceDetail />
              </ProtectedRoute>
            } />
            <Route path="/payment-cards" element={
              <ProtectedRoute>
                <PaymentCardsContainer />
              </ProtectedRoute>
            } />
            <Route path="/templates" element={
              <ProtectedRoute>
                <TemplateManagerContainer />
              </ProtectedRoute>
            } />
            <Route path="/wishlist" element={
              <ProtectedRoute>
                <WishlistContainer />
              </ProtectedRoute>
            } />
            <Route path="/categories" element={
              <ProtectedRoute>
                <CategoryPage />
              </ProtectedRoute>
            } />
            <Route path="/tools" element={
              <ProtectedRoute>
                <Tools />
              </ProtectedRoute>
            } />
            
            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Suspense>
    </BrowserRouter>
  );
};

export default Router;