# backend/schemas/expense.py
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from datetime import datetime

class ExpenseProductItem(BaseModel):
    name: str
    price: float
    quantity: int

class ExpenseItem(BaseModel):
    id: int
    store: str
    orderNumber: str
    date: str
    category: str
    creditCard: str
    total: float
    products: List[ExpenseProductItem]
    
    class Config:
        orm_mode = True

class ExpenseGroupResponse(BaseModel):
    name: str
    count: int
    total: float
    items: List[ExpenseItem]
    
    class Config:
        orm_mode = True

class ExpenseSummary(BaseModel):
    total_spending: float
    purchase_count: int
    average_purchase: float
    top_category: Optional[str] = None
    
    class Config:
        orm_mode = True

class ExpenseResponse(BaseModel):
    summary: ExpenseSummary
    data: List[ExpenseGroupResponse]
    
    class Config:
        orm_mode = True