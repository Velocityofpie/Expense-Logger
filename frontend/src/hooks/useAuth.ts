// src/hooks/useAuth.ts
import { useContext } from 'react';
import { AuthContext, AuthContextProps } from '../context/AuthContext';

export const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default useAuth;