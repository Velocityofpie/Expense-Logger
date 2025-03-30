// src/features/tools/ocr/utils/ocr-formatters.ts
import { LANGUAGE_NAMES } from './ocr-api';
import { OcrLanguage } from '../../shared/types';

/**
 * Format OCR text to be more readable
 */
export const formatOcrText = (text: string): string => {
  if (!text) return "";
  
  // Basic formatting to improve readability:
  
  // 1. Remove excessive empty lines (more than 2 consecutive)
  let formatted = text.replace(/\n{3,}/g, "\n\n");
  
  // 2. Remove excessive spaces (more than 2 consecutive)
  formatted = formatted.replace(/ {3,}/g, "  ");
  
  // 3. Clean up OCR page markers
  formatted = formatted.replace(/----- Page \d+ -----/g, "\n\n--- New Page ---\n\n");
  
  // 4. Make paragraph breaks more visible
  formatted = formatted.replace(/([.!?])\s*\n/g, "$1\n\n");
  
  // 5. Fix common OCR issues like 'l' instead of '1', etc.
  formatted = formatted
    .replace(/(\d)l(\d)/g, "$11$2")  // Replace digit-l-digit with digit-1-digit
    .replace(/(\w)'(\w)/g, "$1'$2"); // Fix curly apostrophes
    
  return formatted;
};

/**
 * Get the full language name for a language code
 */
export const getLanguageName = (languageCode: string, languages: OcrLanguage[]): string => {
  const selectedLang = languages.find(l => l.code === languageCode);
  return selectedLang ? 
    selectedLang.name || LANGUAGE_NAMES[languageCode] || languageCode :
    LANGUAGE_NAMES[languageCode] || languageCode;
};

/**
 * Create a download link for the text
 */
export const createDownloadLink = (
  text: string, 
  fileName: string, 
  fileNameSuffix: string = ""
): string => {
  const blob = new Blob([text], { type: "text/plain" });
  return URL.createObjectURL(blob);
};

/**
 * Create a filename for downloading
 */
export const createDownloadFileName = (
  originalFileName: string = "", 
  fileNameSuffix: string = ""
): string => {
  return `${(originalFileName || "extracted").replace(/\.\w+$/, "")}${fileNameSuffix}.txt`;
};