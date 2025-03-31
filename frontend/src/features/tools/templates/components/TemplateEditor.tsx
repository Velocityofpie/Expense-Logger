// src/features/tools/templates/components/TemplateEditor.tsx
import React from 'react';
import { Button, Form, Alert } from 'react-bootstrap';
import TemplateMarkerEditor from './TemplateMarkerEditor';
import TemplateFieldEditor from './TemplateFieldEditor';
import { TemplateMarker, TemplateField } from '../../shared/types';

interface TemplateEditorProps {
  editorMode: 'visual' | 'code';
  templateData: {
    identification: {
      markers: TemplateMarker[];
    };
    fields: TemplateField[];
  };
  templateJson: string;
  jsonError: string;
  onSwitchEditorMode: (mode: 'visual' | 'code') => void;
  onJsonChange: (json: string) => void;
  onAddMarker: () => void;
  onRemoveMarker: (index: number) => void;
  onUpdateMarker: (index: number, field: keyof TemplateMarker, value: string | boolean) => void;
  onAddField: () => void;
  onRemoveField: (index: number) => void;
  onUpdateField: (index: number, field: string, value: any) => void;
}

const TemplateEditor: React.FC<TemplateEditorProps> = ({
  editorMode,
  templateData,
  templateJson,
  jsonError,
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
    <div className="mb-3">
      <div className="d-flex align-items-center mb-3 border-bottom pb-2">
        <h5 className="mb-0">Template Definition</h5>
        <div className="ms-auto">
          <div className="btn-group" role="group">
            <Button
              variant={editorMode === "visual" ? "primary" : "outline-primary"}
              size="sm"
              onClick={() => onSwitchEditorMode("visual")}
              className="px-3"
            >
              Visual Editor
            </Button>
            <Button
              variant={editorMode === "code" ? "primary" : "outline-primary"}
              size="sm"
              onClick={() => onSwitchEditorMode("code")}
              className="px-3"
            >
              JSON Editor
            </Button>
          </div>
        </div>
      </div>
      
      {editorMode === "code" ? (
        <div>
          <Form.Group>
            <Form.Control
              as="textarea"
              rows={15}
              value={templateJson}
              onChange={(e) => onJsonChange(e.target.value)}
              placeholder="Paste JSON template data here..."
              className="template-json-editor font-monospace"
              isInvalid={!!jsonError}
            />
            {jsonError && (
              <Form.Control.Feedback type="invalid">
                {jsonError}
              </Form.Control.Feedback>
            )}
          </Form.Group>
          <Alert variant="info" className="mt-2">
            <i className="bi bi-info-circle-fill me-2"></i>
            The JSON editor allows advanced editing of the template structure. Make sure your JSON is valid before switching back to the visual editor.
          </Alert>
        </div>
      ) : (
        <div>
          {/* Visual editor */}
          <TemplateMarkerEditor 
            markers={templateData.identification.markers}
            onAddMarker={onAddMarker}
            onRemoveMarker={onRemoveMarker}
            onUpdateMarker={onUpdateMarker}
          />
          
          <TemplateFieldEditor 
            fields={templateData.fields}
            onAddField={onAddField}
            onRemoveField={onRemoveField}
            onUpdateField={onUpdateField}
          />
        </div>
      )}
    </div>
  );
};

export default TemplateEditor;