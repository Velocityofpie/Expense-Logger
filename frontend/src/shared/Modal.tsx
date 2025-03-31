import React, { useEffect, useRef, useState, forwardRef } from 'react';
import { createPortal } from 'react-dom';
import { ModalProps, ModalHeaderProps, ModalBodyProps, ModalFooterProps } from './types';

/**
 * Modal component for displaying content that requires user interaction
 */
export const Modal: React.FC<ModalProps> = ({
  children,
  isOpen,
  onClose,
  size = 'md',
  closeOnEsc = true,
  closeOnOutsideClick = true,
  initialFocus,
  className = '',
  ...props
}) => {
  const [mounted, setMounted] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Handle mounting/unmounting
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);
  
  // Handle escape key press
  useEffect(() => {
    if (!isOpen || !closeOnEsc) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeOnEsc, onClose]);
  
  // Handle outside click
  const handleOutsideClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (
      closeOnOutsideClick &&
      overlayRef.current === e.target && 
      contentRef.current && 
      !contentRef.current.contains(e.target as Node)
    ) {
      onClose();
    }
  };
  
  // Handle focus management
  useEffect(() => {
    if (!isOpen) return;
    
    // Focus the initial element or the first focusable element
    const element = initialFocus?.current || contentRef.current?.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])') as HTMLElement;
    
    if (element) {
      element.focus();
    }
    
    // Handle focus trap
    const handleFocusTrap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !contentRef.current) return;
      
      const focusableElements = contentRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements.length === 0) return;
      
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
      
      if (e.shiftKey && document.activeElement === firstElement) {
        lastElement.focus();
        e.preventDefault();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        firstElement.focus();
        e.preventDefault();
      }
    };
    
    document.addEventListener('keydown', handleFocusTrap);
    return () => document.removeEventListener('keydown', handleFocusTrap);
  }, [isOpen, initialFocus]);
  
  // Handle body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '15px'; // Prevent layout shift
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }
    
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [isOpen]);
  
  // Size classes
  const sizeClasses = {
    xs: 'max-w-xs',
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full'
  };
  
  // Animation classes
  const overlayAnimationClass = isOpen
    ? 'opacity-100'
    : 'opacity-0 pointer-events-none';
    
  const contentAnimationClass = isOpen
    ? 'opacity-100 scale-100'
    : 'opacity-0 scale-95 pointer-events-none';
  
  // Don't render anything if not mounted
  if (!mounted) return null;
  
  return createPortal(
    <div 
      ref={overlayRef}
      onClick={handleOutsideClick}
      className={`fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 transition-opacity duration-300 ease-out bg-black bg-opacity-50 ${overlayAnimationClass}`}
      aria-modal="true"
      role="dialog"
      {...props}
    >
      <div 
        ref={contentRef}
        className={`relative w-full ${sizeClasses[size]} bg-white dark:bg-dark-card rounded-lg shadow-xl transition-all duration-300 ease-out transform ${contentAnimationClass} ${className}`}
      >
        {children}
      </div>
    </div>,
    document.body
  );
};

/**
 * Modal header component
 */
export const ModalHeader = forwardRef<HTMLDivElement, ModalHeaderProps>(
  ({ children, modalTitle, onClose, className = '', ...props }, ref) => {
    return (
      <div 
        ref={ref}
        className={`px-6 py-4 border-b border-gray-200 dark:border-dark-border ${className}`}
        {...props}
      >
        {children || (
          <div className="flex items-center justify-between">
            {modalTitle && <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text-primary">{modalTitle}</h3>}
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 focus:outline-none focus:text-gray-500 transition-colors duration-200"
                aria-label="Close"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
    );
  }
);

ModalHeader.displayName = 'ModalHeader';

/**
 * Modal body component
 */
export const ModalBody = forwardRef<HTMLDivElement, ModalBodyProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <div 
        ref={ref}
        className={`px-6 py-4 overflow-y-auto ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

ModalBody.displayName = 'ModalBody';

/**
 * Modal footer component
 */
export const ModalFooter = forwardRef<HTMLDivElement, ModalFooterProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <div 
        ref={ref}
        className={`px-6 py-4 border-t border-gray-200 dark:border-dark-border ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

ModalFooter.displayName = 'ModalFooter';

export default Modal;