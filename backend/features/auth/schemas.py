# features/auth/schemas.py
from typing import Optional
from pydantic import BaseModel, EmailStr, ConfigDict
from datetime import datetime

class UserBase(BaseModel):
    username: str
    email: EmailStr
    
    model_config = ConfigDict(from_attributes=True)
        

class UserCreate(UserBase):
    password: str


class UserResponse(UserBase):
    user_id: int
    created_at: datetime