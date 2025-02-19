import React, { useState, useEffect } from "react";
import { Button, Table, Form, Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Dropzone from "react-dropzone";

const API_URL = "http://127.0.0.1:8000";

export default function InvoiceExtractor() {
  const [invoices, setInvoices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchInvoices();
    fetchCategories();
  }, []);

  // ---------------------------
  //   FETCHING
  // ---------------------------
  const fetchInvoices = async () => {
    try {
      const response = await fetch(`${API_URL}/invoices/`);
      if (!response.ok) throw new Error("Failed to fetch invoices");
      const data = await response.json();
      setInvoices(data.invoices);
    } catch (error) {
      console.error("Error fetching invoices:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/categories/`);
      if (!response.ok) {
        // Possibly no real endpoint
        console.warn("No /categories/ endpoint found. Using fallback list.");
        return;
      }
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // ---------------------------
  //   FILE UPLOAD
  // ---------------------------
  const handleFileUpload = async (files) => {
    for (let file of files) {
      const formData = new FormData();
      formData.append("file", file);
      try {
        await fetch(`${API_URL}/upload/`, {
          method: "POST",
          body: formData,
        });
        fetchInvoices(); // Refresh after upload
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    }
  };

  // ---------------------------
  //   CATEGORY + MODAL
  // ---------------------------
  const handleCategoryChange = (invoiceId, value) => {
    if (value === "ADD_NEW") {
      // Show the "Add new category" modal
      setShowModal(true);
      // We'll store the invoice ID in local state or pass it along
      setCurrentInvoiceId(invoiceId);
    } else {
      // Just an existing category
      updateCategory(invoiceId, value);
    }
  };

  // We also need a place to store which invoice we’re updating if we do "Add new category..."
  const [currentInvoiceId, setCurrentInvoiceId] = useState(null);

  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      alert("Category name cannot be empty.");
      return;
    }
    try {
      // POST to backend
      const res = await fetch(`${API_URL}/categories/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cat: newCategory }),
      });
      const data = await res.json();

      // Update local categories
      setCategories(data.categories);

      // If we want to auto-set the newly added category on the invoice:
      if (currentInvoiceId !== null) {
        updateCategory(currentInvoiceId, newCategory);
      }

      // Clear and close
      setNewCategory("");
      setShowModal(false);
      setCurrentInvoiceId(null);
    } catch (error) {
      console.error("Error adding new category:", error);
      alert("Failed to add category.");
    }
  };

  // ---------------------------
  //   UPDATE & DELETE
  // ---------------------------
  const updateCategory = async (invoiceId, category) => {
    try {
      const invoiceToUpdate = invoices.find((inv) => inv.id === invoiceId);
      if (!invoiceToUpdate) return;

      const updatedInvoice = { ...invoiceToUpdate, category };
      await fetch(`${API_URL}/update/${invoiceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedInvoice),
      });
      fetchInvoices();
    } catch (error) {
      console.error("Error updating category:", error);
    }
  };

  const deleteInvoice = async (invoiceId, filename) => {
    try {
      await fetch(
        `${API_URL}/delete/${invoiceId}?filename=${encodeURIComponent(filename)}`,
        { method: "DELETE" }
      );
      fetchInvoices();
    } catch (error) {
      console.error("Error deleting invoice:", error);
    }
  };

  const viewInvoice = (invoice) => {
    navigate(`/invoice/${invoice.id}`, { state: { invoice } });
  };

  // ---------------------------
  //   RENDER
  // ---------------------------
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Invoice Extractor</h1>

      {/* 1) File Upload via Dropzone */}
      <Dropzone onDrop={handleFileUpload}>
        {({ getRootProps, getInputProps }) => (
          <div {...getRootProps()} className="p-4 border-dashed border-2 cursor-pointer">
            <input {...getInputProps()} />
            <p>Drag & drop an invoice file here, or click to select a file</p>
          </div>
        )}
      </Dropzone>

      {/* 2) Invoice Table */}
      <Table striped bordered hover className="mt-4">
        <thead>
          <tr>
            <th>ID</th>
            <th>Filename</th>
            <th>Amount</th>
            <th>Date</th>
            <th>Order #</th>
            <th>Merchant</th>
            <th>Category</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {invoices.length > 0 ? (
            invoices.map((invoice) => (
              <tr key={invoice.id}>
                <td>{invoice.id}</td>
                <td
                  className="cursor-pointer"
                  onClick={() => viewInvoice(invoice)}
                >
                  {invoice.filename}
                </td>
                <td>${invoice.amount}</td>
                <td>{invoice.date}</td>
                <td>{invoice.order_number}</td>
                <td>{invoice.merchant}</td>
                <td>
                  <Form.Select
                    value={invoice.category || ""}
                    onChange={(e) =>
                      handleCategoryChange(invoice.id, e.target.value)
                    }
                  >
                    {categories.map((cat, idx) => (
                      <option key={idx} value={cat}>
                        {cat}
                      </option>
                    ))}
                    <option value="ADD_NEW">Add new category...</option>
                  </Form.Select>
                </td>
                <td>
                  <Button
                    variant="danger"
                    onClick={() => deleteInvoice(invoice.id, invoice.filename)}
                  >
                    Delete
                  </Button>
                  <a
                    href={`${API_URL}/uploads/${encodeURIComponent(
                      invoice.filename
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2"
                  >
                    View
                  </a>
                  <a
                    href={`${API_URL}/download/${encodeURIComponent(
                      invoice.filename
                    )}`}
                    download
                    className="ml-2"
                  >
                    Download
                  </a>
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

      {/* 3) Modal for "Add New Category" */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Category</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Category Name</Form.Label>
            <Form.Control
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="e.g. 'Supplies' or 'Entertainment'"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddCategory}>
            Add
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
