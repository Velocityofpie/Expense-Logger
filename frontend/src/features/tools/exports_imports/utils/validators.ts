// frontend/src/features/tools/exports_imports/utils/validators.ts
import { FileFormat } from '../types';

/**
 * Validate file size
 * @param file The file to validate
 * @param maxSizeInBytes The maximum allowed size in bytes
 * @returns Whether the file size is valid
 */
export const validateFileSize = (file: File, maxSizeInBytes: number = 10 * 1024 * 1024): boolean => {
  return file.size <= maxSizeInBytes;
};

/**
 * Validate file format
 * @param file The file to validate
 * @param allowedFormats The allowed formats
 * @returns Whether the file format is valid
 */
export const validateFileFormat = (file: File, allowedFormats: FileFormat[]): boolean => {
  const extension = file.name.split('.').pop()?.toLowerCase();
  
  // Map extensions to formats
  const formatsByExtension: Record<string, FileFormat> = {
    'csv': 'csv',
    'xlsx': 'excel',
    'xls': 'excel',
    'json': 'json',
    'pdf': 'pdf',
    'qif': 'qif',
    'ofx': 'ofx',
    'xml': 'xml',
    'zip': 'zip'
  };
  
  const format = extension ? formatsByExtension[extension] : undefined;
  
  return format !== undefined && allowedFormats.includes(format);
};

/**
 * Validate a date string
 * @param dateString The date string to validate
 * @param format The expected format ('ISO', 'US', 'EU', or 'any')
 * @returns Whether the date is valid
 */
export const validateDateString = (dateString: string, format: 'ISO' | 'US' | 'EU' | 'any' = 'any'): boolean => {
  if (!dateString) return false;
  
  // Regular expressions for different date formats
  const patterns: Record<string, RegExp> = {
    ISO: /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
    US: /^\d{1,2}\/\d{1,2}\/\d{4}$/, // MM/DD/YYYY
    EU: /^\d{1,2}\.\d{1,2}\.\d{4}$/ // DD.MM.YYYY
  };
  
  // Check if date matches the specified format
  if (format !== 'any' && !patterns[format].test(dateString)) {
    return false;
  }
  
  // Validate the date values
  let year: number;
  let month: number;
  let day: number;
  
  if (format === 'ISO' || (format === 'any' && patterns.ISO.test(dateString))) {
    const parts = dateString.split('-');
    year = parseInt(parts[0], 10);
    month = parseInt(parts[1], 10);
    day = parseInt(parts[2], 10);
  } else if (format === 'US' || (format === 'any' && patterns.US.test(dateString))) {
    const parts = dateString.split('/');
    month = parseInt(parts[0], 10);
    day = parseInt(parts[1], 10);
    year = parseInt(parts[2], 10);
  } else if (format === 'EU' || (format === 'any' && patterns.EU.test(dateString))) {
    const parts = dateString.split('.');
    day = parseInt(parts[0], 10);
    month = parseInt(parts[1], 10);
    year = parseInt(parts[2], 10);
  } else {
    // Try to parse with Date constructor
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  }
  
  // Check if the date values are valid
  if (month < 1 || month > 12) return false;
  
  // Check days in month
  const daysInMonth = new Date(year, month, 0).getDate();
  return day > 0 && day <= daysInMonth;
};

/**
 * Validate a numeric value
 * @param value The value to validate
 * @param options Validation options
 * @returns Whether the value is valid
 */
export const validateNumber = (
  value: any,
  options: {
    allowNegative?: boolean;
    min?: number;
    max?: number;
    isInteger?: boolean;
  } = {}
): boolean => {
  const { allowNegative = true, min, max, isInteger = false } = options;
  
  // Convert to number if it's a string
  const num = typeof value === 'string' ? parseFloat(value) : value;
  
  // Check if it's a valid number
  if (typeof num !== 'number' || isNaN(num)) return false;
  
  // Check if it's negative
  if (!allowNegative && num < 0) return false;
  
  // Check if it's an integer
  if (isInteger && !Number.isInteger(num)) return false;
  
  // Check range
  if (min !== undefined && num < min) return false;
  if (max !== undefined && num > max) return false;
  
  return true;
};

/**
 * Validate field mappings
 * @param mapping The field mapping
 * @param requiredFields The fields that must be mapped
 * @returns Validation result with errors
 */
export const validateFieldMapping = (
  mapping: Record<string, string>,
  requiredFields: string[]
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  const mappedFields = Object.values(mapping).filter(Boolean);
  
  // Check if required fields are mapped
  for (const field of requiredFields) {
    if (!mappedFields.includes(field)) {
      errors.push(`Required field "${field}" is not mapped`);
    }
  }
  
  // Check for duplicate mappings
  const fieldCounts: Record<string, number> = {};
  
  for (const field of mappedFields) {
    fieldCounts[field] = (fieldCounts[field] || 0) + 1;
    
    if (fieldCounts[field] > 1) {
      errors.push(`Field "${field}" is mapped multiple times`);
      break; // Only report once per field
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Validate import data
 * @param data The data to validate
 * @param schema Validation schema
 * @returns Validation result with errors
 */
export const validateData = (
  data: any[],
  schema: Record<string, {
    type: 'string' | 'number' | 'date' | 'boolean';
    required?: boolean;
    validate?: (value: any) => boolean;
  }>
): { valid: boolean; errors: { row: number; field: string; message: string }[] } => {
  const errors: { row: number; field: string; message: string }[] = [];
  
  data.forEach((row, rowIndex) => {
    for (const [field, rules] of Object.entries(schema)) {
      const value = row[field];
      
      // Check required fields
      if (rules.required && (value === undefined || value === null || value === '')) {
        errors.push({
          row: rowIndex + 1,
          field,
          message: `${field} is required`
        });
        continue;
      }
      
      // Skip validation for empty optional fields
      if ((value === undefined || value === null || value === '') && !rules.required) {
        continue;
      }
      
      // Type validation
      switch (rules.type) {
        case 'string':
          if (typeof value !== 'string') {
            errors.push({
              row: rowIndex + 1,
              field,
              message: `${field} must be a string`
            });
          }
          break;
        case 'number':
          if (typeof value !== 'number' && isNaN(parseFloat(value))) {
            errors.push({
              row: rowIndex + 1,
              field,
              message: `${field} must be a number`
            });
          }
          break;
        case 'date':
          if (!validateDateString(String(value), 'any')) {
            errors.push({
              row: rowIndex + 1,
              field,
              message: `${field} must be a valid date`
            });
          }
          break;
        case 'boolean':
          if (typeof value !== 'boolean' && value !== 'true' && value !== 'false' && value !== 1 && value !== 0) {
            errors.push({
              row: rowIndex + 1,
              field,
              message: `${field} must be a boolean`
            });
          }
          break;
      }
      
      // Custom validation
      if (rules.validate && !rules.validate(value)) {
        errors.push({
          row: rowIndex + 1,
          field,
          message: `${field} failed validation`
        });
      }
    }
  });
  
  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Validate template configuration
 * @param template The template to validate
 * @returns Validation result with errors
 */
export const validateTemplate = (
  template: {
    name: string;
    fields: Array<{
      field_name: string;
      extraction: {
        regex: string;
      };
    }>;
  }
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Check name
  if (!template.name || template.name.trim() === '') {
    errors.push('Template name is required');
  }
  
  // Check fields
  if (!template.fields || !Array.isArray(template.fields) || template.fields.length === 0) {
    errors.push('At least one field is required');
  } else {
    const fieldNames = new Set<string>();
    
    template.fields.forEach((field, index) => {
      // Check field name
      if (!field.field_name || field.field_name.trim() === '') {
        errors.push(`Field ${index + 1} name is required`);
      } else if (fieldNames.has(field.field_name)) {
        errors.push(`Duplicate field name: ${field.field_name}`);
      } else {
        fieldNames.add(field.field_name);
      }
      
      // Check regex
      if (!field.extraction || !field.extraction.regex) {
        errors.push(`Extraction regex is required for field ${field.field_name || index + 1}`);
      } else {
        try {
          new RegExp(field.extraction.regex);
        } catch (e) {
          errors.push(`Invalid regex for field ${field.field_name || index + 1}: ${e}`);
        }
      }
    });
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};