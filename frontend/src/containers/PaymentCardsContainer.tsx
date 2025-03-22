// src/containers/PaymentCardsContainer.tsx
import React, { useState, useEffect } from 'react';
import PaymentCards from '../components/payment/PaymentCards';
import PageContainer from '../components/common/PageContainer';
import { Alert } from '../components/common/Feedback/Alert';
import { Spinner } from '../components/common/Feedback/Spinner';

const PaymentCardsContainer: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>('');
  
  // Simulate loading data
  useEffect(() => {
    // In a real app, you would fetch data here
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Handler for error messages
  const handleError = (errorMessage: string): void => {
    setError(errorMessage);
    
    // Auto-clear error after 5 seconds
    setTimeout(() => {
      setError(null);
    }, 5000);
  };
  
  // Handler for success messages
  const handleSuccess = (message: string): void => {
    setSuccessMessage(message);
    
    // Auto-clear success message after 5 seconds
    setTimeout(() => {
      setSuccessMessage('');
    }, 5000);
  };
  
  return (
    <PageContainer title="Payment Cards Management">
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          {error && (
            <div className="mb-6">
              <Alert
                type="error"
                message={error}
                onClose={() => setError(null)}
              />
            </div>
          )}
          
          {successMessage && (
            <div className="mb-6">
              <Alert
                type="success"
                message={successMessage}
                onClose={() => setSuccessMessage('')}
              />
            </div>
          )}
          
          <PaymentCards />
        </>
      )}
    </PageContainer>
  );
};

export default PaymentCardsContainer;