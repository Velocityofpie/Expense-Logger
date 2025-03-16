import os
import json
from datetime import datetime, date
from pathlib import Path
from typing import List, Optional, Dict, Any, Union

import sqlalchemy as sa
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker, Session
from sqlalchemy.dialects.postgresql import JSONB

from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, Form, Body
from fastapi.responses import JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

# FastAPI application setup
app = FastAPI(title="Invoice Management System")

# Ensure the folder path
UPLOAD_FOLDER = Path("uploads")
UPLOAD_FOLDER.mkdir(parents=True, exist_ok=True)

# Mount it for static file serving
app.mount("/uploads", StaticFiles(directory=UPLOAD_FOLDER), name="uploads")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────────────────
# DATABASE CONFIGURATION
# ─────────────────────────────────────────────────────────
DB_HOST = os.environ.get("DB_HOST", "postgres_db")
DB_NAME = os.environ.get("DB_NAME", "expense_logger")
DB_USER = os.environ.get("DB_USER", "postgres")
DB_PASSWORD = os.environ.get("DB_PASSWORD", "secret")

DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}/{DB_NAME}"

engine = sa.create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# ─────────────────────────────────────────────────────────
# DATABASE MODELS
# ─────────────────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"
    
    user_id = sa.Column(sa.Integer, primary_key=True)
    username = sa.Column(sa.String(50), unique=True)
    password_hash = sa.Column(sa.Text)
    email = sa.Column(sa.String(100), unique=True)
    created_at = sa.Column(sa.DateTime, default=datetime.utcnow)
    is_deleted = sa.Column(sa.Boolean, default=False)
    
    # Relationships
    invoices = relationship("Invoice", back_populates="user")
    cards = relationship("Card", back_populates="user")
    wishlist_items = relationship("WishlistItem", back_populates="user")
    audit_logs = relationship("AuditLog", back_populates="user")


class Invoice(Base):
    __tablename__ = "invoices"
    
    invoice_id = sa.Column(sa.Integer, primary_key=True)
    user_id = sa.Column(sa.Integer, sa.ForeignKey("users.user_id"))
    file_name = sa.Column(sa.String(255))
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
    created_at = sa.Column(sa.DateTime, default=datetime.utcnow)
    is_deleted = sa.Column(sa.Boolean, default=False)
    
    # Relationships
    user = relationship("User", back_populates="invoices")
    items = relationship("InvoiceItem", back_populates="invoice", cascade="all, delete-orphan")
    tags = relationship("Tag", secondary="invoice_tags", back_populates="invoices")
    categories = relationship("Category", secondary="invoice_categories", back_populates="invoices")
    payments = relationship("Payment", back_populates="invoice")
    status_history = relationship("InvoiceStatusHistory", back_populates="invoice")
    files = relationship("InvoiceFile", back_populates="invoice")


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


class Card(Base):
    __tablename__ = "cards"
    
    card_id = sa.Column(sa.Integer, primary_key=True)
    user_id = sa.Column(sa.Integer, sa.ForeignKey("users.user_id"))
    card_name = sa.Column(sa.String(100))
    created_at = sa.Column(sa.DateTime, default=datetime.utcnow)
    
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


class WishlistItem(Base):
    __tablename__ = "wishlist"
    
    wishlist_id = sa.Column(sa.Integer, primary_key=True)
    user_id = sa.Column(sa.Integer, sa.ForeignKey("users.user_id"))
    product_name = sa.Column(sa.String(255))
    product_link = sa.Column(sa.Text)
    added_at = sa.Column(sa.DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="wishlist_items")

# ─────────────────────────────────────────────────────────
# PYDANTIC MODELS
# ─────────────────────────────────────────────────────────

class InvoiceItemBase(BaseModel):
    product_name: str
    quantity: int
    unit_price: float
    product_link: Optional[str] = None
    documentation: Optional[str] = None
    condition: Optional[str] = None
    paid_by: Optional[str] = None
    used_date: Optional[str] = None
    expiration_date: Optional[str] = None
    
    class Config:
        orm_mode = True


class InvoiceCreate(BaseModel):
    user_id: Optional[int] = None
    file_name: Optional[str] = None
    order_number: Optional[str] = None
    purchase_date: Optional[str] = None
    payment_method: Optional[str] = None
    grand_total: Optional[float] = None
    status: Optional[str] = "Open"
    notes: Optional[str] = None
    shipping_handling: Optional[float] = None
    estimated_tax: Optional[float] = None
    total_before_tax: Optional[float] = None
    billing_address: Optional[str] = None
    credit_card_transactions: Optional[float] = None
    gift_card_amount: Optional[float] = None
    refunded_amount: Optional[float] = None
    items: List[InvoiceItemBase] = []
    tags: List[str] = []
    categories: List[str] = []
    
    class Config:
        orm_mode = True


class InvoiceResponse(BaseModel):
    invoice_id: int
    user_id: Optional[int] = None
    file_name: Optional[str] = None
    order_number: Optional[str] = None
    purchase_date: Optional[str] = None
    payment_method: Optional[str] = None
    grand_total: Optional[float] = None
    status: str
    notes: Optional[str] = None
    shipping_handling: Optional[float] = None
    estimated_tax: Optional[float] = None
    total_before_tax: Optional[float] = None
    billing_address: Optional[str] = None
    credit_card_transactions: Optional[float] = None
    gift_card_amount: Optional[float] = None
    refunded_amount: Optional[float] = None
    created_at: datetime
    items: List[InvoiceItemBase] = []
    tags: List[str] = []
    categories: List[str] = []
    
    class Config:
        orm_mode = True


class InvoiceUpdate(BaseModel):
    file_name: Optional[str] = None
    order_number: Optional[str] = None
    purchase_date: Optional[str] = None
    payment_method: Optional[str] = None
    grand_total: Optional[float] = None
    status: Optional[str] = None
    notes: Optional[str] = None
    shipping_handling: Optional[float] = None
    estimated_tax: Optional[float] = None
    total_before_tax: Optional[float] = None
    billing_address: Optional[str] = None
    credit_card_transactions: Optional[float] = None
    gift_card_amount: Optional[float] = None
    refunded_amount: Optional[float] = None
    items: Optional[List[InvoiceItemBase]] = None
    tags: Optional[List[str]] = None
    categories: Optional[List[str]] = None
    
    class Config:
        orm_mode = True


# ─────────────────────────────────────────────────────────
# HELPER FUNCTIONS
# ─────────────────────────────────────────────────────────

def parse_date(date_str: Optional[str]) -> Optional[date]:
    """Parse date string to date object."""
    if not date_str:
        return None
    
    try:
        # Try different formats
        for fmt in ('%Y-%m-%d', '%m/%d/%Y', '%d/%m/%Y', '%m-%d-%Y'):
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


def log_audit(db: Session, user_id: int, action: str, table_name: str, record_id: int, old_data: Dict = None, new_data: Dict = None):
    """Create audit log entry."""
    log = AuditLog(
        user_id=user_id,
        action=action,
        table_name=table_name,
        record_id=record_id,
        old_data=old_data,
        new_data=new_data
    )
    db.add(log)
    db.flush()


def add_status_history(db: Session, invoice_id: int, status: str):
    """Add status change to history."""
    history = InvoiceStatusHistory(
        invoice_id=invoice_id,
        status=status
    )
    db.add(history)
    db.flush()


# ─────────────────────────────────────────────────────────
# DATABASE DEPENDENCY
# ─────────────────────────────────────────────────────────

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Create the database tables
Base.metadata.create_all(bind=engine)


# ─────────────────────────────────────────────────────────
# API ENDPOINTS
# ─────────────────────────────────────────────────────────

@app.get("/invoices/", response_model=List[InvoiceResponse])
async def get_invoices(db: Session = Depends(get_db), user_id: Optional[int] = None, skip: int = 0, limit: int = 100):
    """Return all invoices, optionally filtered by user."""
    try:
        query = db.query(Invoice).filter(Invoice.is_deleted == False)
        
        if user_id:
            query = query.filter(Invoice.user_id == user_id)
            
        invoices = query.offset(skip).limit(limit).all()
        
        return [
            InvoiceResponse(
                invoice_id=invoice.invoice_id,
                user_id=invoice.user_id,
                file_name=invoice.file_name,
                order_number=invoice.order_number,
                purchase_date=invoice.purchase_date.isoformat() if invoice.purchase_date else None,
                payment_method=invoice.payment_method,
                grand_total=float(invoice.grand_total) if invoice.grand_total is not None else None,
                status=invoice.status,
                notes=invoice.notes,
                shipping_handling=float(invoice.shipping_handling) if invoice.shipping_handling is not None else None,
                estimated_tax=float(invoice.estimated_tax) if invoice.estimated_tax is not None else None,
                total_before_tax=float(invoice.total_before_tax) if invoice.total_before_tax is not None else None,
                billing_address=invoice.billing_address,
                credit_card_transactions=float(invoice.credit_card_transactions) if invoice.credit_card_transactions is not None else None,
                gift_card_amount=float(invoice.gift_card_amount) if invoice.gift_card_amount is not None else None,
                refunded_amount=float(invoice.refunded_amount) if invoice.refunded_amount is not None else None,
                created_at=invoice.created_at,
                items=[
                    InvoiceItemBase(
                        product_name=item.product_name,
                        quantity=item.quantity,
                        unit_price=float(item.unit_price) if item.unit_price is not None else 0,
                        product_link=item.product_link,
                        documentation=item.documentation,
                        condition=item.condition,
                        paid_by=item.paid_by,
                        used_date=item.used_date.isoformat() if item.used_date else None,
                        expiration_date=item.expiration_date.isoformat() if item.expiration_date else None
                    ) for item in invoice.items
                ],
                tags=[tag.tag_name for tag in invoice.tags],
                categories=[category.category_name for category in invoice.categories]
            ) for invoice in invoices
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/invoice/{invoice_id}", response_model=InvoiceResponse)
async def get_invoice(invoice_id: int, db: Session = Depends(get_db)):
    """Return a single invoice by ID."""
    try:
        invoice = db.query(Invoice).filter(Invoice.invoice_id == invoice_id, Invoice.is_deleted == False).first()
        
        if not invoice:
            raise HTTPException(status_code=404, detail="Invoice not found")
        
        return InvoiceResponse(
            invoice_id=invoice.invoice_id,
            user_id=invoice.user_id,
            file_name=invoice.file_name,
            order_number=invoice.order_number,
            purchase_date=invoice.purchase_date.isoformat() if invoice.purchase_date else None,
            payment_method=invoice.payment_method,
            grand_total=float(invoice.grand_total) if invoice.grand_total is not None else None,
            status=invoice.status,
            notes=invoice.notes,
            shipping_handling=float(invoice.shipping_handling) if invoice.shipping_handling is not None else None,
            estimated_tax=float(invoice.estimated_tax) if invoice.estimated_tax is not None else None,
            total_before_tax=float(invoice.total_before_tax) if invoice.total_before_tax is not None else None,
            billing_address=invoice.billing_address,
            credit_card_transactions=float(invoice.credit_card_transactions) if invoice.credit_card_transactions is not None else None,
            gift_card_amount=float(invoice.gift_card_amount) if invoice.gift_card_amount is not None else None,
            refunded_amount=float(invoice.refunded_amount) if invoice.refunded_amount is not None else None,
            created_at=invoice.created_at,
            items=[
                InvoiceItemBase(
                    product_name=item.product_name,
                    quantity=item.quantity,
                    unit_price=float(item.unit_price) if item.unit_price is not None else 0,
                    product_link=item.product_link,
                    documentation=item.documentation,
                    condition=item.condition,
                    paid_by=item.paid_by,
                    used_date=item.used_date.isoformat() if item.used_date else None,
                    expiration_date=item.expiration_date.isoformat() if item.expiration_date else None
                ) for item in invoice.items
            ],
            tags=[tag.tag_name for tag in invoice.tags],
            categories=[category.category_name for category in invoice.categories]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/add-entry/", response_model=dict)
async def add_entry(entry_data: InvoiceCreate, db: Session = Depends(get_db), user_id: int = 1):
    """Add a new invoice entry without file."""
    try:
        # Create new invoice
        new_invoice = Invoice(
            user_id=user_id,  # Default user ID if auth not implemented
            file_name="",
            order_number=entry_data.order_number,
            purchase_date=parse_date(entry_data.purchase_date),
            payment_method=entry_data.payment_method,
            grand_total=entry_data.grand_total,
            status=entry_data.status or "Open",
            notes=entry_data.notes,
            shipping_handling=entry_data.shipping_handling,
            estimated_tax=entry_data.estimated_tax,
            total_before_tax=entry_data.total_before_tax,
            billing_address=entry_data.billing_address,
            credit_card_transactions=entry_data.credit_card_transactions,
            gift_card_amount=entry_data.gift_card_amount,
            refunded_amount=entry_data.refunded_amount
        )
        db.add(new_invoice)
        db.flush()
        
        # Add line items
        for item_data in entry_data.items:
            item = InvoiceItem(
                invoice_id=new_invoice.invoice_id,
                product_name=item_data.product_name,
                quantity=item_data.quantity,
                unit_price=item_data.unit_price,
                product_link=item_data.product_link,
                documentation=item_data.documentation,
                condition=item_data.condition,
                paid_by=item_data.paid_by,
                used_date=parse_date(item_data.used_date),
                expiration_date=parse_date(item_data.expiration_date)
            )
            db.add(item)
        
        # Add tags
        for tag_name in entry_data.tags:
            tag = get_or_create_tag(db, tag_name)
            new_invoice.tags.append(tag)
        
        # Add categories
        for category_name in entry_data.categories:
            category = get_or_create_category(db, category_name)
            new_invoice.categories.append(category)
        
        # Add status history
        add_status_history(db, new_invoice.invoice_id, new_invoice.status)
        
        # Log action
        log_audit(
            db=db,
            user_id=user_id,
            action="INSERT",
            table_name="invoices",
            record_id=new_invoice.invoice_id,
            new_data={
                "order_number": new_invoice.order_number,
                "purchase_date": new_invoice.purchase_date.isoformat() if new_invoice.purchase_date else None,
                "status": new_invoice.status
            }
        )
        
        db.commit()
        return {"message": "Invoice entry added successfully", "invoice_id": new_invoice.invoice_id}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/upload/")
async def upload_invoice(file: UploadFile = File(...), db: Session = Depends(get_db), user_id: int = 1):
    """Upload a file and create a new invoice record."""
    try:
        # Check if user exists
        user = db.query(User).filter(User.user_id == user_id).first()
        if not user:
            # Create a default user if not exists
            user = User(
                user_id=user_id,
                username="default",
                password_hash="defaultpasswordhash",
                email="default@example.com"
            )
            db.add(user)
            db.flush()
            print(f"Created default user with ID {user_id}")

        # Create upload folder if it doesn't exist
        UPLOAD_FOLDER.mkdir(parents=True, exist_ok=True)
        
        # Clean filename to avoid path traversal and ensure uniqueness
        original_filename = file.filename
        safe_filename = "".join([c for c in original_filename if c.isalnum() or c in "._- "])
        
        # Add timestamp to ensure uniqueness
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        unique_filename = f"{timestamp}_{safe_filename}"
        
        # Create the full file path
        file_path = UPLOAD_FOLDER / unique_filename
        
        # Log for debugging
        print(f"Saving file to: {file_path}")
        
        # Read file content
        content = await file.read()
        
        # Save file to disk
        with open(file_path, "wb") as f:
            f.write(content)
        
        # Create new invoice with minimal info
        new_invoice = Invoice(
            user_id=user_id,
            file_name=unique_filename,
            status="Open"
        )
        db.add(new_invoice)
        db.flush()
        
        # Create invoice file record
        invoice_file = InvoiceFile(
            invoice_id=new_invoice.invoice_id,
            file_name=unique_filename,
            file_path=str(file_path)
        )
        db.add(invoice_file)
        
        # Add status history
        add_status_history(db, new_invoice.invoice_id, "Open")
        
        # Log action
        log_audit(
            db=db,
            user_id=user_id,
            action="INSERT",
            table_name="invoices",
            record_id=new_invoice.invoice_id,
            new_data={"file_name": unique_filename, "status": "Open"}
        )
        
        db.commit()
        return {
            "message": "File uploaded successfully", 
            "invoice_id": new_invoice.invoice_id, 
            "filename": unique_filename,
            "original_filename": original_filename
        }
    except Exception as e:
        db.rollback()
        print(f"Upload error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/update/{invoice_id}")
async def update_invoice(invoice_id: int, invoice_data: InvoiceUpdate, db: Session = Depends(get_db), user_id: int = 1):
    """Update an existing invoice."""
    try:
        # Get existing invoice
        invoice = db.query(Invoice).filter(Invoice.invoice_id == invoice_id, Invoice.is_deleted == False).first()
        if not invoice:
            raise HTTPException(status_code=404, detail="Invoice not found")
        
        # Store old data for audit log
        old_data = {
            "file_name": invoice.file_name,
            "order_number": invoice.order_number,
            "status": invoice.status,
            "payment_method": invoice.payment_method
        }
        
        # Determine filename changes
        old_filename = invoice.file_name or ""
        old_file_path = (UPLOAD_FOLDER / old_filename) if old_filename else None
        
        # Prepare new merchant/order_number
        merchant = invoice_data.file_name  # In this context, file_name is being used as merchant
        order_number = invoice_data.order_number
        
        # Get file extension if a file existed
        old_ext = ""
        if old_filename:
            _, old_ext = os.path.splitext(old_filename)
        
        # If merchant + order_number exist, create new filename with old extension
        if merchant and order_number:
            new_filename = f"{merchant} - Order# {order_number}{old_ext}"
        else:
            # Keep old filename if missing merchant/order_number
            new_filename = old_filename
        
        # If old file exists and name changed, rename on disk
        if old_filename and old_file_path and Path(old_file_path).exists() and (new_filename != old_filename):
            new_file_path = UPLOAD_FOLDER / new_filename
            Path(old_file_path).rename(new_file_path)
            
            # Update file record
            file_record = db.query(InvoiceFile).filter(
                InvoiceFile.invoice_id == invoice_id,
                InvoiceFile.file_name == old_filename
            ).first()
            if file_record:
                file_record.file_name = new_filename
                file_record.file_path = str(new_file_path)
        
        # Update invoice fields
        if invoice_data.file_name is not None:
            invoice.file_name = new_filename
        if invoice_data.order_number is not None:
            invoice.order_number = invoice_data.order_number
        if invoice_data.purchase_date is not None:
            invoice.purchase_date = parse_date(invoice_data.purchase_date)
        if invoice_data.payment_method is not None:
            invoice.payment_method = invoice_data.payment_method
        if invoice_data.grand_total is not None:
            invoice.grand_total = invoice_data.grand_total
        if invoice_data.status is not None:
            old_status = invoice.status
            invoice.status = invoice_data.status
            # Add status history if status changed
            if old_status != invoice_data.status:
                add_status_history(db, invoice_id, invoice_data.status)
        if invoice_data.notes is not None:
            invoice.notes = invoice_data.notes
        if invoice_data.shipping_handling is not None:
            invoice.shipping_handling = invoice_data.shipping_handling
        if invoice_data.estimated_tax is not None:
            invoice.estimated_tax = invoice_data.estimated_tax
        if invoice_data.total_before_tax is not None:
            invoice.total_before_tax = invoice_data.total_before_tax
        if invoice_data.billing_address is not None:
            invoice.billing_address = invoice_data.billing_address
        if invoice_data.credit_card_transactions is not None:
            invoice.credit_card_transactions = invoice_data.credit_card_transactions
        if invoice_data.gift_card_amount is not None:
            invoice.gift_card_amount = invoice_data.gift_card_amount
        if invoice_data.refunded_amount is not None:
            invoice.refunded_amount = invoice_data.refunded_amount
        
        # Update items if provided
        if invoice_data.items is not None:
            # Remove existing items
            for item in invoice.items:
                db.delete(item)
            
            # Add new items
            for item_data in invoice_data.items:
                item = InvoiceItem(
                    invoice_id=invoice_id,
                    product_name=item_data.product_name,
                    quantity=item_data.quantity,
                    unit_price=item_data.unit_price,
                    product_link=item_data.product_link,
                    documentation=item_data.documentation,
                    condition=item_data.condition,
                    paid_by=item_data.paid_by,
                    used_date=parse_date(item_data.used_date),
                    expiration_date=parse_date(item_data.expiration_date)
                )
                db.add(item)
        
        # Update tags if provided
        if invoice_data.tags is not None:
            # Clear existing tags
            invoice.tags = []
            
            # Add new tags
            for tag_name in invoice_data.tags:
                tag = get_or_create_tag(db, tag_name)
                invoice.tags.append(tag)
        
        # Update categories if provided
        if invoice_data.categories is not None:
            # Clear existing categories
            invoice.categories = []
            
            # Add new categories
            for category_name in invoice_data.categories:
                category = get_or_create_category(db, category_name)
                invoice.categories.append(category)
        
        # Log audit for the update
        log_audit(
            db=db,
            user_id=user_id,
            action="UPDATE",
            table_name="invoices",
            record_id=invoice_id,
            old_data=old_data,
            new_data={
                "file_name": invoice.file_name,
                "order_number": invoice.order_number,
                "status": invoice.status,
                "payment_method": invoice.payment_method
            }
        )
        
        db.commit()
        return {"message": "Invoice updated successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/uploads/{filename}")
async def get_uploaded_file(filename: str):
    """Return the file if it exists, else a 200 with a message that no file is available."""
    file_path = UPLOAD_FOLDER / filename
    if not Path(file_path).exists():
        return JSONResponse(content={"detail": "No file available"}, status_code=200)
    
    return FileResponse(file_path, filename=filename)


@app.get("/download/{filename}")
def download_invoice(filename: str):
    """Download the file if it exists, else 404."""
    file_path = UPLOAD_FOLDER / filename
    if Path(file_path).exists():
        return FileResponse(file_path, filename=filename)
    
    return JSONResponse(content={"detail": "File not found"}, status_code=404)


@app.delete("/delete/{invoice_id}")
async def delete_invoice(invoice_id: int, db: Session = Depends(get_db), user_id: int = 1):
    """Soft delete an invoice record."""
    try:
        invoice = db.query(Invoice).filter(Invoice.invoice_id == invoice_id, Invoice.is_deleted == False).first()
        if not invoice:
            raise HTTPException(status_code=404, detail="Invoice not found")
        
        # Get file information before deleting
        filename = invoice.file_name
        
        # Soft delete
        invoice.is_deleted = True
        
        # Log audit
        log_audit(
            db=db,
            user_id=user_id,
            action="DELETE",
            table_name="invoices",
            record_id=invoice_id,
            old_data={"file_name": filename, "is_deleted": False},
            new_data={"is_deleted": True}
        )
        
        db.commit()
        return {"message": "Invoice deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting invoice: {str(e)}")


@app.delete("/delete-permanent/{invoice_id}")
async def delete_invoice_permanent(invoice_id: int, db: Session = Depends(get_db), user_id: int = 1):
    """Hard delete an invoice record and remove associated files."""
    try:
        invoice = db.query(Invoice).filter(Invoice.invoice_id == invoice_id).first()
        if not invoice:
            raise HTTPException(status_code=404, detail="Invoice not found")
        
        # Get file information
        filename = invoice.file_name
        
        # Delete the associated files from disk
        for file_record in invoice.files:
            file_path = file_record.file_path
            if file_path and Path(file_path).exists():
                Path(file_path).unlink()
        
        # Log audit
        log_audit(
            db=db,
            user_id=user_id,
            action="HARD_DELETE",
            table_name="invoices",
            record_id=invoice_id,
            old_data={"file_name": filename}
        )
        
        # Hard delete the record (cascade will handle related records)
        db.delete(invoice)
        db.commit()
        
        return {"message": "Invoice permanently deleted"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error permanently deleting invoice: {str(e)}")


@app.get("/tags/", response_model=List[str])
async def get_all_tags(db: Session = Depends(get_db)):
    """Get all available tags."""
    try:
        tags = db.query(Tag.tag_name).all()
        return [tag[0] for tag in tags]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/categories/", response_model=List[str])
async def get_all_categories(db: Session = Depends(get_db)):
    """Get all available categories."""
    try:
        categories = db.query(Category.category_name).all()
        return [category[0] for category in categories]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/cards/", response_model=dict)
async def add_card(card_name: str = Body(...), user_id: int = Body(1), db: Session = Depends(get_db)):
    """Add a new card."""
    try:
        card = Card(
            user_id=user_id,
            card_name=card_name
        )
        db.add(card)
        db.commit()
        return {"message": "Card added successfully", "card_id": card.card_id}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/card-numbers/", response_model=dict)
async def add_card_number(
    card_id: int = Body(...),
    last_four: str = Body(...),
    expiration_date: str = Body(...),
    db: Session = Depends(get_db)
):
    """Add a new card number to an existing card."""
    try:
        # Check if card exists
        card = db.query(Card).filter(Card.card_id == card_id).first()
        if not card:
            raise HTTPException(status_code=404, detail="Card not found")
        
        # Add card number
        card_number = CardNumber(
            card_id=card_id,
            last_four=last_four,
            expiration_date=parse_date(expiration_date)
        )
        db.add(card_number)
        db.commit()
        
        return {"message": "Card number added successfully", "card_number_id": card_number.card_number_id}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/payments/", response_model=dict)
async def add_payment(
    invoice_id: int = Body(...),
    card_number_id: int = Body(...), 
    amount: float = Body(...),
    transaction_id: str = Body(...),
    db: Session = Depends(get_db)
):
    """Add a payment for an invoice."""
    try:
        # Check if invoice exists
        invoice = db.query(Invoice).filter(Invoice.invoice_id == invoice_id, Invoice.is_deleted == False).first()
        if not invoice:
            raise HTTPException(status_code=404, detail="Invoice not found")
        
        # Check if card number exists
        card_number = db.query(CardNumber).filter(CardNumber.card_number_id == card_number_id).first()
        if not card_number:
            raise HTTPException(status_code=404, detail="Card number not found")
        
        # Add payment
        payment = Payment(
            invoice_id=invoice_id,
            card_number_id=card_number_id,
            amount=amount,
            transaction_id=transaction_id
        )
        db.add(payment)
        
        # Update invoice status if needed (e.g., change to "Paid" if total payment matches grand_total)
        total_payments = sum([float(p.amount) for p in invoice.payments]) + amount
        if total_payments >= float(invoice.grand_total or 0):
            old_status = invoice.status
            invoice.status = "Paid"
            
            # Add status history if status changed
            if old_status != "Paid":
                add_status_history(db, invoice_id, "Paid")
        
        db.commit()
        return {"message": "Payment added successfully", "payment_id": payment.payment_id}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/wishlist/", response_model=dict)
async def add_wishlist_item(
    product_name: str = Body(...),
    product_link: str = Body(...),
    user_id: int = Body(1),
    db: Session = Depends(get_db)
):
    """Add an item to the user's wishlist."""
    try:
        wishlist_item = WishlistItem(
            user_id=user_id,
            product_name=product_name,
            product_link=product_link
        )
        db.add(wishlist_item)
        db.commit()
        return {"message": "Item added to wishlist", "wishlist_id": wishlist_item.wishlist_id}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/wishlist/", response_model=List[dict])
async def get_wishlist(user_id: int = 1, db: Session = Depends(get_db)):
    """Get all items in a user's wishlist."""
    try:
        items = db.query(WishlistItem).filter(WishlistItem.user_id == user_id).all()
        return [
            {
                "wishlist_id": item.wishlist_id,
                "product_name": item.product_name,
                "product_link": item.product_link,
                "added_at": item.added_at
            } for item in items
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/wishlist/{wishlist_id}")
async def delete_wishlist_item(wishlist_id: int, db: Session = Depends(get_db)):
    """Remove an item from the wishlist."""
    try:
        item = db.query(WishlistItem).filter(WishlistItem.wishlist_id == wishlist_id).first()
        if not item:
            raise HTTPException(status_code=404, detail="Wishlist item not found")
        
        db.delete(item)
        db.commit()
        return {"message": "Item removed from wishlist"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))