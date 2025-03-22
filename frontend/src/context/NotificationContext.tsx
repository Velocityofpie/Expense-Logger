// src/context/NotificationContext.tsx
import React, { createContext, useReducer, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Notification, ToastVariant, NotificationPosition } from '../types/common.types';

/**
 * Interface for notification state
 */
interface NotificationState {
  notifications: Notification[];
}

/**
 * Type for notification actions
 */
type NotificationAction = 
  | { type: 'ADD_NOTIFICATION'; payload: Omit<Notification, 'id'> }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'CLEAR_ALL_NOTIFICATIONS' };

/**
 * Interface for notification context
 */
interface NotificationContextType extends NotificationState {
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
  showToast: (message: string, variant?: ToastVariant, duration?: number) => void;
  showSuccessToast: (message: string, duration?: number) => void;
  showErrorToast: (message: string, duration?: number) => void;
  showWarningToast: (message: string, duration?: number) => void;
  showInfoToast: (message: string, duration?: number) => void;
}

// Initial state
const initialState: NotificationState = {
  notifications: [],
};

// Create context
export const NotificationContext = createContext<NotificationContextType>({
  ...initialState,
  addNotification: () => {},
  removeNotification: () => {},
  clearAllNotifications: () => {},
  showToast: () => {},
  showSuccessToast: () => {},
  showErrorToast: () => {},
  showWarningToast: () => {},
  showInfoToast: () => {},
});

/**
 * Reducer function to handle notification state changes
 */
const notificationReducer = (
  state: NotificationState, 
  action: NotificationAction
): NotificationState => {
  switch (action.type) {
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [
          ...state.notifications,
          { id: uuidv4(), ...action.payload },
        ],
      };
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(
          (notification) => notification.id !== action.payload
        ),
      };
    case 'CLEAR_ALL_NOTIFICATIONS':
      return {
        ...state,
        notifications: [],
      };
    default:
      return state;
  }
};

/**
 * Default notification settings
 */
const defaultDuration = 5000; // 5 seconds
const defaultPosition: NotificationPosition = 'top-right';

/**
 * Notification provider component
 */
export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);

  /**
   * Add a new notification
   */
  const addNotification = (notification: Omit<Notification, 'id'>): void => {
    const notificationWithDefaults = {
      ...notification,
      duration: notification.duration || defaultDuration,
      position: notification.position || defaultPosition,
      autoClose: notification.autoClose !== false, // Default to true
    };
    
    dispatch({ type: 'ADD_NOTIFICATION', payload: notificationWithDefaults });
    
    // Auto-remove notification after duration if autoClose is true
    if (notificationWithDefaults.autoClose && notificationWithDefaults.duration) {
      setTimeout(() => {
        dispatch({ 
          type: 'REMOVE_NOTIFICATION', 
          payload: notificationWithDefaults.id || uuidv4() 
        });
      }, notificationWithDefaults.duration);
    }
  };

  /**
   * Remove a notification by ID
   */
  const removeNotification = (id: string): void => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
  };

  /**
   * Clear all notifications
   */
  const clearAllNotifications = (): void => {
    dispatch({ type: 'CLEAR_ALL_NOTIFICATIONS' });
  };

  /**
   * Show a toast notification
   */
  const showToast = (
    message: string, 
    variant: ToastVariant = 'info', 
    duration = defaultDuration
  ): void => {
    addNotification({
      message,
      variant,
      duration,
      autoClose: true,
    });
  };

  /**
   * Show a success toast notification
   */
  const showSuccessToast = (message: string, duration = defaultDuration): void => {
    showToast(message, 'success', duration);
  };

  /**
   * Show an error toast notification
   */
  const showErrorToast = (message: string, duration = defaultDuration): void => {
    showToast(message, 'error', duration);
  };

  /**
   * Show a warning toast notification
   */
  const showWarningToast = (message: string, duration = defaultDuration): void => {
    showToast(message, 'warning', duration);
  };

  /**
   * Show an info toast notification
   */
  const showInfoToast = (message: string, duration = defaultDuration): void => {
    showToast(message, 'info', duration);
  };

  // Context value
  const value = {
    notifications: state.notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
    showToast,
    showSuccessToast,
    showErrorToast,
    showWarningToast,
    showInfoToast,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;