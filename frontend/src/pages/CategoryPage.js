import React, { useState, useEffect } from "react";
import { Form, Table } from "react-bootstrap";
import { fetchInvoices } from "../api"; // Assuming you have this API helper

export default function CategoryPage() {
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  // Fetch invoices on mount
  useEffect(() => {
    async function loadData() {
      const data = await fetchInvoices();
      const items = data.invoices || [];
      setInvoices(items);
    }
    loadData();
  }, []);

  // Derive unique categories from invoices
  useEffect(() => {
    const cats = Array.from(
      new Set(invoices.map((inv) => inv.category || "Uncategorized"))
    );
    setCategories(cats);
  }, [invoices]);

  // Filter invoices based on the selected category
  useEffect(() => {
    if (selectedCategory === "") {
      setFilteredInvoices(invoices);
    } else {
      setFilteredInvoices(
        invoices.filter(
          (inv) => (inv.category || "Uncategorized") === selectedCategory
        )
      );
    }
  }, [selectedCategory, invoices]);

  return (
    <div style={{ padding: "1rem" }}>
      <h1>Invoices by Category</h1>
      <Form.Group
        controlId="categorySelect"
        style={{ maxWidth: "300px", marginBottom: "1rem" }}
      >
        <Form.Label>Select Category</Form.Label>
        <Form.Control
          as="select"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">All</option>
          {categories.map((cat, index) => (
            <option key={index} value={cat}>
              {cat}
            </option>
          ))}
        </Form.Control>
      </Form.Group>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Date</th>
            <th>Merchant</th>
            <th>Order #</th>
            <th>Amount</th>
            <th>Category</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {filteredInvoices.map((inv) => (
            <tr key={inv.id}>
              <td>{inv.id}</td>
              <td>{inv.date}</td>
              <td>{inv.merchant}</td>
              <td>{inv.order_number}</td>
              <td>{inv.amount}</td>
              <td>{inv.category}</td>
              <td>{inv.status}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
