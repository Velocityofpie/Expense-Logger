// src/features/tools/shared/types.ts

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  success?: boolean;
  status?: number;
}

// OCR language definition
export interface OcrLanguage {
  code: string;
  name: string;
}

// OCR extraction result
export interface OcrResult {
  text: string;
  confidence?: number;
  pages?: number;
}

// OCR request options
export interface OcrRequestOptions {
  language?: string;
  dpi?: number;
  preprocess?: boolean;
  page_start?: number;
  page_end?: number;
}

// Template marker for document identification
export interface TemplateMarker {
  text: string;
  required: boolean;
}

// Template field definition for data extraction
export interface TemplateField {
  field_name: string;
  display_name?: string;
  data_type: 'string' | 'date' | 'currency' | 'integer' | 'float' | 'boolean' | 'address';
  extraction: {
    regex: string;
    alternative_regex?: string;
  };
  validation?: {
    required?: boolean;
    pattern?: string;
    min_length?: number;
    max_length?: number;
    min_value?: number;
    max_value?: number;
  };
}

// Complete template definition
export interface Template {
  template_id: number;
  name: string;
  vendor?: string;
  version?: string;
  description?: string;
  created_at: string;
  updated_at?: string;
  template_data: {
    identification: {
      markers: TemplateMarker[];
    };
    fields: TemplateField[];
  };
}

// Template form data (for creating/editing)
export interface TemplateFormData {
  name: string;
  vendor: string;
  version: string;
  description: string;
  template_data: {
    identification: {
      markers: TemplateMarker[];
    };
    fields: TemplateField[];
  };
}

// Individual field test result
export interface FieldTestResult {
  field_name: string;
  display_name: string;
  required: boolean;
  matched: boolean;
  value: string | null;
}

// Result of testing a template against an invoice
export interface TemplateTestResult {
  success: boolean;
  match_score: number;
  fields_matched: number;
  fields_total: number;
  extracted_data: Record<string, any>;
  field_results?: FieldTestResult[];
  result_id?: number;
  template_id?: number;
  invoice_id?: number;
  test_date?: string;
  notes?: string;
}

// Invoice item
export interface InvoiceItem {
  product_name: string;
  quantity: number;
  unit_price: number;
  item_type?: string;
  total_price?: number;
}

// Invoice data
export interface Invoice {
  invoice_id: number;
  merchant_name: string;
  order_number?: string;
  purchase_date?: string;
  payment_method?: string;
  grand_total: number;
  status: string;
  items: InvoiceItem[];
  tags: string[];
  categories: string[];
  file_name?: string;
  notes?: string;
}