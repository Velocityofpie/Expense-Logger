// frontend/src/features/tools/exports_imports/utils/importUtils.ts
import Papa from 'papaparse';
import * as XLSX from 'sheetjs';
import { FileFormat, ImportResult, FieldMapping } from '../types';

/**
 * Parse a file based on its format
 * @param file The file to parse
 * @param format The file format
 * @returns A promise that resolves to the parsed data
 */
export const parseFile = async (file: File, format: FileFormat): Promise<any[]> => {
  switch (format) {
    case 'csv':
      return parseCSV(file);
    case 'excel':
      return parseExcel(file);
    case 'json':
      return parseJSON(file);
    case 'qif':
    case 'ofx':
      return parseFinancialFormat(file, format);
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
};

/**
 * Parse a CSV file
 * @param file The CSV file to parse
 * @returns A promise that resolves to the parsed data
 */
export const parseCSV = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => {
        if (results.errors && results.errors.length > 0) {
          console.error('CSV parsing errors:', results.errors);
        }
        resolve(results.data);
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};

/**
 * Parse an Excel file
 * @param file The Excel file to parse
 * @returns A promise that resolves to the parsed data
 */
export const parseExcel = async (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        // Convert to objects with headers as keys
        if (jsonData.length > 1) {
          const headers = jsonData[0] as string[];
          const rows = jsonData.slice(1);
          
          const result = rows.map(row => {
            const obj: Record<string, any> = {};
            headers.forEach((header, i) => {
              obj[header] = (row as any[])[i];
            });
            return obj;
          });
          
          resolve(result);
        } else {
          resolve([]);
        }
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = (error) => {
      reject(error);
    };
    
    reader.readAsBinaryString(file);
  });
};

/**
 * Parse a JSON file
 * @param file The JSON file to parse
 * @returns A promise that resolves to the parsed data
 */
export const parseJSON = async (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const jsonText = e.target?.result as string;
        const data = JSON.parse(jsonText);
        
        // Handle both array and object formats
        const result = Array.isArray(data) ? data : [data];
        resolve(result);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = (error) => {
      reject(error);
    };
    
    reader.readAsText(file);
  });
};

/**
 * Parse a financial format file (QIF, OFX)
 * @param file The file to parse
 * @param format The file format
 * @returns A promise that resolves to the parsed data
 */
export const parseFinancialFormat = async (file: File, format: 'qif' | 'ofx'): Promise<any[]> => {
  // In a real application, this would use specialized libraries for parsing financial formats
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        let result: any[] = [];
        
        if (format === 'qif') {
          // Basic QIF parsing (simplified)
          result = parseQIF(text);
        } else if (format === 'ofx') {
          // Basic OFX parsing (simplified)
          result = parseOFX(text);
        }
        
        resolve(result);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = (error) => {
      reject(error);
    };
    
    reader.readAsText(file);
  });
};

/**
 * Parse QIF format text
 * @param text The QIF text content
 * @returns The parsed transactions
 */
export const parseQIF = (text: string): any[] => {
  // A very simplified QIF parser - real implementation would be more complex
  const transactions: any[] = [];
  const blocks = text.split('^\n');
  
  blocks.forEach(block => {
    if (!block.trim()) return;
    
    const lines = block.split('\n');
    const transaction: Record<string, any> = {};
    
    lines.forEach(line => {
      if (!line) return;
      
      const type = line[0];
      const value = line.substring(1).trim();
      
      switch (type) {
        case 'D': // Date
          transaction.date = value;
          break;
        case 'T': // Amount
          transaction.amount = parseFloat(value);
          break;
        case 'P': // Payee
          transaction.payee = value;
          break;
        case 'M': // Memo
          transaction.memo = value;
          break;
        case 'L': // Category
          transaction.category = value;
          break;
      }
    });
    
    if (Object.keys(transaction).length > 0) {
      transactions.push(transaction);
    }
  });
  
  return transactions;
};

/**
 * Parse OFX format text
 * @param text The OFX text content
 * @returns The parsed transactions
 */
export const parseOFX = (text: string): any[] => {
  // A very simplified OFX parser - real implementation would use a proper XML parser
  const transactions: any[] = [];
  
  // Extract transaction blocks
  const transactionMatches = text.match(/<STMTTRN>([\s\S]*?)<\/STMTTRN>/g);
  
  if (transactionMatches) {
    transactionMatches.forEach(transactionBlock => {
      const transaction: Record<string, any> = {};
      
      // Extract date
      const dateMatch = transactionBlock.match(/<DTPOSTED>(.*?)<\/DTPOSTED>/);
      if (dateMatch) {
        transaction.date = formatOFXDate(dateMatch[1]);
      }
      
      // Extract amount
      const amountMatch = transactionBlock.match(/<TRNAMT>(.*?)<\/TRNAMT>/);
      if (amountMatch) {
        transaction.amount = parseFloat(amountMatch[1]);
      }
      
      // Extract name/payee
      const nameMatch = transactionBlock.match(/<NAME>(.*?)<\/NAME>/);
      if (nameMatch) {
        transaction.payee = nameMatch[1];
      }
      
      // Extract memo
      const memoMatch = transactionBlock.match(/<MEMO>(.*?)<\/MEMO>/);
      if (memoMatch) {
        transaction.memo = memoMatch[1];
      }
      
      if (Object.keys(transaction).length > 0) {
        transactions.push(transaction);
      }
    });
  }
  
  return transactions;
};

/**
 * Format an OFX date string (YYYYMMDD) to ISO format
 * @param dateString The OFX date string
 * @returns The formatted date string
 */
export const formatOFXDate = (dateString: string): string => {
  // YYYYMMDD to YYYY-MM-DD
  if (dateString.length >= 8) {
    const year = dateString.substring(0, 4);
    const month = dateString.substring(4, 6);
    const day = dateString.substring(6, 8);
    return `${year}-${month}-${day}`;
  }
  return dateString;
};

/**
 * Apply field mapping to data
 * @param data The source data
 * @param mapping The field mapping
 * @returns The mapped data
 */
export const applyFieldMapping = (data: any[], mapping: Record<string, string>): any[] => {
  return data.map(item => {
    const result: Record<string, any> = {};
    
    // Apply the mapping
    Object.entries(mapping).forEach(([sourceField, targetField]) => {
      if (targetField && sourceField in item) {
        result[targetField] = item[sourceField];
      }
    });
    
    return result;
  });
};

/**
 * Validate imported data against schema
 * @param data The data to validate
 * @returns Validation results
 */
export const validateImportData = (data: any[]): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Basic validation
  data.forEach((item, index) => {
    // Check required fields
    if (!item.merchant_name) {
      errors.push(`Row ${index + 1}: Missing merchant name`);
    }
    
    // Validate date format
    if (item.purchase_date && !/^\d{4}-\d{2}-\d{2}$/.test(item.purchase_date)) {
      errors.push(`Row ${index + 1}: Invalid date format. Expected YYYY-MM-DD`);
    }
    
    // Validate numeric fields
    if (item.grand_total && isNaN(parseFloat(item.grand_total))) {
      errors.push(`Row ${index + 1}: Grand total must be a number`);
    }
    
    if (item.quantity && isNaN(parseInt(item.quantity))) {
      errors.push(`Row ${index + 1}: Quantity must be a number`);
    }
    
    if (item.unit_price && isNaN(parseFloat(item.unit_price))) {
      errors.push(`Row ${index + 1}: Unit price must be a number`);
    }
  });
  
  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Process the import
 * @param data The data to import
 * @returns Import results
 */
export const processImport = async (data: any[]): Promise<ImportResult> => {
  try {
    // In a real application, this would call an API to import the data
    // Simulate some failures
    const failedIndices = [];
    for (let i = 0; i < data.length; i++) {
      if (Math.random() < 0.05) { // 5% chance of failure per record
        failedIndices.push(i);
      }
    }
    
    const importedCount = data.length - failedIndices.length;
    
    // Generate errors
    const errors = failedIndices.map(index => {
      const reasons = [
        'Invalid date format',
        'Missing required field',
        'Duplicate entry',
        'Invalid amount'
      ];
      const reason = reasons[Math.floor(Math.random() * reasons.length)];
      return `${reason} in row ${index + 1}`;
    });
    
    return {
      success: importedCount > 0,
      totalRecords: data.length,
      importedRecords: importedCount,
      failedRecords: failedIndices.length,
      warnings: Math.floor(Math.random() * 3), // 0-2 warnings
      errors: errors
    };
  } catch (error) {
    return {
      success: false,
      totalRecords: data.length,
      importedRecords: 0,
      failedRecords: data.length,
      warnings: 0,
      errors: [(error as Error).message]
    };
  }
};

/**
 * Get template suggestions based on file content
 * @param data The parsed file data
 * @returns An array of template IDs that might match the data
 */
export const getSuggestedTemplates = (data: any[]): string[] => {
  if (!data || data.length === 0) return [];
  
  const suggestedTemplates: string[] = [];
  const firstRow = data[0];
  const fieldNames = Object.keys(firstRow).map(key => key.toLowerCase());
  
  // Check for Amazon order format
  if (
    fieldNames.includes('order id') || 
    fieldNames.includes('orderid') || 
    (fieldNames.includes('order') && fieldNames.includes('date') && fieldNames.includes('total'))
  ) {
    suggestedTemplates.push('amazon-template');
  }
  
  // Check for bank statement format
  if (
    fieldNames.includes('transaction') && 
    fieldNames.includes('date') && 
    (fieldNames.includes('deposit') || fieldNames.includes('withdrawal') || fieldNames.includes('amount'))
  ) {
    suggestedTemplates.push('bank-template');
  }
  
  // Check for credit card statement
  if (
    fieldNames.includes('transaction') && 
    fieldNames.includes('date') && 
    fieldNames.includes('amount') && 
    (fieldNames.includes('card') || fieldNames.includes('credit'))
  ) {
    suggestedTemplates.push('credit-card-template');
  }
  
  return suggestedTemplates;
};

/**
 * Load an import template
 * @param templateId The template ID
 * @returns The template object
 */
export const loadImportTemplate = async (templateId: string): Promise<any> => {
  // In a real app, this would fetch from an API
  const templates: Record<string, any> = {
    'amazon-template': {
      id: 'amazon-template',
      name: 'Amazon Orders',
      description: 'Template for Amazon order history',
      format: 'csv',
      fieldMapping: {
        'Order ID': 'order_number',
        'Order Date': 'purchase_date',
        'Total Charged': 'grand_total',
        'Shipping Address': 'billing_address',
        'Payment Method': 'payment_method',
        'Item Name': 'product_name',
        'Quantity': 'quantity',
        'Item Price': 'unit_price'
      }
    },
    'bank-template': {
      id: 'bank-template',
      name: 'Bank Statement',
      description: 'Template for bank transactions',
      format: 'csv',
      fieldMapping: {
        'Transaction Date': 'purchase_date',
        'Description': 'merchant_name',
        'Deposit': 'payment_amount',
        'Withdrawal': 'grand_total',
        'Balance': 'account_balance'
      }
    }
  };
  
  return templates[templateId] || null;
};