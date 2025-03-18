# backend/models/__init__.py
from models.user import User
from models.invoice import (
    Invoice, 
    InvoiceItem, 
    Tag, 
    InvoiceTag, 
    Category, 
    InvoiceCategory, 
    InvoiceStatusHistory, 
    InvoiceFile
)
from models.payment import Card, CardNumber, Payment
from models.wishlist import WishlistItem
from models.template import InvoiceTemplate, TemplateTestResult
from models.base import Base, TimestampMixin, SoftDeleteMixin

# Import all models here to make them available to alembic
__all__ = [
    'Base',
    'TimestampMixin',
    'SoftDeleteMixin',
    'User',
    'Invoice',
    'InvoiceItem',
    'Tag',
    'InvoiceTag',
    'Category',
    'InvoiceCategory',
    'InvoiceStatusHistory',
    'InvoiceFile',
    'Card',
    'CardNumber',
    'Payment',
    'WishlistItem',
    'InvoiceTemplate',
    'TemplateTestResult',
]