// frontend/src/features/tools/toolsApi.ts
import { OcrLanguage, OcrResult, OcrRequestOptions, Template, TemplateTestResult } from './types';

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

// ─────────────────────────────────────────────────────────
// OCR API Functions
// ─────────────────────────────────────────────────────────

/**
 * Extract text from a PDF or image file using OCR
 */
export async function extractOcrText(file: File, options: OcrRequestOptions = {}): Promise<OcrResult> {
  try {
    const formData = new FormData();
    formData.append("file", file);
    
    // Add options to formData
    if (options.language) formData.append("language", options.language);
    if (options.dpi) formData.append("dpi", options.dpi.toString());
    if (options.preprocess !== undefined) formData.append("preprocess", options.preprocess.toString());
    if (options.page_start !== undefined) formData.append("page_start", options.page_start.toString());
    if (options.page_end !== undefined) formData.append("page_end", options.page_end.toString());
    
    const response = await fetch(`${API_URL}/ocr/extract/`, {
      method: "POST",
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "OCR processing failed");
    }
    
    return await response.json();
  } catch (error) {
    console.error("OCR extraction error:", error);
    throw error;
  }
}

/**
 * Get available OCR languages
 */
export async function fetchOcrLanguages(): Promise<OcrLanguage[]> {
  try {
    const response = await fetch(`${API_URL}/ocr/languages/`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to fetch OCR languages");
    }
    
    const data = await response.json();
    return data.languages;
  } catch (error) {
    console.error("Error fetching OCR languages:", error);
    // Return a default list of languages if the API call fails
    return [
      { code: "eng", name: "English" },
      { code: "fra", name: "French" },
      { code: "deu", name: "German" },
      { code: "spa", name: "Spanish" }
    ];
  }
}

// ─────────────────────────────────────────────────────────
// Template Management API Functions
// ─────────────────────────────────────────────────────────

/**
 * Fetch all templates
 */
export async function fetchTemplates(): Promise<Template[]> {
  try {
    const response = await fetch(`${API_URL}/templates/`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to fetch templates');
    }
    
    return response.json();
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
    const response = await fetch(`${API_URL}/templates/${id}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to fetch template');
    }
    
    return response.json();
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
    const response = await fetch(`${API_URL}/templates/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(templateData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to create template');
    }
    
    return response.json();
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
    const response = await fetch(`${API_URL}/templates/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(templateData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to update template');
    }
    
    return response.json();
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
    const response = await fetch(`${API_URL}/templates/${id}`, {
      method: "DELETE",
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to delete template');
    }
    
    return response.json();
  } catch (error) {
    console.error("Error deleting template:", error);
    throw error;
  }
}

/**
 * Import a template
 */
export async function importTemplate(formData: FormData): Promise<Template> {
  try {
    const response = await fetch(`${API_URL}/templates/import`, {
      method: "POST",
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to import template');
    }
    
    return response.json();
  } catch (error) {
    console.error("Error importing template:", error);
    throw error;
  }
}

/**
 * Test a template against an invoice
 */
export async function testTemplate(templateId: number, invoiceId: number): Promise<TemplateTestResult> {
  try {
    const response = await fetch(`${API_URL}/templates/test`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        template_id: templateId,
        invoice_id: invoiceId
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to test template');
    }
    
    return response.json();
  } catch (error) {
    console.error("Error testing template:", error);
    throw error;
  }
}

/**
 * Fetch invoices for testing templates
 */
export async function fetchInvoices(skip = 0, limit = 10): Promise<any[]> {
  try {
    const response = await fetch(`${API_URL}/invoices/?skip=${skip}&limit=${limit}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to fetch invoices');
    }
    
    return response.json();
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return [];
  }
}