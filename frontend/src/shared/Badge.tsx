// src/shared/Badge.tsx
import React from 'react';

export type BadgeColor = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';

export interface BadgeProps {
  children: React.ReactNode;
  color?: BadgeColor;
  className?: string;
  // We don't add onClick here because we'll wrap badges in buttons when they need to be clickable
}

const Badge: React.FC<BadgeProps> = ({
  children,
  color = 'primary',
  className = '',
}) => {
  const colorClasses = {
    primary: 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300',
    secondary: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    danger: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  };

  return (
    <span 
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClasses[color]} ${className}`}
    >
      {children}
    </span>
  );
};

// Create a clickable version of Badge as a separate component
export interface ClickableBadgeProps extends BadgeProps {
  onClick: () => void;
}

export const ClickableBadge: React.FC<ClickableBadgeProps> = ({
  children,
  color = 'primary',
  className = '',
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="focus:outline-none"
    >
      <Badge
        color={color}
        className={`cursor-pointer hover:opacity-80 ${className}`}
      >
        {children}
      </Badge>
    </button>
  );
};

export default Badge;