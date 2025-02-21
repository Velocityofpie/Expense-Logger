import React, { useState, useEffect } from "react";
import { Button, Table, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000";

// Example statuses you might want:
const VALID_STATUSES = ["Open", "Draft", "Needs Attention", "Resolved"];

export default function InvoiceExtractor() {
  const [invoices, setInvoices] = useState([]);
  const [file, setFile] = useState(null);

  // Fields for adding a bank entry (no PDF)
  const [newDate, setNewDate] = useState("");
  const [newMerchant, setNewMerchant] = useState("");
  const [newOrderNumber, setNewOrderNumber] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newStatus, setNewStatus] = useState("Open");
  const [newTags, setNewTags] = useState("");
  const [newNotes, setNewNotes] = useState("");

  const navigate = useNavigate();

  // ─────────────────────────────────────────────────────────
  // Fetch the invoice list on mount
  // ─────────────────────────────────────────────────────────
  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await fetch(`${API_URL}/invoices/`);
      const data = await response.json();
      setInvoices(data.invoices || []);
    } catch (error) {
      console.error("Error fetching invoices:", error);
    }
  };

  // ─────────────────────────────────────────────────────────
  // Upload a PDF-based invoice
  // ─────────────────────────────────────────────────────────
  const handleFileSelect = (e) => {
    setFile(e.target.files[0]);
  };

  const uploadInvoice = async () => {
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append("file", file);

      await fetch(`${API_URL}/upload/`, {
        method: "POST",
        body: formData,
      });

      // Clear file input
      setFile(null);
      // Refresh the invoice list
      fetchInvoices();
    } catch (error) {
      console.error("Error uploading invoice:", error);
    }
  };

  // ─────────────────────────────────────────────────────────
  // Add a "bank entry" (no PDF)
  // ─────────────────────────────────────────────────────────
  const addBankEntry = async () => {
    try {
      const entryData = {
        date: newDate,
        merchant: newMerchant,
        order_number: newOrderNumber,
        category: newCategory,
        amount: newAmount,
        status: newStatus,
        // We'll store tags as an array on the backend, so split by comma:
        tags: newTags.split(",").map((t) => t.trim()).filter(Boolean),
        notes: newNotes,
      };

      const response = await fetch(`${API_URL}/add-entry/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entryData),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || "Failed to add bank entry");
      }

      // Clear the form
      setNewDate("");
      setNewMerchant("");
      setNewOrderNumber("");
      setNewCategory("");
      setNewAmount("");
      setNewStatus("Open");
      setNewTags("");
      setNewNotes("");

      // Refresh the invoice list
      fetchInvoices();
    } catch (error) {
      console.error("Error adding bank entry:", error);
    }
  };

  // ─────────────────────────────────────────────────────────
  // Update an invoice's fields (e.g. category, status, tags)
  // ─────────────────────────────────────────────────────────
  const updateInvoice = async (inv, updatedFields) => {
    try {
      // If tags are being updated as a string, convert them to array
      if (updatedFields.tags && typeof updatedFields.tags === "string") {
        updatedFields.tags = updatedFields.tags.split(",").map((t) => t.trim());
      }

      const updatedInvoice = { ...inv, ...updatedFields };

      await fetch(`${API_URL}/update/${inv.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedInvoice),
      });
      fetchInvoices(); // Refresh
    } catch (error) {
      console.error("Error updating invoice:", error);
    }
  };

  // ─────────────────────────────────────────────────────────
  // Delete an invoice
  // ─────────────────────────────────────────────────────────
  const deleteInvoice = async (inv) => {
    if (!window.confirm("Are you sure you want to delete this invoice?")) {
      return;
    }
    try {
      const filename = inv.filename || "";
      const url = `${API_URL}/delete/${inv.id}?filename=${encodeURIComponent(filename)}`;

      const response = await fetch(url, { method: "DELETE" });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Failed to delete invoice");
      }
      fetchInvoices();
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  // ─────────────────────────────────────────────────────────
  // View invoice detail page
  // ─────────────────────────────────────────────────────────
  const viewInvoice = (inv, index) => {
    // We'll pass invoice + the entire list + current index
    navigate(`/invoice/${inv.id}`, {
      state: {
        invoice: inv,
        invoiceList: invoices,
        currentIndex: index,
      },
    });
  };

  // ─────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────
  return (
    <div className="p-4">
      <h1>Invoice Extractor</h1>

      {/* ─────────────────────────────────────────────────────────
          A) Upload PDF
      ───────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: "2rem" }}>
        <h2>Upload PDF Invoice</h2>
        <input type="file" onChange={handleFileSelect} />
        <Button onClick={uploadInvoice} style={{ marginLeft: "1rem" }}>
          Upload
        </Button>
      </div>

      {/* ─────────────────────────────────────────────────────────
          B) Add Bank Entry
      ───────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: "2rem" }}>
        <h2>Add Bank Entry (no PDF)</h2>
        <Form.Group>
          <Form.Label>Date</Form.Label>
          <Form.Control
            type="date"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>Merchant</Form.Label>
          <Form.Control
            type="text"
            value={newMerchant}
            onChange={(e) => setNewMerchant(e.target.value)}
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>Order #</Form.Label>
          <Form.Control
            type="text"
            value={newOrderNumber}
            onChange={(e) => setNewOrderNumber(e.target.value)}
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>Category</Form.Label>
          <Form.Control
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>Amount</Form.Label>
          <Form.Control
            type="text"
            value={newAmount}
            onChange={(e) => setNewAmount(e.target.value)}
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>Status</Form.Label>
          <Form.Control
            as="select"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
          >
            {VALID_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Form.Control>
        </Form.Group>
        <Form.Group>
          <Form.Label>Tags (comma separated)</Form.Label>
          <Form.Control
            type="text"
            value={newTags}
            onChange={(e) => setNewTags(e.target.value)}
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>Notes</Form.Label>
          <Form.Control
            as="textarea"
            value={newNotes}
            onChange={(e) => setNewNotes(e.target.value)}
          />
        </Form.Group>
        <Button onClick={addBankEntry} style={{ marginTop: "1rem" }}>
          Add Bank Entry
        </Button>
      </div>

      {/* ─────────────────────────────────────────────────────────
          C) Invoice Table
      ───────────────────────────────────────────────────────── */}
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Filename</th>
            <th>Date</th>
            <th>Merchant</th>
            <th>Order #</th>
            <th>Category</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Tags</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {invoices.length === 0 ? (
            <tr>
              <td colSpan={10} style={{ textAlign: "center" }}>
                No invoices found
              </td>
            </tr>
          ) : (
            invoices.map((inv, index) => {
              // If tags are an array, convert to comma string:
              let tagsString = "";
              if (Array.isArray(inv.tags)) {
                tagsString = inv.tags.join(", ");
              } else if (typeof inv.tags === "string") {
                tagsString = inv.tags;
              }

              return (
                <tr key={inv.id}>
                  <td>{inv.id}</td>
                  <td
                    style={{ cursor: "pointer", color: "blue" }}
                    onClick={() => viewInvoice(inv, index)}
                  >
                    {inv.filename || "(No PDF)"}
                  </td>
                  <td>{inv.date}</td>
                  <td>{inv.merchant}</td>
                  <td>{inv.order_number}</td>
                  <td>{inv.category}</td>
                  <td>{inv.amount}</td>

                  {/* Status dropdown */}
                  <td>
                    <Form.Control
                      as="select"
                      value={inv.status || "Open"}
                      onChange={(e) => updateInvoice(inv, { status: e.target.value })}
                    >
                      {VALID_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </Form.Control>
                  </td>

                  {/* Tags text input */}
                  <td>
                    <Form.Control
                      type="text"
                      value={tagsString}
                      onChange={(e) => updateInvoice(inv, { tags: e.target.value })}
                    />
                  </td>

                  <td>
                    <Button
                      variant="danger"
                      onClick={() => deleteInvoice(inv)}
                      style={{ marginRight: "0.5rem" }}
                    >
                      Delete
                    </Button>
                    {/* If we have a filename, show View/Download links */}
                    {inv.filename && inv.filename.length > 0 && (
                      <>
                        <a
                          href={`${API_URL}/uploads/${encodeURIComponent(inv.filename)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ marginRight: "0.5rem" }}
                        >
                          View
                        </a>
                        <a
                          href={`${API_URL}/download/${encodeURIComponent(inv.filename)}`}
                          download
                        >
                          Download
                        </a>
                      </>
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </Table>
    </div>
  );
}
