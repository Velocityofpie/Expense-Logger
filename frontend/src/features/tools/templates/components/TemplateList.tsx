// src/features/tools/templates/components/TemplateList.tsx
import React from 'react';
import { Table, Button, Badge, Spinner, Card } from 'react-bootstrap';
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
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Loading templates...</span>
        </Spinner>
        <p className="mt-3">Loading templates...</p>
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <Card className="text-center p-4 border-dashed">
        <Card.Body>
          <div className="mb-3">
            <i className="bi bi-file-earmark-text display-4 text-muted"></i>
          </div>
          <h5>No Templates Available</h5>
          <p className="text-muted mb-3">
            Create a new template or import one to get started. Templates help automatically extract data from your invoices.
          </p>
          <div className="d-flex justify-content-center">
            <Button variant="outline-primary">Create Your First Template</Button>
          </div>
        </Card.Body>
      </Card>
    );
  }

  return (
    <div className="table-responsive">
      <Table hover className="align-middle">
        <thead className="bg-light">
          <tr>
            <th>Name</th>
            <th>Vendor</th>
            <th>Version</th>
            <th>Fields</th>
            <th>Created</th>
            <th className="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {templates.map(template => (
            <tr key={template.template_id}>
              <td className="fw-medium">{template.name || "Unnamed Template"}</td>
              <td>{template.vendor || "-"}</td>
              <td>{template.version || "1.0"}</td>
              <td>
                {template.template_data && template.template_data.fields ? (
                  <Badge bg="info" pill className="py-1 px-2">
                    {template.template_data.fields.length} fields
                  </Badge>
                ) : (
                  <Badge bg="secondary" pill className="py-1 px-2">0 fields</Badge>
                )}
              </td>
              <td>
                {new Date(template.created_at).toLocaleDateString()}
              </td>
              <td>
                <div className="d-flex justify-content-center gap-1">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    title="Edit Template"
                    onClick={() => onEdit(template)}
                  >
                    <i className="bi bi-pencil"></i>
                  </Button>
                  <Button
                    variant="outline-success"
                    size="sm"
                    title="Test Template"
                    onClick={() => onTest(template.template_id)}
                  >
                    <i className="bi bi-check2-circle"></i>
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    title="Export Template"
                    onClick={() => onExport(template.template_id)}
                  >
                    <i className="bi bi-download"></i>
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    title="Delete Template"
                    onClick={() => onDelete(template.template_id)}
                  >
                    <i className="bi bi-trash"></i>
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default TemplateList;