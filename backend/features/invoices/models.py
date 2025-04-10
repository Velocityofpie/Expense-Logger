# backend/models/invoice.py
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from datetime import datetime
from core.database import Base
from backend.core.models import Base, TimestampMixin, SoftDeleteMixin

# backend/models/invoice.py - Update the Invoice model to add merchant_name

class Invoice(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "invoices"
    
    invoice_id = sa.Column(sa.Integer, primary_key=True)
    user_id = sa.Column(sa.Integer, sa.ForeignKey("users.user_id"))
    file_name = sa.Column(sa.String(255))
    merchant_name = sa.Column(sa.String(255))  # Add separate merchant name field
    order_number = sa.Column(sa.String(50), unique=True)
    purchase_date = sa.Column(sa.Date)
    payment_method = sa.Column(sa.String(50))
    grand_total = sa.Column(sa.Numeric(10, 2))
    status = sa.Column(sa.String(50), default="Open")
    notes = sa.Column(sa.Text)
    shipping_handling = sa.Column(sa.Numeric(10, 2))
    estimated_tax = sa.Column(sa.Numeric(10, 2))
    total_before_tax = sa.Column(sa.Numeric(10, 2))
    billing_address = sa.Column(sa.Text)
    credit_card_transactions = sa.Column(sa.Numeric(10, 2))
    gift_card_amount = sa.Column(sa.Numeric(10, 2))
    refunded_amount = sa.Column(sa.Numeric(10, 2))
    credit_card = sa.Column(sa.String(255))  # Credit card used
    
    # Relationships
    user = relationship("User", back_populates="invoices")
    items = relationship("InvoiceItem", back_populates="invoice", cascade="all, delete-orphan")
    tags = relationship("Tag", secondary="invoice_tags", back_populates="invoices")
    categories = relationship("Category", secondary="invoice_categories", back_populates="invoices")
    payments = relationship("Payment", back_populates="invoice")
    status_history = relationship("InvoiceStatusHistory", back_populates="invoice")
    files = relationship("InvoiceFile", back_populates="invoice")
    template_tests = relationship("TemplateTestResult", back_populates="invoice")
    expense_categories = relationship("ExpenseCategory", secondary="invoice_expense_categories", back_populates="invoices")


class InvoiceItem(Base):
    __tablename__ = "invoice_items"
    
    item_id = sa.Column(sa.Integer, primary_key=True)
    invoice_id = sa.Column(sa.Integer, sa.ForeignKey("invoices.invoice_id"))
    product_name = sa.Column(sa.String(255))
    quantity = sa.Column(sa.Integer)
    unit_price = sa.Column(sa.Numeric(10, 2))
    product_link = sa.Column(sa.Text)
    documentation = sa.Column(sa.Text)
    condition = sa.Column(sa.String(50))
    paid_by = sa.Column(sa.String(50))
    used_date = sa.Column(sa.Date)
    expiration_date = sa.Column(sa.Date)
    item_type = sa.Column(sa.String(100))  # Add this new field
    
    # Computed property
    @property
    def total_price(self):
        return self.quantity * self.unit_price if self.quantity and self.unit_price else None
    
    # Relationships
    invoice = relationship("Invoice", back_populates="items")


class Tag(Base):
    __tablename__ = "tags"
    
    tag_id = sa.Column(sa.Integer, primary_key=True)
    tag_name = sa.Column(sa.String(100), unique=True)
    
    # Relationships
    invoices = relationship("Invoice", secondary="invoice_tags", back_populates="tags")


class InvoiceTag(Base):
    __tablename__ = "invoice_tags"
    
    invoice_id = sa.Column(sa.Integer, sa.ForeignKey("invoices.invoice_id"), primary_key=True)
    tag_id = sa.Column(sa.Integer, sa.ForeignKey("tags.tag_id"), primary_key=True)


class Category(Base):
    __tablename__ = "categories"
    
    category_id = sa.Column(sa.Integer, primary_key=True)
    category_name = sa.Column(sa.String(100), unique=True)
    
    # Relationships
    invoices = relationship("Invoice", secondary="invoice_categories", back_populates="categories")


class InvoiceCategory(Base):
    __tablename__ = "invoice_categories"
    
    invoice_id = sa.Column(sa.Integer, sa.ForeignKey("invoices.invoice_id"), primary_key=True)
    category_id = sa.Column(sa.Integer, sa.ForeignKey("categories.category_id"), primary_key=True)


class InvoiceStatusHistory(Base):
    __tablename__ = "invoice_status_history"
    
    status_id = sa.Column(sa.Integer, primary_key=True)
    invoice_id = sa.Column(sa.Integer, sa.ForeignKey("invoices.invoice_id"))
    status = sa.Column(sa.String(50))
    changed_at = sa.Column(sa.DateTime, default=datetime.utcnow)
    
    # Relationships
    invoice = relationship("Invoice", back_populates="status_history")


class InvoiceFile(Base):
    __tablename__ = "invoice_files"
    
    file_id = sa.Column(sa.Integer, primary_key=True)
    invoice_id = sa.Column(sa.Integer, sa.ForeignKey("invoices.invoice_id"))
    file_name = sa.Column(sa.String(255))
    file_path = sa.Column(sa.Text)
    uploaded_at = sa.Column(sa.DateTime, default=datetime.utcnow)
    
    # Relationships
    invoice = relationship("Invoice", back_populates="files")


class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    log_id = sa.Column(sa.Integer, primary_key=True)
    user_id = sa.Column(sa.Integer, sa.ForeignKey("users.user_id"))
    action = sa.Column(sa.String(50))
    table_name = sa.Column(sa.String(50))
    record_id = sa.Column(sa.Integer)
    old_data = sa.Column(JSONB)
    new_data = sa.Column(JSONB)
    timestamp = sa.Column(sa.DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="audit_logs")

# backend/models/invoice.py - Add new models or extend existing

class ExpenseCategory(Base, TimestampMixin):
    __tablename__ = "expense_categories"
    
    category_id = sa.Column(sa.Integer, primary_key=True)
    user_id = sa.Column(sa.Integer, sa.ForeignKey("users.user_id"))
    name = sa.Column(sa.String(100), nullable=False)
    parent_category = sa.Column(sa.Integer, sa.ForeignKey("expense_categories.category_id"), nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="expense_categories")
    invoices = relationship("Invoice", secondary="invoice_expense_categories", back_populates="expense_categories")

# Add a table to link invoices to expense categories
class InvoiceExpenseCategory(Base):
    __tablename__ = "invoice_expense_categories"
    
    invoice_id = sa.Column(sa.Integer, sa.ForeignKey("invoices.invoice_id"), primary_key=True)
    category_id = sa.Column(sa.Integer, sa.ForeignKey("expense_categories.category_id"), primary_key=True)