# backend/models/payment.py
import sqlalchemy as sa
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.core.database import Base
from backend.core.models import Base, TimestampMixin

class Card(Base, TimestampMixin):
    __tablename__ = "cards"
    
    card_id = sa.Column(sa.Integer, primary_key=True)
    user_id = sa.Column(sa.Integer, sa.ForeignKey("users.user_id"))
    card_name = sa.Column(sa.String(100))
    
    # Relationships
    user = relationship("User", back_populates="cards")
    card_numbers = relationship("CardNumber", back_populates="card", cascade="all, delete-orphan")


class CardNumber(Base):
    __tablename__ = "card_numbers"
    
    card_number_id = sa.Column(sa.Integer, primary_key=True)
    card_id = sa.Column(sa.Integer, sa.ForeignKey("cards.card_id"))
    last_four = sa.Column(sa.String(4), unique=True)
    expiration_date = sa.Column(sa.Date)
    added_at = sa.Column(sa.DateTime, default=datetime.utcnow)
    
    # Relationships
    card = relationship("Card", back_populates="card_numbers")
    payments = relationship("Payment", back_populates="card_number")


class Payment(Base):
    __tablename__ = "payments"
    
    payment_id = sa.Column(sa.Integer, primary_key=True)
    invoice_id = sa.Column(sa.Integer, sa.ForeignKey("invoices.invoice_id"))
    card_number_id = sa.Column(sa.Integer, sa.ForeignKey("card_numbers.card_number_id"))
    amount = sa.Column(sa.Numeric(10, 2))
    transaction_id = sa.Column(sa.String(100), unique=True)
    payment_date = sa.Column(sa.DateTime, default=datetime.utcnow)
    
    # Relationships
    invoice = relationship("Invoice", back_populates="payments")
    card_number = relationship("CardNumber", back_populates="payments")