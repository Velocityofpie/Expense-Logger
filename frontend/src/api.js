// frontend/src/api.js

// Define API_URL
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
// Template Management
// ─────────────────────────────────────────────────────────

// Fetch all templates
export async function fetchTemplates() {
  try {
    const response = await fetch(`${API_URL}/templates/`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to fetch templates');
    }
    
    return response.json();
  } catch (error) {
    console.error("Error fetching templates:", error);
    throw error;
  }
}

// Fetch a single template by ID
export async function fetchTemplateById(id) {
  try {
    const response = await fetch(`${API_URL}/templates/${id}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to fetch template');
    }
    
    return response.json();
  } catch (error) {
    console.error("Error fetching template:", error);
    throw error;
  }
}

// Create a new template
export async function createTemplate(templateData) {
  try {
    const response = await fetch(`${API_URL}/templates/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(templateData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to create template');
    }
    
    return response.json();
  } catch (error) {
    console.error("Error creating template:", error);
    throw error;
  }
}

// Update a template
export async function updateTemplate(id, templateData) {
  try {
    const response = await fetch(`${API_URL}/templates/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(templateData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to update template');
    }
    
    return response.json();
  } catch (error) {
    console.error("Error updating template:", error);
    throw error;
  }
}

// Delete a template
export async function deleteTemplate(id) {
  try {
    const response = await fetch(`${API_URL}/templates/${id}`, {
      method: "DELETE",
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to delete template');
    }
    
    return response.json();
  } catch (error) {
    console.error("Error deleting template:", error);
    throw error;
  }
}

// Import a template
export async function importTemplate(formData) {
  try {
    const response = await fetch(`${API_URL}/templates/import`, {
      method: "POST",
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to import template');
    }
    
    return response.json();
  } catch (error) {
    console.error("Error importing template:", error);
    throw error;
  }
}

// Test a template against an invoice
export async function testTemplate(templateId, invoiceId) {
  try {
    const response = await fetch(`${API_URL}/templates/test`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        template_id: templateId,
        invoice_id: invoiceId
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to test template');
    }
    
    return response.json();
  } catch (error) {
    console.error("Error testing template:", error);
    throw error;
  }
}

// frontend/src/api.js

// Add a new expense
export async function addExpense(expenseData) {
  try {
    // Transform to the format expected by your backend
    const invoiceData = {
      merchant_name: expenseData.store,
      order_number: expenseData.orderNumber,
      purchase_date: expenseData.date,
      payment_method: expenseData.creditCard,
      grand_total: expenseData.total,
      status: "Open",
      categories: [expenseData.category],
      items: expenseData.products.map(product => ({
        product_name: product.name,
        quantity: product.quantity,
        unit_price: product.price
      }))
    };
    
    // Call your existing addInvoiceEntry function
    const result = await addInvoiceEntry(invoiceData);
    return result;
  } catch (error) {
    console.error("Error adding expense:", error);
    throw error;
  }
}

// Update existing expense
export async function updateExpense(id, expenseData) {
  try {
    // Transform to the format expected by your backend
    const invoiceData = {
      merchant_name: expenseData.store,
      order_number: expenseData.orderNumber,
      purchase_date: expenseData.date,
      payment_method: expenseData.creditCard,
      grand_total: expenseData.total,
      categories: [expenseData.category],
      items: expenseData.products.map(product => ({
        product_name: product.name,
        quantity: product.quantity,
        unit_price: product.price
      }))
    };
    
    // Call your existing updateInvoice function
    const result = await updateInvoice(id, invoiceData);
    return result;
  } catch (error) {
    console.error("Error updating expense:", error);
    throw error;
  }
}

export async function addExpense(expenseData) {
  try {
    // Transform to the format expected by your backend
    const invoiceData = {
      merchant_name: expenseData.store,
      order_number: expenseData.orderNumber,
      purchase_date: expenseData.date,
      payment_method: expenseData.creditCard,
      grand_total: expenseData.total,
      status: "Open",
      categories: [expenseData.category],
      items: expenseData.products.map(product => ({
        product_name: product.name,
        quantity: product.quantity,
        unit_price: product.price,
        item_type: product.item_type || expenseData.category  // Set item_type from product or default to category
      }))
    };
    
    // Call your existing addInvoiceEntry function
    const result = await addInvoiceEntry(invoiceData);
    return result;
  } catch (error) {
    console.error("Error adding expense:", error);
    throw error;
  }
}

// Update existing expense
export async function updateExpense(id, expenseData) {
  try {
    // Transform to the format expected by your backend
    const invoiceData = {
      merchant_name: expenseData.store,
      order_number: expenseData.orderNumber,
      purchase_date: expenseData.date,
      payment_method: expenseData.creditCard,
      grand_total: expenseData.total,
      categories: [expenseData.category],
      items: expenseData.products.map(product => ({
        product_name: product.name,
        quantity: product.quantity,
        unit_price: product.price,
        item_type: product.item_type || expenseData.category  // Set item_type from product or default to category
      }))
    };
    
    // Call your existing updateInvoice function
    const result = await updateInvoice(id, invoiceData);
    return result;
  } catch (error) {
    console.error("Error updating expense:", error);
    throw error;
  }
}