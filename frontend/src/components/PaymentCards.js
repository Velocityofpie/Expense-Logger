import React, { useState, useEffect } from "react";
import { Card, Button, Form, Table, Modal, Row, Col } from "react-bootstrap";

// Mock data - in a real app, you would fetch this from your API
const mockCards = [
  {
    card_id: 1,
    card_name: "Chase Freedom",
    created_at: "2023-01-01T00:00:00Z",
    card_numbers: [
      {
        card_number_id: 1,
        last_four: "4567",
        expiration_date: "2025-12-01",
        added_at: "2023-01-01T00:00:00Z"
      }
    ]
  },
  {
    card_id: 2,
    card_name: "American Express",
    created_at: "2023-02-15T00:00:00Z",
    card_numbers: [
      {
        card_number_id: 2,
        last_four: "1234",
        expiration_date: "2024-10-01",
        added_at: "2023-02-15T00:00:00Z"
      },
      {
        card_number_id: 3,
        last_four: "5678",
        expiration_date: "2026-08-01",
        added_at: "2023-08-20T00:00:00Z"
      }
    ]
  }
];

export default function PaymentCards() {
  const [cards, setCards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for modals
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [showAddCardNumberModal, setShowAddCardNumberModal] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState(null);
  
  // State for form fields
  const [newCardName, setNewCardName] = useState("");
  const [newCardNumber, setNewCardNumber] = useState({
    last_four: "",
    expiration_month: "",
    expiration_year: ""
  });
  
  // Load cards data
  useEffect(() => {
    // In a real app, you would fetch cards from your API
    // For now, we'll use the mock data
    setCards(mockCards);
    setIsLoading(false);
  }, []);
  
  // Handle add card
  const handleAddCard = async () => {
    if (!newCardName.trim()) {
      alert("Please enter a card name.");
      return;
    }
    
    try {
      // In a real app, you would call your API
      // const result = await addCard(newCardName);
      
      // For mock, we'll simulate adding a card
      const newCard = {
        card_id: Math.floor(Math.random() * 1000) + 10,
        card_name: newCardName,
        created_at: new Date().toISOString(),
        card_numbers: []
      };
      
      setCards([...cards, newCard]);
      setNewCardName("");
      setShowAddCardModal(false);
    } catch (error) {
      console.error("Error adding card:", error);
      setError("Failed to add card. Please try again.");
    }
  };
  
  // Handle add card number
  const handleAddCardNumber = async () => {
    const { last_four, expiration_month, expiration_year } = newCardNumber;
    
    if (!last_four || !expiration_month || !expiration_year) {
      alert("Please fill in all fields.");
      return;
    }
    
    if (last_four.length !== 4 || !/^\d{4}$/.test(last_four)) {
      alert("Last four digits must be exactly 4 numbers.");
      return;
    }
    
    try {
      // Format expiration date for API
      const expirationDate = `${expiration_year}-${expiration_month}-01`;
      
      // In a real app, you would call your API
      // const result = await addCardNumber(selectedCardId, last_four, expirationDate);
      
      // For mock, we'll simulate adding a card number
      const newCardNumberObj = {
        card_number_id: Math.floor(Math.random() * 1000) + 10,
        last_four,
        expiration_date: expirationDate,
        added_at: new Date().toISOString()
      };
      
      const updatedCards = cards.map(card => {
        if (card.card_id === selectedCardId) {
          return {
            ...card,
            card_numbers: [...card.card_numbers, newCardNumberObj]
          };
        }
        return card;
      });
      
      setCards(updatedCards);
      setNewCardNumber({
        last_four: "",
        expiration_month: "",
        expiration_year: ""
      });
      setShowAddCardNumberModal(false);
    } catch (error) {
      console.error("Error adding card number:", error);
      setError("Failed to add card number. Please try again.");
    }
  };
  
  // Open add card number modal
  const openAddCardNumberModal = (cardId) => {
    setSelectedCardId(cardId);
    setShowAddCardNumberModal(true);
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  // Format expiration date for display
  const formatExpirationDate = (dateString) => {
    const date = new Date(dateString);
    return `${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
  };
  
  if (isLoading) {
    return <div className="text-center p-5">Loading payment cards...</div>;
  }
  
  if (error) {
    return <div className="text-center p-5 text-danger">{error}</div>;
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Payment Cards</h2>
      
      <Button 
        variant="primary" 
        className="mb-4"
        onClick={() => setShowAddCardModal(true)}
      >
        Add New Card
      </Button>
      
      {cards.length === 0 ? (
        <Card className="text-center p-4">
          <Card.Body>
            <Card.Title>No Payment Cards</Card.Title>
            <Card.Text>
              You haven't added any payment cards yet. Click "Add New Card" to get started.
            </Card.Text>
          </Card.Body>
        </Card>
      ) : (
        <div>
          {cards.map(card => (
            <Card key={card.card_id} className="mb-4">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h4>{card.card_name}</h4>
                <Button 
                  variant="outline-primary" 
                  size="sm"
                  onClick={() => openAddCardNumberModal(card.card_id)}
                >
                  Add Card Number
                </Button>
              </Card.Header>
              <Card.Body>
                <p className="text-muted">Added on {formatDate(card.created_at)}</p>
                
                {card.card_numbers.length === 0 ? (
                  <p>No card numbers added yet.</p>
                ) : (
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>Last Four</th>
                        <th>Expiration</th>
                        <th>Added On</th>
                      </tr>
                    </thead>
                    <tbody>
                      {card.card_numbers.map(number => (
                        <tr key={number.card_number_id}>
                          <td>**** **** **** {number.last_four}</td>
                          <td>{formatExpirationDate(number.expiration_date)}</td>
                          <td>{formatDate(number.added_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </Card.Body>
            </Card>
          ))}
        </div>
      )}
      
      {/* Add Card Modal */}
      <Modal show={showAddCardModal} onHide={() => setShowAddCardModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Card</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Card Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g., Chase Freedom, Amex Gold"
                value={newCardName}
                onChange={(e) => setNewCardName(e.target.value)}
              />
              <Form.Text className="text-muted">
                Enter a descriptive name for this card.
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddCardModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddCard}>
            Add Card
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Add Card Number Modal */}
      <Modal show={showAddCardNumberModal} onHide={() => setShowAddCardNumberModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Card Number</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Last Four Digits</Form.Label>
              <Form.Control
                type="text"
                placeholder="1234"
                maxLength={4}
                value={newCardNumber.last_four}
                onChange={(e) => setNewCardNumber({...newCardNumber, last_four: e.target.value})}
              />
              <Form.Text className="text-muted">
                Enter only the last 4 digits of your card.
              </Form.Text>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Expiration Date</Form.Label>
              <Row>
                <Col>
                  <Form.Select
                    value={newCardNumber.expiration_month}
                    onChange={(e) => setNewCardNumber({...newCardNumber, expiration_month: e.target.value})}
                  >
                    <option value="">Month</option>
                    {Array.from({length: 12}, (_, i) => {
                      const month = i + 1;
                      return (
                        <option key={month} value={String(month).padStart(2, '0')}>
                          {String(month).padStart(2, '0')}
                        </option>
                      );
                    })}
                  </Form.Select>
                </Col>
                <Col>
                  <Form.Select
                    value={newCardNumber.expiration_year}
                    onChange={(e) => setNewCardNumber({...newCardNumber, expiration_year: e.target.value})}
                  >
                    <option value="">Year</option>
                    {Array.from({length: 10}, (_, i) => {
                      const year = new Date().getFullYear() + i;
                      return (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      );
                    })}
                  </Form.Select>
                </Col>
              </Row>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddCardNumberModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddCardNumber}>
            Add Card Number
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}