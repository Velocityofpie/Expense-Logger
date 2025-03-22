// src/hooks/usePaymentCards.ts
import { useState, useEffect, useCallback } from 'react';

// Define interfaces for payment card data
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

export interface UsePaymentCardsResult {
  cards: PaymentCard[];
  isLoading: boolean;
  error: string | null;
  fetchCards: () => Promise<void>;
  addCard: (cardName: string) => Promise<PaymentCard>;
  addCardNumber: (cardId: number, lastFour: string, expirationDate: string) => Promise<CardNumber>;
  deleteCard: (cardId: number) => Promise<void>;
  deleteCardNumber: (cardId: number, cardNumberId: number) => Promise<void>;
}

// Mock data for simulation
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

export function usePaymentCards(): UsePaymentCardsResult {
  const [cards, setCards] = useState<PaymentCard[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all cards
  const fetchCards = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // In a real app, you would fetch from your API
      // For now, we'll use the mock data
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setCards(mockCards);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to fetch payment cards');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Add a new card
  const addCard = useCallback(async (cardName: string): Promise<PaymentCard> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Validate
      if (!cardName.trim()) {
        throw new Error('Card name is required');
      }
      
      // In a real app, you would call your API
      // For simulation:
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const newCard: PaymentCard = {
        card_id: Math.floor(Math.random() * 1000) + 10,
        card_name: cardName,
        created_at: new Date().toISOString(),
        card_numbers: []
      };
      
      setCards(prevCards => [...prevCards, newCard]);
      
      return newCard;
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to add card');
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Add a card number to an existing card
  const addCardNumber = useCallback(async (
    cardId: number, 
    lastFour: string, 
    expirationDate: string
  ): Promise<CardNumber> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Validate
      if (lastFour.length !== 4 || !/^\d{4}$/.test(lastFour)) {
        throw new Error('Last four digits must be exactly 4 numbers');
      }
      
      if (!expirationDate) {
        throw new Error('Expiration date is required');
      }
      
      // In a real app, you would call your API
      // For simulation:
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const newCardNumber: CardNumber = {
        card_number_id: Math.floor(Math.random() * 1000) + 10,
        last_four: lastFour,
        expiration_date: expirationDate,
        added_at: new Date().toISOString()
      };
      
      setCards(prevCards => 
        prevCards.map(card => {
          if (card.card_id === cardId) {
            return {
              ...card,
              card_numbers: [...card.card_numbers, newCardNumber]
            };
          }
          return card;
        })
      );
      
      return newCardNumber;
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to add card number');
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Delete a card
  const deleteCard = useCallback(async (cardId: number): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // In a real app, you would call your API
      // For simulation:
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setCards(prevCards => prevCards.filter(card => card.card_id !== cardId));
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to delete card');
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Delete a card number
  const deleteCardNumber = useCallback(async (
    cardId: number, 
    cardNumberId: number
  ): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // In a real app, you would call your API
      // For simulation:
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setCards(prevCards => 
        prevCards.map(card => {
          if (card.card_id === cardId) {
            return {
              ...card,
              card_numbers: card.card_numbers.filter(
                cardNumber => cardNumber.card_number_id !== cardNumberId
              )
            };
          }
          return card;
        })
      );
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to delete card number');
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load cards on mount
  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  return {
    cards,
    isLoading,
    error,
    fetchCards,
    addCard,
    addCardNumber,
    deleteCard,
    deleteCardNumber
  };
}

export default usePaymentCards;