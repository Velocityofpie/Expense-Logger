// src/features/tools/templates/components/TemplateFieldEditor.tsx
import React from 'react';
import { Form, Button, Card, Row, Col } from 'react-bootstrap';
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
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h6 className="mb-0">Fields to Extract</h6>
        <Button
          variant="outline-primary"
          size="sm"
          onClick={onAddField}
        >
          Add Field
        </Button>
      </Card.Header>
      <Card.Body>
        <div className="template-fields-container">
          {fields.length === 0 ? (
            <div className="text-center py-3">
              <p className="mb-0">No fields defined. Click "Add Field" to create one.</p>
            </div>
          ) : (
            fields.map((field, index) => (
              <Card key={index} className="field-card mb-3">
                <div className="field-card-header">
                  <h6 className="mb-0">
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
                <div className="field-card-body">
                  <Row className="mb-3">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Field Name (internal)</Form.Label>
                        <Form.Control
                          type="text"
                          value={field.field_name || ""}
                          onChange={(e) => onUpdateField(index, "field_name", e.target.value)}
                          placeholder="e.g., order_number"
                        />
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
                    <Form.Label>Extraction Regex Pattern</Form.Label>
                    <Form.Control
                      type="text"
                      value={field.extraction?.regex || ""}
                      onChange={(e) => onUpdateField(index, "extraction.regex", e.target.value)}
                      placeholder="e.g., Order #(\\d{3}-\\d{7}-\\d{7})"
                    />
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
                </div>
              </Card>
            ))
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default TemplateFieldEditor;