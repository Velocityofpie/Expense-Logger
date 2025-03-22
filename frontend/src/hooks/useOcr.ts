// src/hooks/useOcr.ts
import { useState, useCallback } from 'react';

// Define interfaces for OCR data
export interface OcrSettings {
  language: string;
  dpi: number;
  preprocess: boolean;
  pageStart?: number;
  pageEnd?: number;
}

export interface OcrResult {
  text: string;
  confidence?: number;
  words?: Array<{
    text: string;
    confidence: number;
    bbox: [number, number, number, number]; // [x, y, width, height]
  }>;
  processing_time?: number;
}

export interface AvailableLanguage {
  code: string;
  name: string;
}

export interface UseOcrResult {
  extractedText: string;
  rawOcrData: string;
  isProcessing: boolean;
  error: string | null;
  success: string | null;
  availableLanguages: AvailableLanguage[];
  isLoadingLanguages: boolean;
  settings: OcrSettings;
  updateSettings: (newSettings: Partial<OcrSettings>) => void;
  extractTextFromPdf: (file: File) => Promise<OcrResult>;
  formatOcrText: (text: string) => string;
  clearResults: () => void;
  fetchLanguages: () => Promise<AvailableLanguage[]>;
}

// Mock available languages
const MOCK_LANGUAGES: AvailableLanguage[] = [
  { code: "eng", name: "English" },
  { code: "fra", name: "French" },
  { code: "deu", name: "German" },
  { code: "spa", name: "Spanish" },
  { code: "ita", name: "Italian" },
  { code: "por", name: "Portuguese" },
  { code: "chi_sim", name: "Chinese (Simplified)" },
  { code: "jpn", name: "Japanese" },
  { code: "kor", name: "Korean" }
];

// API URL
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

export function useOcr(): UseOcrResult {
  const [extractedText, setExtractedText] = useState<string>("");
  const [rawOcrData, setRawOcrData] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [availableLanguages, setAvailableLanguages] = useState<AvailableLanguage[]>([]);
  const [isLoadingLanguages, setIsLoadingLanguages] = useState<boolean>(false);
  
  // Default OCR settings
  const [settings, setSettings] = useState<OcrSettings>({
    language: "eng",
    dpi: 300,
    preprocess: false
  });

  // Update OCR settings
  const updateSettings = useCallback((newSettings: Partial<OcrSettings>): void => {
    setSettings(prevSettings => ({
      ...prevSettings,
      ...newSettings
    }));
  }, []);

  // Extract text from PDF
  const extractTextFromPdf = useCallback(async (file: File): Promise<OcrResult> => {
    try {
      setIsProcessing(true);
      setError(null);
      setSuccess(null);
      
      if (file.type !== "application/pdf") {
        throw new Error("Only PDF files are supported.");
      }
      
      const formData = new FormData();
      formData.append("file", file);
      formData.append("language", settings.language);
      formData.append("dpi", settings.dpi.toString());
      formData.append("preprocess", settings.preprocess.toString());
      
      if (settings.pageStart) {
        formData.append("page_start", settings.pageStart.toString());
      }
      
      if (settings.pageEnd) {
        formData.append("page_end", settings.pageEnd.toString());
      }
      
      const response = await fetch(`${API_URL}/ocr/extract/`, {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "OCR processing failed");
      }
      
      const data = await response.json();
      
      // Store both raw and formatted versions
      setRawOcrData(data.text); 
      setExtractedText(data.text);
      
      setSuccess("Text extracted successfully!");
      
      return data;
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred during OCR processing");
      }
      throw err;
    } finally {
      setIsProcessing(false);
    }
  }, [settings]);

  // Format OCR text to make it more readable
  const formatOcrText = useCallback((text: string): string => {
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
  }, []);

  // Clear OCR results
  const clearResults = useCallback((): void => {
    setExtractedText("");
    setRawOcrData("");
    setError(null);
    setSuccess(null);
  }, []);

  // Fetch available OCR languages
  const fetchLanguages = useCallback(async (): Promise<AvailableLanguage[]> => {
    try {
      setIsLoadingLanguages(true);
      
      // In a real implementation, you would make an API call
      // For demo purposes, we'll use mock data
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setAvailableLanguages(MOCK_LANGUAGES);
      return MOCK_LANGUAGES;
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to fetch available languages");
      }
      return [];
    } finally {
      setIsLoadingLanguages(false);
    }
  }, []);

  return {
    extractedText,
    rawOcrData,
    isProcessing,
    error,
    success,
    availableLanguages,
    isLoadingLanguages,
    settings,
    updateSettings,
    extractTextFromPdf,
    formatOcrText,
    clearResults,
    fetchLanguages
  };
}

export default useOcr;