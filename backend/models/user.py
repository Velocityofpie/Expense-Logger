# backend/models/user.py
import sqlalchemy as sa
from sqlalchemy.orm import relationship
from database import Base
from models.base import TimestampMixin, SoftDeleteMixin

class User(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "users"
    
    user_id = sa.Column(sa.Integer, primary_key=True)
    username = sa.Column(sa.String(50), unique=True)
    password_hash = sa.Column(sa.Text)
    email = sa.Column(sa.String(100), unique=True)
    
    # Relationships
    invoices = relationship("Invoice", back_populates="user")
    cards = relationship("Card", back_populates="user")
    wishlist_items = relationship("WishlistItem", back_populates="user")
    audit_logs = relationship("AuditLog", back_populates="user")
    templates = relationship("InvoiceTemplate", back_populates="creator")
    
    # Add this missing relationship
    expense_categories = relationship("ExpenseCategory", back_populates="user")