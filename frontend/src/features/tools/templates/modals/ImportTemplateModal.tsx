// src/features/tools/templates/modals/ImportTemplateModal.tsx
import React, { useState, useRef } from 'react';
import { Modal, Button, Form, Spinner, Alert } from 'react-bootstrap';

interface ImportTemplateModalProps {
  show: boolean;
  onHide: () => void;
  onImport: (file: File) => Promise<void>;
  isImporting: boolean;
}

const ImportTemplateModal: React.FC<ImportTemplateModalProps> = ({
  show,
  onHide,
  onImport,
  isImporting
}) => {
  const [importFile, setImportFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Validate file type
      if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
        setError('Please select a valid JSON file');
        return;
      }
      
      setImportFile(file);
    }
  };
  
  const handleImport = async () => {
    if (!importFile) {
      setError('Please select a template file to import');
      return;
    }
    
    try {
      await onImport(importFile);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setImportFile(null);
    } catch (error) {
      console.error("Error in import handler:", error);
      setError('Failed to import template');
    }
  };

  const handleReset = () => {
    setImportFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  return (
    <Modal 
      show={show} 
      onHide={onHide}
      centered
      backdrop="static"
      onExited={handleReset}
    >
      <Modal.Header closeButton>
        <Modal.Title>Import Template</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        
        <Form.Group className="mb-3">
          <Form.Label>Select Template File</Form.Label>
          <Form.Control
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileSelect}
            disabled={isImporting}
          />
          <Form.Text className="text-muted">
            Import a JSON template file.
          </Form.Text>
        </Form.Group>
        
        {importFile && (
          <div className="mt-3">
            <p className="mb-1"><strong>Selected file:</strong></p>
            <p className="mb-0 text-break">{importFile.name}</p>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={isImporting}>
          Cancel
        </Button>
        <Button 
          variant="primary" 
          onClick={handleImport}
          disabled={isImporting || !importFile}
        >
          {isImporting ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
                className="me-2"
              />
              Importing...
            </>
          ) : (
            "Import Template"
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ImportTemplateModal;