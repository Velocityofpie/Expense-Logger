// src/features/invoices/invoiceDetail/utils/fileNameGenerator.ts

/**
 * Generate a standardized filename based on merchant name and order number
 * 
 * @param merchantName The merchant name
 * @param orderNumber The order number
 * @param originalFileName The original file name (to get extension)
 * @returns Generated file name
 */
export const generateFileName = (
    merchantName: string,
    orderNumber: string,
    originalFileName?: string
  ): string => {
    // Return original filename if missing required parameters
    if (!merchantName || !orderNumber) {
      return originalFileName || '';
    }
  
    // Format merchant name (remove invalid characters, replace spaces with hyphens)
    const formattedMerchant = merchantName
      .trim()
      .replace(/[/\\?%*:|"<>]/g, '') // Remove characters that are invalid in filenames
      .replace(/\s+/g, '-');         // Replace spaces with hyphens
    
    // Format order number (remove spaces, replace special chars with underscores)
    const formattedOrderNumber = orderNumber
      .trim()
      .replace(/[/\\?%*:|"<>]/g, '')
      .replace(/\s+/g, '_');
    
    // Get the file extension from the original filename
    const extension = originalFileName 
      ? originalFileName.substring(originalFileName.lastIndexOf('.')) 
      : '';
    
    // Create new filename with format Merchant-Order#_OrderNumber.ext
    return `${formattedMerchant}-Order#_${formattedOrderNumber}${extension}`;
  };