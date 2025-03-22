import { ReactNode } from 'react';

// Interface for children prop
export interface ChildrenProps {
  children?: ReactNode;
}

// Interface for class name prop
export interface ClassNameProps {
  className?: string;
}

// Combined interface for common props
export interface CommonProps extends ChildrenProps, ClassNameProps {
  id?: string;
}

// Interface for basic form element props
export interface FormElementProps extends CommonProps {
  name?: string;
  disabled?: boolean;
  required?: boolean;
  readOnly?: boolean;
  autoFocus?: boolean;
}

// Interface for text input props
export interface TextInputProps extends FormElementProps {
  value?: string;
  defaultValue?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'search' | 'tel' | 'url' | 'number';
  min?: number;
  max?: number;
  step?: number;
  pattern?: string;
  autoComplete?: string;
}

// Interface for select props
export interface SelectProps extends FormElementProps {
  value?: string | string[];
  defaultValue?: string | string[];
  onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLSelectElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLSelectElement>) => void;
  options?: { value: string; label: string }[];
  multiple?: boolean;
}

// Interface for text area props
export interface TextAreaProps extends FormElementProps {
  value?: string;
  defaultValue?: string;
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLTextAreaElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
  cols?: number;
  maxLength?: number;
  minLength?: number;
  wrap?: 'hard' | 'soft';
  autoComplete?: string;
}

// Interface for button props
export interface ButtonProps extends CommonProps {
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
  fullWidth?: boolean;
}

// Interface for theme context
export interface ThemeContextProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

// Types for size variants
export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// Types for color variants
export type ColorVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';