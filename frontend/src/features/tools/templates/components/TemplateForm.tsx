// src/features/tools/templates/components/TemplateForm.tsx
import React from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import TemplateEditor from './TemplateEditor';
import { TemplateFormData, TemplateMarker, Template } from '../../shared/types';

interface TemplateFormProps {
  currentTemplate: Template | null;
  templateData: TemplateFormData;
  editorMode: 'visual' | 'code';
  templateJson: string;
  jsonError: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSwitchEditorMode: (mode: 'visual' | 'code') => void;
  onJsonChange: (json: string) => void;
  onAddMarker: () => void;
  onRemoveMarker: (index: number) => void;
  onUpdateMarker: (index: number, field: keyof TemplateMarker, value: string | boolean) => void;
  onAddField: () => void;
  onRemoveField: (index: number) => void;
  onUpdateField: (index: number, field: string, value: any) => void;
}

const TemplateForm: React.FC<TemplateFormProps> = ({
  currentTemplate,
  templateData,
  editorMode,
  templateJson,
  jsonError,
  onInputChange,
  onSwitchEditorMode,
  onJsonChange,
  onAddMarker,
  onRemoveMarker,
  onUpdateMarker,
  onAddField,
  onRemoveField,
  onUpdateField
}) => {
  return (
    <Form>
      <Row className="mb-3">
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Template Name</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={templateData.name}
              onChange={onInputChange}
              required
              placeholder="e.g., Amazon Invoice"
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group className="mb-3">
            <Form.Label>Vendor</Form.Label>
            <Form.Control
              type="text"
              name="vendor"
              value={templateData.vendor}
              onChange={onInputChange}
              placeholder="e.g., Amazon"
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group className="mb-3">
            <Form.Label>Version</Form.Label>
            <Form.Control
              type="text"
              name="version"
              value={templateData.version}
              onChange={onInputChange}
              placeholder="e.g., 1.0"
            />
          </Form.Group>
        </Col>
      </Row>
      
      <Form.Group className="mb-3">
        <Form.Label>Description</Form.Label>
        <Form.Control
          as="textarea"
          rows={2}
          name="description"
          value={templateData.description}
          onChange={onInputChange}
          placeholder="Describe this template..."
        />
      </Form.Group>
      
      <TemplateEditor
        editorMode={editorMode}
        templateData={templateData.template_data}
        templateJson={templateJson}
        jsonError={jsonError}
        onSwitchEditorMode={onSwitchEditorMode}
        onJsonChange={onJsonChange}
        onAddMarker={onAddMarker}
        onRemoveMarker={onRemoveMarker}
        onUpdateMarker={onUpdateMarker}
        onAddField={onAddField}
        onRemoveField={onRemoveField}
        onUpdateField={onUpdateField}
      />
    </Form>
  );
};

export default TemplateForm;