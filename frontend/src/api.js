// frontend/src/api.js

// Update this line for Docker setup
// The API_URL should match the Docker service name and port
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

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
    try {
        console.log(`Attempting to upload to: ${API_URL}/upload/`);
        const response = await fetch(`${API_URL}/upload/`, {
            method: "POST",
            // Don't set Content-Type header when using FormData
            body: formData,
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error("Upload error response:", errorText);
            throw new Error(errorText || 'Upload failed');
        }
        
        return response.json();
    } catch (error) {
        console.error("Upload error:", error);
        throw error;
    }
}

// Add a new invoice entry (no file)
export async function addInvoiceEntry(invoiceData) {
    try {
        const response = await fetch(`${API_URL}/add-entry/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(invoiceData),
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Failed to add invoice entry');
        }
        
        return response.json();
    } catch (error) {
        console.error("Error adding invoice entry:", error);
        throw error;
    }
}

// Update an invoice
export async function updateInvoice(id, invoiceData) {
    try {
        const response = await fetch(`${API_URL}/update/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(invoiceData),
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Failed to update invoice');
        }
        
        return response.json();
    } catch (error) {
        console.error("Error updating invoice:", error);
        throw error;
    }
}

// Soft delete an invoice
export async function deleteInvoice(id) {
    try {
        const response = await fetch(`${API_URL}/delete/${id}`, {
            method: "DELETE",
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Failed to delete invoice');
        }
        
        return response.json();
    } catch (error) {
        console.error("Error deleting invoice:", error);
        throw error;
    }
}

// Hard delete an invoice
export async function permanentlyDeleteInvoice(id) {
    try {
        const response = await fetch(`${API_URL}/delete-permanent/${id}`, {
            method: "DELETE",
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Failed to permanently delete invoice');
        }
        
        return response.json();
    } catch (error) {
        console.error("Error permanently deleting invoice:", error);
        throw error;
    }
}

// ─────────────────────────────────────────────────────────
// Tags & Categories
// ─────────────────────────────────────────────────────────

// Fetch all available tags
export async function fetchTags() {
    try {
        const response = await fetch(`${API_URL}/tags/`);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Failed to fetch tags');
        }
        
        return response.json();
    } catch (error) {
        console.error("Error fetching tags:", error);
        throw error;
    }
}

// Fetch all available categories
export async function fetchCategories() {
    try {
        const response = await fetch(`${API_URL}/categories/`);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Failed to fetch categories');
        }
        
        return response.json();
    } catch (error) {
        console.error("Error fetching categories:", error);
        throw error;
    }
}

// ─────────────────────────────────────────────────────────
// Payment Management
// ─────────────────────────────────────────────────────────

// Add a new card
export async function addCard(cardName, userId = 1) {
    try {
        const response = await fetch(`${API_URL}/cards/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ card_name: cardName, user_id: userId }),
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Failed to add card');
        }
        
        return response.json();
    } catch (error) {
        console.error("Error adding card:", error);
        throw error;
    }
}

// Add a new card number to an existing card
export async function addCardNumber(cardId, lastFour, expirationDate) {
    try {
        const response = await fetch(`${API_URL}/card-numbers/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                card_id: cardId,
                last_four: lastFour,
                expiration_date: expirationDate,
            }),
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Failed to add card number');
        }
        
        return response.json();
    } catch (error) {
        console.error("Error adding card number:", error);
        throw error;
    }
}

// Add a payment for an invoice
export async function addPayment(invoiceId, cardNumberId, amount, transactionId) {
    try {
        const response = await fetch(`${API_URL}/payments/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                invoice_id: invoiceId,
                card_number_id: cardNumberId,
                amount: amount,
                transaction_id: transactionId,
            }),
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Failed to add payment');
        }
        
        return response.json();
    } catch (error) {
        console.error("Error adding payment:", error);
        throw error;
    }
}

// ─────────────────────────────────────────────────────────
// Wishlist Management
// ─────────────────────────────────────────────────────────

// Add item to wishlist
export async function addToWishlist(productName, productLink, userId = 1) {
    try {
        const response = await fetch(`${API_URL}/wishlist/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                product_name: productName,
                product_link: productLink,
                user_id: userId,
            }),
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Failed to add to wishlist');
        }
        
        return response.json();
    } catch (error) {
        console.error("Error adding to wishlist:", error);
        throw error;
    }
}

// Get user's wishlist
export async function getWishlist(userId = 1) {
    try {
        const response = await fetch(`${API_URL}/wishlist/?user_id=${userId}`);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Failed to get wishlist');
        }
        
        return response.json();
    } catch (error) {
        console.error("Error getting wishlist:", error);
        throw error;
    }
}

// Remove item from wishlist
export async function removeFromWishlist(wishlistId) {
    try {
        const response = await fetch(`${API_URL}/wishlist/${wishlistId}`, {
            method: "DELETE",
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Failed to remove from wishlist');
        }
        
        return response.json();
    } catch (error) {
        console.error("Error removing from wishlist:", error);
        throw error;
    }
}