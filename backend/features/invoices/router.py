# backend/routers/invoices.py
import os
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Body
from fastapi.responses import JSONResponse, FileResponse
from sqlalchemy.orm import Session
from pathlib import Path

from backend.features.invoices.models import Category, InvoiceCategory
from utils.audit import log_audit

from backend.features.invoices.models import Tag, InvoiceTag
from utils.audit import log_audit

from backend.Core.database import get_db
from backend.features.invoices.models import (
    Invoice, InvoiceItem, Tag, Category, InvoiceFile, InvoiceStatusHistory
)
from backend.features.invoices.schemas import (
    InvoiceCreate, InvoiceResponse, InvoiceUpdate, InvoiceItemBase
)
from utils.helpers import parse_date, get_or_create_tag, get_or_create_category, add_status_history
from utils.audit import log_audit

router = APIRouter(
    prefix="",
    tags=["invoices"],
    responses={404: {"description": "Not found"}},
)

# Get upload folder path from main
UPLOAD_FOLDER = Path("uploads")

@router.get("/invoices/", response_model=List[InvoiceResponse])
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
                merchant_name=invoice.merchant_name,  # Include merchant_name in response
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


@router.get("/invoice/{invoice_id}", response_model=InvoiceResponse)
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
            merchant_name=invoice.merchant_name,  # Include merchant_name in response
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


@router.post("/add-entry/", response_model=dict)
async def add_entry(entry_data: InvoiceCreate, db: Session = Depends(get_db), user_id: int = 1):
    """Add a new invoice entry without file."""
    try:
        # Create new invoice
        new_invoice = Invoice(
            user_id=user_id,  # Default user ID if auth not implemented
            file_name="",
            merchant_name=entry_data.merchant_name,  # Add merchant_name field
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
                "merchant_name": new_invoice.merchant_name,  # Include merchant_name in audit
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


# Update an existing invoice
@router.put("/update/{invoice_id}")
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
            "merchant_name": invoice.merchant_name, # Add merchant_name to old_data
            "order_number": invoice.order_number,
            "status": invoice.status,
            "payment_method": invoice.payment_method
        }
        
        # Get old filename
        old_filename = invoice.file_name or ""
        old_file_path = (UPLOAD_FOLDER / old_filename) if old_filename else None
        
        # Generate new filename if merchant and order number provided
        new_filename = old_filename
        if invoice_data.merchant_name and invoice_data.order_number:
            # Get file extension if a file existed
            old_ext = ""
            if old_filename:
                _, old_ext = os.path.splitext(old_filename)
            
            # Create new filename with format Merchant-Order#_OrderNumber.ext
            new_filename = f"{invoice_data.merchant_name}-Order#_{invoice_data.order_number}{old_ext}"
        
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
        if invoice_data.merchant_name is not None:
            invoice.merchant_name = invoice_data.merchant_name  # Make sure to update merchant_name
            
        if new_filename != old_filename:
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
                "merchant_name": invoice.merchant_name,  # Include merchant_name in new_data
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

@router.get("/uploads/{filename}")
async def get_uploaded_file(filename: str):
    """Return the file if it exists, else a 200 with a message that no file is available."""
    file_path = UPLOAD_FOLDER / filename
    if not Path(file_path).exists():
        return JSONResponse(content={"detail": "No file available"}, status_code=200)
    
    return FileResponse(file_path, filename=filename)


@router.get("/download/{filename}")
def download_invoice(filename: str):
    """Download the file if it exists, else 404."""
    file_path = UPLOAD_FOLDER / filename
    if Path(file_path).exists():
        return FileResponse(file_path, filename=filename)
    
    return JSONResponse(content={"detail": "File not found"}, status_code=404)


@router.delete("/delete/{invoice_id}")
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
            old_data={"file_name": filename, "merchant_name": invoice.merchant_name, "is_deleted": False},  # Add merchant_name
            new_data={"is_deleted": True}
        )
        
        db.commit()
        return {"message": "Invoice deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting invoice: {str(e)}")


@router.delete("/delete-permanent/{invoice_id}")
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
            old_data={"file_name": filename, "merchant_name": invoice.merchant_name}  # Add merchant_name
        )
        
        # Hard delete the record (cascade will handle related records)
        db.delete(invoice)
        db.commit()
        
        return {"message": "Invoice permanently deleted"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error permanently deleting invoice: {str(e)}")


@router.get("/tags/", response_model=List[str])
async def get_all_tags(db: Session = Depends(get_db)):
    """Get all available tags."""
    try:
        tags = db.query(Tag.tag_name).all()
        return [tag[0] for tag in tags]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/categories/", response_model=List[str])
async def get_all_categories(db: Session = Depends(get_db)):
    """Get all available categories."""
    try:
        categories = db.query(Category.category_name).all()
        return [category[0] for category in categories]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.delete("/categories/{category_name}")
async def delete_category(category_name: str, db: Session = Depends(get_db), user_id: int = 1):
    """Delete a category from the database."""
    try:
        # Find the category
        category = db.query(Category).filter(Category.category_name == category_name).first()
        if not category:
            raise HTTPException(status_code=404, detail="Category not found")
        
        # Begin a transaction to ensure atomicity
        transaction = db.begin_nested()
        
        try:
            # First, remove all references to this category in the junction table
            junction_count = db.query(InvoiceCategory).filter(
                InvoiceCategory.category_id == category.category_id
            ).delete()
            
            # Then delete the category itself
            db.delete(category)
            
            # Log the action
            log_audit(
                db=db,
                user_id=user_id,
                action="DELETE",
                table_name="categories",
                record_id=category.category_id,
                old_data={"category_name": category_name, "junction_references_removed": junction_count}
            )
            
            # Commit the transaction
            transaction.commit()
            db.commit()  # Added this explicit commit to finalize changes
            
            return {"message": f"Category '{category_name}' deleted successfully", "references_removed": junction_count}
        
        except Exception as e:
            # Rollback transaction on error
            transaction.rollback()
            raise e
            
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        # Log the error details for debugging
        print(f"Error deleting category: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"An error occurred while deleting the category: {str(e)}")
    
    
@router.delete("/tags/{tag_name}")
async def delete_tag(tag_name: str, db: Session = Depends(get_db), user_id: int = 1):
    """Delete a tag from the database."""
    try:
        # Find the tag
        tag = db.query(Tag).filter(Tag.tag_name == tag_name).first()
        if not tag:
            raise HTTPException(status_code=404, detail="Tag not found")
        
        # Begin a transaction to ensure atomicity
        transaction = db.begin_nested()
        
        try:
            # First, remove all references to this tag in the junction table
            junction_count = db.query(InvoiceTag).filter(
                InvoiceTag.tag_id == tag.tag_id
            ).delete()
            
            # Then delete the tag itself
            db.delete(tag)
            
            # Log the action
            log_audit(
                db=db,
                user_id=user_id,
                action="DELETE",
                table_name="tags",
                record_id=tag.tag_id,
                old_data={"tag_name": tag_name, "junction_references_removed": junction_count}
            )
            
            # Commit the transaction
            transaction.commit()
            db.commit()  # Added this explicit commit to finalize changes
            
            return {"message": f"Tag '{tag_name}' deleted successfully", "references_removed": junction_count}
        
        except Exception as e:
            # Rollback transaction on error
            transaction.rollback()
            raise e
            
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        # Log the error details for debugging
        print(f"Error deleting tag: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"An error occurred while deleting the tag: {str(e)}") 