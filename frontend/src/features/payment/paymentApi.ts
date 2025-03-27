// src/features/payment/paymentApi.ts
import axios from 'axios';
import { Card, CardNumber, Payment, CardsResponse, CardResponse, CardNumberResponse } from './types';

// Get API URL from environment variables
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

/**
 * Get all payment cards for the current user
 */
export const getCards = async (): Promise<Card[]> => {
  try {
    const response = await axios.get<CardsResponse>(`${API_URL}/cards/`);
    return response.data.cards;
  } catch (error) {
    console.error("Error fetching payment cards:", error);
    throw error;
  }
};

/**
 * Get a specific card by ID
 */
export const getCardById = async (cardId: number): Promise<Card> => {
  try {
    const response = await axios.get<CardResponse>(`${API_URL}/cards/${cardId}`);
    return response.data.card;
  } catch (error) {
    console.error(`Error fetching card ${cardId}:`, error);
    throw error;
  }
};

/**
 * Create a new payment card
 */
export const createCard = async (cardName: string, cardType?: string): Promise<Card> => {
  try {
    const response = await axios.post<CardResponse>(`${API_URL}/cards/`, {
      card_name: cardName,
      card_type: cardType
    });
    return response.data.card;
  } catch (error) {
    console.error("Error creating payment card:", error);
    throw error;
  }
};

/**
 * Update an existing payment card
 */
export const updateCard = async (cardId: number, cardName: string, cardType?: string): Promise<Card> => {
  try {
    const response = await axios.put<CardResponse>(`${API_URL}/cards/${cardId}`, {
      card_name: cardName,
      card_type: cardType
    });
    return response.data.card;
  } catch (error) {
    console.error(`Error updating card ${cardId}:`, error);
    throw error;
  }
};

/**
 * Delete a payment card
 */
export const deleteCard = async (cardId: number): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/cards/${cardId}`);
  } catch (error) {
    console.error(`Error deleting card ${cardId}:`, error);
    throw error;
  }
};

/**
 * Add a new card number to an existing card
 */
export const addCardNumber = async (
  cardId: number, 
  lastFour: string, 
  expirationMonth: string, 
  expirationYear: string,
  isDefault?: boolean
): Promise<CardNumber> => {
  try {
    const expirationDate = `${expirationYear}-${expirationMonth}-01`;
    
    const response = await axios.post<CardNumberResponse>(`${API_URL}/cards/${cardId}/numbers`, {
      last_four: lastFour,
      expiration_date: expirationDate,
      is_default: isDefault || false
    });
    
    return response.data.card_number;
  } catch (error) {
    console.error(`Error adding card number to card ${cardId}:`, error);
    throw error;
  }
};

/**
 * Delete a card number
 */
export const deleteCardNumber = async (cardId: number, cardNumberId: number): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/cards/${cardId}/numbers/${cardNumberId}`);
  } catch (error) {
    console.error(`Error deleting card number ${cardNumberId}:`, error);
    throw error;
  }
};

/**
 * Make a payment using a card number
 */
export const makePayment = async (
  invoiceId: number, 
  cardNumberId: number, 
  amount: number, 
  transactionId?: string
): Promise<Payment> => {
  try {
    const response = await axios.post(`${API_URL}/payments/`, {
      invoice_id: invoiceId,
      card_number_id: cardNumberId,
      amount,
      transaction_id: transactionId || `TX-${Date.now()}`
    });
    
    return response.data.payment;
  } catch (error) {
    console.error("Error making payment:", error);
    throw error;
  }
};

/**
 * Get payment history for a specific invoice
 */
export const getPaymentsByInvoice = async (invoiceId: number): Promise<Payment[]> => {
  try {
    const response = await axios.get(`${API_URL}/payments/invoice/${invoiceId}`);
    return response.data.payments;
  } catch (error) {
    console.error(`Error fetching payments for invoice ${invoiceId}:`, error);
    throw error;
  }
};

/**
 * Get payment history for current user
 */
export const getUserPayments = async (): Promise<Payment[]> => {
  try {
    const response = await axios.get(`${API_URL}/payments/user`);
    return response.data.payments;
  } catch (error) {
    console.error("Error fetching user payments:", error);
    throw error;
  }
};