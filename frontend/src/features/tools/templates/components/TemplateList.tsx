// src/features/tools/templates/components/TemplateList.tsx
import React from 'react';
import { Table, Button, Badge, Spinner } from 'react-bootstrap';
import { Template } from '../../shared/types';

interface TemplateListProps {
  templates: Template[];
  isLoading: boolean;
  onEdit: (template: Template) => void;
  onTest: (templateId: number) => void;
  onExport: (templateId: number) => void;
  onDelete: (templateId: number) => void;
}

const TemplateList: React.FC<TemplateListProps> = ({
  templates,
  isLoading,
  onEdit,
  onTest,
  onExport,
  onDelete
}) => {
  if (isLoading) {
    return (
      <div className="text-center p-4">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Loading templates...</p>
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="text-center p-4">
        <p className="mb-0">No templates available. Create a new template or import one.</p>
      </div>
    );
  }

  return (
    <Table responsive striped hover>
      <thead>
        <tr>
          <th>Name</th>
          <th>Vendor</th>
          <th>Version</th>
          <th>Fields</th>
          <th>Created</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {templates.map(template => (
          <tr key={template.template_id}>
            <td>{template.name}</td>
            <td>{template.vendor || "-"}</td>
            <td>{template.version || "1.0"}</td>
            <td>
              {template.template_data && template.template_data.fields ? (
                <Badge bg="info">{template.template_data.fields.length} fields</Badge>
              ) : "-"}
            </td>
            <td>
              {new Date(template.created_at).toLocaleDateString()}
            </td>
            <td>
              <Button
                variant="outline-primary"
                size="sm"
                className="me-1"
                onClick={() => onEdit(template)}
              >
                Edit
              </Button>
              <Button
                variant="outline-success"
                size="sm"
                className="me-1"
                onClick={() => onTest(template.template_id)}
              >
                Test
              </Button>
              <Button
                variant="outline-secondary"
                size="sm"
                className="me-1"
                onClick={() => onExport(template.template_id)}
              >
                Export
              </Button>
              <Button
                variant="outline-danger"
                size="sm"
                onClick={() => onDelete(template.template_id)}
              >
                Delete
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default TemplateList;