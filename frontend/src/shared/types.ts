import React, { ButtonHTMLAttributes, HTMLAttributes, TableHTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from 'react';

// Button Component Types
export type ButtonVariant = 
  | 'primary'
  | 'secondary'
  | 'success'
  | 'danger'
  | 'warning'
  | 'info'
  | 'outline'
  | 'ghost'
  | 'link'
  | 'icon'; // Add 'icon' variant

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Button contents
   */
  children: React.ReactNode;
  
  /**
   * Button visual style
   */
  variant?: ButtonVariant;
  
  /**
   * Button color (for icon and outline variants)
   */
  color?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info'; // Add color prop
  
  /**
   * Button size
   */
  size?: ButtonSize;
  
  /**
   * Optional icon element
   */
  icon?: React.ReactNode;
  
  /**
   * Icon position relative to text
   */
  iconPosition?: 'left' | 'right';
  
  /**
   * Icon to show on the left side of the button text
   */
  iconLeft?: React.ReactNode;
  
  /**
   * Icon to show on the right side of the button text
   */
  iconRight?: React.ReactNode;
  
  /**
   * Text to display when button is in loading state
   */
  loadingText?: string;
  
  /**
   * Whether button should take up full width of container
   */
  fullWidth?: boolean;
  
  /**
   * Whether button is in loading state
   */
  isLoading?: boolean;
  
  /**
   * Optional click handler
   */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

// Card Component Types
// Card Component Types
export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Card contents (optional)
   */
  children?: React.ReactNode;
  
  /**
   * Additional CSS classes
   */
  className?: string;
  
  /**
   * Whether to add hover effect
   */
  hover?: boolean;

  /**
   * Whether the card should take up full width
   */
  fullWidth?: boolean;
}

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Card header contents (optional)
   */
  children?: React.ReactNode;
  
  /**
   * Card title
   */
  headerTitle?: React.ReactNode;
  
  /**
   * Card subtitle
   */
  subtitle?: React.ReactNode;
  
  /**
   * Action components to display in header
   */
  actions?: React.ReactNode;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

export interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Card body contents (optional)
   */
  children?: React.ReactNode;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Card footer contents (optional)
   */
  children?: React.ReactNode;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

// Modal Component Types
export type ModalSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full';

export interface ModalProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Modal contents
   */
  children: React.ReactNode;
  
  /**
   * Whether the modal is visible
   */
  isOpen: boolean;
  
  /**
   * Callback when the modal is closed
   */
  onClose: () => void;
  
  /**
   * Modal size
   */
  size?: ModalSize;
  
  /**
   * Whether to close on escape key press
   */
  closeOnEsc?: boolean;
  
  /**
   * Whether to close when clicking outside
   */
  closeOnOutsideClick?: boolean;
  
  /**
   * Ref for the element to focus when the modal opens
   */
  initialFocus?: React.RefObject<HTMLElement>;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

export interface ModalHeaderProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Modal header contents
   */
  children?: React.ReactNode;
  
  /**
   * Modal title
   */
  modalTitle?: React.ReactNode;
  
  /**
   * Callback when the close button is clicked
   */
  onClose?: () => void;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

export interface ModalBodyProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Modal body contents
   */
  children: React.ReactNode;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

export interface ModalFooterProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Modal footer contents
   */
  children: React.ReactNode;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

// Table Component Types
export interface TableProps extends TableHTMLAttributes<HTMLTableElement> {
  /**
   * Table contents
   */
  children: React.ReactNode;
  
  /**
   * Whether the header should be sticky
   */
  stickyHeader?: boolean;
  
  /**
   * Whether to show borders
   */
  bordered?: boolean;
  
  /**
   * Whether to stripe rows
   */
  striped?: boolean;
  
  /**
   * Whether to add hover effect to rows
   */
  hover?: boolean;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

export interface TableHeadProps extends HTMLAttributes<HTMLTableSectionElement> {
  /**
   * Table head contents
   */
  children: React.ReactNode;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

export interface TableBodyProps extends HTMLAttributes<HTMLTableSectionElement> {
  /**
   * Table body contents
   */
  children: React.ReactNode;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

export interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  /**
   * Table row contents
   */
  children: React.ReactNode;
  
  /**
   * Whether to highlight on hover
   */
  isHoverable?: boolean;
  
  /**
   * Whether row is active/focused
   */
  isActive?: boolean;
  
  /**
   * Whether row is selected
   */
  isSelected?: boolean;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

export interface TableHeaderProps extends ThHTMLAttributes<HTMLTableCellElement> {
  /**
   * Table header contents
   */
  children: React.ReactNode;
  
  /**
   * Cell width
   */
  width?: string | number;
  
  /**
   * Text alignment
   */
  align?: 'left' | 'center' | 'right';
  
  /**
   * Whether header is sortable
   */
  sortable?: boolean;
  
  /**
   * Current sort direction
   */
  sortDirection?: 'asc' | 'desc';
  
  /**
   * Sort callback
   */
  onSort?: () => void;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

export interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
  /**
   * Table cell contents
   */
  children?: React.ReactNode;
  
  /**
   * Text alignment
   */
  align?: 'left' | 'center' | 'right';
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

export interface TableFooterProps extends HTMLAttributes<HTMLTableSectionElement> {
  /**
   * Table footer contents
   */
  children: React.ReactNode;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

export interface TableComponent extends React.ForwardRefExoticComponent<TableProps & React.RefAttributes<HTMLTableElement>> {
  Head: React.ForwardRefExoticComponent<TableHeadProps & React.RefAttributes<HTMLTableSectionElement>>;
  Body: React.ForwardRefExoticComponent<TableBodyProps & React.RefAttributes<HTMLTableSectionElement>>;
  Row: React.ForwardRefExoticComponent<TableRowProps & React.RefAttributes<HTMLTableRowElement>>;
  Header: React.ForwardRefExoticComponent<TableHeaderProps & React.RefAttributes<HTMLTableCellElement>>;
  Cell: React.ForwardRefExoticComponent<TableCellProps & React.RefAttributes<HTMLTableCellElement>>;
  Footer: React.ForwardRefExoticComponent<TableFooterProps & React.RefAttributes<HTMLTableSectionElement>>;
}