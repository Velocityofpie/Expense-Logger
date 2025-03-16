import React, { useState, useEffect } from "react";
import { Card, Button, Form, ListGroup, Row, Col, Alert } from "react-bootstrap";

export default function Wishlist() {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for new wishlist item
  const [newItem, setNewItem] = useState({
    product_name: "",
    product_link: ""
  });
  
  // Success message state
  const [successMessage, setSuccessMessage] = useState("");
  
  // Load wishlist data
  useEffect(() => {
    fetchWishlist();
  }, []);
  
  // Fetch wishlist items
  const fetchWishlist = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // In a real app, you would call your API
      // const items = await getWishlist();
      
      // For now, we'll use mock data
      const mockItems = [
        {
          wishlist_id: 1,
          product_name: "Sony WH-1000XM4 Headphones",
          product_link: "https://www.example.com/headphones",
          added_at: "2023-05-15T10:30:00Z"
        },
        {
          wishlist_id: 2,
          product_name: "MacBook Pro M2",
          product_link: "https://www.example.com/macbook",
          added_at: "2023-06-20T14:45:00Z"
        },
        {
          wishlist_id: 3,
          product_name: "Kindle Paperwhite",
          product_link: "https://www.example.com/kindle",
          added_at: "2023-07-10T09:15:00Z"
        }
      ];
      
      setWishlistItems(mockItems);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      setError("Failed to load wishlist. Please try again.");
      setIsLoading(false);
    }
  };
  
  // Handle input change for new item
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewItem({
      ...newItem,
      [name]: value
    });
  };
  
  // Add item to wishlist
  const handleAddItem = async (e) => {
    e.preventDefault();
    
    if (!newItem.product_name) {
      setError("Please enter a product name.");
      return;
    }
    
    try {
      setError(null);
      
      // In a real app, you would call your API
      // const result = await addToWishlist(newItem.product_name, newItem.product_link);
      
      // For mock, we'll simulate adding an item
      const newWishlistItem = {
        wishlist_id: Math.floor(Math.random() * 1000) + 10,
        product_name: newItem.product_name,
        product_link: newItem.product_link,
        added_at: new Date().toISOString()
      };
      
      setWishlistItems([...wishlistItems, newWishlistItem]);
      
      // Reset form and show success message
      setNewItem({
        product_name: "",
        product_link: ""
      });
      
      setSuccessMessage("Item added to wishlist successfully!");
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      setError("Failed to add item to wishlist. Please try again.");
    }
  };
  
  // Remove item from wishlist
  const handleRemoveItem = async (itemId) => {
    try {
      // In a real app, you would call your API
      // await removeFromWishlist(itemId);
      
      // For mock, we'll filter out the removed item
      setWishlistItems(wishlistItems.filter(item => item.wishlist_id !== itemId));
      
      setSuccessMessage("Item removed from wishlist!");
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      setError("Failed to remove item from wishlist. Please try again.");
    }
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };
  
  if (isLoading) {
    return <div className="text-center p-5">Loading wishlist...</div>;
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-4">My Wishlist</h2>
      
      {successMessage && (
        <Alert variant="success" dismissible onClose={() => setSuccessMessage("")}>
          {successMessage}
        </Alert>
      )}
      
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      <Row>
        <Col md={4}>
          <Card>
            <Card.Header>
              <h5>Add New Item</h5>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleAddItem}>
                <Form.Group className="mb-3">
                  <Form.Label>Product Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter product name"
                    name="product_name"
                    value={newItem.product_name}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Product Link (Optional)</Form.Label>
                  <Form.Control
                    type="url"
                    placeholder="https://example.com/product"
                    name="product_link"
                    value={newItem.product_link}
                    onChange={handleInputChange}
                  />
                </Form.Group>
                
                <Button variant="primary" type="submit">
                  Add to Wishlist
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={8}>
          <Card>
            <Card.Header>
              <h5>Wishlist Items</h5>
            </Card.Header>
            <Card.Body>
              {wishlistItems.length === 0 ? (
                <p className="text-center">Your wishlist is empty. Add some items!</p>
              ) : (
                <ListGroup>
                  {wishlistItems.map(item => (
                    <ListGroup.Item 
                      key={item.wishlist_id}
                      className="d-flex justify-content-between align-items-start"
                    >
                      <div className="ms-2 me-auto">
                        <div className="fw-bold">{item.product_name}</div>
                        {item.product_link && (
                          <a href={item.product_link} target="_blank" rel="noopener noreferrer">
                            View Product
                          </a>
                        )}
                        <div className="text-muted small">
                          Added on {formatDate(item.added_at)}
                        </div>
                      </div>
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        onClick={() => handleRemoveItem(item.wishlist_id)}
                      >
                        Remove
                      </Button>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </Card.Body>
          </Card>
          
          {/* Additional Features Section */}
          <Card className="mt-4">
            <Card.Header>
              <h5>Wishlist Features</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <Card className="mb-3">
                    <Card.Body>
                      <h6>Track Price Changes</h6>
                      <p className="small">Enable price tracking for your wishlist items and get notified when prices drop.</p>
                      <Form.Check 
                        type="switch"
                        id="price-tracking"
                        label="Enable Price Tracking"
                      />
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card className="mb-3">
                    <Card.Body>
                      <h6>Availability Alerts</h6>
                      <p className="small">Get notified when out-of-stock items become available again.</p>
                      <Form.Check 
                        type="switch"
                        id="availability-alerts"
                        label="Enable Availability Alerts"
                      />
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card className="mb-3">
                    <Card.Body>
                      <h6>Share Wishlist</h6>
                      <p className="small">Create a shareable link to your wishlist.</p>
                      <Button size="sm" variant="outline-primary">
                        Generate Shareable Link
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card className="mb-3">
                    <Card.Body>
                      <h6>Export Wishlist</h6>
                      <p className="small">Export your wishlist to a CSV file.</p>
                      <Button size="sm" variant="outline-primary">
                        Export to CSV
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Recently Viewed Products Section */}
      {wishlistItems.length > 0 && (
        <Card className="mt-4">
          <Card.Header>
            <h5>Recently Viewed Products</h5>
          </Card.Header>
          <Card.Body>
            <Row>
              {wishlistItems.slice(0, 3).map(item => (
                <Col md={4} key={`recent-${item.wishlist_id}`}>
                  <Card className="mb-3">
                    <Card.Body>
                      <Card.Title>{item.product_name}</Card.Title>
                      <div className="mb-2">
                        <span className="text-muted small">Viewed on {formatDate(item.added_at)}</span>
                      </div>
                      <div className="d-flex justify-content-between">
                        {item.product_link && (
                          <Button size="sm" variant="outline-primary" href={item.product_link} target="_blank">
                            View
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="outline-success"
                          onClick={() => alert("Add to cart feature not implemented yet")}
                        >
                          Add to Cart
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card.Body>
        </Card>
      )}
    </div>
  );
}