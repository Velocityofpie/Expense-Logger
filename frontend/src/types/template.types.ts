// Interface for template marker
export interface TemplateMarker {
    text: string;
    required: boolean;
  }
  
  // Interface for template field extraction
  export interface TemplateFieldExtraction {
    regex: string;
    alternative_regex?: string;
  }
  
  // Interface for template field validation
  export interface TemplateFieldValidation {
    required: boolean;
    pattern?: string;
    min_length?: number;
    max_length?: number;
  }
  
  // Interface for template field
  export interface TemplateField {
    field_name: string;
    display_name: string;
    data_type: 'string' | 'date' | 'currency' | 'integer' | 'float' | 'boolean' | 'address';
    extraction: TemplateFieldExtraction;
    validation?: TemplateFieldValidation;
  }
  
  // Interface for template identification
  export interface TemplateIdentification {
    markers: TemplateMarker[];
  }
  
  // Interface for template data
  export interface TemplateData {
    identification: TemplateIdentification;
    fields: TemplateField[];
  }
  
  // Interface for template
  export interface Template {
    template_id?: number;
    name: string;
    vendor?: string;
    version?: string;
    description?: string;
    template_data: TemplateData;
    created_at?: string;
    updated_at?: string;
  }
  
  // Interface for template test results
  export interface TemplateTestResult {
    success: boolean;
    match_score: number;
    fields_matched: number;
    fields_total: number;
    extracted_data: Record<string, any>;
    errors?: string[];
  }