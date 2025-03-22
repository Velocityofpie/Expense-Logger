// Interface for card number
export interface CardNumber {
    card_number_id: number;
    last_four: string;
    expiration_date: string;
    added_at: string;
  }
  
  // Interface for payment card
  export interface PaymentCard {
    card_id: number;
    card_name: string;
    created_at: string;
    card_numbers: CardNumber[];
  }
  
  // Interface for payment transaction
  export interface PaymentTransaction {
    transaction_id: string;
    payment_id: number;
    invoice_id: number;
    card_number_id: number;
    amount: number;
    payment_date: string;
    status: string;
  }
  
  // Interface for payment request
  export interface PaymentRequest {
    invoice_id: number;
    card_number_id: number;
    amount: number;
    transaction_id: string;
  }
  
  // Interface for payment response
  export interface PaymentResponse {
    payment_id: number;
    invoice_id: number;
    transaction_id: string;
    amount: number;
    status: string;
    created_at: string;
  }