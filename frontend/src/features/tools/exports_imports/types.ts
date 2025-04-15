// frontend/src/features/tools/exports_imports/types.ts

// File formats supported for import/export
export type FileFormat = 
  | 'csv' 
  | 'excel' 
  | 'pdf' 
  | 'json'
  | 'xml'
  | 'qif'
  | 'ofx'
  | 'zip';

// Import and export operations
export type Operation = 'import' | 'export';

// Import stages
export type ImportStage = 'upload' | 'mapping' | 'validation' | 'importing' | 'complete';

// Export stages
export type ExportStage = 'configure' | 'exporting' | 'complete';

// Backup types
export type BackupType = 'full' | 'data' | 'settings' | 'custom';

// Backup status
export type BackupStatus = 'completed' | 'in_progress' | 'failed';

// Backup schedule frequency
export type ScheduleFrequency = 'daily' | 'weekly' | 'monthly';

// Cloud storage providers
export type CloudProvider = 'none' | 'google_drive' | 'dropbox' | 'onedrive' | 'aws_s3';

// Import template interface
export interface ImportTemplate {
  id: string;
  name: string;
  description: string;
  format: FileFormat;
  fieldMapping: Record<string, string>;
  dateFormat?: string;
  decimalSeparator?: '.' | ',';
  thousandsSeparator?: ',' | '.' | ' ' | '';
  encoding?: string;
  skipLines?: number;
  createdAt: string;
  updatedAt: string;
}

// Export template interface
export interface ExportTemplate {
  id: string;
  name: string;
  description: string;
  format: FileFormat;
  includedFields: string[];
  filters: {
    dateRange?: {
      start?: string;
      end?: string;
    };
    categories?: string[];
    tags?: string[];
    status?: string[];
  };
  options: {
    includeAttachments?: boolean;
    includeImages?: boolean;
    password?: boolean;
    compress?: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

// Backup record interface
export interface BackupRecord {
  id: string;
  name: string;
  type: BackupType;
  date: string;
  size: string;
  status: BackupStatus;
  components?: string[];
  location?: string;
  notes?: string;
}

// Schedule settings interface
export interface ScheduleSettings {
  enabled: boolean;
  frequency: ScheduleFrequency;
  day: string;
  time: string;
  retention: string;
  cloudBackup: boolean;
  cloudProvider: CloudProvider;
  backupType: BackupType;
  components?: string[];
}

// Import result interface
export interface ImportResult {
  success: boolean;
  totalRecords: number;
  importedRecords: number;
  failedRecords: number;
  warnings: number;
  errors: string[];
  details?: any;
}

// Export result interface
export interface ExportResult {
  success: boolean;
  format: FileFormat;
  recordCount: number;
  fileSize: string;
  downloadUrl: string;
  filename: string;
  dateSummary: string;
  filterSummary?: string;
}

// Field mapping interface
export interface FieldMapping {
  sourceField: string;
  targetField: string;
  required: boolean;
  transform?: string;
}

// Cloud connection settings
export interface CloudConnectionSettings {
  provider: CloudProvider;
  active: boolean;
  lastSync?: string;
  folderPath?: string;
  tokenExpiry?: string;
  autoSync?: boolean;
}