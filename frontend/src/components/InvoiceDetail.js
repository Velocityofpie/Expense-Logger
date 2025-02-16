import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Form, Table } from "react-bootstrap";

const API_URL = "http://127.0.0.1:8000";

export default function InvoiceDetail() {
    const location = useLocation();
    const navigate = useNavigate();
    const [invoice, setInvoice] = useState(location.state?.invoice || {});
    const [isEditing, setIsEditing] = useState(false);
    const [lineItems, setLineItems] = useState([]);
    const [pdfUrl, setPdfUrl] = useState("");

    useEffect(() => {
        if (invoice._id) {
            fetchInvoiceDetails();
        }
    }, [invoice._id]);

    const fetchInvoiceDetails = async () => {
        try {
            const response = await fetch(`${API_URL}/invoice/${invoice._id}`);
            if (!response.ok) throw new Error("Failed to fetch invoice details");
            const data = await response.json();
            setInvoice(data);
            setLineItems(Array.isArray(data.line_items) ? data.line_items : []);
            
            // Generate the correct PDF path
            setPdfUrl(`${API_URL}/uploads/${encodeURIComponent(data.filename)}`);
        } catch (error) {
            console.error("Error fetching invoice details:", error);
        }
    };

    const handleEditChange = (e) => {
        setInvoice({ ...invoice, [e.target.name]: e.target.value });
    };

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

    const saveEdit = async () => {
        await fetch(`${API_URL}/update/${invoice._id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...invoice, line_items: lineItems }),
        });
        setIsEditing(false);
        fetchInvoiceDetails();
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Invoice Details</h2>
            <div className="border p-4 rounded shadow-md">
                <div className="flex space-x-4 mb-4">
                    <Button variant="secondary" onClick={() => navigate("/")}>Back</Button>
                    <Button variant="success" onClick={saveEdit}>Save Changes</Button>
                </div>
                <p><strong>Filename:</strong> {invoice.filename}</p>
                <p><strong>ID:</strong> {invoice._id}</p>
                
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>Date:</Form.Label>
                        <Form.Control type="date" name="date" value={invoice.date || ""} onChange={handleEditChange} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Order #:</Form.Label>
                        <Form.Control type="text" name="order_number" value={invoice.order_number || ""} onChange={handleEditChange} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Merchant:</Form.Label>
                        <Form.Control type="text" name="merchant" value={invoice.merchant || ""} onChange={handleEditChange} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Total Amount:</Form.Label>
                        <Form.Control type="text" name="amount" value={invoice.amount || ""} onChange={handleEditChange} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Category:</Form.Label>
                        <Form.Control type="text" name="category" value={invoice.category || ""} onChange={handleEditChange} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Card Used:</Form.Label>
                        <Form.Control type="text" name="card_used" value={invoice.card_used || ""} onChange={handleEditChange} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Notes:</Form.Label>
                        <Form.Control as="textarea" name="notes" value={invoice.notes || ""} onChange={handleEditChange} />
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
                                    <td><Form.Control type="text" value={item.product} onChange={(e) => handleLineItemChange(index, "product", e.target.value)} /></td>
                                    <td><Form.Control type="text" value={item.price} onChange={(e) => handleLineItemChange(index, "price", e.target.value)} /></td>
                                    <td><Form.Control type="text" value={item.quantity} onChange={(e) => handleLineItemChange(index, "quantity", e.target.value)} /></td>
                                    <td><Form.Control type="text" value={item.total} onChange={(e) => handleLineItemChange(index, "total", e.target.value)} /></td>
                                    <td><Form.Control type="text" value={item.link} onChange={(e) => handleLineItemChange(index, "link", e.target.value)} /></td>
                                    <td><Button variant="danger" onClick={() => removeRow(index)}>Remove</Button></td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="text-center">No line items found</td>
                            </tr>
                        )}
                    </tbody>
                </Table>
                <Button variant="primary" onClick={addRow}>Add Row</Button>
                
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
