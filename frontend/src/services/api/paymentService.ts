import { get, post, put, del } from './client';
import { PaymentCard, CardNumber, PaymentTransaction, PaymentRequest, PaymentResponse } from '../../types/payment.types';

/**
 * Fetch all payment cards
 */
export const fetchPaymentCards = async (): Promise<PaymentCard[]> => {
  try {
    return await get<PaymentCard[]>('/payment-cards/');
  } catch (error) {
    console.error('Error fetching payment cards:', error);
    throw error;
  }
};

/**
 * Fetch a payment card by ID
 */
export const fetchPaymentCardById = async (cardId: number): Promise<PaymentCard> => {
  try {
    return await get<PaymentCard>(`/payment-cards/${cardId}`);
  } catch (error) {
    console.error(`Error fetching payment card ${cardId}:`, error);
    throw error;
  }
};

/**
 * Add a new payment card
 */
export const addPaymentCard = async (cardName: string): Promise<PaymentCard> => {
  try {
    return await post<PaymentCard, { card_name: string }>('/payment-cards/', { card_name: cardName });
  } catch (error) {
    console.error('Error adding payment card:', error);
    throw error;
  }
};

/**
 * Update a payment card
 */
export const updatePaymentCard = async (
  cardId: number,
  cardName: string
): Promise<PaymentCard> => {
  try {
    return await put<PaymentCard, { card_name: string }>(
      `/payment-cards/${cardId}`,
      { card_name: cardName }
    );
  } catch (error) {
    console.error(`Error updating payment card ${cardId}:`, error);
    throw error;
  }
};

/**
 * Delete a payment card
 */
export const deletePaymentCard = async (cardId: number): Promise<{ success: boolean; message: string }> => {
  try {
    return await del<{ success: boolean; message: string }>(`/payment-cards/${cardId}`);
  } catch (error) {
    console.error(`Error deleting payment card ${cardId}:`, error);
    throw error;
  }
};

/**
 * Add a card number to a payment card
 */
export const addCardNumber = async (
  cardId: number,
  lastFour: string,
  expirationDate: string
): Promise<CardNumber> => {
  try {
    const payload = {
      last_four: lastFour,
      expiration_date: expirationDate
    };
    
    return await post<CardNumber>(`/payment-cards/${cardId}/numbers`, payload);
  } catch (error) {
    console.error(`Error adding card number to payment card ${cardId}:`, error);
    throw error;
  }
};

/**
 * Delete a card number
 */
export const deleteCardNumber = async (
  cardNumberId: number
): Promise<{ success: boolean; message: string }> => {
  try {
    return await del<{ success: boolean; message: string }>(`/card-numbers/${cardNumberId}`);
  } catch (error) {
    console.error(`Error deleting card number ${cardNumberId}:`, error);
    throw error;
  }
};

/**
 * Make a payment
 */
export const makePayment = async (
  paymentRequest: PaymentRequest
): Promise<PaymentResponse> => {
  try {
    return await post<PaymentResponse, PaymentRequest>('/payments/', paymentRequest);
  } catch (error) {
    console.error('Error making payment:', error);
    throw error;
  }
};

/**
 * Get payment transactions by invoice ID
 */
export const getPaymentsByInvoiceId = async (
  invoiceId: number
): Promise<PaymentTransaction[]> => {
  try {
    return await get<PaymentTransaction[]>(`/payments/invoice/${invoiceId}`);
  } catch (error) {
    console.error(`Error fetching payments for invoice ${invoiceId}:`, error);
    throw error;
  }
};

/**
 * Get payment transactions by card number ID
 */
export const getPaymentsByCardNumberId = async (
  cardNumberId: number
): Promise<PaymentTransaction[]> => {
  try {
    return await get<PaymentTransaction[]>(`/payments/card-number/${cardNumberId}`);
  } catch (error) {
    console.error(`Error fetching payments for card number ${cardNumberId}:`, error);
    throw error;
  }
};

export default {
  fetchPaymentCards,
  fetchPaymentCardById,
  addPaymentCard,
  updatePaymentCard,
  deletePaymentCard,
  addCardNumber,
  deleteCardNumber,
  makePayment,
  getPaymentsByInvoiceId,
  getPaymentsByCardNumberId
};