# features/payments/schemas.py
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class CardBase(BaseModel):
    card_name: str
    
    model_config = ConfigDict(from_attributes=True)


class CardCreate(CardBase):
    user_id: Optional[int] = 1


class CardResponse(CardBase):
    card_id: int
    user_id: int
    created_at: datetime


class CardNumberBase(BaseModel):
    last_four: str
    expiration_date: str
    
    model_config = ConfigDict(from_attributes=True)


class CardNumberCreate(CardNumberBase):
    card_id: int


class CardNumberResponse(CardNumberBase):
    card_number_id: int
    card_id: int
    added_at: datetime


class PaymentBase(BaseModel):
    invoice_id: int
    card_number_id: int
    amount: float
    transaction_id: str
    
    model_config = ConfigDict(from_attributes=True)


class PaymentCreate(PaymentBase):
    pass


class PaymentResponse(PaymentBase):
    payment_id: int
    payment_date: datetime