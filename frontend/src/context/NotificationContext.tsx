// src/context/NotificationContext.tsx
import React, { createContext, useState, useCallback, ReactNode } from 'react';

// Define notification types
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

// Define the notification interface
export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  title?: string;
  duration?: number;
  autoDismiss?: boolean;
}

// Define the context props interface
export interface NotificationContextProps {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => string;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

// Create the context
export const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

// Define props for the provider component
interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Generate a unique ID for notifications
  const generateId = (): string => {
    return Math.random().toString(36).substring(2, 9);
  };

  // Add a new notification
  const addNotification = useCallback((notification: Omit<Notification, 'id'>): string => {
    const id = generateId();
    const newNotification: Notification = {
      id,
      autoDismiss: true, // Default to auto dismiss
      duration: 5000, // Default duration
      ...notification
    };
    
    setNotifications(prevNotifications => [...prevNotifications, newNotification]);
    
    // Auto-dismiss notification if enabled
    if (newNotification.autoDismiss) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }
    
    return id;
  }, []);

  // Remove a notification by ID
  const removeNotification = useCallback((id: string): void => {
    setNotifications(prevNotifications => 
      prevNotifications.filter(notification => notification.id !== id)
    );
  }, []);

  // Clear all notifications
  const clearNotifications = useCallback((): void => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
        clearNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};