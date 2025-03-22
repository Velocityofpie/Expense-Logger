# backend/schemas/user.py
from typing import Optional
from pydantic import BaseModel, EmailStr
from datetime import datetime

class UserBase(BaseModel):
    username: str
    email: EmailStr
    
    class Config:
        orm_mode = True
        

class UserCreate(UserBase):
    password: str


class UserResponse(UserBase):
    user_id: int
    created_at: datetime
    
    class Config:
        orm_mode = True