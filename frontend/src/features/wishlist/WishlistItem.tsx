// src/features/wishlist/WishlistItem.tsx
import React, { useState } from 'react';
import { Card, Badge, Button, Modal, Form } from 'react-bootstrap';
import { WishlistItem as WishlistItemType } from './types';
import { updateWishlistItem, removeFromWishlist, enablePriceTracking } from './wishlistApi';

interface WishlistItemProps {
  item: WishlistItemType;
  onUpdate: (updatedItem: WishlistItemType) => void;
  onRemove: (id: number) => void;
}

const WishlistItem: React.FC<WishlistItemProps> = ({ item, onUpdate, onRemove }) => {
  // State for edit modal
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [editItem, setEditItem] = useState<WishlistItemType>({ ...item });
  
  // State for price tracking modal
  const [showPriceTrackingModal, setShowPriceTrackingModal] = useState<boolean>(false);
  const [desiredPrice, setDesiredPrice] = useState<number | undefined>(item.desired_price);
  
  // State for confirm delete modal
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  
  // State for loading indicators
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [isRemoving, setIsRemoving] = useState<boolean>(false);
  
  // Format currency
  const formatCurrency = (value?: number): string => {
    if (value === undefined) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };
  
  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Get badge color based on priority
  const getPriorityBadgeVariant = (priority?: string): string => {
    switch (priority) {
      case 'high':
        return 'danger';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'secondary';
    }
  };
  
  // Get badge color based on status
  const getStatusBadgeVariant = (status?: string): string => {
    switch (status) {
      case 'available':
        return 'success';
      case 'out_of_stock':
        return 'danger';
      case 'price_drop':
        return 'primary';
      default:
        return 'secondary';
    }
  };
  
  // Handle edit form changes
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setEditItem({
      ...editItem,
      [name]: type === 'number' ? (value === '' ? undefined : parseFloat(value)) : value
    });
  };
  
  // Handle form submission for edit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    
    try {
      const updatedItem = await updateWishlistItem(editItem);
      onUpdate(updatedItem);
      setShowEditModal(false);
    } catch (error) {
      console.error("Error updating wishlist item:", error);
      alert("Failed to update item. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Handle enabling price tracking
  const handleEnablePriceTracking = async () => {
    try {
      const updatedItem = await enablePriceTracking(item.wishlist_id, desiredPrice);
      onUpdate(updatedItem);
      setShowPriceTrackingModal(false);
    } catch (error) {
      console.error("Error enabling price tracking:", error);
      alert("Failed to enable price tracking. Please try again.");
    }
  };
  
  // Handle delete
  const handleDelete = async () => {
    setIsRemoving(true);
    
    try {
      await removeFromWishlist(item.wishlist_id);
      onRemove(item.wishlist_id);
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Error removing wishlist item:", error);
      alert("Failed to remove item. Please try again.");
    } finally {
      setIsRemoving(false);
    }
  };
  
  return (
    <>
      <Card className="mb-3 h-100 shadow-sm">
        {item.image_url && (
          <div 
            className="card-img-top" 
            style={{ 
              height: '160px', 
              backgroundImage: `url(${item.image_url})`,
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              backgroundColor: '#f8f9fa'
            }}
          />
        )}
        
        <Card.Body>
          <div className="d-flex justify-content-between align-items-start">
            <Card.Title className="mb-2 text-truncate" title={item.product_name}>
              {item.product_name}
            </Card.Title>
            
            {item.status && (
              <Badge bg={getStatusBadgeVariant(item.status)} className="ms-2">
                {item.status === 'price_drop' ? 'Price Drop!' : item.status.replace('_', ' ')}
              </Badge>
            )}
          </div>
          
          <div className="mb-2">
            {item.priority && (
              <Badge bg={getPriorityBadgeVariant(item.priority)} className="me-2">
                {item.priority}
              </Badge>
            )}
            
            {item.category && (
              <Badge bg="secondary">
                {item.category}
              </Badge>
            )}
          </div>
          
          <div className="mb-3">
            {item.price && (
              <div className="fs-5 fw-bold mb-1">
                {formatCurrency(item.price)}
              </div>
            )}
            
            {item.desired_price && (
              <div className="small text-muted">
                Target: {formatCurrency(item.desired_price)}
              </div>
            )}
          </div>
          
          {item.notes && (
            <Card.Text className="mb-3 small">
              {item.notes}
            </Card.Text>
          )}
          
          <div className="text-muted small mb-3">
            Added on {formatDate(item.added_at)}
          </div>
          
          <div className="d-flex flex-wrap gap-2">
            {item.product_link && (
              <Button
                variant="outline-primary"
                size="sm"
                href={item.product_link}
                target="_blank"
                rel="noopener noreferrer"
              >
                View Product
              </Button>
            )}
            
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => setShowEditModal(true)}
            >
              Edit
            </Button>
            
            <Button
              variant="outline-info"
              size="sm"
              onClick={() => setShowPriceTrackingModal(true)}
            >
              Track Price
            </Button>
            
            <Button
              variant="outline-danger"
              size="sm"
              onClick={() => setShowDeleteModal(true)}
            >
              Remove
            </Button>
          </div>
        </Card.Body>
      </Card>
      
      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Wishlist Item</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleEditSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Product Name</Form.Label>
              <Form.Control
                type="text"
                name="product_name"
                value={editItem.product_name}
                onChange={handleEditChange}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Product Link</Form.Label>
              <Form.Control
                type="url"
                name="product_link"
                value={editItem.product_link || ''}
                onChange={handleEditChange}
                placeholder="https://example.com/product"
              />
            </Form.Group>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Current Price</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    min="0"
                    name="price"
                    value={editItem.price || ''}
                    onChange={handleEditChange}
                    placeholder="0.00"
                  />
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Desired Price</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    min="0"
                    name="desired_price"
                    value={editItem.desired_price || ''}
                    onChange={handleEditChange}
                    placeholder="0.00"
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Priority</Form.Label>
                  <Form.Select
                    name="priority"
                    value={editItem.priority || ''}
                    onChange={handleEditChange}
                  >
                    <option value="">Select Priority</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Category</Form.Label>
                  <Form.Control
                    type="text"
                    name="category"
                    value={editItem.category || ''}
                    onChange={handleEditChange}
                    placeholder="e.g. Electronics"
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="notes"
                value={editItem.notes || ''}
                onChange={handleEditChange}
                placeholder="Add any notes about this item"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Image URL</Form.Label>
              <Form.Control
                type="url"
                name="image_url"
                value={editItem.image_url || ''}
                onChange={handleEditChange}
                placeholder="https://example.com/image.jpg"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleEditSubmit} 
            disabled={isUpdating}
          >
            {isUpdating ? 'Saving...' : 'Save Changes'}
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Price Tracking Modal */}
      <Modal show={showPriceTrackingModal} onHide={() => setShowPriceTrackingModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Set Price Alert</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Get notified when the price of <strong>{item.product_name}</strong> drops below your desired price.
          </p>
          
          <Form.Group className="mb-3">
            <Form.Label>Current Price</Form.Label>
            <Form.Control
              type="text"
              value={formatCurrency(item.price)}
              disabled
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Desired Price</Form.Label>
            <Form.Control
              type="number"
              step="0.01"
              min="0"
              value={desiredPrice || ''}
              onChange={(e) => setDesiredPrice(e.target.value === '' ? undefined : parseFloat(e.target.value))}
              placeholder="Enter your target price"
            />
            <Form.Text className="text-muted">
              You'll receive a notification when the price drops below this amount.
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPriceTrackingModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleEnablePriceTracking}
            disabled={!desiredPrice}
          >
            Enable Price Alert
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Removal</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to remove <strong>{item.product_name}</strong> from your wishlist?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDelete}
            disabled={isRemoving}
          >
            {isRemoving ? 'Removing...' : 'Remove Item'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default WishlistItem;