// src/services/formatters/dateFormatter.ts
export const formatDate = (date: string | Date | undefined, includeTime: boolean = false): string => {
    if (!date) return '-';
    
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      
      if (isNaN(dateObj.getTime())) return '-';
      
      if (includeTime) {
        return dateObj.toLocaleString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        });
      } else {
        return dateObj.toLocaleDateString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        });
      }
    } catch (error) {
      console.error('Error formatting date:', error);
      return '-';
    }
  };