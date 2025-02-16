import React, { useState, useEffect } from "react";
import { Button, Table, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Dropzone from "react-dropzone";

const API_URL = "http://127.0.0.1:8000";

export default function InvoiceExtractor() {
    
    const [invoices, setInvoices] = useState([]);
    const [categories, setCategories] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchInvoices();
        fetchCategories();
    }, []);

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
            if (!response.ok) throw new Error("Failed to fetch categories");
            const data = await response.json();
            setCategories(data.categories);
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    const handleFileUpload = async (files) => {
        for (let file of files) {
            const formData = new FormData();
            formData.append("file", file);
            try {
                await fetch(`${API_URL}/upload/`, {
                    method: "POST",
                    body: formData,
                });
                fetchInvoices();
            } catch (error) {
                console.error("Error uploading file:", error);
            }
        }
    };

    const deleteInvoice = async (id) => {
        try {
            await fetch(`${API_URL}/delete/${id}`, { method: "DELETE" });
            fetchInvoices();
        } catch (error) {
            console.error("Error deleting invoice:", error);
        }
    };

    const updateCategory = async (id, category) => {
        try {
            await fetch(`${API_URL}/update/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ category }),
            });
            fetchInvoices();
        } catch (error) {
            console.error("Error updating category:", error);
        }
    };

    const viewInvoice = (invoice) => {
        navigate(`/invoice/${invoice._id}`, { state: { invoice } });
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Invoice Extractor</h1>

            {/* 🔹 Drag and Drop File Upload */}
            <Dropzone onDrop={handleFileUpload}>
                {({ getRootProps, getInputProps }) => (
                    <div {...getRootProps()} className="p-4 border-dashed border-2 cursor-pointer">
                        <input {...getInputProps()} />
                        <p>Drag & drop an invoice file here, or click to select a file</p>
                    </div>
                )}
            </Dropzone>

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
                            <tr key={invoice._id}>
                                <td>{invoice._id}</td>
                                <td className="cursor-pointer" onClick={() => viewInvoice(invoice)}>
                                    {invoice.filename}
                                </td>
                                <td>${invoice.amount}</td>
                                <td>{invoice.date}</td>
                                <td>{invoice.order_number}</td>
                                <td>{invoice.merchant}</td>
                                <td>
                                    <Form.Control
                                        as="select"
                                        value={invoice.category || "Uncategorized"}
                                        onChange={(e) => updateCategory(invoice._id, e.target.value)}
                                    >
                                        {categories.map((cat, index) => (
                                            <option key={index} value={cat}>{cat}</option>
                                        ))}
                                        <option value="">Add new category...</option>
                                    </Form.Control>
                                </td>
                                <td>
                                    <Button variant="danger" onClick={() => deleteInvoice(invoice._id)}>Delete</Button>
                                    <a href={`${API_URL}/uploads/${encodeURIComponent(invoice.filename)}`} target="_blank" rel="noopener noreferrer" className="ml-2">
                                        View
                                    </a>
                                    <a href={`${API_URL}/download/${encodeURIComponent(invoice.filename)}`} download className="ml-2">
                                        Download
                                    </a>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="8" className="text-center">No invoices found</td>
                        </tr>
                    )}
                </tbody>
            </Table>
        </div>
    );
}
