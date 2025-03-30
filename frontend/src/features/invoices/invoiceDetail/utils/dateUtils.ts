// src/features/invoices/invoiceDetail/utils/dateUtils.ts

/**
 * Normalizes date formats to ISO string (YYYY-MM-DD)
 * @param dateString Date string in various formats
 * @returns Normalized date string in YYYY-MM-DD format
 */
export const normalizeDateFormat = (dateString: string): string => {
    if (!dateString) return '';
    
    try {
      // Handle common date formats
      const patterns = [
        // MM/DD/YYYY or MM-DD-YYYY
        { regex: /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/, formatter: (m: RegExpMatchArray) => `${m[3]}-${m[1].padStart(2, '0')}-${m[2].padStart(2, '0')}` },
        
        // YYYY/MM/DD or YYYY-MM-DD
        { regex: /^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/, formatter: (m: RegExpMatchArray) => `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}` },
        
        // DD/MM/YYYY, DD.MM.YYYY, or DD-MM-YYYY
        { regex: /^(\d{1,2})[\/\.\-](\d{1,2})[\/\.\-](\d{4})$/, formatter: (m: RegExpMatchArray) => `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}` },
        
        // Month name formats: Jan 1, 2023 or January 1, 2023
        { regex: /^([a-zA-Z]{3,9})\s+(\d{1,2}),?\s+(\d{4})$/, formatter: (_: RegExpMatchArray) => new Date(dateString).toISOString().split('T')[0] }
      ];
      
      // Try each pattern
      for (const { regex, formatter } of patterns) {
        const matches = dateString.match(regex);
        if (matches) {
          return formatter(matches);
        }
      }
      
      // If no patterns match, try with Date constructor
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    } catch (e) {
      console.error('Error parsing date:', e);
    }
    
    // Return original string if parsing fails
    return dateString;
  };
  
  /**
   * Format a date to a display format
   * @param dateString ISO date string (YYYY-MM-DD)
   * @param format Optional format style
   * @returns Formatted date string
   */
  export const formatDate = (
    dateString: string, 
    format: 'short' | 'medium' | 'long' = 'medium'
  ): string => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      
      const options: Intl.DateTimeFormatOptions = { 
        year: 'numeric',
        month: format === 'short' ? 'numeric' : 'long',
        day: 'numeric'
      };
      
      return date.toLocaleDateString('en-US', options);
    } catch (e) {
      console.error('Error formatting date:', e);
      return dateString;
    }
  };
  
  /**
   * Check if a string is a valid date
   * @param dateString Date string to validate
   * @returns Boolean indicating if the date is valid
   */
  export const isValidDate = (dateString: string): boolean => {
    if (!dateString) return false;
    
    try {
      const date = new Date(dateString);
      return !isNaN(date.getTime());
    } catch (e) {
      return false;
    }
  };