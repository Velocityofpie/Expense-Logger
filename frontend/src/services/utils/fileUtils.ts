/**
 * Utility functions for file handling
 */

/**
 * Check if a file is a PDF
 * @param file - The file to check
 * @returns True if the file is a PDF, false otherwise
 */
export const isPdf = (file: File): boolean => {
    return file.type === 'application/pdf';
  };
  
  /**
   * Check if a file is an image
   * @param file - The file to check
   * @returns True if the file is an image, false otherwise
   */
  export const isImage = (file: File): boolean => {
    return file.type.startsWith('image/');
  };
  
  /**
   * Get the file extension from a file name
   * @param fileName - The file name to parse
   * @returns The file extension (without the dot) or an empty string if no extension
   */
  export const getFileExtension = (fileName: string): string => {
    const parts = fileName.split('.');
    if (parts.length === 1) {
      return '';
    }
    return parts[parts.length - 1].toLowerCase();
  };
  
  /**
   * Convert a file size in bytes to a human-readable string
   * @param bytes - The file size in bytes
   * @param decimals - The number of decimal places to show (default: 2)
   * @returns Human-readable file size
   */
  export const formatFileSize = (bytes: number, decimals = 2): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };
  
  /**
   * Create a URL for a file
   * @param file - The file to create a URL for
   * @returns The URL for the file
   */
  export const createFileUrl = (file: File): string => {
    return URL.createObjectURL(file);
  };
  
  /**
   * Revoke a file URL
   * @param url - The URL to revoke
   */
  export const revokeFileUrl = (url: string): void => {
    URL.revokeObjectURL(url);
  };
  
  /**
   * Download a file from a URL
   * @param url - The URL of the file to download
   * @param fileName - The name to save the file as
   */
  export const downloadFile = (url: string, fileName: string): void => {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  /**
   * Convert a file to a Base64 string
   * @param file - The file to convert
   * @returns Promise resolving to the Base64 string
   */
  export const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          // Remove the data URL prefix (e.g., "data:application/pdf;base64,")
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        } else {
          reject(new Error('Failed to convert file to Base64'));
        }
      };
      reader.onerror = (error) => reject(error);
    });
  };
  
  /**
   * Create a filename based on merchant and order number
   * @param merchantName - The merchant name
   * @param orderNumber - The order number
   * @param originalFileName - The original filename (for extension)
   * @returns A formatted filename
   */
  export const generateFileName = (
    merchantName: string | undefined,
    orderNumber: string | undefined,
    originalFileName: string | undefined
  ): string => {
    // If both merchant and order number are filled
    if (merchantName && orderNumber) {
      // Get the file extension from the original filename
      const originalExt = originalFileName 
        ? originalFileName.substring(originalFileName.lastIndexOf('.'))
        : '';
      
      // Remove any invalid characters from the merchant name and order number
      const sanitizedMerchant = merchantName.replace(/[^a-zA-Z0-9_-]/g, '_');
      const sanitizedOrderNumber = orderNumber.replace(/[^a-zA-Z0-9_-]/g, '_');
      
      // Create new filename with format Merchant-Order#_OrderNumber.ext
      return `${sanitizedMerchant}-Order#_${sanitizedOrderNumber}${originalExt}`;
    }
    
    // If either merchant or order number is missing, return the original filename
    return originalFileName || '';
  };
  
  /**
   * Process a FileList into an array of File objects
   * @param fileList - The FileList to process
   * @returns An array of File objects
   */
  export const fileListToArray = (fileList: FileList): File[] => {
    return Array.from(fileList);
  };
  
  /**
   * Generate a unique file ID
   * @returns A unique ID (timestamp + random)
   */
  export const generateFileId = (): string => {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  };