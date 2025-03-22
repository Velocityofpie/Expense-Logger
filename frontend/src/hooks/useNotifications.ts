// src/hooks/useNotifications.ts
import { useContext } from 'react';
import { NotificationContext, NotificationContextProps } from '../context/NotificationContext';

export const useNotifications = (): NotificationContextProps => {
  const context = useContext(NotificationContext);
  
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  
  return context;
};

export default useNotifications;