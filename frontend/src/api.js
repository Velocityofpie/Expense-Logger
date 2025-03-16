// frontend/src/api.js

const API_URL = "http://localhost:8000";

// ─────────────────────────────────────────────────────────
// Invoice Management
// ─────────────────────────────────────────────────────────

// Fetch all invoices with optional pagination
export async function fetchInvoices(skip = 0, limit = 100, userId = null) {
    let url = `${API_URL}/invoices/?skip=${skip}&limit=${limit}`;
    if (userId) {
        url += `&user_id=${userId}`;
    }
    const response = await fetch(url);
    return response.json();
}

// Fetch a single invoice by ID
export async function fetchInvoiceById(id) {
    const response = await fetch(`${API_URL}/invoice/${id}`);
    return response.json();
}

// Upload an invoice file
export async function uploadInvoice(formData) {
    const response = await fetch(`${API_URL}/upload/`, {
        method: "POST",
        body: formData,
    });
    return response.json();
}

// Add a new invoice entry (no file)
export async function addInvoiceEntry(invoiceData) {
    return fetch(`${API_URL}/add-entry/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invoiceData),
    }).then(response => response.json());
}

// Update an invoice
export async function updateInvoice(id, invoiceData) {
    return fetch(`${API_URL}/update/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invoiceData),
    }).then(response => response.json());
}

// Soft delete an invoice
export async function deleteInvoice(id) {
    return fetch(`${API_URL}/delete/${id}`, {
        method: "DELETE",
    }).then(response => response.json());
}

// Hard delete an invoice
export async function permanentlyDeleteInvoice(id) {
    return fetch(`${API_URL}/delete-permanent/${id}`, {
        method: "DELETE",
    }).then(response => response.json());
}

// ─────────────────────────────────────────────────────────
// Tags & Categories
// ─────────────────────────────────────────────────────────

// Fetch all available tags
export async function fetchTags() {
    const response = await fetch(`${API_URL}/tags/`);
    return response.json();
}

// Fetch all available categories
export async function fetchCategories() {
    const response = await fetch(`${API_URL}/categories/`);
    return response.json();
}

// ─────────────────────────────────────────────────────────
// Payment Management
// ─────────────────────────────────────────────────────────

// Add a new card
export async function addCard(cardName, userId = 1) {
    return fetch(`${API_URL}/cards/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ card_name: cardName, user_id: userId }),
    }).then(response => response.json());
}

// Add a new card number to an existing card
export async function addCardNumber(cardId, lastFour, expirationDate) {
    return fetch(`${API_URL}/card-numbers/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            card_id: cardId,
            last_four: lastFour,
            expiration_date: expirationDate,
        }),
    }).then(response => response.json());
}

// Add a payment for an invoice
export async function addPayment(invoiceId, cardNumberId, amount, transactionId) {
    return fetch(`${API_URL}/payments/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            invoice_id: invoiceId,
            card_number_id: cardNumberId,
            amount: amount,
            transaction_id: transactionId,
        }),
    }).then(response => response.json());
}

// ─────────────────────────────────────────────────────────
// Wishlist Management
// ─────────────────────────────────────────────────────────

// Add item to wishlist
export async function addToWishlist(productName, productLink, userId = 1) {
    return fetch(`${API_URL}/wishlist/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            product_name: productName,
            product_link: productLink,
            user_id: userId,
        }),
    }).then(response => response.json());
}

// Get user's wishlist
export async function getWishlist(userId = 1) {
    const response = await fetch(`${API_URL}/wishlist/?user_id=${userId}`);
    return response.json();
}

// Remove item from wishlist
export async function removeFromWishlist(wishlistId) {
    return fetch(`${API_URL}/wishlist/${wishlistId}`, {
        method: "DELETE",
    }).then(response => response.json());
}