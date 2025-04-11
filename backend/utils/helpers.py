# utils/helpers.py
from typing import Optional
from datetime import datetime, date
from sqlalchemy.orm import Session
from features.invoices.models import Tag, Category

def parse_date(date_str: Optional[str]) -> Optional[date]:
    """Parse date string to date object."""
    if not date_str:
        return None
    
    try:
        # Try different formats
        for fmt in ('%Y-%m-%d', '%m/%d/%Y', '%d/%m/%Y', '%m-%d-%Y', '%B %d, %Y', '%b %d, %Y'):
            try:
                return datetime.strptime(date_str, fmt).date()
            except ValueError:
                continue
        return None
    except Exception:
        return None


def get_or_create_tag(db: Session, tag_name: str) -> Tag:
    """Get existing tag or create new one."""
    tag = db.query(Tag).filter(Tag.tag_name == tag_name).first()
    if not tag:
        tag = Tag(tag_name=tag_name)
        db.add(tag)
        db.flush()
    return tag


def get_or_create_category(db: Session, category_name: str) -> Category:
    """Get existing category or create new one."""
    category = db.query(Category).filter(Category.category_name == category_name).first()
    if not category:
        category = Category(category_name=category_name)
        db.add(category)
        db.flush()
    return category


def add_status_history(db: Session, invoice_id: int, status: str):
    """Add status change to history."""
    from features.invoices.models import InvoiceStatusHistory
    
    history = InvoiceStatusHistory(
        invoice_id=invoice_id,
        status=status
    )
    db.add(history)
    db.flush()
    return history