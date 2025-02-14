import React, { useState, useEffect } from "react";
import { Button, Table, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Dropzone from "react-dropzone";

const API_URL = "http://127.0.0.1:8000";

export default function InvoiceExtractor() {
  const [file, setFile] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleFileUpload = (files) => {
    setFile(files[0]);
  };

  const uploadInvoice = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_URL}/upload/`, {
      method: "POST",
      body: formData,
    });
    if (response.ok) {
      fetchInvoices();
    }
  };

  const fetchInvoices = async () => {
    const response = await fetch(`${API_URL}/invoices/`);
    const data = await response.json();
    setInvoices(data.invoices);
  };

  const deleteInvoice = async (id, filename) => {
    try {
        const response = await fetch(`${API_URL}/delete/${id}?filename=${encodeURIComponent(filename)}`, {
            method: "DELETE",
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || "Failed to delete invoice");
        }

        fetchInvoices(); // Refresh invoice list
    } catch (error) {
        console.error("Delete error:", error);
    }
};


  const updateCategory = async (id, category) => {
    if (!categories.includes(category)) {
      setCategories([...categories, category]);
    }
    await fetch(`${API_URL}/update/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category }),
    });
    fetchInvoices();
  };

  const viewInvoice = (invoice) => {
    navigate(`/invoice/${invoice.id}`, { state: { invoice } });
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Invoice Extractor</h1>
      <div className="flex flex-col space-y-2 mb-4">
        <label className="font-semibold">Upload Invoice File:</label>
        <Dropzone onDrop={handleFileUpload}>
          {({ getRootProps, getInputProps }) => (
            <div {...getRootProps()} className="p-4 border-dashed border-2 cursor-pointer">
              <input {...getInputProps()} />
              <p>Drag & drop an invoice file here, or click to select a file</p>
            </div>
          )}
        </Dropzone>
        <Button onClick={uploadInvoice} className="p-2 bg-blue-500 text-white rounded">Upload Invoice</Button>
      </div>
      
      <Table striped bordered hover className="table-auto w-full text-left border border-gray-400">
        <thead>
          <tr className="border border-gray-400">
            <th className="p-4 border border-gray-400">ID</th>
            <th className="p-4 border border-gray-400">Filename</th>
            <th className="p-4 border border-gray-400">Amount</th>
            <th className="p-4 border border-gray-400">Date</th>
            <th className="p-4 border border-gray-400">Order #</th>
            <th className="p-4 border border-gray-400">Merchant</th>
            <th className="p-4 border border-gray-400">Category</th>
            <th className="p-4 border border-gray-400">Actions</th>
          </tr>
        </thead>
        <tbody>
          {invoices.length > 0 ? (
            invoices.map((invoice) => (
              <tr key={invoice.id} className="border border-gray-400">
                <td className="p-4 border border-gray-400">{invoice.id}</td>
                <td className="p-4 border border-gray-400 cursor-pointer" onClick={() => viewInvoice(invoice)}>{invoice.filename}</td>
                <td className="p-4 border border-gray-400">${invoice.amount}</td>
                <td className="p-4 border border-gray-400">{invoice.date}</td>
                <td className="p-4 border border-gray-400">{invoice.order_number}</td>
                <td className="p-4 border border-gray-400">{invoice.merchant}</td>
                <td className="p-4 border border-gray-400">
                  <Form.Control
                    as="select"
                    value={invoice.category || "Uncategorized"}
                    onChange={(e) => updateCategory(invoice.id, e.target.value)}
                  >
                    {categories.map((cat, index) => (
                      <option key={index} value={cat}>{cat}</option>
                    ))}
                    <option value="">Add new category...</option>
                  </Form.Control>
                </td>
                <td className="p-4 border border-gray-400">
                  <Button className="mr-4 bg-red-500 text-white p-2 rounded" onClick={() => deleteInvoice(invoice.id, invoice.filename)}>Delete</Button>
                  <a href={`${API_URL}/uploads/${encodeURIComponent(invoice.filename)}`} target="_blank" rel="noopener noreferrer" className="ml-4 bg-blue-500 text-white p-2 rounded">View</a>
                  <a href={`${API_URL}/download/${encodeURIComponent(invoice.filename)}`} className="ml-4 bg-blue-500 text-white p-2 rounded" download>Download</a>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" className="text-center p-4 border border-gray-400">No invoices found</td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
}
