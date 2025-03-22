import { get, post, put, del } from './client';
import { Template, TemplateTestResult } from '../../types/template.types';

/**
 * Fetch all templates
 */
export const fetchTemplates = async (): Promise<Template[]> => {
  try {
    return await get<Template[]>('/templates/');
  } catch (error) {
    console.error('Error fetching templates:', error);
    throw error;
  }
};

/**
 * Fetch a single template by ID
 */
export const fetchTemplateById = async (id: string | number): Promise<Template> => {
  try {
    return await get<Template>(`/templates/${id}`);
  } catch (error) {
    console.error(`Error fetching template ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new template
 */
export const createTemplate = async (templateData: Partial<Template>): Promise<Template> => {
  try {
    return await post<Template, Partial<Template>>('/templates/', templateData);
  } catch (error) {
    console.error('Error creating template:', error);
    throw error;
  }
};

/**
 * Update a template
 */
export const updateTemplate = async (
  id: string | number,
  templateData: Partial<Template>
): Promise<Template> => {
  try {
    return await put<Template, Partial<Template>>(`/templates/${id}`, templateData);
  } catch (error) {
    console.error(`Error updating template ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a template
 */
export const deleteTemplate = async (id: string | number): Promise<{ success: boolean; message: string }> => {
  try {
    return await del<{ success: boolean; message: string }>(`/templates/${id}`);
  } catch (error) {
    console.error(`Error deleting template ${id}:`, error);
    throw error;
  }
};

/**
 * Import a template from a file
 */
export const importTemplate = async (formData: FormData): Promise<Template> => {
  try {
    return await post<Template, FormData>(
      '/templates/import',
      formData,
      {
        headers: {
          // Remove default Content-Type header for FormData
          'Content-Type': undefined,
        },
      }
    );
  } catch (error) {
    console.error('Error importing template:', error);
    throw error;
  }
};

/**
 * Export a template
 * Returns a URL that can be used to download the template
 */
export const getTemplateExportUrl = (id: string | number): string => {
  return `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/templates/${id}/export`;
};

/**
 * Test a template against an invoice
 */
export const testTemplate = async (
  templateId: string | number,
  invoiceId: string | number
): Promise<TemplateTestResult> => {
  try {
    const testData = {
      template_id: templateId,
      invoice_id: invoiceId
    };
    
    return await post<TemplateTestResult>('/templates/test', testData);
  } catch (error) {
    console.error('Error testing template:', error);
    throw error;
  }
};

export default {
  fetchTemplates,
  fetchTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  importTemplate,
  getTemplateExportUrl,
  testTemplate
};