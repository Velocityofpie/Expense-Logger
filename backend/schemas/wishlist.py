# backend/schemas/wishlist.py
from typing import Optional
from datetime import datetime
from pydantic import BaseModel

class WishlistItemBase(BaseModel):
    product_name: str
    product_link: Optional[str] = None
    
    class Config:
        orm_mode = True


class WishlistItemCreate(WishlistItemBase):
    user_id: Optional[int] = 1


class WishlistItemResponse(WishlistItemBase):
    wishlist_id: int
    user_id: int
    added_at: datetime
    
    class Config:
        orm_mode = True