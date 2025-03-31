// src/features/tools/templates/components/TemplateFieldEditor.tsx
import React from 'react';
import { Form, Button, Card, Row, Col, Alert } from 'react-bootstrap';
import { TemplateField } from '../../shared/types';

interface TemplateFieldEditorProps {
  fields: TemplateField[];
  onAddField: () => void;
  onRemoveField: (index: number) => void;
  onUpdateField: (index: number, field: string, value: any) => void;
}

const TemplateFieldEditor: React.FC<TemplateFieldEditorProps> = ({
  fields,
  onAddField,
  onRemoveField,
  onUpdateField
}) => {
  return (
    <Card>
      <Card.Header className="bg-light d-flex justify-content-between align-items-center">
        <h6 className="mb-0">Fields to Extract</h6>
        <Button
          variant="outline-primary"
          size="sm"
          onClick={onAddField}
        >
          Add Field
        </Button>
      </Card.Header>
      <Card.Body className="p-0">
        <div className="template-fields-container">
          {fields.length === 0 ? (
            <div className="text-center py-4 text-muted">
              <p className="mb-0">No fields defined. Click "Add Field" to create one.</p>
            </div>
          ) : (
            <div className="p-3">
              {fields.map((field, index) => (
                <Card key={index} className="field-card mb-3 border shadow-sm">
                  <div className="field-card-header bg-light p-3 d-flex justify-content-between align-items-center border-bottom">
                    <h6 className="mb-0 text-primary">
                      {field.display_name || field.field_name || `Field ${index + 1}`}
                    </h6>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => onRemoveField(index)}
                    >
                      Remove
                    </Button>
                  </div>
                  <div className="field-card-body p-3">
                    <Row className="mb-3">
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>
                            Field Name (internal) <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Control
                            type="text"
                            value={field.field_name || ""}
                            onChange={(e) => onUpdateField(index, "field_name", e.target.value)}
                            placeholder="e.g., order_number"
                            isInvalid={!field.field_name?.trim()}
                          />
                          {!field.field_name?.trim() && (
                            <Form.Control.Feedback type="invalid">
                              Field name is required
                            </Form.Control.Feedback>
                          )}
                          <Form.Text className="text-muted">
                            The internal name used to reference this field in the system
                          </Form.Text>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Display Name</Form.Label>
                          <Form.Control
                            type="text"
                            value={field.display_name || ""}
                            onChange={(e) => onUpdateField(index, "display_name", e.target.value)}
                            placeholder="e.g., Order Number"
                          />
                          <Form.Text className="text-muted">
                            The user-friendly name shown in the UI
                          </Form.Text>
                        </Form.Group>
                      </Col>
                    </Row>
                    
                    <Row className="mb-3">
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Data Type</Form.Label>
                          <Form.Select
                            value={field.data_type || "string"}
                            onChange={(e) => onUpdateField(index, "data_type", e.target.value)}
                          >
                            <option value="string">String</option>
                            <option value="date">Date</option>
                            <option value="currency">Currency</option>
                            <option value="integer">Integer</option>
                            <option value="float">Float</option>
                            <option value="boolean">Boolean</option>
                            <option value="address">Address</option>
                          </Form.Select>
                          <Form.Text className="text-muted">
                            The type of data this field contains
                          </Form.Text>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mt-md-4">
                          <Form.Check
                            type="checkbox"
                            label="Required Field"
                            checked={field.validation?.required || false}
                            onChange={(e) => {
                              onUpdateField(index, "validation.required", e.target.checked);
                            }}
                          />
                          <Form.Text className="text-muted">
                            If checked, this field must be successfully extracted for the template to match
                          </Form.Text>
                        </Form.Group>
                      </Col>
                    </Row>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Extraction Regex Pattern <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="text"
                        value={field.extraction?.regex || ""}
                        onChange={(e) => onUpdateField(index, "extraction.regex", e.target.value)}
                        placeholder="e.g., Order #(\\d{3}-\\d{7}-\\d{7})"
                        isInvalid={!field.extraction?.regex?.trim()}
                      />
                      {!field.extraction?.regex?.trim() && (
                        <Form.Control.Feedback type="invalid">
                          Regex pattern is required
                        </Form.Control.Feedback>
                      )}
                      <Form.Text className="text-muted">
                        Use regex with capture groups to extract data. The first capture group will be used.
                      </Form.Text>
                    </Form.Group>
                    
                    <Form.Group>
                      <Form.Label>Alternative Regex Pattern (optional)</Form.Label>
                      <Form.Control
                        type="text"
                        value={field.extraction?.alternative_regex || ""}
                        onChange={(e) => onUpdateField(index, "extraction.alternative_regex", e.target.value)}
                        placeholder="Alternative pattern if the first one fails"
                      />
                      <Form.Text className="text-muted">
                        A backup pattern to try if the first pattern doesn't match
                      </Form.Text>
                    </Form.Group>
                    
                    {field.data_type === "date" && (
                      <Alert variant="info" className="mt-3">
                        <i className="bi bi-info-circle me-2"></i>
                        For date fields, use capture groups to extract the date in a standard format.
                        Example pattern: <code>Order Date: (.*?)</code>
                      </Alert>
                    )}
                    
                    {field.data_type === "currency" && (
                      <Alert variant="info" className="mt-3">
                        <i className="bi bi-info-circle me-2"></i>
                        For currency fields, capture just the numeric value.
                        Example: <code>Total: $(.*?)</code>
                      </Alert>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </Card.Body>
      <Card.Footer className="bg-light d-flex justify-content-between">
        <div className="text-muted small">
          <i className="bi bi-info-circle me-1"></i>
          Fields define what data to extract from documents
        </div>
        <Button 
          variant="outline-primary" 
          size="sm" 
          onClick={onAddField}
        >
          <i className="bi bi-plus-circle me-1"></i>
          Add Another Field
        </Button>
      </Card.Footer>
    </Card>
  );
};

export default TemplateFieldEditor;