import React from 'react';
import { CommonProps } from '../../types/common.types';

interface TableProps extends CommonProps {
  striped?: boolean;
  hoverable?: boolean;
  bordered?: boolean;
  compact?: boolean;
}

interface TableHeadProps extends CommonProps {}

interface TableBodyProps extends CommonProps {}

interface TableRowProps extends CommonProps {
  isHoverable?: boolean;
  isSelected?: boolean;
}

interface TableHeaderProps extends CommonProps {
  isSortable?: boolean;
  isSorted?: boolean;
  sortDirection?: 'asc' | 'desc';
  onSort?: () => void;
}

interface TableCellProps extends CommonProps {
  align?: 'left' | 'center' | 'right';
}

interface TableFooterProps extends CommonProps {}

export const Table: React.FC<TableProps> = ({ 
  children, 
  className = '', 
  striped = false, 
  hoverable = false, 
  bordered = false, 
  compact = false, 
  ...props 
}) => {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-dark-border">
      <table 
        className={`min-w-full divide-y divide-gray-200 dark:divide-dark-border ${
          striped ? 'table-striped' : ''
        } ${
          hoverable ? 'table-hover' : ''
        } ${
          bordered ? 'table-bordered' : ''
        } ${
          compact ? 'table-compact' : ''
        } ${className}`} 
        {...props}
      >
        {children}
      </table>
    </div>
  );
};

export const TableHead: React.FC<TableHeadProps> = ({ 
  children, 
  className = '', 
  ...props 
}) => {
  return (
    <thead 
      className={`bg-gray-50 dark:bg-dark-card ${className}`} 
      {...props}
    >
      {children}
    </thead>
  );
};

export const TableBody: React.FC<TableBodyProps> = ({ 
  children, 
  className = '', 
  ...props 
}) => {
  return (
    <tbody 
      className={`bg-white dark:bg-dark-card divide-y divide-gray-200 dark:divide-dark-border ${className}`} 
      {...props}
    >
      {children}
    </tbody>
  );
};

export const TableRow: React.FC<TableRowProps> = ({ 
  children, 
  isHoverable = true, 
  isSelected = false,
  className = '', 
  ...props 
}) => {
  return (
    <tr 
      className={`${
        isHoverable ? 'hover:bg-gray-50 dark:hover:bg-gray-800' : ''
      } ${
        isSelected ? 'bg-gray-100 dark:bg-gray-700' : ''
      } ${className}`} 
      {...props}
    >
      {children}
    </tr>
  );
};

export const TableHeader: React.FC<TableHeaderProps> = ({ 
  children, 
  isSortable = false,
  isSorted = false,
  sortDirection = 'asc',
  onSort,
  className = '', 
  ...props 
}) => {
  return (
    <th 
      className={`px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-muted uppercase tracking-wider ${
        isSortable ? 'cursor-pointer' : ''
      } ${className}`} 
      onClick={isSortable ? onSort : undefined}
      {...props}
    >
      <div className="flex items-center">
        {children}
        {isSortable && (
          <span className="ml-1">
            {isSorted ? (
              sortDirection === 'asc' ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )
            ) : (
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            )}
          </span>
        )}
      </div>
    </th>
  );
};

export const TableCell: React.FC<TableCellProps> = ({ 
  children, 
  align = 'left',
  className = '', 
  ...props 
}) => {
  return (
    <td 
      className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-dark-text-secondary ${
        align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left'
      } ${className}`} 
      {...props}
    >
      {children}
    </td>
  );
};

export const TableFooter: React.FC<TableFooterProps> = ({ 
  children, 
  className = '', 
  ...props 
}) => {
  return (
    <tfoot 
      className={`bg-gray-50 dark:bg-dark-card ${className}`} 
      {...props}
    >
      {children}
    </tfoot>
  );
};

export default Table;