import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { CommonProps } from '../../types/common.types';

interface ModalProps extends CommonProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnEsc?: boolean;
  closeOnOverlayClick?: boolean;
  hideCloseButton?: boolean;
  footer?: React.ReactNode;
  centered?: boolean;
  scrollBehavior?: 'inside' | 'outside';
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  size = 'md',
  closeOnEsc = true,
  closeOnOverlayClick = true,
  hideCloseButton = false,
  footer,
  centered = false,
  scrollBehavior = 'outside',
  children,
  className = '',
  ...props
}) => {
  // Create ref for modal content
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen && closeOnEsc) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden'; // Prevent body scrolling
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = ''; // Restore body scrolling
    };
  }, [isOpen, closeOnEsc, onClose]);
  
  // Handle click outside to close
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };
  
  // Modal size classes
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-xl',
    xl: 'max-w-3xl',
    full: 'max-w-full mx-4',
  };
  
  // Vertical alignment class
  const alignClass = centered ? 'items-center' : 'items-start md:items-center';
  
  // Scrolling behavior
  const scrollClass = scrollBehavior === 'inside' 
    ? 'max-h-[calc(100vh-7rem)] overflow-y-auto' 
    : '';
  
  // If modal is not open, don't render anything
  if (!isOpen) return null;
  
  // Create portal to render modal outside of parent component hierarchy
  return createPortal(
    <div 
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
      {...props}
    >
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity flex justify-center ${alignClass} p-4`}
        onClick={handleOverlayClick}
      >
        {/* Modal Content */}
        <div 
          ref={contentRef}
          className={`w-full ${sizeClasses[size]} bg-white dark:bg-dark-card rounded-lg shadow-xl transform transition-all ${className}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          {(title || !hideCloseButton) && (
            <div className="px-6 py-4 border-b border-gray-200 dark:border-dark-border flex justify-between items-center">
              {title && (
                <h3 
                  id="modal-title" 
                  className="text-lg font-medium text-gray-900 dark:text-dark-text-primary"
                >
                  {title}
                </h3>
              )}
              
              {!hideCloseButton && (
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  onClick={onClose}
                  aria-label="Close"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          )}
          
          {/* Body */}
          <div className={`px-6 py-4 ${scrollClass}`}>
            {children}
          </div>
          
          {/* Footer */}
          {footer && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-dark-border">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;