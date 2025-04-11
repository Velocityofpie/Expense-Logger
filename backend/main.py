# backend/main.py
import os
from pathlib import Path
from fastapi import FastAPI, Depends
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

# Import core components
from core.database import engine, Base, get_db

# Import feature routers
from features.auth.router import router as auth_router
from features.invoices.router import router as invoices_router
from features.payments.router import router as payments_router
from features.expenses.router import router as expenses_router
from features.templates.router import router as templates_router
from features.ocr.router import router as ocr_router
from features.wishlist.router import router as wishlist_router

# Create the FastAPI application with increased request size limit
app = FastAPI(
    title="Invoice Management System",
    # Maximum size of a request in bytes (10MB)
    max_request_size=10 * 1024 * 1024
)

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

# Include routers from features
app.include_router(auth_router)
app.include_router(invoices_router)
app.include_router(payments_router)
app.include_router(expenses_router)
app.include_router(templates_router)
app.include_router(ocr_router)
app.include_router(wishlist_router)

# Create tables on startup
@app.on_event("startup")
async def startup_event():
    # Create all tables in the database
    Base.metadata.create_all(bind=engine)
    
    # Ensure default user exists
    db = next(get_db())
    try:
        from features.auth.models import User
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
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=8000,
        # Set timeout and limits for uploads
        timeout_keep_alive=300,
        limit_concurrency=10,
        limit_max_requests=100
    )