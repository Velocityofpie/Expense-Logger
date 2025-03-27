// src/shared/index.ts - Fix exports
/**
 * Barrel exports for shared UI components
 */

// Export components
export { default as Tabs, Tab } from './Tabs';
export type { TabsProps, TabProps } from './Tabs';
export { default as Button } from './Button';
export { default as Card, CardHeader, CardBody, CardFooter } from './Card';
export { default as Modal, ModalHeader, ModalBody, ModalFooter } from './Modal';
export { 
  default as Table, 
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

// Export component types
export type {
  ButtonProps,
  ButtonVariant,
  ButtonSize,
  CardProps,
  CardHeaderProps,
  CardBodyProps,
  CardFooterProps,
  ModalProps,
  ModalHeaderProps,
  ModalBodyProps,
  ModalFooterProps,
  TableProps,
  TableHeadProps,
  TableBodyProps,
  TableRowProps,
  TableHeaderProps,
  TableCellProps,
  TableFooterProps,
  InputProps,
  SelectProps,
  TextareaProps,
  CheckboxProps,
  BadgeProps
} from './types';