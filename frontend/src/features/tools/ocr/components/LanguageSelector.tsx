// src/features/tools/ocr/components/LanguageSelector.tsx
import React from 'react';
import { Form } from 'react-bootstrap';
import { OcrLanguage } from '../../shared/types';

interface LanguageSelectorProps {
  language: string;
  languages: OcrLanguage[];
  isLoading: boolean;
  onChange: (language: string) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ 
  language, 
  languages, 
  isLoading, 
  onChange 
}) => {
  return (
    <Form.Group className="mb-3">
      <Form.Label className="fw-semibold">OCR Language</Form.Label>
      <Form.Select 
        value={language}
        onChange={(e) => onChange(e.target.value)}
        disabled={isLoading}
      >
        {isLoading ? (
          <option>Loading languages...</option>
        ) : (
          languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name || lang.code}
            </option>
          ))
        )}
      </Form.Select>
      <Form.Text className="text-muted">
        Select the language of the text in your PDF.
      </Form.Text>
    </Form.Group>
  );
};

export default LanguageSelector;