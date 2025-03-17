// frontend/src/components/Table.js
import React from 'react';

export const Table = ({ children, className = '', ...props }) => {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-dark-border">
      <table 
        className={`min-w-full divide-y divide-gray-200 dark:divide-dark-border ${className}`} 
        {...props}
      >
        {children}
      </table>
    </div>
  );
};

export const TableHead = ({ children, className = '', ...props }) => {
  return (
    <thead className={`bg-gray-50 dark:bg-dark-card ${className}`} {...props}>
      {children}
    </thead>
  );
};

export const TableBody = ({ children, className = '', ...props }) => {
  return (
    <tbody 
      className={`bg-white dark:bg-dark-card divide-y divide-gray-200 dark:divide-dark-border ${className}`} 
      {...props}
    >
      {children}
    </tbody>
  );
};

export const TableRow = ({ children, isHoverable = true, className = '', ...props }) => {
  return (
    <tr 
      className={`${isHoverable ? 'hover:bg-gray-50 dark:hover:bg-gray-800' : ''} ${className}`} 
      {...props}
    >
      {children}
    </tr>
  );
};

export const TableHeader = ({ children, className = '', ...props }) => {
  return (
    <th 
      className={`px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-muted uppercase tracking-wider ${className}`} 
      {...props}
    >
      {children}
    </th>
  );
};

export const TableCell = ({ children, className = '', ...props }) => {
  return (
    <td 
      className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-dark-text-secondary ${className}`} 
      {...props}
    >
      {children}
    </td>
  );
};

export const TableFooter = ({ children, className = '', ...props }) => {
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