// frontend/src/features/tools/exports_imports/utils/formatConversions.ts
import Papa from 'papaparse';
import * as XLSX from 'sheetjs';
import { FileFormat } from '../types';

/**
 * Convert data between different formats
 * @param data The data to convert
 * @param sourceFormat The current format of the data
 * @param targetFormat The format to convert to
 * @returns The converted data
 */
export const convertFormat = (
  data: any, 
  sourceFormat: FileFormat, 
  targetFormat: FileFormat
): any => {
  // If source and target formats are the same, return the data unchanged
  if (sourceFormat === targetFormat) {
    return data;
  }

  // Convert to an intermediate JSON format first if not already
  let jsonData: any[];
  if (sourceFormat === 'json') {
    jsonData = Array.isArray(data) ? data : [data];
  } else {
    jsonData = convertToJson(data, sourceFormat);
  }

  // Then convert from JSON to the target format
  return convertFromJson(jsonData, targetFormat);
};

/**
 * Convert data to JSON format
 * @param data The data to convert
 * @param sourceFormat The current format of the data
 * @returns The data in JSON format
 */
export const convertToJson = (data: any, sourceFormat: FileFormat): any[] => {
  switch (sourceFormat) {
    case 'csv':
      return convertCsvToJson(data);
    case 'excel':
      return convertExcelToJson(data);
    case 'json':
      return Array.isArray(data) ? data : [data];
    case 'qif':
      return convertQifToJson(data);
    case 'ofx':
      return convertOfxToJson(data);
    default:
      throw new Error(`Conversion from ${sourceFormat} to JSON is not supported`);
  }
};

/**
 * Convert data from JSON format to another format
 * @param data The JSON data to convert
 * @param targetFormat The format to convert to
 * @returns The converted data
 */
export const convertFromJson = (data: any[], targetFormat: FileFormat): any => {
  switch (targetFormat) {
    case 'csv':
      return convertJsonToCsv(data);
    case 'excel':
      return convertJsonToExcel(data);
    case 'json':
      return data;
    default:
      throw new Error(`Conversion from JSON to ${targetFormat} is not supported`);
  }
};

/**
 * Convert CSV string to JSON
 * @param csvString The CSV string to convert
 * @returns The data as a JSON array
 */
export const convertCsvToJson = (csvString: string): any[] => {
  const result = Papa.parse(csvString, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true
  });
  
  return result.data as any[];
};

/**
 * Convert JSON data to CSV string
 * @param jsonData The JSON data to convert
 * @returns The data as a CSV string
 */
export const convertJsonToCsv = (jsonData: any[]): string => {
  return Papa.unparse(jsonData);
};

/**
 * Convert Excel data to JSON
 * @param excelData The Excel data to convert
 * @returns The data as a JSON array
 */
export const convertExcelToJson = (excelData: any): any[] => {
  const workbook = XLSX.read(excelData, { type: 'binary' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  return XLSX.utils.sheet_to_json(worksheet);
};

/**
 * Convert JSON data to Excel
 * @param jsonData The JSON data to convert
 * @returns The data as an Excel workbook
 */
export const convertJsonToExcel = (jsonData: any[]): any => {
  const worksheet = XLSX.utils.json_to_sheet(jsonData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  return workbook;
};

/**
 * Convert QIF string to JSON
 * @param qifString The QIF string to convert
 * @returns The data as a JSON array
 */
export const convertQifToJson = (qifString: string): any[] => {
  const transactions: any[] = [];
  const blocks = qifString.split('^\n');
  
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
          transaction.merchant_name = value;
          break;
        case 'M': // Memo
          transaction.notes = value;
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
 * Convert OFX string to JSON
 * @param ofxString The OFX string to convert
 * @returns The data as a JSON array
 */
export const convertOfxToJson = (ofxString: string): any[] => {
  const transactions: any[] = [];
  
  // Extract transaction blocks
  const transactionMatches = ofxString.match(/<STMTTRN>([\s\S]*?)<\/STMTTRN>/g);
  
  if (transactionMatches) {
    transactionMatches.forEach(transactionBlock => {
      const transaction: Record<string, any> = {};
      
      // Extract date
      const dateMatch = transactionBlock.match(/<DTPOSTED>(.*?)<\/DTPOSTED>/);
      if (dateMatch) {
        const rawDate = dateMatch[1];
        // Format: YYYYMMDD
        if (rawDate.length >= 8) {
          const year = rawDate.substring(0, 4);
          const month = rawDate.substring(4, 6);
          const day = rawDate.substring(6, 8);
          transaction.date = `${year}-${month}-${day}`;
        } else {
          transaction.date = rawDate;
        }
      }
      
      // Extract amount
      const amountMatch = transactionBlock.match(/<TRNAMT>(.*?)<\/TRNAMT>/);
      if (amountMatch) {
        transaction.amount = parseFloat(amountMatch[1]);
        
        // If amount is negative, it's a payment/expense
        if (transaction.amount < 0) {
          transaction.grand_total = Math.abs(transaction.amount);
        } else {
          transaction.payment_amount = transaction.amount;
        }
      }
      
      // Extract name/payee
      const nameMatch = transactionBlock.match(/<NAME>(.*?)<\/NAME>/);
      if (nameMatch) {
        transaction.merchant_name = nameMatch[1];
      }
      
      // Extract memo
      const memoMatch = transactionBlock.match(/<MEMO>(.*?)<\/MEMO>/);
      if (memoMatch) {
        transaction.notes = memoMatch[1];
      }
      
      // Extract reference number / order number
      const refMatch = transactionBlock.match(/<REFNUM>(.*?)<\/REFNUM>/);
      if (refMatch) {
        transaction.order_number = refMatch[1];
      }
      
      if (Object.keys(transaction).length > 0) {
        transactions.push(transaction);
      }
    });
  }
  
  return transactions;
};

/**
 * Detect file format based on file extension and content
 * @param file The file to analyze
 * @returns The detected format
 */
export const detectFileFormat = async (file: File): Promise<FileFormat> => {
  // First check by file extension
  const extension = file.name.split('.').pop()?.toLowerCase();
  
  if (extension === 'csv') {
    return 'csv';
  } else if (extension === 'xlsx' || extension === 'xls') {
    return 'excel';
  } else if (extension === 'json') {
    return 'json';
  } else if (extension === 'pdf') {
    return 'pdf';
  } else if (extension === 'qif') {
    return 'qif';
  } else if (extension === 'ofx') {
    return 'ofx';
  } else if (extension === 'xml') {
    return 'xml';
  }
  
  // If extension doesn't help, try to detect by content
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer).subarray(0, 4);
  const header = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  
  // PDF signature: %PDF (hex: 25 50 44 46)
  if (header.startsWith('25504446')) {
    return 'pdf';
  }
  
  // Excel signature: D0 CF 11 E0 (old XLS) or 50 4B 03 04 (XLSX, which is a ZIP file)
  if (header === 'd0cf11e0' || header === '504b0304') {
    return 'excel';
  }
  
  // For text-based formats, look at the content
  const text = await file.text();
  const firstLine = text.split('\n')[0].trim();
  
  // CSV typically has commas
  if (firstLine.includes(',')) {
    return 'csv';
  }
  
  // JSON starts with { or [
  if (firstLine.startsWith('{') || firstLine.startsWith('[')) {
    return 'json';
  }
  
  // QIF starts with !Type:
  if (firstLine.startsWith('!Type:')) {
    return 'qif';
  }
  
  // OFX/XML is an XML format, starts with <?xml or <OFX
  if (firstLine.startsWith('<?xml') || firstLine.startsWith('<OFX')) {
    return 'ofx';
  }
  
  // Default to CSV if we can't determine the format
  return 'csv';
};

/**
 * Get a friendly name for a file format
 * @param format The file format
 * @returns A human-readable name
 */
export const getFormatName = (format: FileFormat): string => {
  switch (format) {
    case 'csv':
      return 'CSV (Comma-Separated Values)';
    case 'excel':
      return 'Excel Spreadsheet';
    case 'pdf':
      return 'PDF Document';
    case 'json':
      return 'JSON (JavaScript Object Notation)';
    case 'xml':
      return 'XML (Extensible Markup Language)';
    case 'qif':
      return 'QIF (Quicken Interchange Format)';
    case 'ofx':
      return 'OFX (Open Financial Exchange)';
    case 'zip':
      return 'ZIP Archive';
    default:
      return 'Unknown Format';
  }
};

/**
 * Get the file extension for a format
 * @param format The file format
 * @returns The file extension
 */
export const getFormatExtension = (format: FileFormat): string => {
  switch (format) {
    case 'csv':
      return '.csv';
    case 'excel':
      return '.xlsx';
    case 'pdf':
      return '.pdf';
    case 'json':
      return '.json';
    case 'xml':
      return '.xml';
    case 'qif':
      return '.qif';
    case 'ofx':
      return '.ofx';
    case 'zip':
      return '.zip';
    default:
      return '';
  }
};

/**
 * Get the MIME type for a format
 * @param format The file format
 * @returns The MIME type
 */
export const getFormatMimeType = (format: FileFormat): string => {
  switch (format) {
    case 'csv':
      return 'text/csv';
    case 'excel':
      return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    case 'pdf':
      return 'application/pdf';
    case 'json':
      return 'application/json';
    case 'xml':
      return 'application/xml';
    case 'qif':
      return 'application/qif';
    case 'ofx':
      return 'application/ofx';
    case 'zip':
      return 'application/zip';
    default:
      return 'application/octet-stream';
  }
};