// src/components/ocr/OcrExtractor.tsx
import React, { useState, useEffect, ChangeEvent, FormEvent, MouseEvent } from "react";
import { Button, Form, Alert, Spinner, Row, Col, Card, ButtonGroup } from "react-bootstrap";

// Define the API URL
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

// Language mapping for display
interface LanguageMap {
  [key: string]: string;
}

const LANGUAGE_NAMES: LanguageMap = {
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

// Define the language interface
interface Language {
  code: string;
  name: string;
}

// Define OCR settings interface
interface OcrSettings {
  language: string;
  dpi: number;
  preprocess: boolean;
  pageStart: string;
  pageEnd: string;
}

const OcrExtractor: React.FC = () => {
  // State for the file
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>("");
  
  // State for OCR text output
  const [extractedText, setExtractedText] = useState<string>("");
  const [rawOcrData, setRawOcrData] = useState<string>("");
  
  // Processing states
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  
  // Languages state
  const [languages, setLanguages] = useState<Language[]>([]);
  const [isLoadingLanguages, setIsLoadingLanguages] = useState<boolean>(false);
  
  // UI states
  const [showAdvancedOptions, setShowAdvancedOptions] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"readable" | "raw">("readable");
  const [showDownloadOptions, setShowDownloadOptions] = useState<boolean>(false);
  
  // OCR settings
  const [ocrSettings, setOcrSettings] = useState<OcrSettings>({
    language: "eng",
    dpi: 300,
    preprocess: false,
    pageStart: "",
    pageEnd: ""
  });
  
  // Load available languages on component mount
  useEffect(() => {
    fetchLanguages();
  }, []);
  
  // Function to fetch available languages
  const fetchLanguages = async (): Promise<void> => {
    try {
      setIsLoadingLanguages(true);
      const response = await fetch(`${API_URL}/ocr/languages/`);
      if (response.ok) {
        const data = await response.json();
        
        // Transform language data to include full names
        const languagesWithNames: Language[] = data.languages.map((lang: string | { code: string, name?: string }) => {
          // If it's an object with code/name already
          if (typeof lang === 'object' && lang.code) {
            return {
              ...lang,
              name: lang.name || LANGUAGE_NAMES[lang.code] || lang.code
            };
          }
          
          // If it's just a string code
          return {
            code: lang as string,
            name: LANGUAGE_NAMES[lang as string] || lang as string
          };
        });
        
        setLanguages(languagesWithNames);
      } else {
        // Fallback to basic language list with full names
        setLanguages([
          { code: "eng", name: "English" },
          { code: "fra", name: "French" },
          { code: "deu", name: "German" },
          { code: "spa", name: "Spanish" }
        ]);
      }
    } catch (error) {
      console.error("Error fetching languages:", error);
      // Fallback to English only
      setLanguages([{ code: "eng", name: "English" }]);
    } finally {
      setIsLoadingLanguages(false);
    }
  };

  // Handle file selection
  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setError("");
    }
  };

  // Update OCR settings
  const handleSettingChange = (setting: keyof OcrSettings, value: string | number | boolean): void => {
    setOcrSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  // Process PDF for OCR
  const handleExtractText = async (e: FormEvent): Promise<void> => {
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
      
      const formData = new FormData();
      formData.append("file", file);
      formData.append("language", ocrSettings.language);
      formData.append("dpi", ocrSettings.dpi.toString());
      formData.append("preprocess", ocrSettings.preprocess.toString());
      
      if (ocrSettings.pageStart) {
        formData.append("page_start", ocrSettings.pageStart);
      }
      
      if (ocrSettings.pageEnd) {
        formData.append("page_end", ocrSettings.pageEnd);
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
      
      // Store both raw and potentially formatted versions
      setRawOcrData(data.text); 
      setExtractedText(data.text);
      
      setSuccess("Text extracted successfully!");
      
    } catch (error) {
      console.error("OCR extraction error:", error);
      setError(`Failed to extract text: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Download extracted text as a TXT file
  const downloadText = (raw: boolean = false): void => {
    if (!extractedText && !rawOcrData) {
      setError("No text to download.");
      return;
    }
    
    // Choose which text to download based on parameter
    const textToDownload = raw ? rawOcrData : getDisplayText();
    const fileNameSuffix = raw ? "_raw" : "_formatted";
    
    try {
      const blob = new Blob([textToDownload], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${file ? file.name.replace(".pdf", "") : "ocr-text"}${fileNameSuffix}.txt`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
      
      setSuccess(`Text downloaded successfully as ${a.download}!`);
      setShowDownloadOptions(false);
    } catch (error) {
      console.error("Download error:", error);
      setError(`Failed to download text: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  // Copy text to clipboard
  const copyToClipboard = (): void => {
    if (!extractedText && !rawOcrData) {
      setError("No text to copy.");
      return;
    }
    
    const textToCopy = viewMode === "raw" ? rawOcrData : getDisplayText();
    
    navigator.clipboard.writeText(textToCopy)
      .then(() => setSuccess("Text copied to clipboard!"))
      .catch(err => setError(`Failed to copy text: ${err.message}`));
  };

  // Get display name for the currently selected language
  const getSelectedLanguageName = (): string => {
    const selectedLang = languages.find(l => l.code === ocrSettings.language);
    return selectedLang ? selectedLang.name : LANGUAGE_NAMES[ocrSettings.language] || ocrSettings.language;
  };

  // Format the OCR text to make it more readable
  const formatOcrText = (text: string): string => {
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

  // Get the text to display based on the view mode
  const getDisplayText = (): string => {
    if (viewMode === "raw") {
      return rawOcrData;
    } else {
      return formatOcrText(extractedText);
    }
  };

  // Toggle download options dropdown
  const toggleDownloadOptions = (): void => {
    setShowDownloadOptions(!showDownloadOptions);
  };

  // Close download dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      const target = event.target as HTMLElement;
      if (showDownloadOptions && !target.closest('.download-dropdown')) {
        setShowDownloadOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside as unknown as EventListener);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside as unknown as EventListener);
    };
  }, [showDownloadOptions]);

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
      
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <Form onSubmit={handleExtractText}>
            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold">Upload PDF File</Form.Label>
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <div className="custom-file-input">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileSelect}
                      id="pdf-file-input"
                      className="d-none"
                    />
                    <label 
                      htmlFor="pdf-file-input" 
                      className="form-control d-flex align-items-center" 
                      style={{ cursor: 'pointer', height: '42px' }}
                    >
                      {fileName || "Choose File"}
                    </label>
                  </div>
                </div>
                <Button 
                  variant="outline-secondary"
                  onClick={() => document.getElementById('pdf-file-input')?.click()}
                  className="ms-2"
                >
                  Browse
                </Button>
              </div>
              <Form.Text className="text-muted">
                Only PDF files are supported.
              </Form.Text>
            </Form.Group>
            
            <div className="mb-4">
              <Button
                variant="link"
                onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                className="p-0 text-decoration-none"
                aria-expanded={showAdvancedOptions}
              >
                <div className="d-flex align-items-center">
                  <span className="me-2">Advanced OCR Options</span>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="16" 
                    height="16" 
                    fill="currentColor" 
                    className={`bi bi-chevron-${showAdvancedOptions ? 'up' : 'down'}`} 
                    viewBox="0 0 16 16"
                  >
                    <path fillRule="evenodd" d={showAdvancedOptions ? 
                      "M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708l6-6z" :
                      "M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"
                    }/>
                  </svg>
                </div>
              </Button>
            </div>
            
            {showAdvancedOptions && (
              <div className="border rounded p-3 mb-4 bg-light">
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">OCR Language</Form.Label>
                      <Form.Select 
                        value={ocrSettings.language}
                        onChange={(e) => handleSettingChange("language", e.target.value)}
                        disabled={isLoadingLanguages}
                      >
                        {isLoadingLanguages ? (
                          <option>Loading languages...</option>
                        ) : (
                          languages.map((lang) => (
                            <option key={lang.code} value={lang.code}>
                              {lang.name}
                            </option>
                          ))
                        )}
                      </Form.Select>
                      <Form.Text className="text-muted">
                        Select the language of the text in your PDF.
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">DPI (Image Quality)</Form.Label>
                      <Form.Select
                        value={ocrSettings.dpi}
                        onChange={(e) => handleSettingChange("dpi", Number(e.target.value))}
                      >
                        <option value="150">Low (150 DPI) - Faster</option>
                        <option value="300">Medium (300 DPI) - Recommended</option>
                        <option value="600">High (600 DPI) - Better Quality</option>
                      </Form.Select>
                      <Form.Text className="text-muted">
                        Higher DPI improves quality but takes longer to process.
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>
                
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">Page Range (Optional)</Form.Label>
                      <Row>
                        <Col>
                          <Form.Control
                            type="number"
                            min="1"
                            placeholder="Start"
                            value={ocrSettings.pageStart}
                            onChange={(e) => handleSettingChange("pageStart", e.target.value)}
                          />
                        </Col>
                        <Col>
                          <Form.Control
                            type="number"
                            min="1"
                            placeholder="End"
                            value={ocrSettings.pageEnd}
                            onChange={(e) => handleSettingChange("pageEnd", e.target.value)}
                          />
                        </Col>
                      </Row>
                      <Form.Text className="text-muted">
                        Leave empty to process the entire document.
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3 mt-md-4">
                      <Form.Check
                        type="checkbox"
                        id="preprocess"
                        label="Preprocess Images"
                        checked={ocrSettings.preprocess}
                        onChange={(e) => handleSettingChange("preprocess", e.target.checked)}
                      />
                      <Form.Text className="text-muted">
                        Improves OCR quality for scanned documents but may take longer.
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>
              </div>
            )}
            
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
        </Card.Body>
      </Card>
      
      {(extractedText || rawOcrData) && (
        <Card className="shadow-sm mb-4">
          <Card.Header className="bg-light py-3">
            <div className="d-flex justify-content-between align-items-center flex-wrap">
              <div className="mb-2 mb-md-0">
                <h5 className="mb-1">Extracted Text</h5>
                <div className="text-muted small">
                  <span className="fw-semibold">Language:</span> {getSelectedLanguageName()} | 
                  <span className="fw-semibold ms-2">Quality:</span> {ocrSettings.dpi} DPI
                  {ocrSettings.preprocess && <span className="ms-2 badge bg-info text-white">Preprocessed</span>}
                </div>
              </div>
              
              <div className="d-flex flex-wrap">
                {/* Toggle View Mode */}
                <ButtonGroup className="me-2 mb-2 mb-md-0">
                  <Button
                    variant={viewMode === "readable" ? "primary" : "outline-primary"}
                    onClick={() => setViewMode("readable")}
                  >
                    Readable
                  </Button>
                  <Button
                    variant={viewMode === "raw" ? "primary" : "outline-primary"}
                    onClick={() => setViewMode("raw")}
                  >
                    Raw
                  </Button>
                </ButtonGroup>
                
                {/* Copy and Download Buttons */}
                <div className="d-flex">
                  <Button
                    variant="outline-secondary"
                    onClick={copyToClipboard}
                    className="me-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-clipboard me-1" viewBox="0 0 16 16">
                      <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
                      <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
                    </svg>
                    Copy
                  </Button>
                  
                  <div className="position-relative download-dropdown">
                    <Button
                      variant="primary"
                      onClick={toggleDownloadOptions}
                      className="d-flex align-items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-download me-1" viewBox="0 0 16 16">
                        <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                        <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
                      </svg>
                      Download
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-chevron-down ms-2" viewBox="0 0 16 16">
                        <path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
                      </svg>
                    </Button>
                    
                    {showDownloadOptions && (
                      <div className="position-absolute end-0 mt-1 py-1 bg-white rounded shadow-sm" style={{ zIndex: 1000, minWidth: '200px' }}>
                        <button 
                          className="dropdown-item py-2 px-3"
                          onClick={() => downloadText(false)}
                        >
                          Download Current View
                        </button>
                        <button 
                          className="dropdown-item py-2 px-3"
                          onClick={() => downloadText(true)}
                        >
                          Download Raw OCR Data
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card.Header>
          <Card.Body className="p-0">
            <div className="extracted-text-container">
              <pre 
                className={`extracted-text-pre m-0 p-4 ${viewMode === "raw" ? "raw-text" : "readable-text"}`}
                style={{ 
                  height: "500px",
                  overflowY: "auto",
                  backgroundColor: "#ffffff",
                  border: "none",
                  fontSize: viewMode === "raw" ? "14px" : "16px",
                  lineHeight: viewMode === "raw" ? "1.5" : "1.7",
                  fontFamily: viewMode === "raw" 
                    ? "'Consolas', 'Monaco', 'Courier New', monospace"
                    : "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                  whiteSpace: "pre-wrap",
                  wordWrap: "break-word"
                }}
              >
                {getDisplayText()}
              </pre>
            </div>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default OcrExtractor;