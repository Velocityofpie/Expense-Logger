/**
 * Utility functions for form and data validation
 */

/**
 * Validates if a string is a valid email address
 * @param email - The email address to validate
 * @returns True if the email is valid, false otherwise
 */
export const isValidEmail = (email: string): boolean => {
    // Simple regex for email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  /**
   * Validates if a string is a valid URL
   * @param url - The URL to validate
   * @returns True if the URL is valid, false otherwise
   */
  export const isValidUrl = (url: string): boolean => {
    try {
      // Use the URL constructor for validation
      new URL(url);
      return true;
    } catch (err) {
      return false;
    }
  };
  
  /**
   * Checks if a string is empty or contains only whitespace
   * @param value - The string to check
   * @returns True if the string is empty or whitespace, false otherwise
   */
  export const isEmpty = (value: string | null | undefined): boolean => {
    return value === null || value === undefined || value.trim() === '';
  };
  
  /**
   * Validates that a number is within a given range
   * @param value - The number to validate
   * @param min - The minimum allowed value (optional)
   * @param max - The maximum allowed value (optional)
   * @returns True if the number is within range, false otherwise
   */
  export const isInRange = (
    value: number,
    min?: number,
    max?: number
  ): boolean => {
    if (min !== undefined && value < min) return false;
    if (max !== undefined && value > max) return false;
    return true;
  };
  
  /**
   * Validates a password against common security rules
   * @param password - The password to validate
   * @returns An object with validation result and error message
   */
  export const validatePassword = (
    password: string
  ): { isValid: boolean; message: string } => {
    if (password.length < 8) {
      return { isValid: false, message: 'Password must be at least 8 characters long' };
    }
    
    if (!/[A-Z]/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one uppercase letter' };
    }
    
    if (!/[a-z]/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one lowercase letter' };
    }
    
    if (!/[0-9]/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one number' };
    }
    
    if (!/[^A-Za-z0-9]/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one special character' };
    }
    
    return { isValid: true, message: 'Password is valid' };
  };
  
  /**
   * Validates a credit card number using the Luhn algorithm
   * @param cardNumber - The credit card number to validate
   * @returns True if the credit card number is valid, false otherwise
   */
  export const isValidCreditCard = (cardNumber: string): boolean => {
    // Remove all non-digit characters
    const digits = cardNumber.replace(/\D/g, '');
    
    if (digits.length < 13 || digits.length > 19) {
      return false;
    }
    
    // Luhn algorithm
    let sum = 0;
    let shouldDouble = false;
    
    // Start from the rightmost digit and process each digit
    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = parseInt(digits.charAt(i));
      
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    
    // If the sum is divisible by 10, the number is valid
    return sum % 10 === 0;
  };
  
  /**
   * Validates if a date string is in a valid format and represents a valid date
   * @param dateString - The date string to validate
   * @param format - The expected format (ISO, US, or EU)
   * @returns True if the date is valid, false otherwise
   */
  export const isValidDate = (
    dateString: string,
    format: 'ISO' | 'US' | 'EU' = 'ISO'
  ): boolean => {
    if (!dateString) return false;
    
    let day: number;
    let month: number;
    let year: number;
    
    // Match based on format
    if (format === 'ISO') {
      // YYYY-MM-DD
      const matches = dateString.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (!matches) return false;
      
      year = parseInt(matches[1]);
      month = parseInt(matches[2]);
      day = parseInt(matches[3]);
    } else if (format === 'US') {
      // MM/DD/YYYY
      const matches = dateString.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      if (!matches) return false;
      
      month = parseInt(matches[1]);
      day = parseInt(matches[2]);
      year = parseInt(matches[3]);
    } else if (format === 'EU') {
      // DD.MM.YYYY
      const matches = dateString.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
      if (!matches) return false;
      
      day = parseInt(matches[1]);
      month = parseInt(matches[2]);
      year = parseInt(matches[3]);
    } else {
      return false;
    }
    
    // Validate year, month, and day ranges
    if (year < 1000 || year > 9999) return false;
    if (month < 1 || month > 12) return false;
    if (day < 1) return false;
    
    // Create a date object and check if the month and day match
    // (this handles leap years and different month lengths)
    const date = new Date(year, month - 1, day);
    return (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    );
  };
  
  /**
   * Validates if a time string is in a valid format
   * @param timeString - The time string to validate (HH:MM or HH:MM:SS)
   * @returns True if the time is valid, false otherwise
   */
  export const isValidTime = (timeString: string): boolean => {
    // HH:MM or HH:MM:SS
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/;
    return timeRegex.test(timeString);
  };
  
  /**
   * Validates a US phone number
   * @param phoneNumber - The phone number to validate
   * @returns True if the phone number is valid, false otherwise
   */
  export const isValidUSPhoneNumber = (phoneNumber: string): boolean => {
    // Remove non-digit characters
    const digits = phoneNumber.replace(/\D/g, '');
    
    // US phone numbers should have 10 digits (or 11 with country code)
    if (digits.length === 10) {
      return true;
    }
    
    if (digits.length === 11 && digits.charAt(0) === '1') {
      return true;
    }
    
    return false;
  };
  
  /**
   * Validates a US ZIP code
   * @param zipCode - The ZIP code to validate
   * @returns True if the ZIP code is valid, false otherwise
   */
  export const isValidUSZipCode = (zipCode: string): boolean => {
    // 5-digit or 5+4 digit format
    const zipRegex = /^\d{5}(?:-\d{4})?$/;
    return zipRegex.test(zipCode);
  };