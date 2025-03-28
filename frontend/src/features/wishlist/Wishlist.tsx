// src/features/wishlist/Wishlist.tsx
import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Button, 
  Form, 
  InputGroup, 
  Alert,
  Spinner,
  Modal,
  Table,
  Badge
} from 'react-bootstrap';
import { 
  WishlistItem as WishlistItemType, 
  WishlistFilters,
  CreateWishlistItemRequest 
} from './types';
import WishlistItem from './WishlistItem';
import { fetchWishlist, addToWishlist } from './wishlistApi';

const Wishlist: React.FC = () => {
  // State for wishlist items
  const [wishlistItems, setWishlistItems] = useState<WishlistItemType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>("");
  
  // State for filtering and sorting
  const [filters, setFilters] = useState<WishlistFilters>({
    sort_by: 'date_added',
    sort_direction: 'desc'
  });
  
  // State for the new item form
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newItem, setNewItem] = useState<CreateWishlistItemRequest>({
    product_name: '',
    product_link: '',
    price: undefined,
    desired_price: undefined,
    priority: undefined,
    notes: '',
    category: ''
  });
  
  // State for active view tab
  const [activeView, setActiveView] = useState<string>('grid');
  
  // Load wishlist data
  useEffect(() => {
    loadWishlist();
  }, []);
  
  // Load wishlist with filters
  const loadWishlist = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const items = await fetchWishlist(filters);
      setWishlistItems(items);
      
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      setError("Failed to load wishlist. Please try again.");
      setIsLoading(false);
    }
  };
  
  // Apply filters when they change
  useEffect(() => {
    loadWishlist();
  }, [filters]);
  
  // Handle input change for new item form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setNewItem({
      ...newItem,
      [name]: type === 'number' ? (value === '' ? undefined : parseFloat(value)) : value
    });
  };
  
  // Handle form submission for new item
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newItem.product_name) {
      alert("Please enter a product name.");
      return;
    }
    
    try {
      setIsLoading(true);
      
      const addedItem = await addToWishlist(newItem);
      
      // Update state with the new item
      setWishlistItems([addedItem, ...wishlistItems]);
      
      // Reset form and show success message
      setNewItem({
        product_name: '',
        product_link: '',
        price: undefined,
        desired_price: undefined,
        priority: undefined,
        notes: '',
        category: ''
      });
      
      setShowAddForm(false);
      setSuccessMessage("Item added to wishlist successfully!");
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
      
      setIsLoading(false);
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      setError("Failed to add item to wishlist. Please try again.");
      setIsLoading(false);
    }
  };
  
  // Handle updating wishlist item
  const handleUpdateItem = (updatedItem: WishlistItemType) => {
    setWishlistItems(wishlistItems.map(item => 
      item.wishlist_id === updatedItem.wishlist_id ? updatedItem : item
    ));
    
    setSuccessMessage("Item updated successfully!");
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccessMessage("");
    }, 3000);
  };
  
  // Handle removing wishlist item
  const handleRemoveItem = (id: number) => {
    setWishlistItems(wishlistItems.filter(item => item.wishlist_id !== id));
    
    setSuccessMessage("Item removed from wishlist!");
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccessMessage("");
    }, 3000);
  };
  
  // Handle search term change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({
      ...filters,
      search: e.target.value || undefined
    });
  };
  
  // Handle category filter change
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters({
      ...filters,
      category: e.target.value === 'All' ? undefined : e.target.value
    });
  };
  
  // Handle priority filter change
  const handlePriorityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters({
      ...filters,
      priority: e.target.value === 'All' ? undefined : e.target.value as 'low' | 'medium' | 'high'
    });
  };
  
  // Handle sort change
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [sortBy, sortDirection] = e.target.value.split('-');
    
    setFilters({
      ...filters,
      sort_by: sortBy as 'name' | 'price' | 'priority' | 'date_added',
      sort_direction: sortDirection as 'asc' | 'desc'
    });
  };
  
  // Reset all filters
  const resetFilters = () => {
    setFilters({
      sort_by: 'date_added',
      sort_direction: 'desc'
    });
  };
  
  // Get unique categories from items
  const getCategories = (): string[] => {
    const categorySet = new Set<string>();
    
    wishlistItems.forEach(item => {
      if (item.category) {
        categorySet.add(item.category);
      }
    });
    
    return ['All', ...Array.from(categorySet)];
  };
  
  // Format currency
  const formatCurrency = (value?: number): string => {
    if (value === undefined) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };
  
  return (
    <Container className="py-5">
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <h1 className="mb-1">My Wishlist</h1>
          <p className="text-muted">Keep track of items you want to purchase</p>
        </div>
        
        <Button 
          variant="primary" 
          onClick={() => setShowAddForm(!showAddForm)}
          className="d-flex align-items-center"
        >
          {showAddForm ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-x-lg me-2" viewBox="0 0 16 16">
                <path d="M1.293 1.293a1 1 0 0 1 1.414 0L8 6.586l5.293-5.293a1 1 0 1 1 1.414 1.414L9.414 8l5.293 5.293a1 1 0 0 1-1.414 1.414L8 9.414l-5.293 5.293a1 1 0 0 1-1.414-1.414L6.586 8 1.293 2.707a1 1 0 0 1 0-1.414z"/>
              </svg>
              Cancel
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-plus-lg me-2" viewBox="0 0 16 16">
                <path d="M8 0a1 1 0 0 1 1 1v6h6a1 1 0 1 1 0 2H9v6a1 1 0 1 1-2 0V9H1a1 1 0 0 1 0-2h6V1a1 1 0 0 1 1-1z"/>
              </svg>
              Add New Item
            </>
          )}
        </Button>
      </div>
      
      {successMessage && (
        <Alert 
          variant="success" 
          dismissible 
          onClose={() => setSuccessMessage("")}
          className="mb-4"
        >
          {successMessage}
        </Alert>
      )}
      
      {error && (
        <Alert 
          variant="danger" 
          dismissible 
          onClose={() => setError(null)}
          className="mb-4"
        >
          {error}
        </Alert>
      )}
      
      {/* Add Item Form */}
      {showAddForm && (
        <Card className="mb-4 shadow-sm">
          <Card.Header>
            <h5 className="mb-0">Add New Item</h5>
          </Card.Header>
          <Card.Body>
            <Form onSubmit={handleAddItem}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Product Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="product_name"
                      value={newItem.product_name}
                      onChange={handleInputChange}
                      placeholder="Enter product name"
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Product Link (Optional)</Form.Label>
                    <Form.Control
                      type="url"
                      name="product_link"
                      value={newItem.product_link || ''}
                      onChange={handleInputChange}
                      placeholder="https://example.com/product"
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <Row>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Current Price</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>$</InputGroup.Text>
                      <Form.Control
                        type="number"
                        step="0.01"
                        min="0"
                        name="price"
                        value={newItem.price || ''}
                        onChange={handleInputChange}
                        placeholder="0.00"
                      />
                    </InputGroup>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Desired Price</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>$</InputGroup.Text>
                      <Form.Control
                        type="number"
                        step="0.01"
                        min="0"
                        name="desired_price"
                        value={newItem.desired_price || ''}
                        onChange={handleInputChange}
                        placeholder="0.00"
                      />
                    </InputGroup>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Priority</Form.Label>
                    <Form.Select
                      name="priority"
                      value={newItem.priority || ''}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Priority</option>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Category</Form.Label>
                    <Form.Control
                      type="text"
                      name="category"
                      value={newItem.category || ''}
                      onChange={handleInputChange}
                      placeholder="e.g. Electronics"
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <Form.Group className="mb-3">
                <Form.Label>Notes (Optional)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="notes"
                  value={newItem.notes || ''}
                  onChange={handleInputChange}
                  placeholder="Add any notes about this item"
                />
              </Form.Group>
              
              <div className="d-flex justify-content-end">
                <Button 
                  type="submit" 
                  variant="primary"
                  disabled={isLoading || !newItem.product_name}
                >
                  {isLoading ? (
                    <>
                      <Spinner 
                        as="span" 
                        animation="border" 
                        size="sm" 
                        role="status" 
                        aria-hidden="true" 
                        className="me-2"
                      />
                      Adding...
                    </>
                  ) : (
                    'Add to Wishlist'
                  )}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      )}
      
      {/* Filters and View Options */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Row className="align-items-end">
            <Col md={4}>
              <Form.Group className="mb-md-0 mb-3">
                <Form.Label>Search</Form.Label>
                <InputGroup>
                  <Form.Control
                    type="text"
                    placeholder="Search products..."
                    value={filters.search || ''}
                    onChange={handleSearchChange}
                  />
                  {filters.search && (
                    <Button 
                      variant="outline-secondary" 
                      onClick={() => setFilters({...filters, search: undefined})}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-x" viewBox="0 0 16 16">
                        <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                      </svg>
                    </Button>
                  )}
                </InputGroup>
              </Form.Group>
            </Col>
            
            <Col md={2}>
              <Form.Group className="mb-md-0 mb-3">
                <Form.Label>Category</Form.Label>
                <Form.Select
                  value={filters.category || 'All'}
                  onChange={handleCategoryChange}
                >
                  {getCategories().map((category, index) => (
                    <option key={index} value={category}>
                      {category}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            
            <Col md={2}>
              <Form.Group className="mb-md-0 mb-3">
                <Form.Label>Priority</Form.Label>
                <Form.Select
                  value={filters.priority || 'All'}
                  onChange={handlePriorityChange}
                >
                  <option value="All">All Priorities</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </Form.Select>
              </Form.Group>
            </Col>
            
            <Col md={2}>
              <Form.Group className="mb-md-0 mb-3">
                <Form.Label>Sort By</Form.Label>
                <Form.Select
                  value={`${filters.sort_by || 'date_added'}-${filters.sort_direction || 'desc'}`}
                  onChange={handleSortChange}
                >
                  <option value="date_added-desc">Newest First</option>
                  <option value="date_added-asc">Oldest First</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name-asc">Name: A to Z</option>
                  <option value="name-desc">Name: Z to A</option>
                  <option value="priority-desc">Priority: High to Low</option>
                  <option value="priority-asc">Priority: Low to High</option>
                </Form.Select>
              </Form.Group>
            </Col>
            
            <Col md={2}>
              <div className="d-flex gap-2">
                <Button 
                  variant="outline-secondary" 
                  className="w-100"
                  onClick={resetFilters}
                >
                  Reset
                </Button>
                
                <div className="btn-group">
                  <Button
                    variant={activeView === 'grid' ? 'primary' : 'outline-primary'}
                    onClick={() => setActiveView('grid')}
                    title="Grid View"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-grid" viewBox="0 0 16 16">
                      <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5v-3zM2.5 2a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zm6.5.5A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zM1 10.5A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zm6.5.5A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3a1.5 1.5 0 0 1-1.5-1.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3z"/>
                    </svg>
                  </Button>
                  <Button
                    variant={activeView === 'list' ? 'primary' : 'outline-primary'}
                    onClick={() => setActiveView('list')}
                    title="List View"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-list" viewBox="0 0 16 16">
                      <path fillRule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"/>
                    </svg>
                  </Button>
                </div>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      {/* Wishlist Items */}
      {isLoading ? (
        <div className="text-center py-5">
          <Spinner animation="border" role="status" className="mb-3">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="text-muted">Loading wishlist items...</p>
        </div>
      ) : wishlistItems.length === 0 ? (
        <Card className="text-center shadow-sm p-5">
          <div className="py-5">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" className="bi bi-heart text-muted mb-4" viewBox="0 0 16 16">
              <path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01L8 2.748zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143c.06.055.119.112.176.171a3.12 3.12 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15z"/>
            </svg>
            <h3>Your wishlist is empty</h3>
            <p className="text-muted">Add some items to your wishlist to get started!</p>
            <Button 
              variant="primary" 
              onClick={() => setShowAddForm(true)}
              className="mt-3"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-plus-lg me-2" viewBox="0 0 16 16">
                <path d="M8 0a1 1 0 0 1 1 1v6h6a1 1 0 1 1 0 2H9v6a1 1 0 1 1-2 0V9H1a1 1 0 0 1 0-2h6V1a1 1 0 0 1 1-1z"/>
              </svg>
              Add Item
            </Button>
          </div>
        </Card>
      ) : (
        <>
          {activeView === 'grid' ? (
            <Row xs={1} md={2} lg={3} className="g-4">
              {wishlistItems.map((item) => (
                <Col key={item.wishlist_id}>
                  <WishlistItem 
                    item={item} 
                    onUpdate={handleUpdateItem}
                    onRemove={handleRemoveItem}
                  />
                </Col>
              ))}
            </Row>
          ) : (
            <Card className="shadow-sm">
              <Table striped hover responsive className="mb-0">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Priority</th>
                    <th>Price</th>
                    <th>Target Price</th>
                    <th>Date Added</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {wishlistItems.map((item) => (
                    <tr key={item.wishlist_id}>
                      <td>
                        <div className="d-flex align-items-center">
                          {item.product_name}
                          {item.status === 'price_drop' && (
                            <Badge bg="primary" className="ms-2">
                              Price Drop!
                            </Badge>
                          )}
                        </div>
                        {item.category && (
                          <small className="text-muted d-block">
                            {item.category}
                          </small>
                        )}
                      </td>
                      <td>
                        {item.priority && (
                          <Badge bg={
                            item.priority === 'high' ? 'danger' : 
                            item.priority === 'medium' ? 'warning' : 'info'
                          }>
                            {item.priority}
                          </Badge>
                        )}
                      </td>
                      <td>{item.price ? formatCurrency(item.price) : '-'}</td>
                      <td>{item.desired_price ? formatCurrency(item.desired_price) : '-'}</td>
                      <td>{new Date(item.added_at).toLocaleDateString()}</td>
                      <td>
                        <div className="d-flex gap-2">
                          {item.product_link && (
                            <Button
                              variant="outline-primary"
                              size="sm"
                              href={item.product_link}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              View
                            </Button>
                          )}
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => {
                              setShowAddForm(true);
                              // Pre-fill form with item data for editing
                              setNewItem({
                                product_name: item.product_name,
                                product_link: item.product_link,
                                price: item.price,
                                desired_price: item.desired_price,
                                priority: item.priority,
                                notes: item.notes,
                                category: item.category
                              });
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleRemoveItem(item.wishlist_id)}
                          >
                            Remove
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card>
          )}
          
          {/* Feature cards */}
          <div className="mt-5">
            <h4 className="mb-4">Wishlist Features</h4>
            <Row xs={1} md={2} lg={4} className="g-4">
              <Col>
                <Card className="h-100 shadow-sm">
                  <Card.Body className="d-flex flex-column align-items-center text-center p-4">
                    <div className="rounded-circle bg-primary bg-opacity-10 p-3 mb-3">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-graph-down text-primary" viewBox="0 0 16 16">
                        <path fillRule="evenodd" d="M0 0h1v15h15v1H0V0Zm14.817 11.887a.5.5 0 0 0 .07-.704l-4.5-5.5a.5.5 0 0 0-.74-.037L7.06 8.233 3.404 3.206a.5.5 0 0 0-.808.588l4 5.5a.5.5 0 0 0 .758.06l2.609-2.61 4.15 5.073a.5.5 0 0 0 .704.07Z"/>
                      </svg>
                    </div>
                    <h5>Price Tracking</h5>
                    <p className="text-muted mb-4">Get notified when prices drop below your desired amount</p>
                    <div className="mt-auto">
                      <Form.Check 
                        type="switch"
                        id="price-tracking"
                        label="Enable Price Tracking"
                        defaultChecked={true}
                      />
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              
              <Col>
                <Card className="h-100 shadow-sm">
                  <Card.Body className="d-flex flex-column align-items-center text-center p-4">
                    <div className="rounded-circle bg-success bg-opacity-10 p-3 mb-3">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-bell text-success" viewBox="0 0 16 16">
                        <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2zM8 1.918l-.797.161A4.002 4.002 0 0 0 4 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4.002 4.002 0 0 0-3.203-3.92L8 1.917zM14.22 12c.223.447.481.801.78 1H1c.299-.199.557-.553.78-1C2.68 10.2 3 6.88 3 6c0-2.42 1.72-4.44 4.005-4.901a1 1 0 1 1 1.99 0A5.002 5.002 0 0 1 13 6c0 .88.32 4.2 1.22 6z"/>
                      </svg>
                    </div>
                    <h5>Stock Alerts</h5>
                    <p className="text-muted mb-4">Receive notifications when out-of-stock items become available</p>
                    <div className="mt-auto">
                      <Form.Check 
                        type="switch"
                        id="stock-alerts"
                        label="Enable Stock Alerts"
                        defaultChecked={true}
                      />
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              
              <Col>
                <Card className="h-100 shadow-sm">
                  <Card.Body className="d-flex flex-column align-items-center text-center p-4">
                    <div className="rounded-circle bg-warning bg-opacity-10 p-3 mb-3">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-share text-warning" viewBox="0 0 16 16">
                        <path d="M13.5 1a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM11 2.5a2.5 2.5 0 1 1 .603 1.628l-6.718 3.12a2.499 2.499 0 0 1 0 1.504l6.718 3.12a2.5 2.5 0 1 1-.488.876l-6.718-3.12a2.5 2.5 0 1 1 0-3.256l6.718-3.12A2.5 2.5 0 0 1 11 2.5zm-8.5 4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm11 5.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z"/>
                      </svg>
                    </div>
                    <h5>Share Wishlist</h5>
                    <p className="text-muted mb-4">Create a shareable link to your wishlist</p>
                    <div className="mt-auto">
                      <Button variant="outline-warning">
                        Generate Link
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              
              <Col>
                <Card className="h-100 shadow-sm">
                  <Card.Body className="d-flex flex-column align-items-center text-center p-4">
                    <div className="rounded-circle bg-info bg-opacity-10 p-3 mb-3">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-file-earmark-arrow-down text-info" viewBox="0 0 16 16">
                        <path d="M8.5 6.5a.5.5 0 0 0-1 0v3.793L6.354 9.146a.5.5 0 1 0-.708.708l2 2a.5.5 0 0 0 .708 0l2-2a.5.5 0 0 0-.708-.708L8.5 10.293V6.5z"/>
                        <path d="M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2zM9.5 3A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5v2z"/>
                      </svg>
                    </div>
                    <h5>Export Wishlist</h5>
                    <p className="text-muted mb-4">Download your wishlist as a CSV file</p>
                    <div className="mt-auto">
                      <Button variant="outline-info">
                        Export to CSV
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </div>
        </>
      )}
    </Container>
  );
};

export default Wishlist;