// src/hooks/useNotification.ts
import { useContext } from 'react';
import NotificationContext from '../context/NotificationContext';
import { Notification, ToastVariant, NotificationPosition } from '../types/common.types';

/**
 * Custom hook to easily access the notification context
 * @returns Notification context values and methods
 */
export function useNotification() {
  const context = useContext(NotificationContext);

  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }

  /**
   * Show a toast notification
   * @param message Message to display
   * @param variant Variant of the toast (success, error, warning, info)
   * @param duration Duration in milliseconds
   * @param position Position on the screen
   */
  const showToast = (
    message: string,
    variant: ToastVariant = 'info',
    duration?: number,
    position?: NotificationPosition
  ): void => {
    context.addNotification({
      message,
      variant,
      duration,
      position,
      autoClose: true,
    });
  };

  /**
   * Show a success toast notification
   * @param message Message to display
   * @param duration Duration in milliseconds
   * @param position Position on the screen
   */
  const showSuccess = (
    message: string,
    duration?: number,
    position?: NotificationPosition
  ): void => {
    showToast(message, 'success', duration, position);
  };

  /**
   * Show an error toast notification
   * @param message Message to display
   * @param duration Duration in milliseconds
   * @param position Position on the screen
   */
  const showError = (
    message: string,
    duration?: number,
    position?: NotificationPosition
  ): void => {
    showToast(message, 'error', duration, position);
  };

  /**
   * Show a warning toast notification
   * @param message Message to display
   * @param duration Duration in milliseconds
   * @param position Position on the screen
   */
  const showWarning = (
    message: string,
    duration?: number,
    position?: NotificationPosition
  ): void => {
    showToast(message, 'warning', duration, position);
  };

  /**
   * Show an info toast notification
   * @param message Message to display
   * @param duration Duration in milliseconds
   * @param position Position on the screen
   */
  const showInfo = (
    message: string,
    duration?: number,
    position?: NotificationPosition
  ): void => {
    showToast(message, 'info', duration, position);
  };

  /**
   * Show a detailed notification
   * @param notification Notification object
   */
  const show = (notification: Omit<Notification, 'id'>): void => {
    context.addNotification(notification);
  };

  /**
   * Clear all notifications
   */
  const clearAll = (): void => {
    context.clearAllNotifications();
  };

  /**
   * Remove a specific notification
   * @param id Notification ID
   */
  const remove = (id: string): void => {
    context.removeNotification(id);
  };

  /**
   * Get the current active notifications
   * @returns List of active notifications
   */
  const getActiveNotifications = (): Notification[] => {
    return context.notifications;
  };

  return {
    // Simple toast methods
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    
    // More detailed notification methods
    show,
    remove,
    clearAll,
    
    // Access to the notifications
    notifications: context.notifications,
    getActiveNotifications,
  };
}

export default useNotification;