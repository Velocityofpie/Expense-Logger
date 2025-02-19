import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Form, Table } from "react-bootstrap";

const API_URL = "http://127.0.0.1:8000";

export default function InvoiceDetail() {
  const { id } = useParams();           // 1️⃣ Grab the invoice ID from the URL param
  const navigate = useNavigate();

  const [invoice, setInvoice] = useState({});
  const [lineItems, setLineItems] = useState([]);
  const [pdfUrl, setPdfUrl] = useState("");

  useEffect(() => {
    // If we have a valid ID, fetch the invoice from the backend
    if (id) {
      fetchInvoiceDetails(id);
    }
  }, [id]);

  const fetchInvoiceDetails = async (invoiceId) => {
    try {
      const response = await fetch(`${API_URL}/invoice/${invoiceId}`);
      if (!response.ok) throw new Error("Failed to fetch invoice details");
      const data = await response.json();

      // Update invoice state
      setInvoice(data);

      // Convert line_items to an array if needed
      setLineItems(Array.isArray(data.line_items) ? data.line_items : []);

      // Build the PDF URL to display the invoice file
      setPdfUrl(`${API_URL}/uploads/${encodeURIComponent(data.filename)}`);
    } catch (error) {
      console.error("Error fetching invoice details:", error);
    }
  };

  // Handle input changes for main invoice fields (date, merchant, etc.)
  const handleEditChange = (e) => {
    setInvoice({ ...invoice, [e.target.name]: e.target.value });
  };

  // Handle input changes for line items
  const handleLineItemChange = (index, field, value) => {
    const updatedItems = [...lineItems];
    updatedItems[index][field] = value;
    setLineItems(updatedItems);
  };

  // Add a new line item
  const addRow = () => {
    setLineItems([...lineItems, { product: "", price: "", quantity: "", total: "", link: "" }]);
  };

  // Remove a line item
  const removeRow = (index) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  // Save changes to the invoice (PUT /update/{invoice_id})
  const saveEdit = async () => {
    try {
      await fetch(`${API_URL}/update/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...invoice, line_items: lineItems }),
      });
      // Refresh invoice details after saving
      fetchInvoiceDetails(id);
    } catch (error) {
      console.error("Error saving invoice:", error);
    }
  };

  // If the invoice is empty or not yet fetched, show a loading / placeholder
  if (!invoice.id) {
    return <p>Loading or no invoice found.</p>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Invoice Details</h2>
      <div className="border p-4 rounded shadow-md">
        <div className="flex space-x-4 mb-4">
          <Button variant="secondary" onClick={() => navigate("/invoices")}>
            Back
          </Button>
          <Button variant="success" onClick={saveEdit}>
            Save Changes
          </Button>
        </div>

        <p><strong>Filename:</strong> {invoice.filename}</p>
        <p><strong>ID:</strong> {invoice.id}</p>

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
            <Form.Label>Card Used:</Form.Label>
            <Form.Control
              type="text"
              name="card_used"
              value={invoice.card_used || ""}
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

        {/* Line Items */}
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
                      onChange={(e) => handleLineItemChange(index, "product", e.target.value)}
                    />
                  </td>
                  <td>
                    <Form.Control
                      type="text"
                      value={item.price}
                      onChange={(e) => handleLineItemChange(index, "price", e.target.value)}
                    />
                  </td>
                  <td>
                    <Form.Control
                      type="text"
                      value={item.quantity}
                      onChange={(e) => handleLineItemChange(index, "quantity", e.target.value)}
                    />
                  </td>
                  <td>
                    <Form.Control
                      type="text"
                      value={item.total}
                      onChange={(e) => handleLineItemChange(index, "total", e.target.value)}
                    />
                  </td>
                  <td>
                    <Form.Control
                      type="text"
                      value={item.link}
                      onChange={(e) => handleLineItemChange(index, "link", e.target.value)}
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

        {/* Invoice PDF Iframe */}
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
