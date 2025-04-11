# features/wishlist/schemas.py
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class WishlistItemBase(BaseModel):
    product_name: str
    product_link: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)


class WishlistItemCreate(WishlistItemBase):
    user_id: Optional[int] = 1


class WishlistItemResponse(WishlistItemBase):
    wishlist_id: int
    user_id: int
    added_at: datetime