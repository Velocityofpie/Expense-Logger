// src/shared/index.ts - Fixing the imports and exports
/**
 * Barrel exports for shared UI components
 */

// Export components
export { default as Tabs, Tab } from './Tabs';
export type { TabsProps, TabProps } from './Tabs';
export { default as Button } from './Button';
export { default as Card, CardHeader, CardBody, CardFooter } from './Card';
export { default as Modal, ModalHeader, ModalBody, ModalFooter } from './Modal';
export { default as Table } from './Table';
export { 
  TableHead, 
  TableBody, 
  TableRow, 
  TableHeader, 
  TableCell, 
  TableFooter 
} from './Table';
export { default as Input } from './Input';
export { default as Select } from './Select';
export { default as Textarea } from './Textarea';
export { default as Checkbox } from './Checkbox';
export { default as Badge } from './Badge';

// Export component types directly from files to avoid circular dependencies
export type { ButtonProps, ButtonVariant, ButtonSize } from './types';
export type { CardProps, CardHeaderProps, CardBodyProps, CardFooterProps } from './types';
export type { ModalProps, ModalHeaderProps, ModalBodyProps, ModalFooterProps } from './types';
export type { TableProps, TableHeadProps, TableBodyProps, TableRowProps, TableHeaderProps, TableCellProps, TableFooterProps } from './types';
export type { InputProps } from './Input';
export type { SelectProps } from './Select';
export type { TextareaProps } from './Textarea';
export type { CheckboxProps } from './Checkbox';
export type { BadgeProps } from './Badge';