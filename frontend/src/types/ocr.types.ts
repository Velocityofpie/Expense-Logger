// Interface for OCR extraction options
export interface OcrExtractionOptions {
    language: string;
    dpi: number;
    preprocess: boolean;
    page_start?: number;
    page_end?: number;
  }
  
  // Interface for OCR language
  export interface OcrLanguage {
    code: string;
    name: string;
  }
  
  // Interface for OCR extraction response
  export interface OcrExtractionResponse {
    text: string;
    confidence: number;
    pages: number;
    processing_time: number;
    language: string;
  }
  
  // Interface for OCR extraction error
  export interface OcrExtractionError {
    error: string;
    code: string;
    detail?: string;
  }
  
  // Interface for OCR extraction result
  export interface OcrExtractionResult {
    success: boolean;
    text?: string;
    error?: OcrExtractionError;
    confidence?: number;
    processing_time?: number;
  }
  
  // Interface for OCR languages response
  export interface OcrLanguagesResponse {
    languages: OcrLanguage[] | string[];
  }