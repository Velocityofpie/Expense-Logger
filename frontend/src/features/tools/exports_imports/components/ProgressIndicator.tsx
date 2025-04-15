// frontend/src/features/tools/exports_imports/components/ProgressIndicator.tsx
import React from 'react';

interface ProgressIndicatorProps {
  /**
   * Progress value from 0 to 100
   */
  progress: number;
  
  /**
   * Optional color variant
   */
  variant?: 'primary' | 'success' | 'danger' | 'warning' | 'info';
  
  /**
   * Optional size
   */
  size?: 'sm' | 'md' | 'lg';
  
  /**
   * Whether to show the percentage label
   */
  showLabel?: boolean;
  
  /**
   * Optional custom label
   */
  label?: string;
  
  /**
   * Whether to animate the progress
   */
  animated?: boolean;
  
  /**
   * Whether to show a striped pattern
   */
  striped?: boolean;
  
  /**
   * Additional CSS class
   */
  className?: string;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  progress,
  variant = 'primary',
  size = 'md',
  showLabel = true,
  label,
  animated = true,
  striped = false,
  className = '',
}) => {
  // Ensure progress is between 0 and 100
  const normalizedProgress = Math.min(Math.max(0, progress), 100);
  
  // Calculate height based on size
  const height = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-4',
  }[size];
  
  // Calculate variant colors
  const variantClasses = {
    primary: 'bg-primary-500 dark:bg-primary-600',
    success: 'bg-green-500 dark:bg-green-600',
    danger: 'bg-red-500 dark:bg-red-600',
    warning: 'bg-yellow-500 dark:bg-yellow-600',
    info: 'bg-blue-500 dark:bg-blue-600',
  }[variant];
  
  // Calculate animation classes
  const animationClass = animated ? 'transition-all duration-300' : '';
  
  // Calculate striped classes
  const stripedClass = striped ? 'bg-striped' : '';
  
  return (
    <div className={`progress-indicator ${className}`}>
      <div className="relative">
        <div className={`w-full ${height} bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden`}>
          <div
            className={`${height} ${variantClasses} ${animationClass} ${stripedClass} rounded-full`}
            style={{ width: `${normalizedProgress}%` }}
            role="progressbar"
            aria-valuenow={normalizedProgress}
            aria-valuemin={0}
            aria-valuemax={100}
          ></div>
        </div>
        
        {showLabel && (
          <div className="mt-1 text-sm text-center text-gray-500 dark:text-gray-400">
            {label || `${Math.round(normalizedProgress)}%`}
          </div>
        )}
      </div>
    </div>
  );
};

// Define a striped progress bar style
const StripedProgressStyle = () => (
  <style jsx global>{`
    .bg-striped {
      background-image: linear-gradient(
        45deg,
        rgba(255, 255, 255, 0.15) 25%,
        transparent 25%,
        transparent 50%,
        rgba(255, 255, 255, 0.15) 50%,
        rgba(255, 255, 255, 0.15) 75%,
        transparent 75%,
        transparent
      );
      background-size: 1rem 1rem;
    }
    
    @keyframes progress-bar-stripes {
      from {
        background-position: 1rem 0;
      }
      to {
        background-position: 0 0;
      }
    }
    
    .bg-striped.transition-all {
      animation: progress-bar-stripes 1s linear infinite;
    }
  `}</style>
);

// Export the component with the style
const ProgressIndicatorWithStyle: React.FC<ProgressIndicatorProps> = (props) => (
  <>
    <StripedProgressStyle />
    <ProgressIndicator {...props} />
  </>
);

export default ProgressIndicatorWithStyle;