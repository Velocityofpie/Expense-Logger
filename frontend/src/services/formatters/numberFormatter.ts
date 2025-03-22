// src/services/formatters/numberFormatter.ts
export const formatNumber = (value: number | string | undefined, decimals: number = 0): string => {
    if (value === undefined || value === null) return '0';
    
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    
    if (isNaN(numValue)) return '0';
    
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(numValue);
  };