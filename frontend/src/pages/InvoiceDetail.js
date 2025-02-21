import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Form, Table } from "react-bootstrap";

const API_URL = "http://127.0.0.1:8000";

export default function InvoiceDetail() {
  const location = useLocation();
  const navigate = useNavigate();

  // The single invoice from the route state (fallback to empty object).
  const [invoice, setInvoice] = useState(location.state?.invoice || {});
  // The entire list of invoices and our current index in that list:
  const [invoiceList] = useState(location.state?.invoiceList || []);
  const [currentIndex] = useState(location.state?.currentIndex || 0);

  // For line items
  const [lineItems, setLineItems] = useState([]);
  // PDF preview URL
  const [pdfUrl, setPdfUrl] = useState("");

  useEffect(() => {
    if (invoice.id) {
      fetchInvoiceDetails(invoice.id);
    }
    // eslint-disable-next-line
  }, [invoice.id]);

  // ─────────────────────────────────────────────────────────
  // Fetch a single invoice by ID
  // ─────────────────────────────────────────────────────────
  async function fetchInvoiceDetails(id) {
    try {
      const response = await fetch(`${API_URL}/invoice/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch invoice details");
      }
      const data = await response.json();
      setInvoice(data);
      setLineItems(Array.isArray(data.line_items) ? data.line_items : []);
      // If there's a filename, build the PDF url
      if (data.filename) {
        setPdfUrl(`${API_URL}/uploads/${encodeURIComponent(data.filename)}`);
      } else {
        setPdfUrl("");
      }
    } catch (error) {
      console.error("Error fetching invoice details:", error);
    }
  }

  // ─────────────────────────────────────────────────────────
  // Handle changes to main invoice fields
  // ─────────────────────────────────────────────────────────
  const handleFieldChange = (e) => {
    setInvoice({ ...invoice, [e.target.name]: e.target.value });
  };

  // ─────────────────────────────────────────────────────────
  // Handle line items
  // ─────────────────────────────────────────────────────────
  const handleLineItemChange = (index, field, value) => {
    const updated = [...lineItems];
    updated[index][field] = value;
    setLineItems(updated);
  };

  const addRow = () => {
    setLineItems([...lineItems, { product: "", price: "", quantity: "", total: "", link: "" }]);
  };

  const removeRow = (index) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  // ─────────────────────────────────────────────────────────
  // Save changes to the invoice
  // ─────────────────────────────────────────────────────────
  const saveChanges = async () => {
    try {
      // Merge line items into the invoice object
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

      // Optionally re-fetch to see updated file rename, etc.
      fetchInvoiceDetails(invoice.id);
    } catch (error) {
      console.error("Error saving invoice:", error);
    }
  };

  // ─────────────────────────────────────────────────────────
  // Previous / Next Navigation
  // ─────────────────────────────────────────────────────────
  const handlePrev = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      const prevInvoice = invoiceList[newIndex];
      navigate(`/invoice/${prevInvoice.id}`, {
        state: { invoice: prevInvoice, invoiceList, currentIndex: newIndex },
      });
    }
  };

  const handleNext = () => {
    if (currentIndex < invoiceList.length - 1) {
      const newIndex = currentIndex + 1;
      const nextInvoice = invoiceList[newIndex];
      navigate(`/invoice/${nextInvoice.id}`, {
        state: { invoice: nextInvoice, invoiceList, currentIndex: newIndex },
      });
    }
  };

  // ─────────────────────────────────────────────────────────
  // Delete Invoice
  // ─────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this invoice?")) return;
    try {
      const filename = invoice.filename || "";
      const url = `${API_URL}/delete/${invoice.id}?filename=${encodeURIComponent(filename)}`;

      const resp = await fetch(url, { method: "DELETE" });
      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.detail || "Failed to delete invoice");
      }
      // After deleting, go back to main list (or wherever you want).
      navigate("/");
    } catch (error) {
      console.error("Error deleting invoice:", error);
    }
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Invoice Detail</h2>

      {/* Action buttons row */}
      <div style={{ marginBottom: "1rem" }}>
        <Button variant="secondary" onClick={() => navigate("/")}>
          Back
        </Button>{" "}
        <Button variant="danger" onClick={handleDelete}>
          Delete
        </Button>{" "}
        <Button variant="success" onClick={saveChanges}>
          Save Changes
        </Button>{" "}
        {/* Prev/Next only if we have an invoiceList */}
        {invoiceList.length > 1 && (
          <>
            <Button variant="outline-primary" onClick={handlePrev} disabled={currentIndex <= 0}>
              Prev
            </Button>{" "}
            <Button
              variant="outline-primary"
              onClick={handleNext}
              disabled={currentIndex >= invoiceList.length - 1}
            >
              Next
            </Button>
          </>
        )}
      </div>

      <p>
        <strong>ID:</strong> {invoice.id}
      </p>
      <p>
        <strong>Filename:</strong> {invoice.filename}
      </p>

      {/* Main invoice fields */}
      <Form>
        <Form.Group style={{ marginBottom: "0.5rem" }}>
          <Form.Label>Date</Form.Label>
          <Form.Control
            type="date"
            name="date"
            value={invoice.date || ""}
            onChange={handleFieldChange}
          />
        </Form.Group>

        <Form.Group style={{ marginBottom: "0.5rem" }}>
          <Form.Label>Order #</Form.Label>
          <Form.Control
            type="text"
            name="order_number"
            value={invoice.order_number || ""}
            onChange={handleFieldChange}
          />
        </Form.Group>

        <Form.Group style={{ marginBottom: "0.5rem" }}>
          <Form.Label>Merchant</Form.Label>
          <Form.Control
            type="text"
            name="merchant"
            value={invoice.merchant || ""}
            onChange={handleFieldChange}
          />
        </Form.Group>

        <Form.Group style={{ marginBottom: "0.5rem" }}>
          <Form.Label>Amount</Form.Label>
          <Form.Control
            type="text"
            name="amount"
            value={invoice.amount || ""}
            onChange={handleFieldChange}
          />
        </Form.Group>

        <Form.Group style={{ marginBottom: "0.5rem" }}>
          <Form.Label>Category</Form.Label>
          <Form.Control
            type="text"
            name="category"
            value={invoice.category || ""}
            onChange={handleFieldChange}
          />
        </Form.Group>

        {/* Payment field (formerly "card_used") */}
        <Form.Group style={{ marginBottom: "0.5rem" }}>
          <Form.Label>Payment</Form.Label>
          <Form.Control
            type="text"
            name="payment" // if your backend is still 'card_used', see note below
            value={invoice.payment || ""}
            onChange={handleFieldChange}
          />
        </Form.Group>

        <Form.Group style={{ marginBottom: "0.5rem" }}>
          <Form.Label>Status</Form.Label>
          <Form.Control
            type="text"
            name="status"
            value={invoice.status || ""}
            onChange={handleFieldChange}
          />
        </Form.Group>

        <Form.Group style={{ marginBottom: "0.5rem" }}>
          <Form.Label>Tags (comma separated)</Form.Label>
          <Form.Control
            type="text"
            name="tags"
            value={Array.isArray(invoice.tags) ? invoice.tags.join(", ") : invoice.tags || ""}
            onChange={handleFieldChange}
          />
        </Form.Group>

        <Form.Group style={{ marginBottom: "0.5rem" }}>
          <Form.Label>Notes</Form.Label>
          <Form.Control
            as="textarea"
            name="notes"
            value={invoice.notes || ""}
            onChange={handleFieldChange}
          />
        </Form.Group>
      </Form>

      <h3 style={{ marginTop: "1rem" }}>Line Items</h3>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Product</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Total</th>
            <th>Link</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {lineItems.map((item, idx) => (
            <tr key={idx}>
              <td>
                <Form.Control
                  type="text"
                  value={item.product}
                  onChange={(e) => handleLineItemChange(idx, "product", e.target.value)}
                />
              </td>
              <td>
                <Form.Control
                  type="text"
                  value={item.price}
                  onChange={(e) => handleLineItemChange(idx, "price", e.target.value)}
                />
              </td>
              <td>
                <Form.Control
                  type="text"
                  value={item.quantity}
                  onChange={(e) => handleLineItemChange(idx, "quantity", e.target.value)}
                />
              </td>
              <td>
                <Form.Control
                  type="text"
                  value={item.total}
                  onChange={(e) => handleLineItemChange(idx, "total", e.target.value)}
                />
              </td>
              <td>
                <Form.Control
                  type="text"
                  value={item.link}
                  onChange={(e) => handleLineItemChange(idx, "link", e.target.value)}
                />
              </td>
              <td>
                <Button variant="danger" onClick={() => removeRow(idx)}>
                  Remove
                </Button>
              </td>
            </tr>
          ))}
          {lineItems.length === 0 && (
            <tr>
              <td colSpan="6" style={{ textAlign: "center" }}>
                No line items found
              </td>
            </tr>
          )}
        </tbody>
      </Table>
      <Button variant="primary" onClick={addRow}>
        Add Line Item
      </Button>

      {/* PDF Preview */}
      <h3 style={{ marginTop: "1rem" }}>PDF Preview</h3>
      {pdfUrl ? (
        <iframe
          src={pdfUrl}
          width="100%"
          height="500px"
          style={{ border: "1px solid #ccc" }}
          title="Invoice PDF"
        />
      ) : (
        <p>No PDF file found for this invoice.</p>
      )}
    </div>
  );
}
