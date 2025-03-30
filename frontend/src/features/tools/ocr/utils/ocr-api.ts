// src/features/tools/ocr/utils/ocr-api.ts
import { OcrLanguage, OcrResult, OcrRequestOptions } from '../../shared/types';
import { API_URL, apiGet, apiUploadFile } from '../../shared/api';

/**
 * Extract text from a PDF or image file using OCR
 */
export async function extractOcrText(file: File, options: OcrRequestOptions = {}): Promise<OcrResult> {
  try {
    const formData = new FormData();
    formData.append("file", file);
    
    // Add options to formData
    if (options.language) formData.append("language", options.language);
    if (options.dpi) formData.append("dpi", options.dpi.toString());
    if (options.preprocess !== undefined) formData.append("preprocess", options.preprocess.toString());
    if (options.page_start !== undefined) formData.append("page_start", options.page_start.toString());
    if (options.page_end !== undefined) formData.append("page_end", options.page_end.toString());
    
    return await apiUploadFile<OcrResult>('/ocr/extract/', formData);
  } catch (error) {
    console.error("OCR extraction error:", error);
    throw error;
  }
}

/**
 * Get available OCR languages
 */
export async function fetchOcrLanguages(): Promise<OcrLanguage[]> {
  try {
    const data = await apiGet<{ languages: OcrLanguage[] }>('/ocr/languages/');
    return data.languages;
  } catch (error) {
    console.error("Error fetching OCR languages:", error);
    // Return a default list of languages if the API call fails
    return [
      { code: "eng", name: "English" },
      { code: "fra", name: "French" },
      { code: "deu", name: "German" },
      { code: "spa", name: "Spanish" }
    ];
  }
}

// Language mapping for display
export const LANGUAGE_NAMES: Record<string, string> = {
  'eng': 'English',
  'fra': 'French',
  'deu': 'German',
  'spa': 'Spanish',
  'ita': 'Italian',
  'por': 'Portuguese',
  'chi_sim': 'Chinese (Simplified)',
  'chi_tra': 'Chinese (Traditional)',
  'jpn': 'Japanese',
  'kor': 'Korean',
  'ara': 'Arabic',
  'rus': 'Russian',
  'nld': 'Dutch',
  'swe': 'Swedish',
  'fin': 'Finnish',
  'dan': 'Danish',
  'nor': 'Norwegian',
  'pol': 'Polish',
  'tur': 'Turkish',
  'hun': 'Hungarian',
  'ces': 'Czech',
  'ell': 'Greek',
  'heb': 'Hebrew',
  'hin': 'Hindi',
  'vie': 'Vietnamese',
  'ind': 'Indonesian',
  'msa': 'Malay',
  'tha': 'Thai'
};