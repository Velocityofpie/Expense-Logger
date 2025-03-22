// src/services/formatters/currencyFormatter.ts
export const formatCurrency = (value: number | string | undefined): string => {
    if (value === undefined || value === null) return '$0.00';
    
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    
    if (isNaN(numValue)) return '$0.00';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numValue);
  };