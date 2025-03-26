// frontend/src/layout/types.ts
import { ReactNode } from 'react';

export interface PageContainerProps {
  title?: string;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export interface FooterProps {
  className?: string;
}

export interface NavbarProps {
  className?: string;
}