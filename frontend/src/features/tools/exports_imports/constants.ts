// frontend/src/features/tools/exports_imports/constants.ts

/**
 * File formats supported by the import/export system
 */
export const SUPPORTED_IMPORT_FORMATS = [
    'csv',
    'excel',
    'pdf',
    'json',
    'xml',
    'qif',
    'ofx'
  ] as const;
  
  export const SUPPORTED_EXPORT_FORMATS = [
    'csv',
    'excel',
    'pdf',
    'json',
    'zip'
  ] as const;
  
  /**
   * Maximum file size for uploads (in bytes)
   */
  export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  
  /**
   * Backup types
   */
  export const BACKUP_TYPES = [
    'full',
    'data',
    'settings',
    'custom'
  ] as const;
  
  /**
   * Backup components (for custom backups)
   */
  export const BACKUP_COMPONENTS = [
    { id: 'invoices', name: 'Invoice Data', description: 'All invoice records and metadata' },
    { id: 'expenses', name: 'Expense Data', description: 'All expense records and categories' },
    { id: 'payments', name: 'Payment Data', description: 'All payment records and methods' },
    { id: 'templates', name: 'OCR Templates', description: 'All OCR extraction templates' },
    { id: 'settings', name: 'User Settings', description: 'User preferences and configurations' },
    { id: 'files', name: 'Uploaded Files', description: 'All uploaded invoices and attachments' }
  ];
  
  /**
   * Backup schedule frequencies
   */
  export const SCHEDULE_FREQUENCIES = [
    'daily',
    'weekly',
    'monthly'
  ] as const;
  
  /**
   * Days of the week for weekly schedule
   */
  export const DAYS_OF_WEEK = [
    { id: 'monday', name: 'Monday' },
    { id: 'tuesday', name: 'Tuesday' },
    { id: 'wednesday', name: 'Wednesday' },
    { id: 'thursday', name: 'Thursday' },
    { id: 'friday', name: 'Friday' },
    { id: 'saturday', name: 'Saturday' },
    { id: 'sunday', name: 'Sunday' }
  ];
  
  /**
   * Cloud storage providers
   */
  export const CLOUD_PROVIDERS = [
    { id: 'google_drive', name: 'Google Drive', icon: 'google-drive' },
    { id: 'dropbox', name: 'Dropbox', icon: 'dropbox' },
    { id: 'onedrive', name: 'OneDrive', icon: 'microsoft' },
    { id: 'aws_s3', name: 'Amazon S3', icon: 'amazon' }
  ];
  
  /**
   * Field mapping target fields for import
   */
  export const TARGET_FIELDS = [
    { id: 'merchant_name', name: 'Merchant Name', required: true },
    { id: 'order_number', name: 'Order Number', required: false },
    { id: 'purchase_date', name: 'Purchase Date', required: true },
    { id: 'payment_method', name: 'Payment Method', required: false },
    { id: 'grand_total', name: 'Grand Total', required: true },
    { id: 'total_before_tax', name: 'Total Before Tax', required: false },
    { id: 'estimated_tax', name: 'Tax', required: false },
    { id: 'shipping_handling', name: 'Shipping & Handling', required: false },
    { id: 'product_name', name: 'Product Name', required: false },
    { id: 'quantity', name: 'Quantity', required: false },
    { id: 'unit_price', name: 'Unit Price', required: false },
    { id: 'status', name: 'Status', required: false },
    { id: 'notes', name: 'Notes', required: false },
    { id: 'categories', name: 'Categories', required: false },
    { id: 'tags', name: 'Tags', required: false },
    { id: 'billing_address', name: 'Billing Address', required: false },
    { id: 'credit_card', name: 'Credit Card', required: false }
  ];
  
  /**
   * Export field options
   */
  export const EXPORT_FIELDS = [
    { id: 'merchant_name', name: 'Merchant Name' },
    { id: 'order_number', name: 'Order Number' },
    { id: 'purchase_date', name: 'Purchase Date' },
    { id: 'payment_method', name: 'Payment Method' },
    { id: 'grand_total', name: 'Grand Total' },
    { id: 'total_before_tax', name: 'Total Before Tax' },
    { id: 'estimated_tax', name: 'Tax' },
    { id: 'shipping_handling', name: 'Shipping & Handling' },
    { id: 'status', name: 'Status' },
    { id: 'notes', name: 'Notes' },
    { id: 'categories', name: 'Categories' },
    { id: 'tags', name: 'Tags' },
    { id: 'billing_address', name: 'Billing Address' },
    { id: 'credit_card', name: 'Credit Card' },
    { id: 'items', name: 'Line Items (Products)' },
    { id: 'file_name', name: 'File Name' },
    { id: 'created_at', name: 'Creation Date' },
    { id: 'updated_at', name: 'Last Update Date' }
  ];
  
  /**
   * Date format options
   */
  export const DATE_FORMATS = [
    { id: 'YYYY-MM-DD', name: 'ISO (YYYY-MM-DD)', example: '2025-04-15' },
    { id: 'MM/DD/YYYY', name: 'US (MM/DD/YYYY)', example: '04/15/2025' },
    { id: 'DD/MM/YYYY', name: 'EU (DD/MM/YYYY)', example: '15/04/2025' },
    { id: 'MM-DD-YYYY', name: 'US with dashes (MM-DD-YYYY)', example: '04-15-2025' },
    { id: 'DD-MM-YYYY', name: 'EU with dashes (DD-MM-YYYY)', example: '15-04-2025' },
    { id: 'MMM DD, YYYY', name: 'Month name (MMM DD, YYYY)', example: 'Apr 15, 2025' }
  ];
  
  /**
   * Decimal separator options
   */
  export const DECIMAL_SEPARATORS = [
    { id: '.', name: 'Period (.)', example: '123.45' },
    { id: ',', name: 'Comma (,)', example: '123,45' }
  ];
  
  /**
   * Thousands separator options
   */
  export const THOUSANDS_SEPARATORS = [
    { id: ',', name: 'Comma (,)', example: '1,234.56' },
    { id: '.', name: 'Period (.)', example: '1.234,56' },
    { id: ' ', name: 'Space ( )', example: '1 234.56' },
    { id: '', name: 'None', example: '123456' }
  ];
  
  /**
   * Character encoding options
   */
  export const ENCODINGS = [
    { id: 'utf-8', name: 'UTF-8 (Recommended)' },
    { id: 'iso-8859-1', name: 'ISO-8859-1 (Latin-1)' },
    { id: 'windows-1252', name: 'Windows-1252' },
    { id: 'ascii', name: 'ASCII' }
  ];
  
  /**
   * Import template suggestions
   */
  export const IMPORT_TEMPLATES = [
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
      }
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
      }
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
        'Category': 'categories',
        'Type': 'transaction_type',
        'Amount': 'grand_total'
      }
    }
  ];
  
  /**
   * Export template suggestions
   */
  export const EXPORT_TEMPLATES = [
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
      }
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
      }
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
      filters: {}
    }
  ];
  
  /**
   * Error messages
   */
  export const ERROR_MESSAGES = {
    FILE_SIZE: 'The file size exceeds the maximum allowed size (10MB).',
    FILE_FORMAT: 'The file format is not supported.',
    UPLOAD_FAILED: 'Failed to upload the file. Please try again.',
    IMPORT_FAILED: 'Failed to import the data. Please check the file and try again.',
    EXPORT_FAILED: 'Failed to export the data. Please try again.',
    BACKUP_FAILED: 'Failed to create the backup. Please try again.',
    RESTORE_FAILED: 'Failed to restore from the backup. Please try again.',
    VALIDATION_FAILED: 'Validation failed. Please check the data and try again.',
    NETWORK_ERROR: 'Network error. Please check your connection and try again.',
    SERVER_ERROR: 'Server error. Please try again later.',
    TEMPLATE_NOT_FOUND: 'Template not found.',
    BACKUP_NOT_FOUND: 'Backup not found.',
    NO_DATA: 'No data available for export.'
  };
  
  /**
   * Validation schema for import data
   */
  export const IMPORT_VALIDATION_SCHEMA = {
    merchant_name: {
      type: 'string',
      required: true,
      label: 'Merchant Name'
    },
    order_number: {
      type: 'string',
      required: false,
      label: 'Order Number'
    },
    purchase_date: {
      type: 'date',
      required: true,
      label: 'Purchase Date'
    },
    grand_total: {
      type: 'number',
      required: true,
      label: 'Grand Total'
    },
    payment_method: {
      type: 'string',
      required: false,
      label: 'Payment Method'
    },
    product_name: {
      type: 'string',
      required: false,
      label: 'Product Name'
    },
    quantity: {
      type: 'number',
      required: false,
      label: 'Quantity'
    },
    unit_price: {
      type: 'number',
      required: false,
      label: 'Unit Price'
    }
  };
  
  /**
   * Default import options
   */
  export const DEFAULT_IMPORT_OPTIONS = {
    format: 'csv',
    dateFormat: 'YYYY-MM-DD',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    encoding: 'utf-8',
    skipRows: 0
  };
  
  /**
   * Default export options
   */
  export const DEFAULT_EXPORT_OPTIONS = {
    format: 'excel',
    includeAttachments: false,
    includeImages: false
  };
  
  /**
   * Default backup schedule
   */
  export const DEFAULT_BACKUP_SCHEDULE: ScheduleSettings = {
    enabled: false,
    frequency: 'weekly',
    day: 'sunday',
    time: '00:00',
    retention: '30',
    cloudBackup: false,
    cloudProvider: 'none',
    backupType: 'full'
  };
  
  /**
   * Schedule settings type
   */
  export interface ScheduleSettings {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    day: string;
    time: string;
    retention: string;
    cloudBackup: boolean;
    cloudProvider: string;
    backupType: BackupType;
    components?: string[];
  }