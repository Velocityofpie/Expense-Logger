# backend/schemas/invoice.py
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel

class InvoiceItemBase(BaseModel):
    product_name: str
    quantity: int
    unit_price: float
    product_link: Optional[str] = None
    documentation: Optional[str] = None
    condition: Optional[str] = None
    paid_by: Optional[str] = None
    used_date: Optional[str] = None
    expiration_date: Optional[str] = None
    
    class Config:
        orm_mode = True


class InvoiceCreate(BaseModel):
    user_id: Optional[int] = None
    file_name: Optional[str] = None
    merchant_name: Optional[str] = None  # Add merchant_name field
    order_number: Optional[str] = None
    purchase_date: Optional[str] = None
    payment_method: Optional[str] = None
    grand_total: Optional[float] = None
    status: Optional[str] = "Open"
    notes: Optional[str] = None
    shipping_handling: Optional[float] = None
    estimated_tax: Optional[float] = None
    total_before_tax: Optional[float] = None
    billing_address: Optional[str] = None
    credit_card_transactions: Optional[float] = None
    gift_card_amount: Optional[float] = None
    refunded_amount: Optional[float] = None
    items: List[InvoiceItemBase] = []
    tags: List[str] = []
    categories: List[str] = []
    
    class Config:
        orm_mode = True


class InvoiceResponse(BaseModel):
    invoice_id: int
    user_id: Optional[int] = None
    file_name: Optional[str] = None
    merchant_name: Optional[str] = None  # Add merchant_name field to response
    order_number: Optional[str] = None
    purchase_date: Optional[str] = None
    payment_method: Optional[str] = None
    grand_total: Optional[float] = None
    status: str
    notes: Optional[str] = None
    shipping_handling: Optional[float] = None
    estimated_tax: Optional[float] = None
    total_before_tax: Optional[float] = None
    billing_address: Optional[str] = None
    credit_card_transactions: Optional[float] = None
    gift_card_amount: Optional[float] = None
    refunded_amount: Optional[float] = None
    created_at: datetime
    items: List[InvoiceItemBase] = []
    tags: List[str] = []
    categories: List[str] = []
    
    class Config:
        orm_mode = True


# backend/schemas/invoice.py - Update the InvoiceUpdate schema

class InvoiceUpdate(BaseModel):
    file_name: Optional[str] = None
    merchant_name: Optional[str] = None  # Add separate merchant name field
    order_number: Optional[str] = None
    purchase_date: Optional[str] = None
    payment_method: Optional[str] = None
    grand_total: Optional[float] = None
    status: Optional[str] = None
    notes: Optional[str] = None
    shipping_handling: Optional[float] = None
    estimated_tax: Optional[float] = None
    total_before_tax: Optional[float] = None
    billing_address: Optional[str] = None
    credit_card_transactions: Optional[float] = None
    gift_card_amount: Optional[float] = None
    refunded_amount: Optional[float] = None
    items: Optional[List[InvoiceItemBase]] = None
    tags: Optional[List[str]] = None
    categories: Optional[List[str]] = None
    
    class Config:
        orm_mode = True