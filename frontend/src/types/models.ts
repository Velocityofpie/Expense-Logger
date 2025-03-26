/**
 * Data model interfaces for the application
 */

/**
 * Basic user information
 */
export interface User {
    id: number;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role: UserRole;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    lastLogin?: string;
    profileImage?: string;
    settings?: UserSettings;
  }
  
  /**
   * User roles in the system
   */
  export type UserRole = 'admin' | 'user' | 'readonly';
  
  /**
   * User settings and preferences
   */
  export interface UserSettings {
    theme?: 'light' | 'dark' | 'system';
    language?: string;
    currency?: string;
    dateFormat?: string;
    notifications?: NotificationSettings;
    dashboardLayout?: string;
    defaultView?: string;
  }
  
  /**
   * User notification preferences
   */
  export interface NotificationSettings {
    email: boolean;
    push: boolean;
    invoiceDue: boolean;
    paymentConfirmation: boolean;
    monthlyReport: boolean;
    newFeatures: boolean;
  }
  
  /**
   * Invoice data structure
   */
  export interface Invoice {
    id: number;
    userId?: number;
    merchantName: string;
    orderNumber?: string;
    purchaseDate?: string;
    paymentMethod?: string;
    status: InvoiceStatus;
    grandTotal: number;
    totalBeforeTax?: number;
    taxAmount?: number;
    shippingAmount?: number;
    currency?: string;
    notes?: string;
    categories?: string[];
    tags?: string[];
    items: InvoiceItem[];
    payments?: Payment[];
    createdAt: string;
    updatedAt: string;
    fileUrl?: string;
    fileName?: string;
    ocrProcessed?: boolean;
    billingAddress?: Address;
    shippingAddress?: Address;
  }
  
  /**
   * Invoice status types
   */
  export type InvoiceStatus = 'draft' | 'open' | 'paid' | 'overdue' | 'cancelled' | 'needs_attention' | 'archived';
  
  /**
   * Invoice line item
   */
  export interface InvoiceItem {
    id?: number;
    invoiceId?: number;
    productName: string;
    description?: string;
    quantity: number;
    unitPrice: number;
    totalPrice?: number;
    sku?: string;
    productUrl?: string;
    itemType?: string;
    category?: string;
    taxRate?: number;
    discountAmount?: number;
    notes?: string;
  }
  
  /**
   * Address information
   */
  export interface Address {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    phoneNumber?: string;
    attention?: string;
  }
  
  /**
   * Payment record
   */
  export interface Payment {
    id: number;
    invoiceId: number;
    amount: number;
    paymentMethod: string;
    paymentDate: string;
    cardId?: number;
    transactionId?: string;
    status: PaymentStatus;
    notes?: string;
    createdAt: string;
  }
  
  /**
   * Payment status
   */
  export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled';
  
  /**
   * Payment card information
   */
  export interface Card {
    id: number;
    userId: number;
    cardName: string;
    cardBrand?: string;
    isDefault?: boolean;
    createdAt: string;
    updatedAt: string;
    cardNumbers?: CardNumber[];
  }
  
  /**
   * Card number (partial) information
   */
  export interface CardNumber {
    id: number;
    cardId: number;
    lastFour: string;
    expirationDate: string;
    isActive: boolean;
    createdAt: string;
  }
  
  /**
   * OCR Template for document processing
   */
  export interface Template {
    id: number;
    name: string;
    vendor?: string;
    version?: string;
    description?: string;
    createdBy?: number;
    createdAt: string;
    updatedAt: string;
    isPublic: boolean;
    templateData: TemplateData;
  }
  
  /**
   * Template data structure for OCR processing
   */
  export interface TemplateData {
    identification: {
      markers: Array<{
        text: string;
        required: boolean;
      }>;
    };
    fields: Array<{
      fieldName: string;
      displayName?: string;
      dataType: 'string' | 'date' | 'currency' | 'integer' | 'float' | 'boolean' | 'address';
      extraction: {
        regex: string;
        alternativeRegex?: string;
      };
      validation?: {
        required?: boolean;
        pattern?: string;
        minLength?: number;
        maxLength?: number;
        minValue?: number;
        maxValue?: number;
      };
    }>;
  }
  
  /**
   * Wishlist item
   */
  export interface WishlistItem {
    id: number;
    userId: number;
    productName: string;
    productUrl?: string;
    imageUrl?: string;
    currentPrice?: number;
    targetPrice?: number;
    currency?: string;
    priority: 'low' | 'medium' | 'high';
    notes?: string;
    category?: string;
    createdAt: string;
    updatedAt: string;
    notifyOnPriceChange: boolean;
    priceHistory?: PriceHistoryEntry[];
  }
  
  /**
   * Price history entry for a wishlist item
   */
  export interface PriceHistoryEntry {
    date: string;
    price: number;
  }
  
  /**
   * Dashboard statistics
   */
  export interface DashboardStats {
    totalInvoices: number;
    totalAmount: number;
    openInvoices: number;
    paidInvoices: number;
    averageInvoiceAmount: number;
    categoryCounts: Record<string, number>;
    monthlySummary: Array<{
      month: string;
      amount: number;
    }>;
    recentActivity: Array<ActivityEntry>;
  }
  
  /**
   * Activity entry for dashboard
   */
  export interface ActivityEntry {
    id: number;
    type: 'invoice_created' | 'invoice_paid' | 'invoice_uploaded' | 'payment_added' | 'wishlist_item_added';
    timestamp: string;
    userId: number;
    details: Record<string, any>;
  }