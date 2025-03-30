// src/features/tools/templates/TemplateManager.tsx
import React, { useState, useEffect } from "react";
import { Button, Card, Alert, Modal } from "react-bootstrap";

// Components
import TemplateList from "./components/TemplateList";
import TemplateForm from "./components/TemplateForm";
import InvoicePreviewModal from "./components/InvoicePreviewModal";
import ImportTemplateModal from "./modals/ImportTemplateModal";
import TestTemplateModal from "./modals/TestTemplateModal";

// API and utils
import { 
  fetchTemplates, 
  createTemplate, 
  updateTemplate, 
  deleteTemplate, 
  importTemplate,
  testTemplate,
  fetchInvoices,
  getTemplateExportUrl
} from "./utils/template-api";

import {
  createEmptyTemplateData,
  templateToFormData,
  setNestedFieldValue,
  validateTemplateData
} from "./utils/template-formatters";

// Types
import { Template, TemplateMarker, TemplateTestResult, TemplateFormData } from "../shared/types";

// Styles
import "./template-styles.css";

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
  const [templateData, setTemplateData] = useState<TemplateFormData>(createEmptyTemplateData());
  
  // State for template editor
  const [editorMode, setEditorMode] = useState<"visual" | "code">("visual");
  const [templateJson, setTemplateJson] = useState("");
  const [jsonError, setJsonError] = useState("");
  
  // State for import/export
  const [showImportModal, setShowImportModal] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  
  // State for template testing
  const [showTestModal, setShowTestModal] = useState(false);
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
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTemplateData({
      ...templateData,
      [name]: value
    });
  };
  
  // Add marker
  const handleAddMarker = () => {
    const updatedData = { ...templateData };
    updatedData.template_data.identification.markers.push({ text: "", required: false });
    setTemplateData(updatedData);
  };
  
  // Remove marker
  const handleRemoveMarker = (index: number) => {
    const updatedData = { ...templateData };
    updatedData.template_data.identification.markers.splice(index, 1);
    setTemplateData(updatedData);
  };
  
  // Update marker
  const handleUpdateMarker = (index: number, field: keyof TemplateMarker, value: string | boolean) => {
    const updatedData = { ...templateData };
    updatedData.template_data.identification.markers[index][field] = value;
    setTemplateData(updatedData);
  };
  
  // Add field
  const handleAddField = () => {
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
  const handleRemoveField = (index: number) => {
    const updatedData = { ...templateData };
    updatedData.template_data.fields.splice(index, 1);
    setTemplateData(updatedData);
  };
  
  // Update field
  const handleUpdateField = (index: number, field: string, value: any) => {
    const updatedData = { ...templateData };
    
    if (field.includes(".")) {
      // Handle nested fields like "extraction.regex"
      const updatedField = setNestedFieldValue(updatedData.template_data.fields[index], field, value);
      updatedData.template_data.fields[index] = updatedField;
    } else {
      // Handle top-level fields
      updatedData.template_data.fields[index] = {
        ...updatedData.template_data.fields[index],
        [field]: value
      };
    }
    
    setTemplateData(updatedData);
  };
  
  // Handle JSON editor changes
  const handleJsonChange = (json: string) => {
    setTemplateJson(json);
    setJsonError("");
    
    try {
      // Validate JSON as user types
      if (json.trim()) {
        JSON.parse(json);
      }
    } catch (error) {
      if (error instanceof Error) {
        setJsonError(`Invalid JSON: ${error.message}`);
      } else {
        setJsonError(`Invalid JSON format`);
      }
    }
  };
  
  // Switch between visual and code editor
  const handleSwitchEditorMode = (mode: "visual" | "code") => {
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
  const handleSubmitTemplate = async () => {
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
      
      // Validate template data
      const validationErrors = validateTemplateData(dataToSubmit);
      if (validationErrors.length) {
        setError(validationErrors.join('. '));
        setIsSubmitting(false);
        return;
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
      setTemplateData(createEmptyTemplateData());
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
    setTemplateData(templateToFormData(template));
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
  
  // Import a template
  const handleImportTemplate = async (file: File) => {
    try {
      setIsImporting(true);
      await importTemplate(file);
      setSuccessMessage("Template imported successfully!");
      setShowImportModal(false);
      loadTemplates();
    } catch (error) {
      console.error("Error importing template:", error);
      setError("Failed to import template. Please ensure the file is a valid JSON template.");
    } finally {
      setIsImporting(false);
    }
  };
  
  // Export a template
  const handleExportTemplate = (templateId: number) => {
    window.open(getTemplateExportUrl(templateId), "_blank");
  };
  
  // Test a template
  const handleTestTemplate = (templateId: number) => {
    setTestResults(null);
    setShowTestModal(true);
    setCurrentTemplate(templates.find(t => t.template_id === templateId) || null);
  };
  
  // Run a template test
  const handleRunTemplateTest = async (invoiceId: string) => {
    if (!currentTemplate) return;
    
    try {
      setIsTesting(true);
      
      const results = await testTemplate(currentTemplate.template_id, invoiceId);
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
              setTemplateData(createEmptyTemplateData());
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
          <TemplateList
            templates={templates}
            isLoading={isLoading}
            onEdit={handleEditTemplate}
            onTest={handleTestTemplate}
            onExport={handleExportTemplate}
            onDelete={handleDeleteTemplate}
          />
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
          <TemplateForm
            currentTemplate={currentTemplate}
            templateData={templateData}
            editorMode={editorMode}
            templateJson={templateJson}
            jsonError={jsonError}
            onInputChange={handleInputChange}
            onSwitchEditorMode={handleSwitchEditorMode}
            onJsonChange={handleJsonChange}
            onAddMarker={handleAddMarker}
            onRemoveMarker={handleRemoveMarker}
            onUpdateMarker={handleUpdateMarker}
            onAddField={handleAddField}
            onRemoveField={handleRemoveField}
            onUpdateField={handleUpdateField}
          />
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
            {isSubmitting ? "Saving..." : (currentTemplate ? "Update Template" : "Create Template")}
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Import Modal */}
      <ImportTemplateModal
        show={showImportModal}
        onHide={() => setShowImportModal(false)}
        onImport={handleImportTemplate}
        isImporting={isImporting}
      />
      
      {/* Test Modal */}
      <TestTemplateModal
        show={showTestModal}
        onHide={() => setShowTestModal(false)}
        template={currentTemplate}
        invoices={invoices}
        onRunTest={handleRunTemplateTest}
        isTesting={isTesting}
        testResults={testResults}
        onPreviewInvoice={handleOpenInvoicePreview}
      />
      
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