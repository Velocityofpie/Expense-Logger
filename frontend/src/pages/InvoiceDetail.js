import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Form, Table } from "react-bootstrap";

const API_URL = "http://127.0.0.1:8000";

// Possible statuses for the dropdown
const VALID_STATUSES = ["Open", "Draft", "Needs Attention", "Resolved"];

export default function InvoiceDetail() {
  const location = useLocation();
  const navigate = useNavigate();

  // Pull the initial invoice from route state (or empty object if none)
  const [invoice, setInvoice] = useState(location.state?.invoice || {});

  // If we want Prev/Next, get the entire list + index from state
  const [invoiceList, setInvoiceList] = useState(location.state?.invoiceList || []);
  const [currentIndex, setCurrentIndex] = useState(location.state?.currentIndex || 0);

  const [lineItems, setLineItems] = useState([]);
  const [pdfUrl, setPdfUrl] = useState("");

  useEffect(() => {
    // If we have an invoice.id, fetch fresh details from the server
    if (invoice.id) {
      fetchInvoiceDetails(invoice.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoice.id]);

  async function fetchInvoiceDetails(id) {
    try {
      // If your backend route is /invoice/{invoice_id}, you must have that route in main.py
      const response = await fetch(`${API_URL}/invoice/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch invoice details");
      }
      const data = await response.json();
      setInvoice(data);
      setLineItems(Array.isArray(data.line_items) ? data.line_items : []);
      // Build PDF URL
      if (data.filename) {
        setPdfUrl(`${API_URL}/uploads/${encodeURIComponent(data.filename)}`);
      } else {
        setPdfUrl("");
      }
    } catch (error) {
      console.error("Error fetching invoice details:", error);
    }
  }

  // Handle main invoice field changes
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setInvoice({ ...invoice, [name]: value });
  };

  // Handle line item changes
  const handleLineItemChange = (index, field, value) => {
    const updated = [...lineItems];
    updated[index][field] = value;
    setLineItems(updated);
  };

  // Add a new line item
  const addRow = () => {
    setLineItems([...lineItems, { product: "", price: "", quantity: "", total: "", link: "" }]);
  };

  // Remove a line item
  const removeRow = (index) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  // Save changes to the invoice (including rename logic)
  const saveEdit = async () => {
    try {
      const updatedInvoice = {
        ...invoice,
        line_items: lineItems,
      };

      const response = await fetch(`${API_URL}/update/${invoice.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedInvoice),
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Error updating invoice");
      }
      // Refresh from server
      fetchInvoiceDetails(invoice.id);
    } catch (error) {
      console.error("Error saving invoice:", error);
    }
  };

  // Delete the current invoice
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this invoice?")) return;
    try {
      const filename = invoice.filename || "";
      const url = `${API_URL}/delete/${invoice.id}?filename=${encodeURIComponent(filename)}`;
      const response = await fetch(url, { method: "DELETE" });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Failed to delete invoice");
      }
      // After deleting, navigate back to the invoice list
      navigate("/invoices");
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  // Go to the previous invoice in the list
  const handlePrev = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      setInvoice(invoiceList[newIndex]);
    }
  };

  // Go to the next invoice in the list
  const handleNext = () => {
    if (currentIndex < invoiceList.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      setInvoice(invoiceList[newIndex]);
    }
  };

  return (
    <div className="p-6">
      <h2>Invoice Details</h2>
      <div className="border p-4 rounded shadow-md">
        {/* Top buttons */}
        <div className="flex space-x-4 mb-4">
          <Button variant="secondary" onClick={() => navigate("/invoices")}>
            Back
          </Button>
          <Button variant="success" onClick={saveEdit}>
            Save Changes
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </div>

        {/* Prev/Next buttons */}
        <div className="flex space-x-4 mb-4">
          <Button variant="outline-primary" onClick={handlePrev} disabled={currentIndex <= 0}>
            Previous
          </Button>
          <Button
            variant="outline-primary"
            onClick={handleNext}
            disabled={currentIndex >= invoiceList.length - 1}
          >
            Next
          </Button>
        </div>

        <p>
          <strong>Filename:</strong> {invoice.filename}
        </p>
        <p>
          <strong>ID:</strong> {invoice.id}
        </p>

        {/* Main invoice fields */}
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Date:</Form.Label>
            <Form.Control
              type="date"
              name="date"
              value={invoice.date || ""}
              onChange={handleEditChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Order #:</Form.Label>
            <Form.Control
              type="text"
              name="order_number"
              value={invoice.order_number || ""}
              onChange={handleEditChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Merchant:</Form.Label>
            <Form.Control
              type="text"
              name="merchant"
              value={invoice.merchant || ""}
              onChange={handleEditChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Total Amount:</Form.Label>
            <Form.Control
              type="text"
              name="amount"
              value={invoice.amount || ""}
              onChange={handleEditChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Category:</Form.Label>
            <Form.Control
              type="text"
              name="category"
              value={invoice.category || ""}
              onChange={handleEditChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Payment:</Form.Label>
            <Form.Control
              type="text"
              name="payment"
              value={invoice.payment || ""}
              onChange={handleEditChange}
            />
          </Form.Group>

          {/* Status as a dropdown */}
          <Form.Group className="mb-3">
            <Form.Label>Status:</Form.Label>
            <Form.Control
              as="select"
              name="status"
              value={invoice.status || "Open"}
              onChange={handleEditChange}
            >
              {VALID_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Form.Control>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Tags (JSON or comma separated):</Form.Label>
            <Form.Control
              type="text"
              name="tags"
              value={
                Array.isArray(invoice.tags)
                  ? invoice.tags.join(", ")
                  : invoice.tags || ""
              }
              onChange={handleEditChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Notes:</Form.Label>
            <Form.Control
              as="textarea"
              name="notes"
              value={invoice.notes || ""}
              onChange={handleEditChange}
            />
          </Form.Group>
        </Form>

        {/* LINE ITEMS */}
        <h3 className="text-lg font-bold mt-4">Line Items</h3>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Product</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Total</th>
              <th>Link</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {lineItems.length > 0 ? (
              lineItems.map((item, index) => (
                <tr key={index}>
                  <td>
                    <Form.Control
                      type="text"
                      value={item.product}
                      onChange={(e) =>
                        handleLineItemChange(index, "product", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <Form.Control
                      type="text"
                      value={item.price}
                      onChange={(e) =>
                        handleLineItemChange(index, "price", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <Form.Control
                      type="text"
                      value={item.quantity}
                      onChange={(e) =>
                        handleLineItemChange(index, "quantity", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <Form.Control
                      type="text"
                      value={item.total}
                      onChange={(e) =>
                        handleLineItemChange(index, "total", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <Form.Control
                      type="text"
                      value={item.link}
                      onChange={(e) =>
                        handleLineItemChange(index, "link", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <Button variant="danger" onClick={() => removeRow(index)}>
                      Remove
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center">
                  No line items found
                </td>
              </tr>
            )}
          </tbody>
        </Table>
        <Button variant="primary" onClick={addRow}>
          Add Row
        </Button>

        {/* PDF Preview */}
        <h3 className="text-lg font-bold mt-4">Invoice PDF</h3>
        {pdfUrl ? (
          <iframe
            src={pdfUrl}
            width="100%"
            height="500px"
            className="border border-gray-400 rounded"
            title="Invoice PDF"
          ></iframe>
        ) : (
          <p className="text-center">PDF not available</p>
        )}
      </div>
    </div>
  );
}
