// src/features/tools/templates/utils/template-api.ts
import { Template, TemplateTestResult } from '../../shared/types';
import { API_URL, apiGet, apiPost, apiPut, apiDelete, apiUploadFile } from '../../shared/api';

/**
 * Fetch all templates
 */
export async function fetchTemplates(): Promise<Template[]> {
  try {
    return await apiGet<Template[]>('/templates/');
  } catch (error) {
    console.error("Error fetching templates:", error);
    throw error;
  }
}

/**
 * Fetch a single template by ID
 */
export async function fetchTemplateById(id: number): Promise<Template> {
  try {
    return await apiGet<Template>(`/templates/${id}`);
  } catch (error) {
    console.error("Error fetching template:", error);
    throw error;
  }
}

/**
 * Create a new template
 */
export async function createTemplate(templateData: Partial<Template>): Promise<Template> {
  try {
    return await apiPost<Template>('/templates/', templateData);
  } catch (error) {
    console.error("Error creating template:", error);
    throw error;
  }
}

/**
 * Update a template
 */
export async function updateTemplate(id: number, templateData: Partial<Template>): Promise<Template> {
  try {
    return await apiPut<Template>(`/templates/${id}`, templateData);
  } catch (error) {
    console.error("Error updating template:", error);
    throw error;
  }
}

/**
 * Delete a template
 */
export async function deleteTemplate(id: number): Promise<void> {
  try {
    return await apiDelete<void>(`/templates/${id}`);
  } catch (error) {
    console.error("Error deleting template:", error);
    throw error;
  }
}

/**
 * Import a template
 */
export async function importTemplate(file: File): Promise<Template> {
  try {
    const formData = new FormData();
    formData.append("file", file);
    
    return await apiUploadFile<Template>('/templates/import', formData);
  } catch (error) {
    console.error("Error importing template:", error);
    throw error;
  }
}

/**
 * Test a template against an invoice
 */
export async function testTemplate(templateId: number, invoiceId: number | string): Promise<TemplateTestResult> {
  try {
    return await apiPost<TemplateTestResult>('/templates/test', {
      template_id: templateId,
      invoice_id: Number(invoiceId)
    });
  } catch (error) {
    console.error("Error testing template:", error);
    throw error;
  }
}

/**
 * Get the export URL for a template
 */
export function getTemplateExportUrl(templateId: number): string {
  return `${API_URL}/templates/${templateId}/export`;
}

/**
 * Fetch invoices for testing templates
 */
export async function fetchInvoices(skip = 0, limit = 10): Promise<any[]> {
  try {
    return await apiGet<any[]>(`/invoices/?skip=${skip}&limit=${limit}`);
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return [];
  }
}