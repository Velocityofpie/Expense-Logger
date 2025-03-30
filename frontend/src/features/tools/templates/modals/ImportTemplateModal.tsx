// src/features/tools/templates/modals/ImportTemplateModal.tsx
import React, { useState } from 'react';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';

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
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImportFile(e.target.files[0]);
    }
  };
  
  const handleImport = async () => {
    if (!importFile) return;
    
    try {
      await onImport(importFile);
      setImportFile(null); // Reset the file input after successful import
    } catch (error) {
      console.error("Error in import handler:", error);
    }
  };
  
  return (
    <Modal 
      show={show} 
      onHide={onHide}
      centered
      backdrop="static"
    >
      <Modal.Header closeButton>
        <Modal.Title>Import Template</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group className="mb-3">
          <Form.Label>Select Template File</Form.Label>
          <Form.Control
            type="file"
            accept=".json"
            onChange={handleFileSelect}
            disabled={isImporting}
          />
          <Form.Text className="text-muted">
            Import a JSON template file.
          </Form.Text>
        </Form.Group>
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