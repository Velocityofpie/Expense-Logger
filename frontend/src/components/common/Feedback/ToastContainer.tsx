// src/components/common/Feedback/ToastContainer.tsx
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Toast from './Toast';
import { useNotification } from '../../../hooks/useNotification';
import { Notification, NotificationPosition } from '../../../types/common.types';

/**
 * Component to group toasts by position
 */
const ToastContainer: React.FC = () => {
  const { notifications, remove } = useNotification();
  const [portalEl, setPortalEl] = useState<HTMLElement | null>(null);
  
  // Create portal element when component mounts
  useEffect(() => {
    // Check if portal element already exists
    let el = document.getElementById('toast-portal');
    
    // If not, create it
    if (!el) {
      el = document.createElement('div');
      el.id = 'toast-portal';
      document.body.appendChild(el);
    }
    
    setPortalEl(el);
    
    // Clean up on unmount
    return () => {
      if (el && el.parentNode && el.childNodes.length === 0) {
        el.parentNode.removeChild(el);
      }
    };
  }, []);
  
  // If portal element doesn't exist yet, render nothing
  if (!portalEl) {
    return null;
  }
  
  // Group notifications by position
  const notificationsByPosition = notifications.reduce<Record<NotificationPosition, Notification[]>>(
    (acc, notification) => {
      const position = notification.position || 'top-right';
      
      if (!acc[position]) {
        acc[position] = [];
      }
      
      acc[position].push(notification);
      
      return acc;
    },
    {} as Record<NotificationPosition, Notification[]>
  );
  
  // Render toasts grouped by position
  return createPortal(
    <>
      {Object.entries(notificationsByPosition).map(([position, positionNotifications]) => (
        <div key={position} className="toast-group" data-position={position}>
          {positionNotifications.map((notification) => (
            <Toast
              key={notification.id}
              notification={notification}
              onClose={remove}
            />
          ))}
        </div>
      ))}
    </>,
    portalEl
  );
};

export default ToastContainer;