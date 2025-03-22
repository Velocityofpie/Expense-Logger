import { get, post } from './client';
import { OcrExtractionOptions, OcrExtractionResponse, OcrLanguagesResponse } from '../../types/ocr.types';

/**
 * Extract text from a PDF file using OCR
 */
export const extractTextFromPdf = async (
  formData: FormData,
  options?: Partial<OcrExtractionOptions>
): Promise<OcrExtractionResponse> => {
  try {
    // Add options to formData if provided
    if (options) {
      if (options.language) formData.append('language', options.language);
      if (options.dpi) formData.append('dpi', options.dpi.toString());
      if (options.preprocess !== undefined) formData.append('preprocess', options.preprocess.toString());
      if (options.page_start !== undefined) formData.append('page_start', options.page_start.toString());
      if (options.page_end !== undefined) formData.append('page_end', options.page_end.toString());
    }
    
    return await post<OcrExtractionResponse, FormData>(
      '/ocr/extract/',
      formData,
      {
        headers: {
          // Remove default Content-Type header for FormData
          'Content-Type': undefined,
        },
      }
    );
  } catch (error) {
    console.error('OCR extraction error:', error);
    throw error;
  }
};

/**
 * Get available OCR languages
 */
export const getOcrLanguages = async (): Promise<string[]> => {
  try {
    const response = await get<OcrLanguagesResponse>('/ocr/languages/');
    
    // Handle different response formats
    if (response && 'languages' in response) {
      return response.languages as string[];
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching OCR languages:', error);
    // Return default languages on error
    return ['eng', 'fra', 'deu', 'spa'];
  }
};

/**
 * Preprocess an image for better OCR results
 */
export const preprocessImage = async (formData: FormData): Promise<{ success: boolean; url: string }> => {
  try {
    return await post<{ success: boolean; url: string }, FormData>(
      '/ocr/preprocess/',
      formData,
      {
        headers: {
          // Remove default Content-Type header for FormData
          'Content-Type': undefined,
        },
      }
    );
  } catch (error) {
    console.error('Image preprocessing error:', error);
    throw error;
  }
};

/**
 * Extract text from URL
 */
export const extractTextFromUrl = async (
  url: string,
  options?: Partial<OcrExtractionOptions>
): Promise<OcrExtractionResponse> => {
  try {
    // Create request body
    const requestBody = {
      url,
      ...options
    };
    
    return await post<OcrExtractionResponse>('/ocr/extract-url/', requestBody);
  } catch (error) {
    console.error('OCR URL extraction error:', error);
    throw error;
  }
};

export default {
  extractTextFromPdf,
  getOcrLanguages,
  preprocessImage,
  extractTextFromUrl
};