// src/components/payment/PaymentCards.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody, CardFooter } from '../common/Card';
import { Button } from '../common/Button';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../common/Table';
import AddCardModal from './AddCardModal';
import AddCardNumberModal from './AddCardNumberModal';
import CardItem from './CardItem';
import CardNumbersList from './CardNumbersList';

// Type definitions
export interface CardNumber {
  card_number_id: number;
  last_four: string;
  expiration_date: string;
  added_at: string;
}

export interface PaymentCard {
  card_id: number;
  card_name: string;
  created_at: string;
  card_numbers: CardNumber[];
}

// Mock data - in a real app, you would fetch this from your API
const mockCards: PaymentCard[] = [
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

const PaymentCards: React.FC = () => {
  const [cards, setCards] = useState<PaymentCard[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for modals
  const [showAddCardModal, setShowAddCardModal] = useState<boolean>(false);
  const [showAddCardNumberModal, setShowAddCardNumberModal] = useState<boolean>(false);
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  
  // Load cards data
  useEffect(() => {
    // In a real app, you would fetch cards from your API
    // For now, we'll use the mock data
    setCards(mockCards);
    setIsLoading(false);
  }, []);
  
  // Handle add card
  const handleAddCard = async (cardName: string): Promise<void> => {
    if (!cardName.trim()) {
      setError("Please enter a card name.");
      return;
    }
    
    try {
      // In a real app, you would call your API
      // const result = await addCard(cardName);
      
      // For mock, we'll simulate adding a card
      const newCard: PaymentCard = {
        card_id: Math.floor(Math.random() * 1000) + 10,
        card_name: cardName,
        created_at: new Date().toISOString(),
        card_numbers: []
      };
      
      setCards([...cards, newCard]);
      setShowAddCardModal(false);
      setError(null);
    } catch (error) {
      console.error("Error adding card:", error);
      setError("Failed to add card. Please try again.");
    }
  };
  
  // Handle add card number
  const handleAddCardNumber = async (
    cardId: number, 
    lastFour: string, 
    expirationMonth: string, 
    expirationYear: string
  ): Promise<void> => {
    if (!lastFour || !expirationMonth || !expirationYear) {
      setError("Please fill in all fields.");
      return;
    }
    
    if (lastFour.length !== 4 || !/^\d{4}$/.test(lastFour)) {
      setError("Last four digits must be exactly 4 numbers.");
      return;
    }
    
    try {
      // Format expiration date for API
      const expirationDate = `${expirationYear}-${expirationMonth}-01`;
      
      // In a real app, you would call your API
      // const result = await addCardNumber(cardId, lastFour, expirationDate);
      
      // For mock, we'll simulate adding a card number
      const newCardNumber: CardNumber = {
        card_number_id: Math.floor(Math.random() * 1000) + 10,
        last_four: lastFour,
        expiration_date: expirationDate,
        added_at: new Date().toISOString()
      };
      
      const updatedCards = cards.map(card => {
        if (card.card_id === cardId) {
          return {
            ...card,
            card_numbers: [...card.card_numbers, newCardNumber]
          };
        }
        return card;
      });
      
      setCards(updatedCards);
      setShowAddCardNumberModal(false);
      setSelectedCardId(null);
      setError(null);
    } catch (error) {
      console.error("Error adding card number:", error);
      setError("Failed to add card number. Please try again.");
    }
  };
  
  // Open add card number modal
  const openAddCardNumberModal = (cardId: number): void => {
    setSelectedCardId(cardId);
    setShowAddCardNumberModal(true);
  };
  
  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  if (isLoading) {
    return <div className="text-center p-5">Loading payment cards...</div>;
  }
  
  if (error) {
    return <div className="text-center p-5 text-red-600">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-dark-text-primary">
          Payment Cards
        </h2>
        
        <Button 
          variant="primary" 
          onClick={() => setShowAddCardModal(true)}
        >
          Add New Card
        </Button>
      </div>
      
      {cards.length === 0 ? (
        <Card className="text-center p-4">
          <CardBody>
            <h3 className="text-lg font-medium mb-2">No Payment Cards</h3>
            <p className="text-gray-500 dark:text-dark-text-secondary">
              You haven't added any payment cards yet. Click "Add New Card" to get started.
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-4">
          {cards.map(card => (
            <CardItem 
              key={card.card_id} 
              card={card} 
              onAddCardNumber={() => openAddCardNumberModal(card.card_id)}
              formatDate={formatDate}
            />
          ))}
        </div>
      )}
      
      {/* Add Card Modal */}
      <AddCardModal
        show={showAddCardModal}
        onClose={() => setShowAddCardModal(false)}
        onAddCard={handleAddCard}
      />
      
      {/* Add Card Number Modal */}
      <AddCardNumberModal
        show={showAddCardNumberModal}
        onClose={() => {
          setShowAddCardNumberModal(false);
          setSelectedCardId(null);
        }}
        onAddCardNumber={(lastFour, expirationMonth, expirationYear) => {
          if (selectedCardId !== null) {
            handleAddCardNumber(selectedCardId, lastFour, expirationMonth, expirationYear);
          }
        }}
      />
    </div>
  );
};

export default PaymentCards;