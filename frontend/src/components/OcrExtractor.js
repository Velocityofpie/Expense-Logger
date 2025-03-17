// frontend/src/components/OcrExtractor.js
import React, { useState, useEffect } from "react";
import { Form, Button, Alert, Spinner, Row, Col, Card } from "react-bootstrap";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

// Language mapping for display
const LANGUAGE_NAMES = {
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

export default function OcrExtractor() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [extractedText, setExtractedText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [languages, setLanguages] = useState([]);
  const [isLoadingLanguages, setIsLoadingLanguages] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  
  // OCR settings
  const [language, setLanguage] = useState("eng");
  const [dpi, setDpi] = useState(300);
  const [preprocess, setPreprocess] = useState(false);
  const [pageStart, setPageStart] = useState("");
  const [pageEnd, setPageEnd] = useState("");
  
  // Fetch available languages on component mount
  useEffect(() => {
    fetchLanguages();
  }, []);
  
  const fetchLanguages = async () => {
    try {
      setIsLoadingLanguages(true);
      const response = await fetch(`${API_URL}/ocr/languages/`);
      if (response.ok) {
        const data = await response.json();
        
        // Transform language data to include full names
        const languagesWithNames = data.languages.map(lang => {
          // If it's an object with code/name already
          if (typeof lang === 'object' && lang.code) {
            return {
              ...lang,
              name: lang.name || LANGUAGE_NAMES[lang.code] || lang.code
            };
          }
          
          // If it's just a string code
          return {
            code: lang,
            name: LANGUAGE_NAMES[lang] || lang
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
  const handleFileSelect = (e) => {
    if (e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setError("");
    }
  };

  // Process PDF for OCR
  const handleExtractText = async (e) => {
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
      formData.append("language", language);
      formData.append("dpi", dpi);
      formData.append("preprocess", preprocess);
      
      if (pageStart) {
        formData.append("page_start", pageStart);
      }
      
      if (pageEnd) {
        formData.append("page_end", pageEnd);
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
      setExtractedText(data.text);
      setSuccess("Text extracted successfully!");
      
    } catch (error) {
      console.error("OCR extraction error:", error);
      setError(`Failed to extract text: ${error.message || "Unknown error"}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Download extracted text as a TXT file
  const downloadText = () => {
    if (!extractedText) {
      setError("No text to download.");
      return;
    }
    
    const blob = new Blob([extractedText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${file.name.replace(".pdf", "")}_extracted.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setSuccess("Text downloaded successfully!");
  };

  // Copy text to clipboard
  const copyToClipboard = () => {
    if (!extractedText) {
      setError("No text to copy.");
      return;
    }
    
    navigator.clipboard.writeText(extractedText)
      .then(() => setSuccess("Text copied to clipboard!"))
      .catch((err) => setError(`Failed to copy text: ${err.message}`));
  };

  // Get display name for the currently selected language
  const getSelectedLanguageName = () => {
    const selectedLang = languages.find(l => l.code === language);
    return selectedLang ? selectedLang.name : LANGUAGE_NAMES[language] || language;
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
                  onClick={() => document.getElementById('pdf-file-input').click()}
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
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        disabled={isLoadingLanguages}
                      >
                        {isLoadingLanguages ? (
                          <option>Loading languages...</option>
                        ) : (
                          languages.map((lang) => (
                            <option key={lang.code} value={lang.code}>
                              {lang.name || LANGUAGE_NAMES[lang.code] || lang.code}
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
                        value={dpi}
                        onChange={(e) => setDpi(Number(e.target.value))}
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
                            value={pageStart}
                            onChange={(e) => setPageStart(e.target.value)}
                          />
                        </Col>
                        <Col>
                          <Form.Control
                            type="number"
                            min="1"
                            placeholder="End"
                            value={pageEnd}
                            onChange={(e) => setPageEnd(e.target.value)}
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
                        checked={preprocess}
                        onChange={(e) => setPreprocess(e.target.checked)}
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
      
      {extractedText && (
        <Card className="shadow-sm mb-4">
          <Card.Header className="bg-light d-flex justify-content-between align-items-center py-3">
            <div>
              <h5 className="mb-1">Extracted Text</h5>
              <div className="text-muted small">
                <span className="fw-semibold">Language:</span> {getSelectedLanguageName()} | 
                <span className="fw-semibold ms-2">Quality:</span> {dpi} DPI
                {preprocess && <span className="ms-2 badge bg-info text-white">Preprocessed</span>}
              </div>
            </div>
            <div>
              <Button
                variant="outline-secondary"
                onClick={copyToClipboard}
                className="me-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-clipboard me-1" viewBox="0 0 16 16">
                  <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
                  <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
                </svg>
                Copy to Clipboard
              </Button>
              <Button
                variant="primary"
                onClick={downloadText}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-download me-1" viewBox="0 0 16 16">
                  <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                  <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
                </svg>
                Download as Text
              </Button>
            </div>
          </Card.Header>
          <Card.Body className="p-0">
            <div className="extracted-text-container">
              <pre 
                className="extracted-text-pre m-0 p-4"
                style={{ 
                  height: "500px",
                  overflowY: "auto",
                  backgroundColor: "#ffffff",
                  border: "none",
                  fontSize: "16px",
                  lineHeight: "1.6",
                  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", // More readable font
                  whiteSpace: "pre-wrap",
                  wordWrap: "break-word"
                }}
              >
                {extractedText}
              </pre>
            </div>
          </Card.Body>
        </Card>
      )}
    </div>
  );
}