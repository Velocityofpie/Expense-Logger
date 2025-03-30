// src/features/tools/ocr/components/AdvancedOptions.tsx
import React from 'react';
import { Button, Form, Row, Col } from 'react-bootstrap';
import LanguageSelector from './LanguageSelector';
import { OcrLanguage } from '../../shared/types';

interface AdvancedOptionsProps {
  showAdvancedOptions: boolean;
  toggleAdvancedOptions: () => void;
  language: string;
  languages: OcrLanguage[];
  isLoadingLanguages: boolean;
  dpi: number;
  preprocess: boolean;
  pageStart: string;
  pageEnd: string;
  onLanguageChange: (language: string) => void;
  onDpiChange: (dpi: number) => void;
  onPreprocessChange: (preprocess: boolean) => void;
  onPageStartChange: (pageStart: string) => void;
  onPageEndChange: (pageEnd: string) => void;
}

const AdvancedOptions: React.FC<AdvancedOptionsProps> = ({
  showAdvancedOptions,
  toggleAdvancedOptions,
  language,
  languages,
  isLoadingLanguages,
  dpi,
  preprocess,
  pageStart,
  pageEnd,
  onLanguageChange,
  onDpiChange,
  onPreprocessChange,
  onPageStartChange,
  onPageEndChange
}) => {
  return (
    <>
      <div className="mb-4">
        <Button
          variant="link"
          onClick={toggleAdvancedOptions}
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
              <LanguageSelector 
                language={language}
                languages={languages}
                isLoading={isLoadingLanguages}
                onChange={onLanguageChange}
              />
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">DPI (Image Quality)</Form.Label>
                <Form.Select
                  value={dpi}
                  onChange={(e) => onDpiChange(Number(e.target.value))}
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
                      onChange={(e) => onPageStartChange(e.target.value)}
                    />
                  </Col>
                  <Col>
                    <Form.Control
                      type="number"
                      min="1"
                      placeholder="End"
                      value={pageEnd}
                      onChange={(e) => onPageEndChange(e.target.value)}
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
                  onChange={(e) => onPreprocessChange(e.target.checked)}
                />
                <Form.Text className="text-muted">
                  Improves OCR quality for scanned documents but may take longer.
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
        </div>
      )}
    </>
  );
};

export default AdvancedOptions;