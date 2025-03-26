/**
 * Utility functions for formatting data
 */

/**
 * Format a number as currency with dollar sign
 * @param value - The value to format
 * @param options - Formatting options
 * @returns Formatted currency string
 */
export const formatCurrency = (
    value: number | string | null | undefined,
    options: { locale?: string; currency?: string; minimumFractionDigits?: number } = {}
  ): string => {
    // Default options
    const { locale = 'en-US', currency = 'USD', minimumFractionDigits = 2 } = options;
    
    // If value is nullish, return a default formatted string
    if (value === null || value === undefined) return `$0.00`;
    
    // Convert string to number if needed
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    
    // Return formatted currency
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits
    }).format(numValue);
  };
  
  /**
   * Format a date value to a localized string
   * @param value - Date string or object to format
   * @param options - Formatting options
   * @returns Formatted date string
   */
  export const formatDate = (
    value: string | Date | null | undefined,
    options: { locale?: string; format?: 'short' | 'medium' | 'long' | 'full' } = {}
  ): string => {
    // Default options
    const { locale = 'en-US', format = 'medium' } = options;
    
    // If value is nullish, return empty string
    if (value === null || value === undefined) return '';
    
    // Create a Date object if value is a string
    const dateValue = typeof value === 'string' ? new Date(value) : value;
    
    // Return formatted date
    return dateValue.toLocaleDateString(locale, { dateStyle: format });
  };
  
  /**
   * Format a date string to ISO format (YYYY-MM-DD)
   * @param dateString - Date string to format
   * @returns ISO formatted date string
   */
  export const formatToISODate = (dateString: string): string => {
    // Handle common date formats and convert to ISO format
    if (!dateString) return '';
    
    try {
      // Parse common date formats
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
   * Format a file size in bytes to a human-readable string
   * @param bytes - The file size in bytes
   * @param decimals - Number of decimal places to show
   * @returns Formatted file size string
   */
  export const formatFileSize = (bytes: number, decimals: number = 2): string => {
    if (bytes === 0) return '0 Bytes';
  
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
  };
  
  /**
   * Format a number with thousands separators
   * @param value - The number to format
   * @param options - Formatting options 
   * @returns Formatted number string
   */
  export const formatNumber = (
    value: number | string | null | undefined,
    options: { locale?: string; maximumFractionDigits?: number } = {}
  ): string => {
    // Default options
    const { locale = 'en-US', maximumFractionDigits = 2 } = options;
    
    // If value is nullish, return '0'
    if (value === null || value === undefined) return '0';
    
    // Convert string to number if needed
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    
    // Return formatted number
    return new Intl.NumberFormat(locale, {
      maximumFractionDigits
    }).format(numValue);
  };
  
  /**
   * Format a percentage value
   * @param value - The decimal value to format as percentage
   * @param options - Formatting options
   * @returns Formatted percentage string
   */
  export const formatPercentage = (
    value: number | string | null | undefined,
    options: { locale?: string; maximumFractionDigits?: number } = {}
  ): string => {
    // Default options
    const { locale = 'en-US', maximumFractionDigits = 1 } = options;
    
    // If value is nullish, return '0%'
    if (value === null || value === undefined) return '0%';
    
    // Convert string to number if needed
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    
    // Return formatted percentage
    return new Intl.NumberFormat(locale, {
      style: 'percent',
      maximumFractionDigits
    }).format(numValue);
  };
  
  /**
   * Truncate text to a maximum length
   * @param text - Text to truncate
   * @param maxLength - Maximum length
   * @param suffix - Suffix to append to truncated text
   * @returns Truncated text
   */
  export const truncateText = (
    text: string,
    maxLength: number = 50,
    suffix: string = '...'
  ): string => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    
    return text.substring(0, maxLength) + suffix;
  };