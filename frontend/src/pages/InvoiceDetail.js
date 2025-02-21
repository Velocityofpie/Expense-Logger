import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Form, Table } from "react-bootstrap";

const API_URL = "http://127.0.0.1:8000";

export default function InvoiceDetail() {
  const { id } = useParams(); // Current invoice ID from the URL
  const navigate = useNavigate();

  const [invoices, setInvoices] = useState([]);
  const [invoice, setInvoice] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [lineItems, setLineItems] = useState([]);
  const [pdfUrl, setPdfUrl] = useState("");

  // ─────────────────────────────────────────────────────────────────────────
  //  1) Fetch ALL invoices once
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    async function fetchAllInvoices() {
      try {
        const response = await fetch(`${API_URL}/invoices/`);
        if (!response.ok) throw new Error("Failed to fetch all invoices");
        const data = await response.json();
        setInvoices(data.invoices || []);
      } catch (error) {
        console.error("Error fetching invoices:", error);
      }
    }
    fetchAllInvoices();
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  //  2) When ID or invoices changes, load correct invoice
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!id || invoices.length === 0) return;

    const idx = invoices.findIndex((inv) => String(inv.id) === String(id));
    setCurrentIndex(idx);

    if (idx >= 0) {
      const inv = invoices[idx];
      setInvoice(inv);
      setLineItems(inv.line_items || []);
      setPdfUrl(`${API_URL}/uploads/${encodeURIComponent(inv.filename)}`);
    } else {
      // If not found in local array, fetch from server
      fetchInvoiceDetails(id);
    }
  }, [id, invoices]);

  async function fetchInvoiceDetails(invoiceId) {
    try {
      const response = await fetch(`${API_URL}/invoice/${invoiceId}`);
      if (!response.ok) throw new Error("Failed to fetch invoice details");
      const data = await response.json();
      setInvoice(data);
      setLineItems(data.line_items || []);
      setPdfUrl(`${API_URL}/uploads/${encodeURIComponent(data.filename)}`);
    } catch (error) {
      console.error("Error fetching invoice details:", error);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  //  3) Next / Previous invoice navigation
  // ─────────────────────────────────────────────────────────────────────────
  const handleNext = () => {
    if (currentIndex < invoices.length - 1) {
      const nextInv = invoices[currentIndex + 1];
      navigate(`/invoice/${nextInv.id}`);
    } else {
      alert("No more invoices!");
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      const prevInv = invoices[currentIndex - 1];
      navigate(`/invoice/${prevInv.id}`);
    } else {
      alert("No previous invoices!");
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  //  4) Save changes logic
  // ─────────────────────────────────────────────────────────────────────────
  const saveEdit = async () => {
    if (!invoice) return;
    try {
      const response = await fetch(`${API_URL}/update/${invoice.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...invoice,
          line_items: lineItems,
        }),
      });
      if (!response.ok) throw new Error("Failed to update invoice");
      await fetchInvoiceDetails(invoice.id);
      alert("Invoice updated successfully!");
    } catch (error) {
      console.error("Error saving invoice:", error);
      alert("Failed to save invoice changes.");
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  //  5) Delete button
  // ─────────────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!invoice) return;
    try {
      const url = `${API_URL}/delete/${invoice.id}?filename=${encodeURIComponent(invoice.filename)}`;
      const response = await fetch(url, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete invoice");
      alert("Invoice deleted!");
      // Option: navigate to the next invoice, or back to a list:
      navigate("/invoices");
    } catch (error) {
      console.error("Error deleting invoice:", error);
      alert("Failed to delete invoice.");
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  //  6) Handle invoice field changes
  // ─────────────────────────────────────────────────────────────────────────
  const handleInvoiceFieldChange = (field, value) => {
    if (!invoice) return;
    setInvoice({ ...invoice, [field]: value });
  };

  // ─────────────────────────────────────────────────────────────────────────
  //  7) Line item changes
  // ─────────────────────────────────────────────────────────────────────────
  const handleLineItemChange = (index, field, value) => {
    const updatedItems = [...lineItems];
    updatedItems[index][field] = value;
    setLineItems(updatedItems);
  };

  const addRow = () => {
    setLineItems([...lineItems, { product: "", price: "", quantity: "", total: "", link: "" }]);
  };

  const removeRow = (index) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  // ─────────────────────────────────────────────────────────────────────────
  //  8) Custom displayed filename (Merchant - Order# ####.pdf)
  // ─────────────────────────────────────────────────────────────────────────
  function getDisplayedFilename() {
    if (!invoice) return "";
    if (invoice.merchant && invoice.order_number) {
      return `${invoice.merchant} - Order# ${invoice.order_number}.pdf`;
    }
    // fallback to the real filename if merchant/order_number are missing
    return invoice.filename;
  }

  // ─────────────────────────────────────────────────────────────────────────
  //  9) Render
  // ─────────────────────────────────────────────────────────────────────────
  if (!invoice) {
    return <div>Loading invoice...</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Invoice Details</h2>
      <div className="border p-4 rounded shadow-md">
        <div className="flex space-x-4 mb-4">
          <Button variant="secondary" onClick={() => navigate("/")}>
            Back
          </Button>
          <Button variant="primary" onClick={handlePrev}>
            Previous
          </Button>
          <Button variant="primary" onClick={handleNext}>
            Next
          </Button>
          <Button variant="success" onClick={saveEdit}>
            Save Changes
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </div>

        {/* Show custom filename */}
        <p><strong>Filename:</strong> {getDisplayedFilename()}</p>

        {/* Show ID, or any other fields you want */}
        <p><strong>ID:</strong> {invoice.id}</p>

        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Date:</Form.Label>
            <Form.Control
              type="date"
              value={invoice.date || ""}
              onChange={(e) => handleInvoiceFieldChange("date", e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Order #:</Form.Label>
            <Form.Control
              type="text"
              value={invoice.order_number || ""}
              onChange={(e) => handleInvoiceFieldChange("order_number", e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Merchant:</Form.Label>
            <Form.Control
              type="text"
              value={invoice.merchant || ""}
              onChange={(e) => handleInvoiceFieldChange("merchant", e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Total Amount:</Form.Label>
            <Form.Control
              type="text"
              value={invoice.amount || ""}
              onChange={(e) => handleInvoiceFieldChange("amount", e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Category:</Form.Label>
            <Form.Control
              type="text"
              value={invoice.category || ""}
              onChange={(e) => handleInvoiceFieldChange("category", e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Card Used:</Form.Label>
            <Form.Control
              type="text"
              value={invoice.card_used || ""}
              onChange={(e) => handleInvoiceFieldChange("card_used", e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Notes:</Form.Label>
            <Form.Control
              as="textarea"
              value={invoice.notes || ""}
              onChange={(e) => handleInvoiceFieldChange("notes", e.target.value)}
            />
          </Form.Group>
        </Form>

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
