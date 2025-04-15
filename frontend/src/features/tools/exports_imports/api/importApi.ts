// frontend/src/features/tools/exports_imports/api/importApi.ts
import { API_URL, handleApiError } from '../../shared/api';
import { FileFormat, ImportResult } from '../types';

/**
 * Upload a file for import
 * @param file The file to upload
 * @param options Import options
 * @returns A promise that resolves to the upload result
 */
export const uploadFileForImport = async (
  file: File,
  options: {
    format?: FileFormat;
    templateId?: string;
    userId?: number;
  } = {}
): Promise<{ fileId: string; previewData: any[] }> => {
  const formData = new FormData();
  formData.append('file', file);
  
  if (options.format) {
    formData.append('format', options.format);
  }
  
  if (options.templateId) {
    formData.append('templateId', options.templateId);
  }
  
  if (options.userId) {
    formData.append('userId', options.userId.toString());
  }
  
  try {
    const response = await fetch(`${API_URL}/import/upload`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      await handleApiError(response);
    }
    
    return await response.json();
  } catch (error) {
    console.error('File upload error:', error);
    throw error;
  }
};

/**
 * Process an import
 * @param fileId The ID of the uploaded file
 * @param mappings Field mappings
 * @param options Import options
 * @returns A promise that resolves to the import result
 */
export const processImport = async (
  fileId: string,
  mappings: Record<string, string>,
  options: {
    templateId?: string;
    skipRows?: number;
    dateFormat?: string;
    decimalSeparator?: string;
    userId?: number;
  } = {}
): Promise<ImportResult> => {
  try {
    const response = await fetch(`${API_URL}/import/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fileId,
        mappings,
        ...options
      })
    });
    
    if (!response.ok) {
      await handleApiError(response);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Import processing error:', error);
    throw error;
  }
};

/**
 * Get import templates
 * @returns A promise that resolves to the available import templates
 */
export const getImportTemplates = async (): Promise<any[]> => {
  try {
    const response = await fetch(`${API_URL}/import/templates`);
    
    if (!response.ok) {
      await handleApiError(response);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching import templates:', error);
    throw error;
  }
};

/**
 * Get import template by ID
 * @param templateId The template ID
 * @returns A promise that resolves to the template
 */
export const getImportTemplate = async (templateId: string): Promise<any> => {
  try {
    const response = await fetch(`${API_URL}/import/templates/${templateId}`);
    
    if (!response.ok) {
      await handleApiError(response);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching import template ${templateId}:`, error);
    throw error;
  }
};

/**
 * Save import template
 * @param template The template to save
 * @returns A promise that resolves to the saved template
 */
export const saveImportTemplate = async (template: any): Promise<any> => {
  try {
    const method = template.id ? 'PUT' : 'POST';
    const url = template.id 
      ? `${API_URL}/import/templates/${template.id}`
      : `${API_URL}/import/templates`;
    
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
    console.error('Error saving import template:', error);
    throw error;
  }
};

/**
 * Delete import template
 * @param templateId The template ID
 * @returns A promise that resolves to a success indicator
 */
export const deleteImportTemplate = async (templateId: string): Promise<{ success: boolean }> => {
  try {
    const response = await fetch(`${API_URL}/import/templates/${templateId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      await handleApiError(response);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error deleting import template ${templateId}:`, error);
    throw error;
  }
};

/**
 * Set default import template
 * @param templateId The template ID
 * @returns A promise that resolves to a success indicator
 */
export const setDefaultImportTemplate = async (templateId: string): Promise<{ success: boolean }> => {
  try {
    const response = await fetch(`${API_URL}/import/templates/${templateId}/default`, {
      method: 'PUT'
    });
    
    if (!response.ok) {
      await handleApiError(response);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error setting default import template ${templateId}:`, error);
    throw error;
  }
};

/**
 * Get import history
 * @param options Query options
 * @returns A promise that resolves to import history records
 */
export const getImportHistory = async (
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
    
    const url = `${API_URL}/import/history${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      await handleApiError(response);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching import history:', error);
    throw error;
  }
};