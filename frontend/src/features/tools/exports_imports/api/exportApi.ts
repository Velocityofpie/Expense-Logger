// frontend/src/features/tools/exports_imports/api/exportApi.ts
import { API_URL, handleApiError } from '../../shared/api';
import { FileFormat, ExportResult } from '../types';

/**
 * Export data to a file
 * @param format The export format
 * @param options Export options
 * @returns A promise that resolves to the export result
 */
export const exportData = async (
  format: FileFormat,
  options: {
    fields?: string[];
    filters?: {
      dateRange?: { start?: string; end?: string };
      categories?: string[];
      tags?: string[];
      status?: string[];
      searchTerm?: string;
    };
    options?: {
      includeAttachments?: boolean;
      includeImages?: boolean;
      password?: string;
      compress?: boolean;
    };
    filename?: string;
    templateId?: string;
    userId?: number;
  } = {}
): Promise<ExportResult> => {
  try {
    const response = await fetch(`${API_URL}/export`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        format,
        ...options
      })
    });
    
    if (!response.ok) {
      await handleApiError(response);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Export error:', error);
    throw error;
  }
};

/**
 * Get export templates
 * @returns A promise that resolves to the available export templates
 */
export const getExportTemplates = async (): Promise<any[]> => {
  try {
    const response = await fetch(`${API_URL}/export/templates`);
    
    if (!response.ok) {
      await handleApiError(response);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching export templates:', error);
    throw error;
  }
};

/**
 * Get export template by ID
 * @param templateId The template ID
 * @returns A promise that resolves to the template
 */
export const getExportTemplate = async (templateId: string): Promise<any> => {
  try {
    const response = await fetch(`${API_URL}/export/templates/${templateId}`);
    
    if (!response.ok) {
      await handleApiError(response);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching export template ${templateId}:`, error);
    throw error;
  }
};

/**
 * Save export template
 * @param template The template to save
 * @returns A promise that resolves to the saved template
 */
export const saveExportTemplate = async (template: any): Promise<any> => {
  try {
    const method = template.id ? 'PUT' : 'POST';
    const url = template.id 
      ? `${API_URL}/export/templates/${template.id}`
      : `${API_URL}/export/templates`;
    
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(template)
    });
    
    if (!response.ok) {
      await handleApiError(response);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error saving export template:', error);
    throw error;
  }
};

/**
 * Delete export template
 * @param templateId The template ID
 * @returns A promise that resolves to a success indicator
 */
export const deleteExportTemplate = async (templateId: string): Promise<{ success: boolean }> => {
  try {
    const response = await fetch(`${API_URL}/export/templates/${templateId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      await handleApiError(response);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error deleting export template ${templateId}:`, error);
    throw error;
  }
};

/**
 * Set default export template
 * @param templateId The template ID
 * @returns A promise that resolves to a success indicator
 */
export const setDefaultExportTemplate = async (templateId: string): Promise<{ success: boolean }> => {
  try {
    const response = await fetch(`${API_URL}/export/templates/${templateId}/default`, {
      method: 'PUT'
    });
    
    if (!response.ok) {
      await handleApiError(response);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error setting default export template ${templateId}:`, error);
    throw error;
  }
};

/**
 * Get export history
 * @param options Query options
 * @returns A promise that resolves to export history records
 */
export const getExportHistory = async (
  options: {
    page?: number;
    limit?: number;
    userId?: number;
  } = {}
): Promise<any> => {
  try {
    const params = new URLSearchParams();
    
    if (options.page !== undefined) {
      params.append('page', options.page.toString());
    }
    
    if (options.limit !== undefined) {
      params.append('limit', options.limit.toString());
    }
    
    if (options.userId !== undefined) {
      params.append('userId', options.userId.toString());
    }
    
    const url = `${API_URL}/export/history${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      await handleApiError(response);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching export history:', error);
    throw error;
  }
};

/**
 * Get available fields for export
 * @returns A promise that resolves to the available fields
 */
export const getExportFields = async (): Promise<string[]> => {
  try {
    const response = await fetch(`${API_URL}/export/fields`);
    
    if (!response.ok) {
      await handleApiError(response);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching export fields:', error);
    throw error;
  }
};

/**
 * Get file download URL
 * @param fileId The ID of the exported file
 * @returns A promise that resolves to the download URL
 */
export const getExportDownloadUrl = async (fileId: string): Promise<string> => {
  try {
    const response = await fetch(`${API_URL}/export/download/${fileId}`);
    
    if (!response.ok) {
      await handleApiError(response);
    }
    
    const result = await response.json();
    return result.downloadUrl;
  } catch (error) {
    console.error(`Error getting download URL for file ${fileId}:`, error);
    throw error;
  }
};

/**
 * Export data to a specific format
 * @param data The data to export
 * @param format The export format
 * @param options Export options
 * @returns A promise that resolves to the export result
 */
export const exportDataClient = async (
  data: any[],
  format: FileFormat,
  options: {
    filename?: string;
    fields?: string[];
  } = {}
): Promise<{ downloadUrl: string; filename: string }> => {
  // This is a client-side export function that doesn't require a server
  // Useful for quick exports directly in the browser
  
  let url: string;
  const defaultFilename = `export_${new Date().toISOString().split('T')[0]}`;
  const filename = options.filename || defaultFilename;
  
  try {
    switch (format) {
      case 'csv': {
        // Use Papa Parse for CSV
        const Papa = await import('papaparse');
        const csv = Papa.default.unparse(data);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        url = URL.createObjectURL(blob);
        break;
      }
      case 'json': {
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        url = URL.createObjectURL(blob);
        break;
      }
      case 'excel': {
        // Use SheetJS for Excel
        const XLSX = await import('xlsx');
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Data');
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { 
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        });
        url = URL.createObjectURL(blob);
        break;
      }
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
    
    return { 
      downloadUrl: url, 
      filename: `${filename}.${format === 'excel' ? 'xlsx' : format}` 
    };
  } catch (error) {
    console.error('Client-side export error:', error);
    throw error;
  }
};