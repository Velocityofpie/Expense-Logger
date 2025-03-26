/**
 * Utility functions for data validation
 */

/**
 * Check if a value is a valid email address
 * @param email - Email address to validate
 * @returns Whether the email is valid
 */
export const isValidEmail = (email: string): boolean => {
    // Basic email validation regex
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };
  
  /**
   * Check if a value is a valid URL
   * @param url - URL to validate
   * @param requireProtocol - Whether protocol (http/https) is required
   * @returns Whether the URL is valid
   */
  export const isValidUrl = (url: string, requireProtocol: boolean = true): boolean => {
    if (!url) return false;
  
    try {
      const urlObj = new URL(url);
      if (requireProtocol) {
        return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
      }
      return true;
    } catch {
      return false;
    }
  };
  
  /**
   * Check if a string is a valid date
   * @param dateString - Date string to validate
   * @returns Whether the date is valid
   */
  export const isValidDate = (dateString: string): boolean => {
    if (!dateString) return false;
    
    // Try to create a date object
    const date = new Date(dateString);
    
    // Check if the date is valid
    return !isNaN(date.getTime());
  };
  
  /**
   * Check if a value is a number or can be converted to a number
   * @param value - Value to check
   * @returns Whether the value is a valid number
   */
  export const isValidNumber = (value: any): boolean => {
    if (typeof value === 'number') return !isNaN(value);
    if (typeof value === 'string') return !isNaN(Number(value)) && value.trim() !== '';
    return false;
  };
  
  /**
   * Check if a value is a valid credit card number using Luhn algorithm
   * @param cardNumber - Credit card number to validate
   * @returns Whether the card number is valid
   */
  export const isValidCreditCard = (cardNumber: string): boolean => {
    // Remove all non-digit characters
    const sanitized = cardNumber.replace(/\D/g, '');
    
    // Check if length is valid (most cards are 13-19 digits)
    if (sanitized.length < 13 || sanitized.length > 19) return false;
    
    // Luhn algorithm implementation
    let sum = 0;
    let double = false;
    
    // Process from right to left
    for (let i = sanitized.length - 1; i >= 0; i--) {
      let digit = parseInt(sanitized.charAt(i));
      
      // Double every second digit
      if (double) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      
      sum += digit;
      double = !double;
    }
    
    // The sum must be divisible by 10
    return sum % 10 === 0;
  };
  
  /**
   * Check if a password meets minimum strength requirements
   * @param password - Password to validate
   * @param options - Validation options
   * @returns Whether the password meets the requirements
   */
  export const isStrongPassword = (
    password: string, 
    options: {
      minLength?: number;
      requireLowercase?: boolean;
      requireUppercase?: boolean;
      requireNumbers?: boolean;
      requireSpecialChars?: boolean;
    } = {}
  ): boolean => {
    const {
      minLength = 8,
      requireLowercase = true,
      requireUppercase = true,
      requireNumbers = true,
      requireSpecialChars = true
    } = options;
    
    // Check minimum length
    if (password.length < minLength) return false;
    
    // Check for lowercase letters
    if (requireLowercase && !/[a-z]/.test(password)) return false;
    
    // Check for uppercase letters
    if (requireUppercase && !/[A-Z]/.test(password)) return false;
    
    // Check for numbers
    if (requireNumbers && !/\d/.test(password)) return false;
    
    // Check for special characters
    if (requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) return false;
    
    return true;
  };
  
  /**
   * Check if a phone number is valid
   * @param phoneNumber - Phone number to validate
   * @param countryCode - Country code for validation (default: 'US')
   * @returns Whether the phone number is valid
   */
  export const isValidPhoneNumber = (phoneNumber: string, countryCode: string = 'US'): boolean => {
    // Remove all non-digit characters except +
    const sanitized = phoneNumber.replace(/[^\d+]/g, '');
    
    // Basic validation for US numbers
    if (countryCode === 'US') {
      // Allow formats like: +1XXXXXXXXXX, 1XXXXXXXXXX, or XXXXXXXXXX
      return /^(\+?1)?[2-9]\d{9}$/.test(sanitized);
    }
    
    // For international numbers, just ensure we have at least 7 digits
    // In a real application, you'd want a more comprehensive validation library
    return sanitized.replace(/\D/g, '').length >= 7;
  };
  
  /**
   * Check if a string is empty (null, undefined, or whitespace)
   * @param value - String to check
   * @returns Whether the string is empty
   */
  export const isEmpty = (value: string | null | undefined): boolean => {
    return value === null || value === undefined || value.trim() === '';
  };
  
  /**
   * Check if a value is within a specified numeric range
   * @param value - Value to check
   * @param min - Minimum allowable value
   * @param max - Maximum allowable value
   * @returns Whether the value is within range
   */
  export const isInRange = (value: number, min: number, max: number): boolean => {
    return value >= min && value <= max;
  };