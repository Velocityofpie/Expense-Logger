// src/features/tools/templates/components/TemplateMarkerEditor.tsx
import React from 'react';
import { Form, Button, Card } from 'react-bootstrap';
import { TemplateMarker } from '../../shared/types';

interface TemplateMarkerEditorProps {
  markers: TemplateMarker[];
  onAddMarker: () => void;
  onRemoveMarker: (index: number) => void;
  onUpdateMarker: (index: number, field: keyof TemplateMarker, value: string | boolean) => void;
}

const TemplateMarkerEditor: React.FC<TemplateMarkerEditorProps> = ({
  markers,
  onAddMarker,
  onRemoveMarker,
  onUpdateMarker
}) => {
  return (
    <Card className="mb-3">
      <Card.Header className="bg-light">
        <div className="d-flex justify-content-between align-items-center">
          <h6 className="mb-0">Document Identification</h6>
          <Button
            variant="outline-primary"
            size="sm"
            onClick={onAddMarker}
          >
            Add Marker
          </Button>
        </div>
      </Card.Header>
      <Card.Body>
        <div className="mb-3">
          <Form.Label>
            Marker Text <span className="text-muted">(used to identify this document type)</span>
          </Form.Label>
          
          {markers.length > 0 ? (
            markers.map((marker, index) => (
              <div key={index} className="d-flex mb-2 align-items-center">
                <Form.Control
                  type="text"
                  value={marker.text || ''}
                  onChange={(e) => onUpdateMarker(index, "text", e.target.value)}
                  placeholder="e.g., amazoncom"
                  className="me-2"
                  isInvalid={marker.required && !marker.text.trim()}
                />
                <Form.Check
                  type="checkbox"
                  label="Required"
                  checked={marker.required || false}
                  onChange={(e) => onUpdateMarker(index, "required", e.target.checked)}
                  className="me-2"
                />
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => onRemoveMarker(index)}
                >
                  <i className="bi bi-trash"></i> Remove
                </Button>
                
                {marker.required && !marker.text.trim() && (
                  <div className="invalid-feedback d-block ms-2">
                    Required markers must have text
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center text-muted py-3 border rounded">
              No markers defined. Click "Add Marker" to create one.
            </div>
          )}
        </div>
        
        <Form.Text className="text-muted">
          <i className="bi bi-info-circle me-1"></i>
          Markers are used to identify if a document matches this template. The more specific the marker text, the more accurate the template matching will be.
        </Form.Text>
      </Card.Body>
    </Card>
  );
};

export default TemplateMarkerEditor;