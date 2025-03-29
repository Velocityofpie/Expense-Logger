// frontend/src/features/tools/InvoicePreviewModal.tsx
import React, { useState, useEffect } from 'react';
import { Modal, Button, Spinner, Table, Badge, Row, Col, Card } from 'react-bootstrap';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface InvoicePreviewModalProps {
  invoiceId: string | number | null;
  show: boolean;
  onHide: () => void;
}

interface InvoiceItem {
  product_name: string;
  quantity: number;
  unit_price: number;
  item_type?: string;
}

interface Invoice {
  invoice_id: number;
  merchant_name: string;
  order_number?: string;
  purchase_date?: string;
  payment_method?: string;
  grand_total: number;
  status: string;
  items: InvoiceItem[];
  tags: string[];
  categories: string[];
  file_name?: string;
}

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

const InvoicePreviewModal: React.FC<InvoicePreviewModalProps> = ({ invoiceId, show, onHide }) => {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (show && invoiceId) {
      fetchInvoice();
    } else {
      setInvoice(null);
      setError(null);
    }
  }, [invoiceId, show]);
  
  const fetchInvoice = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_URL}/invoice/${invoiceId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch invoice data');
      }
      
      const data = await response.json();
      setInvoice(data);
    } catch (err) {
      setError('Error loading invoice data. Please try again.');
      console.error('Error fetching invoice:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const renderStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      'Open': 'primary',
      'Paid': 'success',
      'Draft': 'secondary',
      'Needs Attention': 'warning',
      'Resolved': 'info',
      'Overdue': 'danger'
    };
    
    const color = statusColors[status] || 'secondary';
    
    return <Badge bg={color}>{status}</Badge>;
  };
  
  const handleViewOriginalFile = () => {
    if (invoice?.file_name) {
      window.open(`${API_URL}/uploads/${invoice.file_name}`, '_blank');
    }
  };
  
  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      backdrop="static"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>
          Invoice Preview
          {invoice && invoice.order_number && (
            <span className="ms-2 text-muted fs-6">#{invoice.order_number}</span>
          )}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" role="status" variant="primary" />
            <p className="mt-3">Loading invoice data...</p>
          </div>
        ) : error ? (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        ) : invoice ? (
          <div>
            <Row className="mb-4">
              <Col md={6}>
                <h5>Invoice Details</h5>
                <Table bordered size="sm">
                  <tbody>
                    <tr>
                      <th style={{ width: '40%' }}>Merchant</th>
                      <td>{invoice.merchant_name || 'N/A'}</td>
                    </tr>
                    <tr>
                      <th>Order Number</th>
                      <td>{invoice.order_number || 'N/A'}</td>
                    </tr>
                    <tr>
                      <th>Date</th>
                      <td>{invoice.purchase_date ? formatDate(invoice.purchase_date) : 'N/A'}</td>
                    </tr>
                    <tr>
                      <th>Payment Method</th>
                      <td>{invoice.payment_method || 'N/A'}</td>
                    </tr>
                    <tr>
                      <th>Status</th>
                      <td>{renderStatusBadge(invoice.status)}</td>
                    </tr>
                  </tbody>
                </Table>
              </Col>
              <Col md={6}>
                <h5>Categories & Tags</h5>
                <div className="mb-3">
                  <strong>Categories:</strong>
                  <div className="mt-2">
                    {invoice.categories.length > 0 ? (
                      invoice.categories.map((category, index) => (
                        <Badge 
                          key={index} 
                          bg="primary" 
                          className="me-2 mb-2"
                        >
                          {category}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-muted">No categories</span>
                    )}
                  </div>
                </div>
                <div>
                  <strong>Tags:</strong>
                  <div className="mt-2">
                    {invoice.tags.length > 0 ? (
                      invoice.tags.map((tag, index) => (
                        <Badge 
                          key={index} 
                          bg="secondary" 
                          className="me-2 mb-2"
                        >
                          {tag}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-muted">No tags</span>
                    )}
                  </div>
                </div>
              </Col>
            </Row>
            
            <h5>Items</h5>
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.length > 0 ? (
                  invoice.items.map((item, index) => (
                    <tr key={index}>
                      <td>{item.product_name}</td>
                      <td>{item.quantity}</td>
                      <td>{formatCurrency(item.unit_price)}</td>
                      <td>{formatCurrency(item.quantity * item.unit_price)}</td>
                      <td>
                        {item.item_type ? (
                          <Badge bg="info">{item.item_type}</Badge>
                        ) : (
                          <span className="text-muted">N/A</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center">No items</td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr>
                  <th colSpan={3} className="text-end">Grand Total:</th>
                  <th>{formatCurrency(invoice.grand_total)}</th>
                  <th></th>
                </tr>
              </tfoot>
            </Table>
          </div>
        ) : (
          <div className="text-center py-5 text-muted">
            <p>No invoice selected</p>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        {invoice && invoice.file_name && (
          <Button 
            variant="outline-secondary" 
            onClick={handleViewOriginalFile}
            className="me-auto"
          >
            View Original File
          </Button>
        )}
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default InvoicePreviewModal;