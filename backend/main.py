# backend/main.py
import os
from pathlib import Path
from typing import Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import tempfile

# Import database
from database import get_db, engine, Base

# Import all models to ensure they're registered with SQLAlchemy
from models import *

# Import routers
from routers.invoice import router as invoices_router
from routers.templates import router as templates_router
from routers.user import router as users_router
from routers.payment import router as payments_router
from routers.wishlist import router as wishlist_router
from routers.expense import router as expense_router

# Import services
from services.template import find_matching_template, process_with_template, update_invoice_with_extracted_data
from services.ocr import extract_text_from_file, OcrOptions, process_pdf_with_ocr, get_available_languages

# Import utilities
from utils.audit import log_audit
from utils.helpers import add_status_history

# Create the FastAPI application
app = FastAPI(title="Invoice Management System")

# Ensure the upload folder path
UPLOAD_FOLDER = Path("uploads")
UPLOAD_FOLDER.mkdir(parents=True, exist_ok=True)

# Mount it for static file serving
app.mount("/uploads", StaticFiles(directory=UPLOAD_FOLDER), name="uploads")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost", "http://localhost:3000", "http://127.0.0.1", "http://127.0.0.1:3000", "http://frontend", "http://frontend:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(invoices_router)
app.include_router(templates_router)
app.include_router(users_router)
app.include_router(payments_router)
app.include_router(wishlist_router)
app.include_router(expense_router)

# ─────────────────────────────────────────────────────────
# File Upload Endpoint
# ─────────────────────────────────────────────────────────

# backend/main.py - the part that needs updating

@app.post("/upload/")
async def upload_invoice(
    file: UploadFile = File(...),
    use_templates: bool = Form(True),
    db: Session = Depends(get_db),
    user_id: int = 1
):
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
        
        # Use the safe filename without timestamp
        unique_filename = safe_filename
        
        # Create the full file path
        file_path = UPLOAD_FOLDER / unique_filename
        
        # Log for debugging
        print(f"Saving file to: {file_path}")
        
        # Read file content
        content = await file.read()
        
        # Save file to disk
        with open(file_path, "wb") as f:
            f.write(content)
        
        # IMPORTANT: Check for and clean up any soft-deleted invoices with the same filename
        # This prevents order_number conflicts when re-uploading previously deleted files
        soft_deleted_invoices = db.query(Invoice).filter(
            Invoice.file_name == unique_filename,
            Invoice.is_deleted == True
        ).all()
        
        for deleted_invoice in soft_deleted_invoices:
            # Permanently delete the invoice to avoid unique constraint conflicts
            print(f"Permanently removing previously deleted invoice: ID {deleted_invoice.invoice_id}")
            db.delete(deleted_invoice)
            
        db.flush()  # Commit these deletions before continuing
        
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
        
        # Process with OCR templates if enabled
        template_used = None
        if use_templates:
            # Match against templates and extract structured data
            best_template = find_matching_template(str(file_path), db)
            if best_template:
                template_used = best_template.name
                extracted_data = process_with_template(str(file_path), best_template.template_data)
                # Update invoice with extracted data
                update_invoice_with_extracted_data(new_invoice, extracted_data["extracted_data"], db)
        
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
            "original_filename": original_filename,
            "template_used": template_used
        }
    except Exception as e:
        db.rollback()
        print(f"Upload error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────────────────────
# OCR Endpoints
# ─────────────────────────────────────────────────────────

@app.post("/ocr/extract/")
async def extract_text_from_pdf(
    file: UploadFile = File(...),
    language: str = Form("eng"),
    dpi: int = Form(300),
    preprocess: bool = Form(False),
    page_start: Optional[int] = Form(None),
    page_end: Optional[int] = Form(None)
):
    """Extract text from a PDF file using OCR."""
    if not file.filename.endswith(('.pdf', '.PDF')):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    try:
        # Create options object
        options = OcrOptions(
            language=language,
            dpi=dpi,
            preprocess=preprocess,
            page_range=[page_start, page_end] if page_start is not None else None
        )
        
        # Create temporary file to store the uploaded PDF
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp:
            temp_path = temp.name
            content = await file.read()
            temp.write(content)
        
        # Extract text using OCR
        try:
            extracted_text = process_pdf_with_ocr(temp_path, options)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"OCR processing failed: {str(e)}")
        finally:
            # Clean up temp file
            if os.path.exists(temp_path):
                os.unlink(temp_path)
        
        return {"text": extracted_text}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OCR processing error: {str(e)}")


@app.get("/ocr/languages/")
async def get_ocr_languages():
    """Get available OCR languages."""
    try:
        languages = get_available_languages()
        return {"languages": languages}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get languages: {str(e)}")


# Create tables on startup
@app.on_event("startup")
async def startup_event():
    # Create all tables in the database
    Base.metadata.create_all(bind=engine)
    
    # Ensure default user exists
    db = next(get_db())
    try:
        user = db.query(User).filter(User.user_id == 1).first()
        if not user:
            default_user = User(
                user_id=1,
                username="default",
                password_hash="defaultpasswordhash",
                email="default@example.com"
            )
            db.add(default_user)
            db.commit()
            print("Created default user")
    except Exception as e:
        db.rollback()
        print(f"Error ensuring default user: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)