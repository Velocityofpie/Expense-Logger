// src/features/tools/ocr/components/TextViewer.tsx
import React, { useState } from 'react';
import { Card, Button } from 'react-bootstrap';

interface TextViewerProps {
  extractedText: string;
  rawOcrData: string;
  selectedLanguage: string;
  dpi: number;
  preprocess: boolean;
  onCopyToClipboard: () => void;
  onDownload: (raw: boolean) => void;
}

const TextViewer: React.FC<TextViewerProps> = ({
  extractedText,
  rawOcrData,
  selectedLanguage,
  dpi,
  preprocess,
  onCopyToClipboard,
  onDownload
}) => {
  const [viewMode, setViewMode] = useState<"readable" | "raw">("readable");
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);

  // Format the OCR text to make it more readable
  const formatOcrText = (text: string): string => {
    if (!text) return "";
    
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
  
  return (
    <Card className="shadow-sm mb-4">
      <Card.Header className="bg-light py-3">
        <div className="d-flex justify-content-between align-items-center flex-wrap">
          <div className="mb-2 mb-md-0">
            <h5 className="mb-1">Extracted Text</h5>
            <div className="text-muted small">
              <span className="fw-semibold">Language:</span> {selectedLanguage} | 
              <span className="fw-semibold ms-2">Quality:</span> {dpi} DPI
              {preprocess && <span className="ms-2 badge bg-info text-white">Preprocessed</span>}
            </div>
          </div>
          
          <div className="d-flex flex-wrap">
            {/* Toggle View Mode */}
            <div className="btn-group me-2 mb-2 mb-md-0">
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
            </div>
            
            {/* Copy and Download Buttons */}
            <div className="d-flex">
              <Button
                variant="outline-secondary"
                onClick={onCopyToClipboard}
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
                      onClick={() => onDownload(false)}
                    >
                      Download Current View
                    </button>
                    <button 
                      className="dropdown-item py-2 px-3"
                      onClick={() => onDownload(true)}
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
              wordWrap: "break-word",
              color: "#212529" // Adding explicit text color here
            }}
          >
            {getDisplayText()}
          </pre>
        </div>
      </Card.Body>
    </Card>
  );
};

export default TextViewer;