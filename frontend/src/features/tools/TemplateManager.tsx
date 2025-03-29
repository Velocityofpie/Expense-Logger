// frontend/src/features/tools/TemplateManager.tsx
import React, { useState, useEffect } from "react";
import { 
  Button, 
  Form, 
  Card, 
  Row, 
  Col, 
  Table, 
  Alert, 
  Spinner, 
  Modal,
  Badge,
  Tab,
  Nav
} from "react-bootstrap";
import { 
  fetchTemplates, 
  createTemplate, 
  updateTemplate, 
  deleteTemplate, 
  importTemplate,
  testTemplate,
  fetchInvoices
} from "./toolsApi";
import { Template, TemplateMarker, TemplateField, TemplateTestResult, FieldTestResult } from "./types";
import InvoicePreviewModal from './InvoicePreviewModal';

const TemplateManager: React.FC = () => {
  // State for template list
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  
  // State for template form
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<Template | null>(null);
  const [templateData, setTemplateData] = useState<any>({
    name: "",
    vendor: "",
    version: "1.0",
    description: "",
    template_data: {
      identification: {
        markers: [
          { text: "", required: true }
        ]
      },
      fields: []
    }
  });
  
  // State for template editor
  const [editorMode, setEditorMode] = useState<"visual" | "code">("visual");
  const [templateJson, setTemplateJson] = useState("");
  const [jsonError, setJsonError] = useState("");
  
  // State for import/export
  const [importFile, setImportFile] = useState<File | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  
  // State for template testing
  const [showTestModal, setShowTestModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState("");
  const [invoices, setInvoices] = useState<any[]>([]);
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState<TemplateTestResult | null>(null);
  
  // State for invoice preview
  const [showInvoicePreview, setShowInvoicePreview] = useState(false);
  const [previewInvoiceId, setPreviewInvoiceId] = useState<string | null>(null);
  
  // Load templates on mount
  useEffect(() => {
    loadTemplates();
    loadInvoices();
  }, []);
  
  // Load templates
  const loadTemplates = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await fetchTemplates();
      setTemplates(data);
      
      setIsLoading(false);
    } catch (error) {
      console.error("Error loading templates:", error);
      setError("Failed to load templates. Please try again.");
      setIsLoading(false);
    }
  };
  
  // Load invoices for testing
  const loadInvoices = async () => {
    try {
      const data = await fetchInvoices();
      setInvoices(data);
    } catch (error) {
      console.error("Error loading invoices:", error);
    }
  };
  
  // Handle form field changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTemplateData({
      ...templateData,
      [name]: value
    });
  };
  
  // Add marker
  const addMarker = () => {
    const updatedData = { ...templateData };
    updatedData.template_data.identification.markers.push({ text: "", required: false });
    setTemplateData(updatedData);
  };
  
  // Remove marker
  const removeMarker = (index: number) => {
    const updatedData = { ...templateData };
    updatedData.template_data.identification.markers.splice(index, 1);
    setTemplateData(updatedData);
  };
  
  // Update marker - Fixed with type safety
  const updateMarker = (index: number, field: keyof TemplateMarker, value: string | boolean) => {
    const updatedData = { ...templateData };
    if (field === 'text' && typeof value === 'string') {
      updatedData.template_data.identification.markers[index].text = value;
    } else if (field === 'required' && typeof value === 'boolean') {
      updatedData.template_data.identification.markers[index].required = value;
    }
    setTemplateData(updatedData);
  };
  
  // Add field
  const addField = () => {
    const updatedData = { ...templateData };
    updatedData.template_data.fields.push({
      field_name: "",
      display_name: "",
      data_type: "string",
      extraction: {
        regex: ""
      },
      validation: {
        required: false
      }
    });
    setTemplateData(updatedData);
  };
  
  // Remove field
  const removeField = (index: number) => {
    const updatedData = { ...templateData };
    updatedData.template_data.fields.splice(index, 1);
    setTemplateData(updatedData);
  };
  
  // Update field
  const updateField = (index: number, field: string, value: any) => {
    const updatedData = { ...templateData };
    
    if (field.includes(".")) {
      // Handle nested fields like "extraction.regex"
      const [parent, child] = field.split(".");
      
      if (!updatedData.template_data.fields[index][parent as keyof TemplateField]) {
        (updatedData.template_data.fields[index] as any)[parent] = {};
      }
      
      (updatedData.template_data.fields[index][parent as keyof TemplateField] as any)[child] = value;
    } else {
      (updatedData.template_data.fields[index] as any)[field] = value;
    }
    
    setTemplateData(updatedData);
  };
  
  // Handle JSON editor changes
  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTemplateJson(e.target.value);
    setJsonError("");
    
    try {
      // Validate JSON as user types
      if (e.target.value.trim()) {
        JSON.parse(e.target.value);
      }
    } catch (error) {
      if (error instanceof Error) {
        setJsonError(`Invalid JSON: ${error.message}`);
      } else {
        setJsonError(`Invalid JSON`);
      }
    }
  };
  
  // Switch between visual and code editor
  const switchEditorMode = (mode: "visual" | "code") => {
    if (mode === "code" && editorMode === "visual") {
      // Going from visual to code
      setTemplateJson(JSON.stringify(templateData.template_data, null, 2));
    } else if (mode === "visual" && editorMode === "code") {
      // Going from code to visual
      try {
        const parsedData = JSON.parse(templateJson);
        setTemplateData({
          ...templateData,
          template_data: parsedData
        });
        setJsonError("");
      } catch (error) {
        if (error instanceof Error) {
          setJsonError(`Cannot switch to visual mode: ${error.message}`);
        } else {
          setJsonError(`Cannot switch to visual mode: Invalid JSON`);
        }
        return;
      }
    }
    
    setEditorMode(mode);
  };
  
  // Submit template form
  const handleSubmitTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      
      // Prepare data
      let dataToSubmit = { ...templateData };
      
      // If in code mode, use the JSON from the editor
      if (editorMode === "code") {
        try {
          const parsedData = JSON.parse(templateJson);
          dataToSubmit.template_data = parsedData;
        } catch (error) {
          if (error instanceof Error) {
            setJsonError(`Invalid JSON: ${error.message}`);
          } else {
            setJsonError(`Invalid JSON format`);
          }
          setIsSubmitting(false);
          return;
        }
      }
      
      if (currentTemplate) {
        // Update existing template
        await updateTemplate(currentTemplate.template_id, dataToSubmit);
        setSuccessMessage("Template updated successfully!");
      } else {
        // Create new template
        await createTemplate(dataToSubmit);
        setSuccessMessage("Template created successfully!");
      }
      
      // Reset form and refresh templates
      setTemplateData({
        name: "",
        vendor: "",
        version: "1.0",
        description: "",
        template_data: {
          identification: {
            markers: [
              { text: "", required: true }
            ]
          },
          fields: []
        }
      });
      setCurrentTemplate(null);
      setShowTemplateForm(false);
      loadTemplates();
      
      setIsSubmitting(false);
    } catch (error) {
      console.error("Error saving template:", error);
      setError("Failed to save template. Please try again.");
      setIsSubmitting(false);
    }
  };
  
  // Edit a template
  const handleEditTemplate = (template: Template) => {
    setCurrentTemplate(template);
    setTemplateData({
      name: template.name,
      vendor: template.vendor || "",
      version: template.version || "1.0",
      description: template.description || "",
      template_data: template.template_data
    });
    setShowTemplateForm(true);
    setEditorMode("visual");
  };
  
  // Delete a template
  const handleDeleteTemplate = async (templateId: number) => {
    if (!window.confirm("Are you sure you want to delete this template?")) {
      return;
    }
    
    try {
      await deleteTemplate(templateId);
      setSuccessMessage("Template deleted successfully!");
      loadTemplates();
    } catch (error) {
      console.error("Error deleting template:", error);
      setError("Failed to delete template. Please try again.");
    }
  };
  
  // Handle file selection for import
  const handleImportFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImportFile(e.target.files[0]);
    }
  };
  
  // Import a template
  const handleImportTemplate = async () => {
    if (!importFile) {
      setError("Please select a file to import.");
      return;
    }
    
    try {
      setIsImporting(true);
      
      const formData = new FormData();
      formData.append("file", importFile);
      
      await importTemplate(formData);
      
      setSuccessMessage("Template imported successfully!");
      setShowImportModal(false);
      setImportFile(null);
      loadTemplates();
      
      setIsImporting(false);
    } catch (error) {
      console.error("Error importing template:", error);
      setError("Failed to import template. Please ensure the file is a valid JSON template.");
      setIsImporting(false);
    }
  };
  
  // Export a template
  const handleExportTemplate = (templateId: number) => {
    const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";
    window.open(`${API_URL}/templates/${templateId}/export`, "_blank");
  };
  
  // Test a template
  const handleTestTemplate = async (templateId: number) => {
    setTestResults(null);
    setSelectedInvoice("");
    setShowTestModal(true);
    setCurrentTemplate(templates.find(t => t.template_id === templateId) || null);
  };
  
  // Run a template test
  const runTemplateTest = async () => {
    if (!selectedInvoice || !currentTemplate) {
      alert("Please select an invoice to test with.");
      return;
    }
    
    try {
      setIsTesting(true);
      
      const results = await testTemplate(currentTemplate.template_id, parseInt(selectedInvoice));
      setTestResults(results);
      
      setIsTesting(false);
    } catch (error) {
      console.error("Error testing template:", error);
      setError("Failed to test template. Please try again.");
      setIsTesting(false);
    }
  };

  // Handle opening invoice preview
  const handleOpenInvoicePreview = (invoiceId: string) => {
    setPreviewInvoiceId(invoiceId);
    setShowInvoicePreview(true);
  };

  return (
    <div className="template-manager">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>OCR Template Management</h3>
        <div>
          <Button 
            variant="outline-primary" 
            className="me-2"
            onClick={() => setShowImportModal(true)}
          >
            Import Template
          </Button>
          <Button 
            variant="primary"
            onClick={() => {
              setCurrentTemplate(null);
              setTemplateData({
                name: "",
                vendor: "",
                version: "1.0",
                description: "",
                template_data: {
                  identification: {
                    markers: [
                      { text: "", required: true }
                    ]
                  },
                  fields: []
                }
              });
              setShowTemplateForm(true);
              setEditorMode("visual");
            }}
          >
            Create Template
          </Button>
        </div>
      </div>
      
      {/* Success/Error Messages */}
      {successMessage && (
        <Alert 
          variant="success" 
          dismissible 
          onClose={() => setSuccessMessage("")}
          className="mb-4"
        >
          {successMessage}
        </Alert>
      )}
      
      {error && (
        <Alert 
          variant="danger" 
          dismissible 
          onClose={() => setError(null)}
          className="mb-4"
        >
          {error}
        </Alert>
      )}
      
      {/* Template List */}
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">Available Templates</h5>
        </Card.Header>
        <Card.Body>
          {isLoading ? (
            <div className="text-center p-4">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
              <p className="mt-2">Loading templates...</p>
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center p-4">
              <p className="mb-0">No templates available. Create a new template or import one.</p>
            </div>
          ) : (
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
                        onClick={() => handleEditTemplate(template)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline-success"
                        size="sm"
                        className="me-1"
                        onClick={() => handleTestTemplate(template.template_id)}
                      >
                        Test
                      </Button>
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        className="me-1"
                        onClick={() => handleExportTemplate(template.template_id)}
                      >
                        Export
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDeleteTemplate(template.template_id)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
      
      {/* Template Form Modal */}
      <Modal 
        show={showTemplateForm} 
        onHide={() => setShowTemplateForm(false)}
        size="lg"
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {currentTemplate ? `Edit Template: ${currentTemplate.name}` : "Create New Template"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmitTemplate}>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Template Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={templateData.name}
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
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
                onChange={handleInputChange}
                placeholder="Describe this template..."
              />
            </Form.Group>
            
            <div className="mb-3">
              <div className="d-flex align-items-center mb-2">
                <h5 className="mb-0">Template Definition</h5>
                <div className="ms-auto">
                  <Button
                    variant={editorMode === "visual" ? "primary" : "outline-primary"}
                    size="sm"
                    className="me-2"
                    onClick={() => switchEditorMode("visual")}
                  >
                    Visual Editor
                  </Button>
                  <Button
                    variant={editorMode === "code" ? "primary" : "outline-primary"}
                    size="sm"
                    onClick={() => switchEditorMode("code")}
                  >
                    JSON Editor
                  </Button>
                </div>
              </div>
              
              {editorMode === "code" ? (
                <div>
                  <Form.Group>
                    <Form.Control
                      as="textarea"
                      rows={15}
                      value={templateJson}
                      onChange={handleJsonChange}
                      placeholder="Paste JSON template data here..."
                      className="font-monospace"
                    />
                  </Form.Group>
                  {jsonError && (
                    <div className="text-danger mt-2">{jsonError}</div>
                  )}
                </div>
              ) : (
                <div>
                  {/* Visual editor */}
                  <Card className="mb-3">
                    <Card.Header>
                      <h6 className="mb-0">Document Identification</h6>
                    </Card.Header>
                    <Card.Body>
                      <div className="mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <Form.Label>Marker Text (used to identify this document type)</Form.Label>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={addMarker}
                          >
                            Add Marker
                          </Button>
                        </div>
                        
                        {templateData.template_data.identification.markers.map((marker: TemplateMarker, index: number) => (
                          <div key={index} className="d-flex mb-2 align-items-center">
                            <Form.Control
                              type="text"
                              value={marker.text}
                              onChange={(e) => updateMarker(index, "text", e.target.value)}
                              placeholder="e.g., amazoncom"
                              className="me-2"
                            />
                            <Form.Check
                              type="checkbox"
                              label="Required"
                              checked={marker.required}
                              onChange={(e) => updateMarker(index, "required", e.target.checked)}
                              className="me-2"
                            />
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => removeMarker(index)}
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                      </div>
                    </Card.Body>
                  </Card>
                  
                  <Card>
                    <Card.Header className="d-flex justify-content-between align-items-center">
                      <h6 className="mb-0">Fields to Extract</h6>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={addField}
                      >
                        Add Field
                      </Button>
                    </Card.Header>
                    <Card.Body>
                      {templateData.template_data.fields.length === 0 ? (
                        <div className="text-center py-3">
                          <p className="mb-0">No fields defined. Click "Add Field" to create one.</p>
                        </div>
                      ) : (
                        templateData.template_data.fields.map((field: TemplateField, index: number) => (
                          <Card key={index} className="mb-3">
                            <Card.Header className="d-flex justify-content-between align-items-center">
                              <h6 className="mb-0">
                                {field.display_name || field.field_name || `Field ${index + 1}`}
                              </h6>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => removeField(index)}
                              >
                                Remove
                              </Button>
                            </Card.Header>
                            <Card.Body>
                              <Row className="mb-3">
                                <Col md={6}>
                                  <Form.Group>
                                    <Form.Label>Field Name (internal)</Form.Label>
                                    <Form.Control
                                      type="text"
                                      value={field.field_name || ""}
                                      onChange={(e) => updateField(index, "field_name", e.target.value)}
                                      placeholder="e.g., order_number"
                                    />
                                  </Form.Group>
                                </Col>
                                <Col md={6}>
                                  <Form.Group>
                                    <Form.Label>Display Name</Form.Label>
                                    <Form.Control
                                      type="text"
                                      value={field.display_name || ""}
                                      onChange={(e) => updateField(index, "display_name", e.target.value)}
                                      placeholder="e.g., Order Number"
                                    />
                                  </Form.Group>
                                </Col>
                              </Row>
                              
                              <Row className="mb-3">
                                <Col md={6}>
                                  <Form.Group>
                                    <Form.Label>Data Type</Form.Label>
                                    <Form.Select
                                      value={field.data_type || "string"}
                                      onChange={(e) => updateField(index, "data_type", e.target.value)}
                                    >
                                      <option value="string">String</option>
                                      <option value="date">Date</option>
                                      <option value="currency">Currency</option>
                                      <option value="integer">Integer</option>
                                      <option value="float">Float</option>
                                      <option value="boolean">Boolean</option>
                                      <option value="address">Address</option>
                                    </Form.Select>
                                  </Form.Group>
                                </Col>
                                <Col md={6}>
                                  <Form.Group className="mt-md-4">
                                    <Form.Check
                                      type="checkbox"
                                      label="Required Field"
                                      checked={field.validation?.required || false}
                                      onChange={(e) => {
                                        const updatedData = { ...templateData };
                                        if (!updatedData.template_data.fields[index].validation) {
                                          updatedData.template_data.fields[index].validation = {};
                                        }
                                        updatedData.template_data.fields[index].validation!.required = e.target.checked;
                                        setTemplateData(updatedData);
                                      }}
                                    />
                                  </Form.Group>
                                </Col>
                              </Row>
                              
                              <Form.Group className="mb-3">
                                <Form.Label>Extraction Regex Pattern</Form.Label>
                                <Form.Control
                                  type="text"
                                  value={field.extraction?.regex || ""}
                                  onChange={(e) => updateField(index, "extraction.regex", e.target.value)}
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
                                  onChange={(e) => updateField(index, "extraction.alternative_regex", e.target.value)}
                                  placeholder="Alternative pattern if the first one fails"
                                />
                              </Form.Group>
                            </Card.Body>
                          </Card>
                        ))
                      )}
                    </Card.Body>
                  </Card>
                </div>
              )}
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowTemplateForm(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSubmitTemplate}
            disabled={isSubmitting || (editorMode === "code" && jsonError !== "")}
          >
            {isSubmitting ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Saving...
              </>
            ) : (
              currentTemplate ? "Update Template" : "Create Template"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Import Modal */}
      <Modal 
        show={showImportModal} 
        onHide={() => setShowImportModal(false)}
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
              onChange={handleImportFileSelect}
            />
            <Form.Text className="text-muted">
              Import a JSON template file.
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowImportModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleImportTemplate}
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
      
      {/* Test Modal */}
      <Modal 
        show={showTestModal} 
        onHide={() => setShowTestModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Test Template: {currentTemplate ? currentTemplate.name : ""}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-4">
            <Form.Label>Select Invoice</Form.Label>
            <Form.Select
              value={selectedInvoice}
              onChange={(e) => setSelectedInvoice(e.target.value)}
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
                  {currentTemplate && currentTemplate.template_data && 
                  currentTemplate.template_data.fields.map((field) => {
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
                        <td>{extractedValue?.toString() || "-"}</td>
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
                      <td>{value?.toString() || "-"}</td>
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
                  onClick={() => handleOpenInvoicePreview(selectedInvoice)}
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
          <Button variant="secondary" onClick={() => setShowTestModal(false)}>
            Close
          </Button>
          <Button 
            variant="primary" 
            onClick={runTemplateTest}
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
      
      {/* Invoice Preview Modal */}
      <InvoicePreviewModal
        invoiceId={previewInvoiceId}
        show={showInvoicePreview}
        onHide={() => setShowInvoicePreview(false)}
      />
    </div>
  );
};

export default TemplateManager;