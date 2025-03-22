// frontend/src/utils/dataTransformers.js

export const transformInvoicesToExpenseTrackerFormat = (invoices) => {
    // Group invoices by main category (Camera, Server, Home Network, etc.)
    const categorizedData = {};
    
    invoices.forEach(invoice => {
      // Get the primary category
      let mainCategory = "Other";
      if (invoice.categories && invoice.categories.length > 0) {
        // Simplistic approach - use first category as main category
        mainCategory = invoice.categories[0];
      }
      
      // Initialize category if it doesn't exist
      if (!categorizedData[mainCategory]) {
        categorizedData[mainCategory] = [];
      }
      
      // Transform invoice to expense format
      const expense = {
        id: invoice.invoice_id,
        store: invoice.merchant_name || "",
        orderNumber: invoice.order_number || `Order # ${mainCategory.substring(0, 3).toUpperCase()}-${String(invoice.invoice_id).padStart(3, '0')}`,
        date: invoice.purchase_date || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        category: invoice.categories && invoice.categories.length > 0 ? invoice.categories[0] : "Uncategorized",
        creditCard: invoice.payment_method || "Unknown",
        total: invoice.grand_total || 0,
        products: invoice.items.map(item => ({
          name: item.product_name,
          price: item.unit_price,
          quantity: item.quantity
        }))
      };
      
      // Add to the appropriate category
      categorizedData[mainCategory].push(expense);
    });
    
    return categorizedData;
  };