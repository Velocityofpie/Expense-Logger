// Modified Invoice Table Component with improved styling
import React, { useState } from "react";
import { Button, Form, Badge, Spinner, Alert } from "react-bootstrap";

// Function to format currency for display
const formatCurrency = (value) => {
  if (!value) return "$0.00";
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value);
};

// Component for the updated invoice table
const InvoiceTable = ({ 
  invoices = [], 
  isLoading, 
  onView, 
  onEdit, 
  onDelete,
  onBatchDelete
}) => {
  // State for selected invoices (for batch actions)
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);

  // Handle individual checkbox selection
  const handleSelectInvoice = (invoiceId) => {
    if (selectedInvoices.includes(invoiceId)) {
      setSelectedInvoices(selectedInvoices.filter(id => id !== invoiceId));
    } else {
      setSelectedInvoices([...selectedInvoices, invoiceId]);
    }
  };

  // Handle "select all" checkbox
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedInvoices([]);
    } else {
      setSelectedInvoices(invoices.map(inv => inv.invoice_id));
    }
    setSelectAll(!selectAll);
  };

  // Handle batch delete confirmation
  const confirmBatchDelete = () => {
    if (selectedInvoices.length > 0) {
      setShowDeleteAlert(true);
    }
  };

  // Execute batch delete
  const executeBatchDelete = () => {
    onBatchDelete(selectedInvoices);
    setSelectedInvoices([]);
    setSelectAll(false);
    setShowDeleteAlert(false);
  };

  // Cancel batch delete
  const cancelBatchDelete = () => {
    setShowDeleteAlert(false);
  };

  if (isLoading) {
    return (
      <div className="text-center p-5">
        <Spinner animation="border" role="status" />
        <p className="mt-3">Loading invoices...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Batch Action Controls */}
      {selectedInvoices.length > 0 && (
        <div className="d-flex justify-content-between align-items-center mb-3 p-2 bg-light rounded">
          <div>
            <span className="font-weight-bold mr-2">{selectedInvoices.length} items selected</span>
          </div>
          <Button 
            variant="danger" 
            size="sm"
            onClick={confirmBatchDelete}
            className="d-flex align-items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="mr-1" viewBox="0 0 16 16">
              <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
              <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
            </svg>
            Delete Selected
          </Button>
        </div>
      )}

      {/* Delete Confirmation Alert */}
      {showDeleteAlert && (
        <Alert variant="danger" className="mb-3">
          <Alert.Heading>Confirm Deletion</Alert.Heading>
          <p>Are you sure you want to delete {selectedInvoices.length} selected invoice(s)? This action cannot be undone.</p>
          <div className="d-flex justify-content-end">
            <Button variant="outline-secondary" className="mr-2" onClick={cancelBatchDelete}>
              Cancel
            </Button>
            <Button variant="danger" onClick={executeBatchDelete}>
              Delete
            </Button>
          </div>
        </Alert>
      )}

      {/* Invoice Table */}
      <div className="table-responsive">
        <table className="table table-hover">
          <thead className="bg-light">
            <tr>
              <th style={{ width: "40px" }}>
                <Form.Check 
                  type="checkbox" 
                  checked={selectAll}
                  onChange={handleSelectAll}
                  aria-label="Select all invoices"
                />
              </th>
              <th className="text-nowrap">Date</th>
              <th className="text-nowrap">Order #</th>
              <th>Merchant</th>
              <th className="text-nowrap">Amount</th>
              <th>Status</th>
              <th>Categories</th>
              <th>Tags</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length > 0 ? (
              invoices.map(invoice => (
                <tr key={invoice.invoice_id} className={selectedInvoices.includes(invoice.invoice_id) ? "table-active" : ""}>
                  <td>
                    <Form.Check 
                      type="checkbox" 
                      checked={selectedInvoices.includes(invoice.invoice_id)}
                      onChange={() => handleSelectInvoice(invoice.invoice_id)}
                      aria-label={`Select invoice ${invoice.invoice_id}`}
                    />
                  </td>
                  <td className="text-nowrap fs-6">
                    {invoice.purchase_date ? new Date(invoice.purchase_date).toLocaleDateString('en-US', {
                      month: '2-digit',
                      day: '2-digit',
                      year: 'numeric'
                    }) : "-"}
                  </td>
                  <td className="font-weight-medium fs-6">{invoice.order_number || "-"}</td>
                  <td>
                    <div className="text-truncate fs-6" style={{ maxWidth: "150px" }} title={invoice.merchant_name || "-"}>
                      {invoice.merchant_name || "-"}
                    </div>
                  </td>
                  <td className="font-weight-medium fs-6">{formatCurrency(invoice.grand_total)}</td>
                  <td>
                    <Badge 
                      bg={
                        invoice.status === "Paid" ? "success" :
                        invoice.status === "Open" ? "primary" :
                        invoice.status === "Needs Attention" ? "danger" :
                        "secondary"
                      }
                      className="fs-6 py-1 px-2"
                    >
                      {invoice.status}
                    </Badge>
                  </td>
                  <td>
                    {invoice.categories && invoice.categories.length > 0 ? (
                      <div className="d-flex flex-wrap gap-1">
                        {invoice.categories.map((category, index) => (
                          <Badge 
                            key={index} 
                            bg="secondary" 
                            className="me-1 mb-1 fs-6"
                          >
                            {category}
                          </Badge>
                        ))}
                      </div>
                    ) : "-"}
                  </td>
                  <td>
                    {invoice.tags && invoice.tags.length > 0 ? (
                      <div className="d-flex flex-wrap gap-1">
                        {invoice.tags.map((tag, index) => (
                          <Badge 
                            key={index} 
                            bg="info" 
                            className="me-1 mb-1 fs-6"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    ) : "-"}
                  </td>
                  <td>
                    <div className="d-flex justify-content-center gap-3">
                      {/* View Document Button - Only show if file exists */}
                      {invoice.file_name && (
                        <button
                          className="btn btn-link p-0 text-primary"
                          onClick={() => onView(invoice)}
                          title="View Document"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/>
                            <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/>
                          </svg>
                        </button>
                      )}
                      
                      {/* Edit Button */}
                      <button
                        className="btn btn-link p-0 text-success"
                        onClick={() => onEdit(invoice)}
                        title="Edit Invoice"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
                        </svg>
                      </button>
                      
                      {/* Delete Button */}
                      <button
                        className="btn btn-link p-0 text-danger"
                        onClick={() => onDelete(invoice)}
                        title="Delete Invoice"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                          <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="text-center py-5">
                  <div className="d-flex flex-column align-items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" className="text-muted mb-3" viewBox="0 0 16 16">
                      <path d="M9.293 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.707A1 1 0 0 0 13.707 4L10 .293A1 1 0 0 0 9.293 0zM9.5 3.5v-2l3 3h-2a1 1 0 0 1-1-1zM4.5 9a.5.5 0 0 1 0-1h7a.5.5 0 0 1 0 1h-7zM4 10.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm.5 2.5a.5.5 0 0 1 0-1h4a.5.5 0 0 1 0 1h-4z"/>
                    </svg>
                    <p className="fs-5 text-muted">No invoices found</p>
                    <p className="text-muted">Upload some invoices or add them manually</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InvoiceTable;