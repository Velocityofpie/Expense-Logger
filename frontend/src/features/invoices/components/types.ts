// src/features/invoices/components/types.ts

/**
 * Common types used across invoice components
 */

export interface FileMetadata {
    category: string;
    tags: string[];
  }
  
  export interface UploadResults {
    success: string[];
    failed: string[];
  }