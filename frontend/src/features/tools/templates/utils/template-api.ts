// src/features/tools/templates/utils/template-api.ts
import { Template, TemplateTestResult } from '../../shared/types';
import { API_URL, apiGet, apiPost, apiPut, apiDelete, apiUploadFile } from '../../shared/api';

/**
 * Fetch all templates
 */
export async function fetchTemplates(): Promise<Template[]> {
  try {
    const response = await apiGet<Template[]>('/templates/');
    return response || [];
  } catch (error) {
    console.error("Error fetching templates:", error);
    // Return empty array on error to prevent UI crashes
    return [];
  }
}

/**
 * Fetch a single template by ID
 */
export async function fetchTemplateById(id: number): Promise<Template | null> {
  try {
    const response = await apiGet<Template>(`/templates/${id}`);
    return response || null;
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
    const response = await apiPost<Template>('/templates/', templateData);
    return response;
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
    const response = await apiPut<Template>(`/templates/${id}`, templateData);
    return response;
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
    await apiDelete<{ success: boolean }>(`/templates/${id}`);
  } catch (error) {
    console.error("Error deleting template:", error);
    throw error;
  }
}

/**
 * Import a template from a file
 */
export async function importTemplate(file: File): Promise<Template> {
  try {
    const formData = new FormData();
    formData.append("file", file);
    
    const response = await apiUploadFile<Template>('/templates/import', formData);
    return response;
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
    const response = await apiPost<TemplateTestResult>('/templates/test', {
      template_id: templateId,
      invoice_id: Number(invoiceId)
    });
    
    return response;
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
 * Mock data for development/testing when API is not available
 */
export const MOCK_TEMPLATES: Template[] = [
  {
    template_id: 1,
    name: "Amazon Invoice",
    vendor: "Amazon",
    version: "1.0",
    description: "Template for Amazon invoices and receipts",
    created_at: new Date().toISOString(),
    template_data: {
      identification: {
        markers: [
          { text: "amazon.com", required: true },
          { text: "order", required: false }
        ]
      },
      fields: [
        {
          field_name: "order_number",
          display_name: "Order Number",
          data_type: "string",
          extraction: {
            regex: "Order #([\\d\\-]+)"
          },
          validation: {
            required: true
          }
        },
        {
          field_name: "order_date",
          display_name: "Order Date",
          data_type: "date",
          extraction: {
            regex: "Order Placed:\\s+([A-Za-z]+ \\d+, \\d{4})"
          }
        },
        {
          field_name: "total",
          display_name: "Order Total",
          data_type: "currency",
          extraction: {
            regex: "Order Total:\\s+\\$(\\d+\\.\\d{2})"
          },
          validation: {
            required: true
          }
        }
      ]
    }
  }
];

/**
 * Fetch invoices for testing templates
 */
export async function fetchInvoices(skip = 0, limit = 10): Promise<any[]> {
  try {
    const response = await apiGet<any[]>(`/invoices/?skip=${skip}&limit=${limit}`);
    return response || [];
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return [];
  }
}