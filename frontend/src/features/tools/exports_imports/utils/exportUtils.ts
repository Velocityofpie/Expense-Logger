// frontend/src/features/tools/exports_imports/utils/exportUtils.ts
import Papa from 'papaparse';
import * as XLSX from 'sheetjs';
import { FileFormat, ExportResult } from '../types';

/**
 * Export data to a specific format
 * @param data The data to export
 * @param format The export format
 * @param options Export options
 * @returns A promise that resolves to the export result
 */
export const exportData = async (
  data: any[], 
  format: FileFormat,
  options: {
    filename?: string;
    includeAttachments?: boolean;
    password?: string;
  } = {}
): Promise<ExportResult> => {
  try {
    const defaultFilename = `expense_data_export_${new Date().toISOString().split('T')[0]}`;
    const filename = options.filename || defaultFilename;
    
    let downloadUrl: string;
    let fileSize: string;
    
    switch (format) {
      case 'csv':
        downloadUrl = exportToCSV(data, filename);
        fileSize = estimateFileSize(data, format);
        break;
      case 'excel':
        downloadUrl = await exportToExcel(data, filename);
        fileSize = estimateFileSize(data, format);
        break;
      case 'json':
        downloadUrl = exportToJSON(data, filename);
        fileSize = estimateFileSize(data, format);
        break;
      case 'pdf':
        // In a real app, this would generate a PDF
        downloadUrl = `data:application/pdf;base64,${fakePdfData()}`;
        fileSize = '125 KB';
        break;
      case 'zip':
        // In a real app, this would create a ZIP file
        downloadUrl = `data:application/zip;base64,${fakeZipData()}`;
        fileSize = '250 KB';
        break;
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
    
    return {
      success: true,
      format,
      recordCount: data.length,
      fileSize,
      downloadUrl,
      filename: `${filename}.${format === 'excel' ? 'xlsx' : format}`,
      dateSummary: new Date().toLocaleDateString()
    };
  } catch (error) {
    console.error('Export error:', error);
    throw error;
  }
};

/**
 * Export data to CSV format
 * @param data The data to export
 * @param filename The output filename
 * @returns The download URL
 */
export const exportToCSV = (data: any[], filename: string): string => {
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  return URL.createObjectURL(blob);
};

/**
 * Export data to Excel format
 * @param data The data to export
 * @param filename The output filename
 * @returns A promise that resolves to the download URL
 */
export const exportToExcel = async (data: any[], filename: string): Promise<string> => {
  // Create a workbook
  const wb = XLSX.utils.book_new();
  
  // Convert data to worksheet
  const ws = XLSX.utils.json_to_sheet(data);
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Expenses');
  
  // Generate Excel file
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  
  // Create Blob
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
  // Generate download URL
  return URL.createObjectURL(blob);
};

/**
 * Export data to JSON format
 * @param data The data to export
 * @param filename The output filename
 * @returns The download URL
 */
export const exportToJSON = (data: any[], filename: string): string => {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  return URL.createObjectURL(blob);
};

/**
 * Generate a PDF export
 * This is a placeholder - in a real app, this would use a PDF generation library
 * @param data The data to export
 * @param filename The output filename
 * @returns A promise that resolves to the download URL
 */
export const exportToPDF = async (data: any[], filename: string): Promise<string> => {
  // In a real application, this would use a library like jsPDF or pdfmake
  // For this example, we'll just return a fake PDF data URL
  return `data:application/pdf;base64,${fakePdfData()}`;
};

/**
 * Create a ZIP export with multiple files
 * This is a placeholder - in a real app, this would use a ZIP library
 * @param data The data to export
 * @param files Files to include
 * @param filename The output filename
 * @returns A promise that resolves to the download URL
 */
export const exportToZIP = async (
  data: any[], 
  files: File[], 
  filename: string
): Promise<string> => {
  // In a real application, this would use a library like JSZip
  // For this example, we'll just return a fake ZIP data URL
  return `data:application/zip;base64,${fakeZipData()}`;
};

/**
 * Estimate the file size for an export
 * @param data The data to export
 * @param format The export format
 * @returns The estimated file size as a string
 */
export const estimateFileSize = (data: any[], format: FileFormat): string => {
  // A very rough estimation based on format and data size
  const jsonSize = JSON.stringify(data).length;
  
  let sizeInBytes: number;
  
  switch (format) {
    case 'csv':
      sizeInBytes = jsonSize * 0.7; // CSV is typically smaller than JSON
      break;
    case 'excel':
      sizeInBytes = jsonSize * 1.2; // Excel is typically larger than JSON
      break;
    case 'pdf':
      sizeInBytes = jsonSize * 1.5; // PDFs can be larger due to formatting
      break;
    case 'json':
      sizeInBytes = jsonSize;
      break;
    case 'zip':
      sizeInBytes = jsonSize * 0.5; // ZIP compression reduces size
      break;
    default:
      sizeInBytes = jsonSize;
  }
  
  // Convert to appropriate units
  if (sizeInBytes < 1024) {
    return `${Math.ceil(sizeInBytes)} B`;
  } else if (sizeInBytes < 1024 * 1024) {
    return `${Math.ceil(sizeInBytes / 1024)} KB`;
  } else {
    return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
  }
};

/**
 * Generate fake PDF data for demo purposes
 * @returns Base64 encoded fake PDF data
 */
export const fakePdfData = (): string => {
  // This would be actual PDF data in a real app
  return 'JVBERi0xLjcKJeLjz9MKNSAwIG9iago8PC9GaWx0ZXIvRmxhdGVEZWNvZGUvTGVuZ3RoIDM4Pj5zdHJlYW0KeJwr5CrkMlAwMDJSMABCM0NjCwsLC04FI1MFrkKuQgDLdAXJCmVuZHN0cmVhbQplbmRvYmoKNiAwIG9iago8PC9GaWx0ZXIvRmxhdGVEZWNvZGUvTGVuZ3RoIDQ5MDY+PnN0cmVhbQp4nK1aS3PbSBK+61fULS/mwILrwacsW5Ydvx+JN+uZ2';
};

/**
 * Generate fake ZIP data for demo purposes
 * @returns Base64 encoded fake ZIP data
 */
export const fakeZipData = (): string => {
  // This would be actual ZIP data in a real app
  return 'UEsDBBQAAAAAACGDalcAAAAAAAAAAAAAAAASAAAAZXhwb3J0X2V4YW1wbGUuY3N2UEsBAhQDFAAAAAAAIYNqVwAAAAAAAAAAAAAAABIAAAAAAAAAAAAAALaBAAAAAGV4cG9ydF9leGFtcGxlLmNzdlBLBQYAAAAAAQABAEAAAAA4AAAAAAA=';
};

/**
 * Format data for export
 * @param data The raw data to format
 * @param selectedFields The fields to include
 * @returns Formatted data for export
 */
export const formatDataForExport = (data: any[], selectedFields: string[]): any[] => {
  if (!data || data.length === 0) return [];
  
  // If no fields are selected, use all fields
  if (!selectedFields || selectedFields.length === 0) {
    const firstItem = data[0];
    selectedFields = Object.keys(firstItem);
  }
  
  // Format each item
  return data.map(item => {
    const formattedItem: Record<string, any> = {};
    
    selectedFields.forEach(field => {
      if (field in item) {
        let value = item[field];
        
        // Format based on field type
        if (field === 'purchase_date' && value) {
          // Format date as YYYY-MM-DD
          if (!(value instanceof Date)) {
            value = new Date(value);
          }
          value = value.toISOString().split('T')[0];
        } else if (
          (field === 'grand_total' || field === 'unit_price' || field === 'total_before_tax') && 
          value !== null &&
          value !== undefined
        ) {
          // Format currency values
          value = parseFloat(value).toFixed(2);
        }
        
        formattedItem[field] = value;
      }
    });
    
    return formattedItem;
  });
};

/**
 * Filter data for export
 * @param data The data to filter
 * @param filters The filters to apply
 * @returns Filtered data
 */
export const filterDataForExport = (
  data: any[],
  filters: {
    dateRange?: { start?: string; end?: string };
    categories?: string[];
    tags?: string[];
    status?: string[];
  }
): any[] => {
  if (!data || data.length === 0) return [];
  if (!filters) return data;
  
  return data.filter(item => {
    // Date range filter
    if (filters.dateRange) {
      const { start, end } = filters.dateRange;
      
      if (start && item.purchase_date) {
        const purchaseDate = new Date(item.purchase_date);
        const startDate = new Date(start);
        if (purchaseDate < startDate) return false;
      }
      
      if (end && item.purchase_date) {
        const purchaseDate = new Date(item.purchase_date);
        const endDate = new Date(end);
        if (purchaseDate > endDate) return false;
      }
    }
    
    // Categories filter
    if (filters.categories && filters.categories.length > 0 && item.categories) {
      const hasMatchingCategory = item.categories.some((category: string) => 
        filters.categories?.includes(category)
      );
      if (!hasMatchingCategory) return false;
    }
    
    // Tags filter
    if (filters.tags && filters.tags.length > 0 && item.tags) {
      const hasMatchingTag = item.tags.some((tag: string) => 
        filters.tags?.includes(tag)
      );
      if (!hasMatchingTag) return false;
    }
    
    // Status filter
    if (filters.status && filters.status.length > 0) {
      if (!filters.status.includes(item.status)) return false;
    }
    
    return true;
  });
};

/**
 * Load an export template
 * @param templateId The template ID
 * @returns The template object
 */
export const loadExportTemplate = async (templateId: string): Promise<any> => {
  // In a real app, this would fetch from an API
  const templates: Record<string, any> = {
    'monthly-report': {
      id: 'monthly-report',
      name: 'Monthly Expense Report',
      description: 'Template for monthly expense reports',
      format: 'excel',
      includedFields: [
        'merchant_name',
        'purchase_date',
        'grand_total',
        'payment_method',
        'categories',
        'tags',
        'notes'
      ],
      filters: {
        dateRange: {
          start: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString().split('T')[0],
          end: new Date(new Date().getFullYear(), new Date().getMonth(), 0).toISOString().split('T')[0]
        }
      },
      options: {
        includeAttachments: false,
        includeImages: false
      }
    },
    'tax-report': {
      id: 'tax-report',
      name: 'Tax Preparation Report',
      description: 'Template for tax preparation',
      format: 'pdf',
      includedFields: [
        'merchant_name',
        'purchase_date',
        'grand_total',
        'estimated_tax',
        'payment_method',
        'categories',
        'notes'
      ],
      filters: {
        dateRange: {
          start: `${new Date().getFullYear() - 1}-01-01`,
          end: `${new Date().getFullYear() - 1}-12-31`
        },
        tags: ['Tax Deductible']
      },
      options: {
        includeAttachments: true,
        includeImages: false
      }
    }
  };
  
  return templates[templateId] || null;
};