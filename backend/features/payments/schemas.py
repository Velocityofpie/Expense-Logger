# backend/schemas/payment.py
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel

class CardBase(BaseModel):
    card_name: str
    
    class Config:
        orm_mode = True


class CardCreate(CardBase):
    user_id: Optional[int] = 1


class CardResponse(CardBase):
    card_id: int
    user_id: int
    created_at: datetime
    
    class Config:
        orm_mode = True


class CardNumberBase(BaseModel):
    last_four: str
    expiration_date: str
    
    class Config:
        orm_mode = True


class CardNumberCreate(CardNumberBase):
    card_id: int


class CardNumberResponse(CardNumberBase):
    card_number_id: int
    card_id: int
    added_at: datetime
    
    class Config:
        orm_mode = True


class PaymentBase(BaseModel):
    invoice_id: int
    card_number_id: int
    amount: float
    transaction_id: str
    
    class Config:
        orm_mode = True


class PaymentCreate(PaymentBase):
    pass


class PaymentResponse(PaymentBase):
    payment_id: int
    payment_date: datetime
    
    class Config:
        orm_mode = True