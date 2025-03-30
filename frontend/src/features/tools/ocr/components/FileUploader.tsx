// src/features/tools/ocr/components/FileUploader.tsx
import React from 'react';
import { Form, Button } from 'react-bootstrap';

interface FileUploaderProps {
  fileName: string;
  onFileSelect: (file: File) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ fileName, onFileSelect }) => {
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      onFileSelect(selectedFile);
    }
  };

  return (
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
  );
};

export default FileUploader;