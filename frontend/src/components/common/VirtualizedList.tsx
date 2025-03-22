// src/components/common/VirtualizedList.tsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import usePerformance from '../../hooks/usePerformance';

/**
 * Props for VirtualizedList component
 */
interface VirtualizedListProps<T> {
  items: T[];
  height: number;
  itemHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
  emptyMessage?: string;
}

/**
 * A performance-optimized virtualized list component that only renders visible items
 */
function VirtualizedList<T>({
  items,
  height,
  itemHeight,
  renderItem,
  overscan = 5,
  className = '',
  emptyMessage = 'No items to display'
}: VirtualizedListProps<T>): JSX.Element {
  // Track performance
  usePerformance('VirtualizedList');
  
  // Create references
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Set up state
  const [scrollTop, setScrollTop] = useState(0);
  
  // Calculate visible window
  const totalHeight = items.length * itemHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.floor((scrollTop + height) / itemHeight) + overscan
  );
  
  // Memoize visible items to prevent unnecessary re-renders
  const visibleItems = useMemo(() => {
    return items.slice(startIndex, endIndex + 1).map((item, index) => ({
      item,
      index: startIndex + index,
      offsetY: (startIndex + index) * itemHeight
    }));
  }, [items, startIndex, endIndex, itemHeight]);
  
  // Handle scroll events
  const handleScroll = () => {
    if (containerRef.current) {
      setScrollTop(containerRef.current.scrollTop);
    }
  };
  
  // Add scroll event listener
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => {
        container.removeEventListener('scroll', handleScroll);
      };
    }
  }, []);
  
  // If no items, show empty message
  if (items.length === 0) {
    return (
      <div className={`flex items-center justify-center h-${height / 16} ${className}`}>
        <p className="text-gray-500 dark:text-gray-400">{emptyMessage}</p>
      </div>
    );
  }
  
  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ height: `${height}px` }}
    >
      <div style={{ height: `${totalHeight}px`, position: 'relative' }}>
        {visibleItems.map(({ item, index, offsetY }) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              top: 0,
              transform: `translateY(${offsetY}px)`,
              width: '100%',
              height: `${itemHeight}px`
            }}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
}

export default VirtualizedList;