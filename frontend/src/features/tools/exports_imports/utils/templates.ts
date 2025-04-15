// frontend/src/features/tools/exports_imports/utils/templates.ts
import { FileFormat, ImportTemplate, ExportTemplate } from '../types';

/**
 * Load saved import templates
 * @returns A promise that resolves to the available import templates
 */
export const loadImportTemplates = async (): Promise<ImportTemplate[]> => {
  // In a real app, this would fetch from an API
  // Here we'll return mock data
  return [
    {
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
      },
      dateFormat: 'MM/DD/YYYY',
      decimalSeparator: '.',
      thousandsSeparator: ',',
      createdAt: '2025-03-10T15:30:00Z',
      updatedAt: '2025-04-05T09:15:00Z'
    },
    {
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
      },
      dateFormat: 'MM/DD/YYYY',
      decimalSeparator: '.',
      thousandsSeparator: ',',
      createdAt: '2025-02-15T11:45:00Z',
      updatedAt: '2025-03-20T14:30:00Z'
    },
    {
      id: 'credit-card-template',
      name: 'Credit Card Statement',
      description: 'Template for credit card transactions',
      format: 'csv',
      fieldMapping: {
        'Transaction Date': 'purchase_date',
        'Posting Date': 'posting_date',
        'Description': 'merchant_name',
        'Category': 'category',
        'Type': 'transaction_type',
        'Amount': 'grand_total'
      },
      dateFormat: 'MM/DD/YYYY',
      decimalSeparator: '.',
      createdAt: '2025-01-10T09:00:00Z',
      updatedAt: '2025-02-28T16:20:00Z'
    }
  ];
};

/**
 * Load saved export templates
 * @returns A promise that resolves to the available export templates
 */
export const loadExportTemplates = async (): Promise<ExportTemplate[]> => {
  // In a real app, this would fetch from an API
  // Here we'll return mock data
  return [
    {
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
      },
      createdAt: '2025-03-01T16:45:00Z',
      updatedAt: '2025-04-05T10:30:00Z'
    },
    {
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
      },
      createdAt: '2025-01-15T09:10:00Z',
      updatedAt: '2025-03-15T14:20:00Z'
    },
    {
      id: 'category-summary',
      name: 'Category Summary',
      description: 'Template for expense category summary',
      format: 'csv',
      includedFields: [
        'categories',
        'grand_total',
        'purchase_date'
      ],
      filters: {},
      options: {
        includeAttachments: false
      },
      createdAt: '2025-02-28T13:20:00Z',
      updatedAt: '2025-04-12T11:45:00Z'
    }
  ];
};

/**
 * Get a template by ID
 * @param templateId The template ID
 * @param type The template type
 * @returns A promise that resolves to the template or null if not found
 */
export const getTemplateById = async (
  templateId: string,
  type: 'import' | 'export'
): Promise<ImportTemplate | ExportTemplate | null> => {
  const templates = type === 'import' 
    ? await loadImportTemplates()
    : await loadExportTemplates();
    
  return templates.find(template => template.id === templateId) || null;
};

/**
 * Save a template
 * @param template The template to save
 * @param type The template type
 * @returns A promise that resolves to the saved template
 */
export const saveTemplate = async (
  template: ImportTemplate | ExportTemplate,
  type: 'import' | 'export'
): Promise<ImportTemplate | ExportTemplate> => {
  // In a real app, this would send to an API
  // Here we'll just return the template with timestamps
  const now = new Date().toISOString();
  
  if (!template.id) {
    // New template
    template.id = `template-${Date.now()}`;
    template.createdAt = now;
  }
  
  template.updatedAt = now;
  
  return template;
};

/**
 * Delete a template
 * @param templateId The template ID
 * @param type The template type
 * @returns A promise that resolves to a success indicator
 */
export const deleteTemplate = async (
  templateId: string,
  type: 'import' | 'export'
): Promise<boolean> => {
  // In a real app, this would send to an API
  // Here we'll just return success
  return true;
};

/**
 * Set a template as default
 * @param templateId The template ID
 * @param type The template type
 * @returns A promise that resolves to a success indicator
 */
export const setDefaultTemplate = async (
  templateId: string,
  type: 'import' | 'export'
): Promise<boolean> => {
  // In a real app, this would send to an API
  // Here we'll just return success
  return true;
};

/**
 * Get the default template for a format
 * @param format The file format
 * @param type The template type
 * @returns A promise that resolves to the default template or null if none
 */
export const getDefaultTemplateForFormat = async (
  format: FileFormat,
  type: 'import' | 'export'
): Promise<ImportTemplate | ExportTemplate | null> => {
  const templates = type === 'import'
    ? await loadImportTemplates()
    : await loadExportTemplates();
    
  // First try to find a template marked as default
  let defaultTemplate = templates.find(t => t.format === format && t.isDefault);
  
  // If none is marked as default, use the most recently updated one
  if (!defaultTemplate) {
    const formatTemplates = templates.filter(t => t.format === format);
    
    if (formatTemplates.length > 0) {
      defaultTemplate = formatTemplates.sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )[0];
    }
  }
  
  return defaultTemplate || null;
};

/**
 * Export a template to JSON
 * @param templateId The template ID
 * @param type The template type
 * @returns A promise that resolves to a JSON string
 */
export const exportTemplateToJSON = async (
  templateId: string,
  type: 'import' | 'export'
): Promise<string> => {
  const template = await getTemplateById(templateId, type);
  
  if (!template) {
    throw new Error(`Template not found: ${templateId}`);
  }
  
  return JSON.stringify(template, null, 2);
};

/**
 * Import a template from JSON
 * @param jsonString The JSON string
 * @param type The template type
 * @returns A promise that resolves to the imported template
 */
export const importTemplateFromJSON = async (
  jsonString: string,
  type: 'import' | 'export'
): Promise<ImportTemplate | ExportTemplate> => {
  try {
    const template = JSON.parse(jsonString);
    
    // Validate the template
    if (!template.name || !template.format) {
      throw new Error('Invalid template: missing required fields');
    }
    
    if (type === 'import' && !template.fieldMapping) {
      throw new Error('Invalid import template: missing field mapping');
    }
    
    if (type === 'export' && !template.includedFields) {
      throw new Error('Invalid export template: missing included fields');
    }
    
    // Generate a new ID
    template.id = `template-${Date.now()}`;
    
    // Set timestamps
    const now = new Date().toISOString();
    template.createdAt = now;
    template.updatedAt = now;
    
    return template;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('Invalid JSON format');
    }
    throw error;
  }
};

/**
 * Suggest field mappings for a data sample
 * @param sampleData A sample of the data to map
 * @param targetFields The target fields to map to
 * @returns A suggested field mapping
 */
export const suggestFieldMappings = (
  sampleData: any[],
  targetFields: string[]
): Record<string, string> => {
  if (!sampleData || sampleData.length === 0) {
    return {};
  }
  
  const firstRow = sampleData[0];
  const sourceFields = Object.keys(firstRow);
  const mapping: Record<string, string> = {};
  
  // Create a map of normalized field names for easier matching
  const normalizedTargetFields = targetFields.map(field => ({
    original: field,
    normalized: normalizeFieldName(field)
  }));
  
  // First pass: look for exact matches
  sourceFields.forEach(sourceField => {
    const normalizedSourceField = normalizeFieldName(sourceField);
    
    const exactMatch = normalizedTargetFields.find(target => 
      target.normalized === normalizedSourceField
    );
    
    if (exactMatch) {
      mapping[sourceField] = exactMatch.original;
    }
  });
  
  // Second pass: look for partial matches for unmapped source fields
  sourceFields.forEach(sourceField => {
    if (mapping[sourceField]) return; // Skip already mapped fields
    
    const normalizedSourceField = normalizeFieldName(sourceField);
    
    // Skip fields that are already targets
    if (Object.values(mapping).includes(sourceField)) return;
    
    // Find unmapped target fields
    const unmappedTargets = normalizedTargetFields.filter(target => 
      !Object.values(mapping).includes(target.original)
    );
    
    // Look for partial matches
    const partialMatch = unmappedTargets.find(target => 
      target.normalized.includes(normalizedSourceField) || 
      normalizedSourceField.includes(target.normalized)
    );
    
    if (partialMatch) {
      mapping[sourceField] = partialMatch.original;
    }
  });
  
  return mapping;
};

/**
 * Normalize a field name for comparison
 * @param fieldName The field name
 * @returns The normalized field name
 */
export const normalizeFieldName = (fieldName: string): string => {
  return fieldName
    .toLowerCase()
    .replace(/[_\s-]/g, '') // Remove underscores, spaces, hyphens
    .replace(/[^a-z0-9]/g, ''); // Remove non-alphanumeric characters
};