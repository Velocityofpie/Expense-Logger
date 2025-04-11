# features/wishlist/models.py
import sqlalchemy as sa
from sqlalchemy.orm import relationship
from datetime import datetime
from core.database import Base
from core.models import TimestampMixin

class WishlistItem(Base, TimestampMixin):
    __tablename__ = "wishlist"
    
    wishlist_id = sa.Column(sa.Integer, primary_key=True)
    user_id = sa.Column(sa.Integer, sa.ForeignKey("users.user_id"))
    product_name = sa.Column(sa.String(255))
    product_link = sa.Column(sa.Text)
    
    # Relationships
    user = relationship("User", back_populates="wishlist_items")