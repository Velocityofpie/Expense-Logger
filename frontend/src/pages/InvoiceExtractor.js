import React, { useState, useEffect } from "react";
import { Button, Table, Form, Card, Row, Col, Badge, InputGroup, Dropdown } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { fetchInvoices, uploadInvoice, addInvoiceEntry, deleteInvoice, fetchTags, fetchCategories } from "../api";

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
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // State for adding a new invoice (no PDF)
  const [newInvoice, setNewInvoice] = useState({
    order_number: "",
    purchase_date: "",
    file_name: "", // Merchant name in the context of the UI
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
        (invoice.notes && invoice.notes.toLowerCase().includes(search)) ||
        (invoice.payment_method && invoice.payment_method.toLowerCase().includes(search));
      
      return statusMatch && categoryMatch && searchMatch;
    });
    
    setFilteredInvoices(filtered);
  };
  
  // Handle file selection
  const handleFileSelect = (e) => {
    if (e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };
  
  // Updated handleUpload function in InvoiceExtractor.js

const handleUpload = async () => {
  if (!file) {
      alert("Please select a file to upload.");
      return;
  }
  
  try {
      setIsUploading(true);
      
      const formData = new FormData();
      formData.append("file", file);
      
      // Log for debugging
      console.log("Uploading file:", file.name);
      
      const result = await uploadInvoice(formData);
      
      console.log("Upload result:", result);
      
      // Reset file state
      setFile(null);
      
      // Reset file input element safely
      const fileInput = document.getElementById('fileInput');
      if (fileInput) {
          // Create a new file input element to replace the current one
          // This is the safest way to reset a file input
          const newFileInput = document.createElement('input');
          newFileInput.type = 'file';
          newFileInput.id = 'fileInput';
          newFileInput.className = fileInput.className;
          newFileInput.accept = fileInput.accept;
          newFileInput.addEventListener('change', handleFileSelect);
          
          // Replace the old input with the new one
          fileInput.parentNode.replaceChild(newFileInput, fileInput);
      }
      
      // Fetch all data to refresh the list
      await fetchAllData();
      
      setIsUploading(false);
      alert("File uploaded successfully!");
  } catch (error) {
      console.error("Error uploading file:", error);
      setIsUploading(false);
      alert(`Error uploading file: ${error.message || "Please try again."}`);
  }
};

// Make sure your file input has the correct ID
// <Form.Control 
//     id="fileInput"
//     type="file" 
//     accept=".pdf,.png,.jpg,.jpeg"
//     onChange={handleFileSelect}
// />

// And update the file input element to include an id for resetting
<Form.Control 
    id="fileInput"
    type="file" 
    accept=".pdf,.png,.jpg,.jpeg"
    onChange={handleFileSelect}
/>
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
    if (!newInvoice.file_name) {
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
        grand_total: parseFloat(newInvoice.grand_total),
        items: newItems
      };
      
      await addInvoiceEntry(invoiceData);
      
      // Reset form and refresh invoice list
      setNewInvoice({
        order_number: "",
        purchase_date: "",
        file_name: "",
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
  const viewInvoice = (invoice) => {
    navigate(`/invoice/${invoice.invoice_id}`);
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

  return (
    <div className="container-fluid p-4">
      <h1 className="mb-4">Invoice Management</h1>
      
      <Row className="mb-5">
        {/* File Upload Section */}
        <Col md={6}>
          <Card>
            <Card.Header>
              <h4>Upload Invoice PDF</h4>
            </Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label>Select PDF File</Form.Label>
                <Form.Control 
                  type="file" 
                  accept=".pdf"
                  onChange={handleFileSelect}
                />
              </Form.Group>
              <Button 
                variant="primary" 
                onClick={handleUpload} 
                disabled={!file || isUploading}
              >
                {isUploading ? "Uploading..." : "Upload Invoice"}
              </Button>
            </Card.Body>
          </Card>
        </Col>
        
        {/* Add Invoice Section (No PDF) */}
        <Col md={6}>
          <Card>
            <Card.Header>
              <h4>Add Invoice (No PDF)</h4>
            </Card.Header>
            <Card.Body>
              <Form>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Merchant</Form.Label>
                      <Form.Control
                        type="text"
                        name="file_name"
                        value={newInvoice.file_name}
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
                      <Form.Label>Tags</Form.Label>
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
                      <Form.Label>Categories</Form.Label>
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
                <h5 className="mt-4">Line Items</h5>
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
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Invoice List */}
      <Card>
        <Card.Header>
          <h4>Invoice List</h4>
        </Card.Header>
        <Card.Body>
          {/* Filter Controls */}
          <Row className="mb-3">
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
          
          {isLoading ? (
            <div className="text-center p-5">Loading invoices...</div>
          ) : (
            <Table responsive striped hover>
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Date</th>
                  <th>Merchant</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Payment Method</th>
                  <th>Tags</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.length > 0 ? (
                  filteredInvoices.map(invoice => (
                    <tr key={invoice.invoice_id}>
                      <td>{invoice.order_number || "-"}</td>
                      <td>{invoice.purchase_date || "-"}</td>
                      <td>{invoice.file_name || "-"}</td>
                      <td>{formatCurrency(invoice.grand_total)}</td>
                      <td>
                        <Badge 
                          bg={
                            invoice.status === "Paid" ? "success" :
                            invoice.status === "Open" ? "primary" :
                            invoice.status === "Needs Attention" ? "danger" :
                            "secondary"
                          }
                        >
                          {invoice.status}
                        </Badge>
                      </td>
                      <td>{invoice.payment_method || "-"}</td>
                      <td>
                        {invoice.tags && invoice.tags.length > 0 ? (
                          invoice.tags.map((tag, index) => (
                            <Badge 
                              key={index} 
                              bg="info" 
                              className="me-1"
                            >
                              {tag}
                            </Badge>
                          ))
                        ) : "-"}
                      </td>
                      <td>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="me-1"
                          onClick={() => viewInvoice(invoice)}
                        >
                          View
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDeleteInvoice(invoice)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center">
                      No invoices found
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}
