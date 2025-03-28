// src/shared/Table.tsx - Fixed version with proper TypeScript typings

import React, { forwardRef } from 'react';
import { 
  TableProps, 
  TableHeadProps, 
  TableBodyProps, 
  TableRowProps, 
  TableHeaderProps, 
  TableCellProps, 
  TableFooterProps,
  TableComponent
} from './types';

/**
 * Table component for displaying structured data
 */
const BaseTable = forwardRef<HTMLTableElement, TableProps>(
  ({ children, className = '', stickyHeader = false, bordered = false, striped = false, hover = false, ...props }, ref) => {
    return (
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-dark-border">
        <table 
          ref={ref}
          className={`min-w-full divide-y divide-gray-200 dark:divide-dark-border ${
            bordered ? 'border-collapse border border-gray-200 dark:border-dark-border' : ''
          } ${className}`} 
          {...props}
        >
          {children}
        </table>
      </div>
    );
  }
);

BaseTable.displayName = 'Table';

/**
 * Table head component
 */
export const TableHead = forwardRef<HTMLTableSectionElement, TableHeadProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <thead 
        ref={ref}
        className={`bg-gray-50 dark:bg-dark-card ${className}`} 
        {...props}
      >
        {children}
      </thead>
    );
  }
);

TableHead.displayName = 'TableHead';

/**
 * Table body component
 */
export const TableBody = forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <tbody 
        ref={ref}
        className={`bg-white dark:bg-dark-card divide-y divide-gray-200 dark:divide-dark-border ${className}`} 
        {...props}
      >
        {children}
      </tbody>
    );
  }
);

TableBody.displayName = 'TableBody';

/**
 * Table row component
 */
export const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ children, isHoverable = true, isActive = false, isSelected = false, className = '', ...props }, ref) => {
    return (
      <tr 
        ref={ref}
        className={`
          ${isHoverable ? 'hover:bg-gray-50 dark:hover:bg-gray-800' : ''}
          ${isActive ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
          ${isSelected ? 'bg-gray-100 dark:bg-gray-800' : ''}
          ${className}
        `} 
        {...props}
      >
        {children}
      </tr>
    );
  }
);

TableRow.displayName = 'TableRow';

/**
 * Table header cell component
 */
export const TableHeader = forwardRef<HTMLTableCellElement, TableHeaderProps>(
  ({ 
    children, 
    width, 
    align = 'left', 
    sortable = false, 
    sortDirection, 
    onSort, 
    className = '', 
    ...props 
  }, ref) => {
    const alignmentClasses = {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right'
    };
    
    const widthClass = width ? `w-${width}` : '';
    
    const handleSort = () => {
      if (sortable && onSort) {
        onSort();
      }
    };
    
    const getSortIcon = () => {
      if (!sortable) return null;
      
      if (!sortDirection) {
        return (
          <svg className="w-4 h-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
        );
      }
      
      if (sortDirection === 'asc') {
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        );
      }
      
      return (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      );
    };
    
    return (
      <th 
        ref={ref}
        scope="col"
        className={`
          px-6 py-3 text-xs font-medium text-gray-500 dark:text-dark-text-muted 
          uppercase tracking-wider ${alignmentClasses[align]} ${widthClass} ${className}
          ${sortable ? 'cursor-pointer' : ''}
        `}
        onClick={handleSort}
        {...props}
      >
        {sortable ? (
          <div className="flex items-center">
            <span className="mr-2">{children}</span>
            {getSortIcon()}
          </div>
        ) : (
          children
        )}
      </th>
    );
  }
);

TableHeader.displayName = 'TableHeader';

/**
 * Table cell component
 */
export const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ children, align = 'left', className = '', ...props }, ref) => {
    const alignmentClasses = {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right'
    };
    
    return (
      <td 
        ref={ref}
        className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-dark-text-secondary ${alignmentClasses[align]} ${className}`} 
        {...props}
      >
        {children}
      </td>
    );
  }
);

TableCell.displayName = 'TableCell';

/**
 * Table footer component
 */
export const TableFooter = forwardRef<HTMLTableSectionElement, TableFooterProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <tfoot 
        ref={ref}
        className={`bg-gray-50 dark:bg-dark-card ${className}`} 
        {...props}
      >
        {children}
      </tfoot>
    );
  }
);

TableFooter.displayName = 'TableFooter';

// Create Table as object with all compound components
const Table = Object.assign(BaseTable, {
  Head: TableHead,
  Body: TableBody,
  Row: TableRow,
  Header: TableHeader,
  Cell: TableCell,
  Footer: TableFooter
}) as TableComponent;

export default Table;