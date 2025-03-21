// frontend/src/pages/InvoiceExtractor.js
import React, { useState, useEffect } from "react";
import { Button, Table, Form, Card, Row, Col, Badge, InputGroup, Dropdown, Collapse, Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { fetchInvoices, uploadInvoice, addInvoiceEntry, deleteInvoice, fetchTags, fetchCategories } from "../api";
import InvoiceTable from "../components/InvoiceTable";

const API_URL = "http://localhost:8000";

// Valid statuses for the dropdown
const VALID_STATUSES = ["Open", "Paid", "Draft", "Needs Attention", "Resolved"];

export default function InvoiceExtractor() {
  const navigate = useNavigate();
  
  // State for invoice list and filters
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // State for file upload
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [useTemplates, setUseTemplates] = useState(true);
  const [showManualEntry, setShowManualEntry] = useState(false);
  
  // State for adding a new invoice (no PDF)
  const [newInvoice, setNewInvoice] = useState({
    order_number: "",
    purchase_date: "",
    file_name: "", 
    merchant_name: "", // Separate merchant name field
    payment_method: "",
    grand_total: "",
    status: "Open",
    notes: "",
    tags: [],
    categories: [],
    items: []
  });
  
  // State for line items in new invoice
  const [newItems, setNewItems] = useState([]);
  
  // State for filters
  const [filters, setFilters] = useState({
    status: "All",
    category: "All",
    searchTerm: ""
  });
  
  // State for available tags and categories
  const [availableTags, setAvailableTags] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);
  
  // State for new category/tag modal
  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false);
  const [showNewTagModal, setShowNewTagModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newTagName, setNewTagName] = useState("");
  const [categoryError, setCategoryError] = useState("");
  const [tagError, setTagError] = useState("");
  
  // Fetch data on component mount
  useEffect(() => {
    fetchAllData();
  }, []);
  
  // Apply filters when invoices or filters change
  useEffect(() => {
    applyFilters();
  }, [invoices, filters]);
  
  // Fetch all necessary data
  const fetchAllData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch invoices, tags, and categories
      const [invoicesData, tagsData, categoriesData] = await Promise.all([
        fetchInvoices(),
        fetchTags(),
        fetchCategories()
      ]);
      
      setInvoices(invoicesData);
      setFilteredInvoices(invoicesData);
      setAvailableTags(tagsData);
      setAvailableCategories(categoriesData);
      
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setIsLoading(false);
    }
  };
  
  // Apply filters to the invoice list
  const applyFilters = () => {
    const { status, category, searchTerm } = filters;
    
    const filtered = invoices.filter(invoice => {
      // Status filter
      const statusMatch = status === "All" || invoice.status === status;
      
      // Category filter
      const categoryMatch = category === "All" || 
        (invoice.categories && invoice.categories.includes(category));
      
      // Search term filter (searches in multiple fields)
      const search = searchTerm.toLowerCase();
      const searchMatch = !searchTerm || 
        (invoice.order_number && invoice.order_number.toLowerCase().includes(search)) ||
        (invoice.file_name && invoice.file_name.toLowerCase().includes(search)) ||
        (invoice.merchant_name && invoice.merchant_name.toLowerCase().includes(search)) ||
        (invoice.notes && invoice.notes.toLowerCase().includes(search)) ||
        (invoice.payment_method && invoice.payment_method.toLowerCase().includes(search));
      
      return statusMatch && categoryMatch && searchMatch;
    });
    
    setFilteredInvoices(filtered);
  };
  
  // Handle file selection with multiple file support
  const handleFileSelect = (e) => {
    if (e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setFiles(prevFiles => [...prevFiles, ...newFiles]);
    }
  };
  
  // Remove a file from the selected files
  const removeFile = (index) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };
  
  // Handle file upload
  const handleUpload = async () => {
    if (files.length === 0) {
      alert("Please select files to upload.");
      return;
    }
    
    try {
      setIsUploading(true);
      
      // Track upload results
      const results = [];
      
      // Upload each file sequentially 
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("use_templates", useTemplates);
        
        console.log("Uploading file:", file.name);
        console.log("Use templates:", useTemplates);
        
        try {
          const result = await uploadInvoice(formData);
          results.push({ fileName: file.name, success: true, result });
        } catch (error) {
          console.error(`Error uploading ${file.name}:`, error);
          results.push({ fileName: file.name, success: false, error: error.message });
        }
      }
      
      // Reset files state
      setFiles([]);
      
      // Fetch all data to refresh the list
      await fetchAllData();
      
      setIsUploading(false);
      
      // Show summary of upload results
      const successCount = results.filter(r => r.success).length;
      const failureCount = results.length - successCount;
      
      if (failureCount === 0) {
        alert(`Successfully uploaded ${successCount} file(s)!`);
      } else {
        alert(`Uploaded ${successCount} file(s), failed to upload ${failureCount} file(s). Check console for details.`);
      }
      
    } catch (error) {
      console.error("Error during upload process:", error);
      setIsUploading(false);
      alert(`Error during upload process: ${error.message || "Please try again."}`);
    }
  };
  
  // Toggle manual entry form
  const toggleManualEntry = () => {
    setShowManualEntry(!showManualEntry);
  };
  
  // Handle changes to new invoice fields
  const handleInvoiceChange = (e) => {
    const { name, value } = e.target;
    setNewInvoice({
      ...newInvoice,
      [name]: value
    });
  };
  
  // Handle multiple select for tags
  const handleTagsChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setNewInvoice({
      ...newInvoice,
      tags: selectedOptions
    });
  };
  
  // Handle multiple select for categories
  const handleCategoriesChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setNewInvoice({
      ...newInvoice,
      categories: selectedOptions
    });
  };
  
  // Add new category
  const handleAddCategory = () => {
    // Reset any previous errors
    setCategoryError("");
    
    // Validate the new category name
    if (!newCategoryName.trim()) {
      setCategoryError("Category name cannot be empty");
      return;
    }
    
    // Check for duplicates
    if (availableCategories.includes(newCategoryName.trim())) {
      setCategoryError("This category already exists");
      return;
    }
    
    // In a real app, this would make an API call
    // Here we'll just update the state directly
    const updatedCategories = [...availableCategories, newCategoryName.trim()];
    setAvailableCategories(updatedCategories);
    
    // Auto-select the new category
    setNewInvoice({
      ...newInvoice,
      categories: [...newInvoice.categories, newCategoryName.trim()]
    });
    
    // Reset and close modal
    setNewCategoryName("");
    setShowNewCategoryModal(false);
  };
  
  // Add new tag
  const handleAddTag = () => {
    // Reset any previous errors
    setTagError("");
    
    // Validate the new tag name
    if (!newTagName.trim()) {
      setTagError("Tag name cannot be empty");
      return;
    }
    
    // Check for duplicates
    if (availableTags.includes(newTagName.trim())) {
      setTagError("This tag already exists");
      return;
    }
    
    // In a real app, this would make an API call
    // Here we'll just update the state directly
    const updatedTags = [...availableTags, newTagName.trim()];
    setAvailableTags(updatedTags);
    
    // Auto-select the new tag
    setNewInvoice({
      ...newInvoice,
      tags: [...newInvoice.tags, newTagName.trim()]
    });
    
    // Reset and close modal
    setNewTagName("");
    setShowNewTagModal(false);
  };
  
  // Add a new line item to the new invoice
  const addLineItem = () => {
    setNewItems([
      ...newItems, 
      {
        product_name: "",
        quantity: 1,
        unit_price: 0,
        product_link: "",
        condition: "New"
      }
    ]);
  };
  
  // Handle changes to line item fields
  const handleLineItemChange = (index, field, value) => {
    const updatedItems = [...newItems];
    updatedItems[index][field] = value;
    setNewItems(updatedItems);
  };
  
  // Remove a line item
  const removeLineItem = (index) => {
    setNewItems(newItems.filter((_, i) => i !== index));
  };
  
  // Submit a new invoice entry (no file)
  const handleSubmitInvoice = async () => {
    // Validation
    if (!newInvoice.merchant_name) {
      alert("Please enter a merchant name.");
      return;
    }
    
    if (!newInvoice.grand_total) {
      alert("Please enter an amount.");
      return;
    }
    
    try {
      // Prepare data
      const invoiceData = {
        ...newInvoice,
        // Use merchant_name for file_name if no specific file_name is provided
        file_name: newInvoice.merchant_name,
        grand_total: parseFloat(newInvoice.grand_total),
        items: newItems
      };
      
      await addInvoiceEntry(invoiceData);
      
      // Reset form and refresh invoice list
      setNewInvoice({
        order_number: "",
        purchase_date: "",
        file_name: "",
        merchant_name: "",
        payment_method: "",
        grand_total: "",
        status: "Open",
        notes: "",
        tags: [],
        categories: [],
        items: []
      });
      setNewItems([]);
      fetchAllData();
      
      alert("Invoice added successfully!");
    } catch (error) {
      console.error("Error adding invoice:", error);
      alert("Error adding invoice. Please try again.");
    }
  };
  
  // Handle filter changes
  const handleFilterChange = (field, value) => {
    setFilters({
      ...filters,
      [field]: value
    });
  };
  
  // View invoice details
  const viewInvoiceDetails = (invoice) => {
    navigate(`/invoice/${invoice.invoice_id}`);
  };
  
  // View invoice document/PDF
  const viewInvoiceDocument = (invoice) => {
    if (invoice.file_name) {
      window.open(`${API_URL}/uploads/${encodeURIComponent(invoice.file_name)}`, '_blank');
    } else {
      alert("No document available for this invoice.");
    }
  };
  
  // Delete an invoice
  const handleDeleteInvoice = async (invoice) => {
    if (!window.confirm(`Are you sure you want to delete invoice ${invoice.order_number || invoice.invoice_id}?`)) {
      return;
    }
    
    try {
      await deleteInvoice(invoice.invoice_id);
      fetchAllData();
      alert("Invoice deleted successfully!");
    } catch (error) {
      console.error("Error deleting invoice:", error);
      alert("Error deleting invoice. Please try again.");
    }
  };
  
  // Format currency for display
  const formatCurrency = (value) => {
    if (!value) return "$0.00";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };


const handleBatchDelete = async (invoiceIds) => {
  if (!window.confirm(`Are you sure you want to delete ${invoiceIds.length} selected invoices? This action cannot be undone.`)) {
    return;
  }
  
  try {
    // Create a counter for successful deletions
    let successCount = 0;
    
    // Delete each invoice sequentially
    for (const id of invoiceIds) {
      try {
        await deleteInvoice(id);
        successCount++;
      } catch (error) {
        console.error(`Error deleting invoice ${id}:`, error);
      }
    }
    
    // Refresh the invoice list
    fetchAllData();
    
    // Show success message
    alert(`Successfully deleted ${successCount} of ${invoiceIds.length} invoices.`);
  } catch (error) {
    console.error("Error during batch delete:", error);
    alert("An error occurred during the batch delete operation.");
  }
};

  return (
    <div className="container-fluid p-2">
      <h1 className="mb-4">Invoice Management</h1>
      
      <Card className="mb-3">
        <Card.Header>
          <div className="d-flex justify-content-between align-items-center">
            <h4>Upload Invoice Files</h4>
            <Button 
              variant={showManualEntry ? "secondary" : "primary"}
              onClick={toggleManualEntry}
            >
              {showManualEntry ? "Hide Manual Entry" : "Add Invoice Manually"}
            </Button>
          </div>
        </Card.Header>
        <Card.Body className="p-2">
          <Row>
            <Col md={showManualEntry ? 6 : 12}>
              <Form.Group className="mb-3">
                <Form.Label>Select PDF or Image Files</Form.Label>
                <Form.Control 
                  id="fileInput"
                  type="file" 
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={handleFileSelect}
                  multiple
                />
                <Form.Text className="text-muted">
                  You can select multiple files to upload at once
                </Form.Text>
              </Form.Group>
            
              {/* File list with remove buttons */}
              {files.length > 0 && (
                <div className="mb-3">
                  <h6>Selected Files:</h6>
                  <ul className="list-group">
                    {files.map((file, index) => (
                      <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                        <span className="text-truncate" style={{ maxWidth: '80%' }}>{file.name}</span>
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          onClick={() => removeFile(index)}
                        >
                          Remove
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            
              {/* Template toggle option */}
              <Form.Group className="mb-3">
                <Form.Check 
                  type="checkbox"
                  id="use-templates"
                  label="Use OCR Templates for extraction"
                  checked={useTemplates}
                  onChange={(e) => setUseTemplates(e.target.checked)}
                />
                <Form.Text className="text-muted">
                  Automatically match invoices to available templates for better data extraction
                </Form.Text>
              </Form.Group>
            
              <Button 
                variant="primary" 
                onClick={handleUpload} 
                disabled={files.length === 0 || isUploading}
                className="w-100"
              >
                {isUploading ? "Uploading..." : `Upload ${files.length} File${files.length !== 1 ? 's' : ''}`}
              </Button>
            </Col>
            
            {/* Manual Invoice Entry (Collapsible) */}
            {showManualEntry && (
              <Col md={6}>
                <Collapse in={showManualEntry}>
                  <div>
                    <h5 className="mb-3">Add Invoice (No PDF)</h5>
                    <Form>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Merchant Name</Form.Label>
                            <Form.Control
                              type="text"
                              name="merchant_name"
                              value={newInvoice.merchant_name}
                              onChange={handleInvoiceChange}
                              placeholder="Enter merchant name"
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Order Number</Form.Label>
                            <Form.Control
                              type="text"
                              name="order_number"
                              value={newInvoice.order_number}
                              onChange={handleInvoiceChange}
                              placeholder="Enter order number"
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                      
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Purchase Date</Form.Label>
                            <Form.Control
                              type="date"
                              name="purchase_date"
                              value={newInvoice.purchase_date}
                              onChange={handleInvoiceChange}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Amount</Form.Label>
                            <InputGroup>
                              <InputGroup.Text>$</InputGroup.Text>
                              <Form.Control
                                type="number"
                                step="0.01"
                                name="grand_total"
                                value={newInvoice.grand_total}
                                onChange={handleInvoiceChange}
                                placeholder="0.00"
                              />
                            </InputGroup>
                          </Form.Group>
                        </Col>
                      </Row>
                      
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Payment Method</Form.Label>
                            <Form.Control
                              type="text"
                              name="payment_method"
                              value={newInvoice.payment_method}
                              onChange={handleInvoiceChange}
                              placeholder="Enter payment method"
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Status</Form.Label>
                            <Form.Select
                              name="status"
                              value={newInvoice.status}
                              onChange={handleInvoiceChange}
                            >
                              {VALID_STATUSES.map(status => (
                                <option key={status} value={status}>{status}</option>
                              ))}
                            </Form.Select>
                          </Form.Group>
                        </Col>
                      </Row>
                      
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label className="d-flex justify-content-between">
                              <span>Tags</span>
                              <Button 
                                variant="link" 
                                size="sm" 
                                className="p-0 text-decoration-none" 
                                onClick={() => setShowNewTagModal(true)}
                              >
                                + Add New
                              </Button>
                            </Form.Label>
                            <Form.Select
                              multiple
                              name="tags"
                              value={newInvoice.tags}
                              onChange={handleTagsChange}
                              style={{ height: "100px" }}
                            >
                              {availableTags.map(tag => (
                                <option key={tag} value={tag}>{tag}</option>
                              ))}
                            </Form.Select>
                            <Form.Text className="text-muted">
                              Hold Ctrl/Cmd to select multiple
                            </Form.Text>
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label className="d-flex justify-content-between">
                              <span>Categories</span>
                              <Button 
                                variant="link" 
                                size="sm" 
                                className="p-0 text-decoration-none" 
                                onClick={() => setShowNewCategoryModal(true)}
                              >
                                + Add New
                              </Button>
                            </Form.Label>
                            <Form.Select
                              multiple
                              name="categories"
                              value={newInvoice.categories}
                              onChange={handleCategoriesChange}
                              style={{ height: "100px" }}
                            >
                              {availableCategories.map(category => (
                                <option key={category} value={category}>{category}</option>
                              ))}
                            </Form.Select>
                            <Form.Text className="text-muted">
                              Hold Ctrl/Cmd to select multiple
                            </Form.Text>
                          </Form.Group>
                        </Col>
                      </Row>
                      
                      <Form.Group className="mb-3">
                        <Form.Label>Notes</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          name="notes"
                          value={newInvoice.notes}
                          onChange={handleInvoiceChange}
                          placeholder="Enter notes"
                        />
                      </Form.Group>
                      
                      {/* Line Items */}
                      <h6 className="mt-4">Line Items</h6>
                      {newItems.length > 0 && (
                        <Table striped bordered hover size="sm" className="mb-3">
                          <thead>
                            <tr>
                              <th>Product</th>
                              <th>Quantity</th>
                              <th>Price</th>
                              <th>Total</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {newItems.map((item, index) => (
                              <tr key={index}>
                                <td>
                                  <Form.Control
                                    type="text"
                                    value={item.product_name}
                                    onChange={(e) => handleLineItemChange(index, "product_name", e.target.value)}
                                    size="sm"
                                    placeholder="Product name"
                                  />
                                </td>
                                <td>
                                  <Form.Control
                                    type="number"
                                    min="1"
                                    value={item.quantity}
                                    onChange={(e) => handleLineItemChange(index, "quantity", parseInt(e.target.value))}
                                    size="sm"
                                  />
                                </td>
                                <td>
                                  <Form.Control
                                    type="number"
                                    step="0.01"
                                    value={item.unit_price}
                                    onChange={(e) => handleLineItemChange(index, "unit_price", parseFloat(e.target.value))}
                                    size="sm"
                                  />
                                </td>
                                <td>
                                  {formatCurrency((item.quantity || 0) * (item.unit_price || 0))}
                                </td>
                                <td>
                                  <Button 
                                    variant="danger" 
                                    size="sm"
                                    onClick={() => removeLineItem(index)}
                                  >
                                    Remove
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      )}
                      
                      <Button 
                        variant="outline-primary" 
                        size="sm"
                        onClick={addLineItem}
                        className="mb-3"
                      >
                        Add Line Item
                      </Button>
                      
                      <div className="d-grid">
                        <Button 
                          variant="success" 
                          onClick={handleSubmitInvoice}
                        >
                          Add Invoice
                        </Button>
                      </div>
                    </Form>
                  </div>
                </Collapse>
              </Col>
            )}
          </Row>
        </Card.Body>
      </Card>
      
      {/* Invoice List */}
      <Card className="mb-3">
        <Card.Header>
          <h4>Invoice List</h4>
        </Card.Header>
        <Card.Body className="p-2">
          {/* Filter Controls */}
          <Row className="mb-3 g-2">
            <Col md={4}>
              <Form.Group>
                <Form.Label>Search</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Search by order #, merchant, etc."
                  value={filters.searchTerm}
                  onChange={(e) => handleFilterChange("searchTerm", e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Status</Form.Label>
                <Form.Select
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                >
                  <option value="All">All Statuses</option>
                  {VALID_STATUSES.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Category</Form.Label>
                <Form.Select
                  value={filters.category}
                  onChange={(e) => handleFilterChange("category", e.target.value)}
                >
                  <option value="All">All Categories</option>
                  {availableCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
      {/* Use the new InvoiceTable component */}
          <InvoiceTable 
            invoices={filteredInvoices}
            isLoading={isLoading}
            onView={viewInvoiceDocument}
            onEdit={viewInvoiceDetails}
            onDelete={handleDeleteInvoice}
            onBatchDelete={handleBatchDelete}
          />
        </Card.Body>
      </Card>
      
      {/* New Category Modal */}
      <Modal 
        show={showNewCategoryModal} 
        onHide={() => {
          setShowNewCategoryModal(false);
          setCategoryError("");
          setNewCategoryName("");
        }}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Add New Category</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Category Name</Form.Label>
            <Form.Control
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Enter category name"
              isInvalid={!!categoryError}
            />
            <Form.Control.Feedback type="invalid">
              {categoryError}
            </Form.Control.Feedback>
            <Form.Text className="text-muted">
              Categories help you organize and filter your invoices.
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => {
            setShowNewCategoryModal(false);
            setCategoryError("");
            setNewCategoryName("");
          }}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddCategory}>
            Add Category
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* New Tag Modal */}
      <Modal 
        show={showNewTagModal} 
        onHide={() => {
          setShowNewTagModal(false);
          setTagError("");
          setNewTagName("");
        }}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Add New Tag</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Tag Name</Form.Label>
            <Form.Control
              type="text"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="Enter tag name"
              isInvalid={!!tagError}
            />
            <Form.Control.Feedback type="invalid">
              {tagError}
            </Form.Control.Feedback>
            <Form.Text className="text-muted">
              Tags help you label and search for specific invoices.
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => {
            setShowNewTagModal(false);
            setTagError("");
            setNewTagName("");
          }}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddTag}>
            Add Tag
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}