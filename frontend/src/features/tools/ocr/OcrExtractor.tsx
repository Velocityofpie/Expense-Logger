// src/features/tools/ocr/OcrExtractor.tsx
import React, { useState, useEffect } from "react";
import { Form, Button, Alert, Spinner } from "react-bootstrap";
import FileUploader from "./components/FileUploader";
import AdvancedOptions from "./components/AdvancedOptions";
import TextViewer from "./components/TextViewer";
import { fetchOcrLanguages, extractOcrText, LANGUAGE_NAMES } from "./utils/ocr-api";
import { getLanguageName, formatOcrText } from "./utils/ocr-formatters";
import { OcrLanguage } from "../shared/types";
import "./ocr-styles.css";

const OcrExtractor: React.FC = () => {
  // State for file selection
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>("");
  
  // State for OCR results
  const [extractedText, setExtractedText] = useState<string>("");
  const [rawOcrData, setRawOcrData] = useState<string>("");
  
  // Processing state
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  
  // OCR settings state
  const [languages, setLanguages] = useState<OcrLanguage[]>([]);
  const [isLoadingLanguages, setIsLoadingLanguages] = useState<boolean>(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState<boolean>(false);
  
  // OCR parameters
  const [language, setLanguage] = useState<string>("eng");
  const [dpi, setDpi] = useState<number>(300);
  const [preprocess, setPreprocess] = useState<boolean>(false);
  const [pageStart, setPageStart] = useState<string>("");
  const [pageEnd, setPageEnd] = useState<string>("");
  
  // Fetch available languages on component mount
  useEffect(() => {
    loadLanguages();
  }, []);
  
  // Load available OCR languages
  const loadLanguages = async (): Promise<void> => {
    try {
      setIsLoadingLanguages(true);
      const languages = await fetchOcrLanguages();
      setLanguages(languages);
    } catch (error) {
      console.error("Error loading languages:", error);
    } finally {
      setIsLoadingLanguages(false);
    }
  };

  // Handle file selection
  const handleFileSelect = (selectedFile: File): void => {
    setFile(selectedFile);
    setFileName(selectedFile.name);
    setError("");
  };

  // Process PDF for OCR
  const handleExtractText = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    if (!file) {
      setError("Please select a PDF file first.");
      return;
    }
    
    if (file.type !== "application/pdf") {
      setError("Only PDF files are supported.");
      return;
    }
    
    try {
      setIsProcessing(true);
      setError("");
      setSuccess("");
      
      const result = await extractOcrText(file, {
        language,
        dpi,
        preprocess,
        page_start: pageStart ? parseInt(pageStart) : undefined,
        page_end: pageEnd ? parseInt(pageEnd) : undefined
      });
      
      // Store both raw and potentially formatted versions
      setRawOcrData(result.text); 
      setExtractedText(result.text);
      
      setSuccess("Text extracted successfully!");
    } catch (error) {
      console.error("OCR extraction error:", error);
      setError(`Failed to extract text: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Download extracted text as a TXT file
  const handleDownloadText = (raw: boolean = false): void => {
    if (!extractedText && !rawOcrData) {
      setError("No text to download.");
      return;
    }
    
    // Choose which text to download based on parameter
    const textToDownload = raw ? rawOcrData : formatOcrText(extractedText);
    const fileNameSuffix = raw ? "_raw" : "_formatted";
    
    try {
      const blob = new Blob([textToDownload], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${file?.name.replace(".pdf", "") || "extracted"}${fileNameSuffix}.txt`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
      
      setSuccess(`Text downloaded successfully as ${a.download}!`);
    } catch (error) {
      console.error("Download error:", error);
      setError(`Failed to download text: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  // Copy text to clipboard
  const handleCopyToClipboard = (): void => {
    if (!extractedText && !rawOcrData) {
      setError("No text to copy.");
      return;
    }
    
    const textToCopy = extractedText || rawOcrData;
    
    navigator.clipboard.writeText(textToCopy)
      .then(() => setSuccess("Text copied to clipboard!"))
      .catch((err) => setError(`Failed to copy text: ${err.message}`));
  };

  // Get selected language name for display
  const getSelectedLanguageName = (): string => {
    return getLanguageName(language, languages);
  };

  return (
    <div className="ocr-extractor">
      <div className="mb-4">
        <h4 className="mb-2">PDF OCR Text Extraction</h4>
        <p className="text-muted">Upload a PDF file to extract text using OCR (Optical Character Recognition)</p>
      </div>
      
      {error && (
        <Alert 
          variant="danger" 
          onClose={() => setError("")} 
          dismissible
          className="mb-4 shadow-sm"
        >
          <div className="d-flex align-items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-exclamation-triangle-fill flex-shrink-0 me-2" viewBox="0 0 16 16">
              <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
            </svg>
            <div>{error}</div>
          </div>
        </Alert>
      )}
      
      {success && (
        <Alert 
          variant="success" 
          onClose={() => setSuccess("")} 
          dismissible
          className="mb-4 shadow-sm"
        >
          <div className="d-flex align-items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-check-circle-fill flex-shrink-0 me-2" viewBox="0 0 16 16">
              <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
            </svg>
            <div>{success}</div>
          </div>
        </Alert>
      )}
      
      <div className="shadow-sm mb-4 bg-white border rounded">
        <div className="p-4">
          <Form onSubmit={handleExtractText}>
            {/* File Uploader Component */}
            <FileUploader 
              fileName={fileName}
              onFileSelect={handleFileSelect}
            />
            
            {/* Advanced Options Component */}
            <AdvancedOptions 
              showAdvancedOptions={showAdvancedOptions}
              toggleAdvancedOptions={() => setShowAdvancedOptions(!showAdvancedOptions)}
              language={language}
              languages={languages}
              isLoadingLanguages={isLoadingLanguages}
              dpi={dpi}
              preprocess={preprocess}
              pageStart={pageStart}
              pageEnd={pageEnd}
              onLanguageChange={setLanguage}
              onDpiChange={setDpi}
              onPreprocessChange={setPreprocess}
              onPageStartChange={setPageStart}
              onPageEndChange={setPageEnd}
            />
            
            <Button
              type="submit"
              variant="primary"
              disabled={!file || isProcessing}
              className="px-4"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Processing...
                </>
              ) : (
                "Extract Text"
              )}
            </Button>
          </Form>
        </div>
      </div>
      
      {/* Text Viewer Component - only show if there is text to display */}
      {(extractedText || rawOcrData) && (
        <TextViewer 
          extractedText={extractedText}
          rawOcrData={rawOcrData}
          selectedLanguage={getSelectedLanguageName()}
          dpi={dpi}
          preprocess={preprocess}
          onCopyToClipboard={handleCopyToClipboard}
          onDownload={handleDownloadText}
        />
      )}
    </div>
  );
};

export default OcrExtractor;