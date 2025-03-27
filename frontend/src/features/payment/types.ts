// src/features/payment/types.ts

// Card type represents a payment card (credit, debit, etc.)
export interface Card {
    card_id: number;
    card_name: string;
    card_type?: string; // Visa, Mastercard, etc.
    created_at: string;
    card_numbers: CardNumber[];
  }
  
  // CardNumber represents an individual card number (a card can have multiple numbers)
  export interface CardNumber {
    card_number_id: number;
    last_four: string;
    expiration_date: string;
    added_at: string;
    is_default?: boolean;
  }
  
  // Payment represents a payment transaction
  export interface Payment {
    payment_id: number;
    invoice_id: number;
    card_number_id: number;
    amount: number;
    transaction_id: string;
    payment_date: string;
    status: PaymentStatus;
  }
  
  // Payment statuses
  export enum PaymentStatus {
    Pending = "Pending",
    Completed = "Completed",
    Failed = "Failed",
    Refunded = "Refunded"
  }
  
  // Form states for creating/editing cards
  export interface CardFormState {
    card_name: string;
    card_type: string;
    last_four: string;
    expiration_month: string;
    expiration_year: string;
  }
  
  // API response types
  export interface CardsResponse {
    cards: Card[];
  }
  
  export interface CardResponse {
    card: Card;
  }
  
  export interface CardNumberResponse {
    card_number: CardNumber;
  }
  
  export interface PaymentResponse {
    payment: Payment;
  }