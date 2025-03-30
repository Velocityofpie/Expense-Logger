// src/features/tools/templates/modals/TestTemplateModal.tsx
import React, { useState } from 'react';
import { Modal, Button, Form, Spinner, Card, Row, Col, Table, Badge } from 'react-bootstrap';
import { Template, TemplateTestResult } from '../../shared/types';

interface TestTemplateModalProps {
  show: boolean;
  onHide: () => void;
  template: Template | null;
  invoices: any[];
  onRunTest: (invoiceId: string) => Promise<void>;
  isTesting: boolean;
  testResults: TemplateTestResult | null;
  onPreviewInvoice: (invoiceId: string) => void;
}

const TestTemplateModal: React.FC<TestTemplateModalProps> = ({
  show,
  onHide,
  template,
  invoices,
  onRunTest,
  isTesting,
  testResults,
  onPreviewInvoice
}) => {
  const [selectedInvoice, setSelectedInvoice] = useState<string>("");
  
  const handleRunTest = async () => {
    if (!selectedInvoice) {
      alert("Please select an invoice to test with.");
      return;
    }
    
    await onRunTest(selectedInvoice);
  };
  
  return (
    <Modal 
      show={show} 
      onHide={onHide}
      size="lg"
      centered
      backdrop="static"
    >
      <Modal.Header closeButton>
        <Modal.Title>
          Test Template: {template ? template.name : ""}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group className="mb-4">
          <Form.Label>Select Invoice</Form.Label>
          <Form.Select
            value={selectedInvoice}
            onChange={(e) => setSelectedInvoice(e.target.value)}
            disabled={isTesting}
          >
            <option value="">Select an invoice...</option>
            {invoices.map(invoice => (
              <option key={invoice.invoice_id} value={invoice.invoice_id}>
                {invoice.order_number || invoice.file_name || `Invoice #${invoice.invoice_id}`}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
        
        {testResults && (
          <div className="mt-4">
            <Card className="mb-3">
              <Card.Header className={`bg-${testResults.success ? "success" : "danger"} text-white`}>
                <h5 className="mb-0">
                  {testResults.success ? "Template Matched Successfully!" : "Template Match Failed"}
                </h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col sm={4}>
                    <div className="mb-3">
                      <h6>Match Score</h6>
                      <h3>{(testResults.match_score * 100).toFixed(1)}%</h3>
                    </div>
                  </Col>
                  <Col sm={4}>
                    <div className="mb-3">
                      <h6>Fields Matched</h6>
                      <h3>{testResults.fields_matched} / {testResults.fields_total}</h3>
                    </div>
                  </Col>
                  <Col sm={4}>
                    <div className="mb-3">
                      <h6>Status</h6>
                      <Badge bg={testResults.success ? "success" : "danger"} className="fs-6">
                        {testResults.success ? "Success" : "Failed"}
                      </Badge>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
            
            <h5 className="mb-3">Field Test Results</h5>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Field</th>
                  <th>Status</th>
                  <th>Required</th>
                  <th>Extracted Value</th>
                </tr>
              </thead>
              <tbody>
                {template && template.template_data && 
                template.template_data.fields.map((field) => {
                  // Determine if the field was successfully extracted
                  const wasExtracted = Object.keys(testResults.extracted_data).includes(field.field_name);
                  const isRequired = field.validation?.required || false;
                  const extractedValue = testResults.extracted_data[field.field_name] || "-";
                  
                  return (
                    <tr key={field.field_name}>
                      <td>
                        <strong>{field.display_name || field.field_name}</strong>
                      </td>
                      <td>
                        {wasExtracted ? (
                          <Badge bg="success">Passed</Badge>
                        ) : (
                          <Badge bg="danger">Failed</Badge>
                        )}
                      </td>
                      <td>
                        {isRequired ? (
                          <Badge bg="warning" text="dark">Required</Badge>
                        ) : (
                          <Badge bg="secondary">Optional</Badge>
                        )}
                      </td>
                      <td>{String(extractedValue) || "-"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
            
            <h5 className="mb-3">Extracted Data</h5>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Field</th>
                  <th>Extracted Value</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(testResults.extracted_data).map(([field, value]) => (
                  <tr key={field}>
                    <td>{field}</td>
                    <td>{String(value) || "-"}</td>
                  </tr>
                ))}
                {Object.keys(testResults.extracted_data).length === 0 && (
                  <tr>
                    <td colSpan={2} className="text-center">No data extracted</td>
                  </tr>
                )}
              </tbody>
            </Table>
            
            {/* Add Invoice Preview Button */}
            <div className="mt-4 d-flex justify-content-end">
              <Button 
                variant="outline-primary"
                onClick={() => onPreviewInvoice(selectedInvoice)}
                disabled={!selectedInvoice}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-eye me-2" viewBox="0 0 16 16">
                  <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
                  <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
                </svg>
                View Invoice
              </Button>
            </div>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={isTesting}>
          Close
        </Button>
        <Button 
          variant="primary" 
          onClick={handleRunTest}
          disabled={isTesting || !selectedInvoice}
        >
          {isTesting ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
                className="me-2"
              />
              Testing...
            </>
          ) : (
            "Run Test"
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default TestTemplateModal;