const API_URL = "http://127.0.0.1:8000";

export async function fetchInvoices() {
    const response = await fetch(`${API_URL}/invoices/`);
    return response.json();
}

export async function deleteInvoice(id) {
    return fetch(`${API_URL}/delete/${id}`, { method: "DELETE" });
}