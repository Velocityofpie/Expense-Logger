const API_URL = "http://127.0.0.1:8000";

// 🔹 Fetch all invoices from MongoDB
export async function fetchInvoices() {
    const response = await fetch(`${API_URL}/invoices/`);
    return response.json();
}

// 🔹 Fetch a single invoice by ID
export async function fetchInvoiceById(id) {
    const response = await fetch(`${API_URL}/invoice/${id}`);
    return response.json();
}

// 🔹 Upload an invoice file
export async function uploadInvoice(formData) {
    const response = await fetch(`${API_URL}/upload/`, {
        method: "POST",
        body: formData,
    });
    return response.json();
}

// 🔹 Delete an invoice by ID
export async function deleteInvoice(id) {
    return fetch(`${API_URL}/delete/${id}`, { method: "DELETE" });
}

// 🔹 Update an invoice (category, date, amount, etc.)
export async function updateInvoice(id, invoiceData) {
    return fetch(`${API_URL}/update/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invoiceData),
    });
}

// 🔹 Fetch available categories (auto-suggestions)
export async function fetchCategories() {
    const response = await fetch(`${API_URL}/categories/`);
    return response.json();
}
