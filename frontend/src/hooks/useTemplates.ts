// src/hooks/useTemplates.ts
import { useState, useEffect, useCallback } from 'react';
import { 
  fetchTemplates, 
  fetchTemplateById, 
  createTemplate, 
  updateTemplate, 
  deleteTemplate,
  importTemplate,
  testTemplate
} from '../services/api/templateService';

// Import types from the central types directory
import { 
  Template,
  TemplateData,
  TemplateField,
  TemplateMarker
} from '../types/template.types';

// Re-export the types for convenience
export type { Template, TemplateData, TemplateField, TemplateMarker };

export interface TemplateCreateData {
  name: string;
  vendor?: string;
  version?: string;
  description?: string;
  template_data: TemplateData;
}

export interface TemplateTestResult {
  success: boolean;
  match_score: number;
  fields_matched: number;
  fields_total: number;
  extracted_data: Record<string, string | number | boolean>;
}

export interface UseTemplatesResult {
  templates: Template[];
  currentTemplate: Template | null;
  isLoading: boolean;
  error: string | null;
  fetchAllTemplates: () => Promise<void>;
  fetchTemplate: (id: number) => Promise<Template>;
  createNewTemplate: (templateData: TemplateCreateData) => Promise<Template>;
  updateExistingTemplate: (id: number, templateData: Partial<TemplateCreateData>) => Promise<Template>;
  removeTemplate: (id: number) => Promise<void>;
  importTemplateFromFile: (file: File) => Promise<Template>;
  testTemplateWithInvoice: (templateId: number, invoiceId: number) => Promise<TemplateTestResult>;
}

export function useTemplates(): UseTemplatesResult {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [currentTemplate, setCurrentTemplate] = useState<Template | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all templates
  const fetchAllTemplates = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const fetchedTemplates = await fetchTemplates();
      setTemplates(fetchedTemplates);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to fetch templates');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch a specific template
  const fetchTemplate = useCallback(async (id: number): Promise<Template> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const template = await fetchTemplateById(id);
      setCurrentTemplate(template);
      return template;
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(`Failed to fetch template #${id}`);
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create a new template
  const createNewTemplate = useCallback(async (templateData: TemplateCreateData): Promise<Template> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const newTemplate = await createTemplate(templateData);
      setTemplates(prevTemplates => {
        const newTemplates: Template[] = [...prevTemplates, newTemplate];
        return newTemplates;
      });
      return newTemplate;
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to create template');
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update an existing template
  const updateExistingTemplate = useCallback(async (
    id: number, 
    templateData: Partial<TemplateCreateData>
  ): Promise<Template> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const updatedTemplate = await updateTemplate(id, templateData);
      
      // Update the template in the local state
      setTemplates(prevTemplates => {
        const newTemplates: Template[] = prevTemplates.map(template => 
          template.template_id === id ? updatedTemplate : template
        );
        return newTemplates;
      });
      
      // Update current template if it's the one being edited
      if (currentTemplate && currentTemplate.template_id === id) {
        setCurrentTemplate(updatedTemplate);
      }
      
      return updatedTemplate;
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(`Failed to update template #${id}`);
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [currentTemplate]);

  // Delete a template
  const removeTemplate = useCallback(async (id: number): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      await deleteTemplate(id);
      
      // Remove the template from the local state
      setTemplates(prevTemplates => {
        const newTemplates: Template[] = prevTemplates.filter(template => 
          template.template_id !== id
        );
        return newTemplates;
      });
      
      // Clear current template if it's the one being deleted
      if (currentTemplate && currentTemplate.template_id === id) {
        setCurrentTemplate(null);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(`Failed to delete template #${id}`);
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [currentTemplate]);

  // Import a template from a file
  const importTemplateFromFile = useCallback(async (file: File): Promise<Template> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const formData = new FormData();
      formData.append('file', file);
      
      const importedTemplate = await importTemplate(formData);
      setTemplates(prevTemplates => {
        const newTemplates: Template[] = [...prevTemplates, importedTemplate];
        return newTemplates;
      });
      return importedTemplate;
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to import template');
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Test a template with an invoice
  const testTemplateWithInvoice = useCallback(async (
    templateId: number, 
    invoiceId: number
  ): Promise<TemplateTestResult> => {
    try {
      setIsLoading(true);
      setError(null);
      
      return await testTemplate(templateId, invoiceId);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to test template');
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load templates on mount
  useEffect(() => {
    fetchAllTemplates();
  }, [fetchAllTemplates]);

  return {
    templates,
    currentTemplate,
    isLoading,
    error,
    fetchAllTemplates,
    fetchTemplate,
    createNewTemplate,
    updateExistingTemplate,
    removeTemplate,
    importTemplateFromFile,
    testTemplateWithInvoice
  };
}

export default useTemplates;