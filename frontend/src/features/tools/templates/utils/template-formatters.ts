// src/features/tools/templates/utils/template-formatters.ts
import { Template, TemplateField, TemplateFormData } from '../../shared/types';

/**
 * Creates a new empty template form data structure
 */
export const createEmptyTemplateData = (): TemplateFormData => {
  return {
    name: "",
    vendor: "",
    version: "1.0",
    description: "",
    template_data: {
      identification: {
        markers: [
          { text: "", required: true }
        ]
      },
      fields: []
    }
  };
};

/**
 * Creates a new empty template field
 */
export const createEmptyField = (): TemplateField => {
  return {
    field_name: "",
    display_name: "",
    data_type: "string",
    extraction: {
      regex: ""
    },
    validation: {
      required: false
    }
  };
};

/**
 * Convert a template to form data
 */
export const templateToFormData = (template: Template): TemplateFormData => {
  // Ensure structure is complete
  return {
    name: template.name || "",
    vendor: template.vendor || "",
    version: template.version || "1.0",
    description: template.description || "",
    template_data: {
      identification: {
        markers: template.template_data?.identification?.markers || [{ text: "", required: true }]
      },
      fields: template.template_data?.fields || []
    }
  };
};

/**
 * Get form data for a nested field (e.g., 'extraction.regex')
 */
export const getNestedFieldValue = (obj: any, path: string): any => {
  if (!obj) return undefined;
  
  const parts = path.split('.');
  let value = obj;
  
  for (const part of parts) {
    if (value === undefined || value === null) {
      return undefined;
    }
    value = value[part];
  }
  
  return value;
};

/**
 * Set a value for a nested field (e.g., 'extraction.regex')
 */
export const setNestedFieldValue = (obj: any, path: string, value: any): any => {
  if (!obj) return {};
  
  const newObj = { ...obj };
  const parts = path.split('.');
  
  let current = newObj;
  
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    
    if (!current[part] || typeof current[part] !== 'object') {
      current[part] = {};
    }
    
    current = current[part];
  }
  
  current[parts[parts.length - 1]] = value;
  
  return newObj;
};

/**
 * Validate template data
 */
export const validateTemplateData = (data: TemplateFormData): string[] => {
  const errors: string[] = [];
  
  // Validate template name
  if (!data.name.trim()) {
    errors.push('Template name is required');
  }
  
  // Check markers
  if (!data.template_data.identification.markers.length) {
    errors.push('At least one identification marker is required');
  } else {
    // Check required markers
    const emptyRequiredMarkers = data.template_data.identification.markers
      .filter(marker => marker.required && !marker.text.trim());
    
    if (emptyRequiredMarkers.length > 0) {
      errors.push('All required markers must have text');
    }
  }
  
  // Check fields
  if (!data.template_data.fields.length) {
    errors.push('At least one field is required');
  } else {
    // Check for missing field names
    const fieldsWithoutNames = data.template_data.fields
      .filter(field => !field.field_name?.trim());
    
    if (fieldsWithoutNames.length > 0) {
      errors.push('All fields must have a field name');
    }
    
    // Check for duplicate field names
    const fieldNames = data.template_data.fields
      .map(field => field.field_name)
      .filter(Boolean) as string[];
    const uniqueFieldNames = new Set(fieldNames);
    
    if (fieldNames.length !== uniqueFieldNames.size) {
      errors.push('Field names must be unique');
    }
    
    // Check for missing regex patterns
    const fieldsWithoutRegex = data.template_data.fields
      .filter(field => !field.extraction?.regex?.trim());
    
    if (fieldsWithoutRegex.length > 0) {
      errors.push('All fields must have an extraction regex pattern');
    }
  }
  
  return errors;
};

/**
 * Get a formatted display name for the template
 */
export const getDisplayName = (template: Template): string => {
  if (!template) return 'Unnamed Template';
  
  let displayName = template.name || 'Unnamed Template';
  
  if (template.vendor) {
    displayName += ` (${template.vendor})`;
  }
  
  if (template.version) {
    displayName += ` v${template.version}`;
  }
  
  return displayName;
};

/**
 * Format date for display
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  
  try {
    return new Date(dateString).toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  } catch (e) {
    return dateString;
  }
};