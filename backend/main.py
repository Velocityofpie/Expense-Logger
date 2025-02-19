from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
import sqlite3
import json
import os
from pathlib import Path
from fastapi.staticfiles import StaticFiles

app = FastAPI()

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Allow frontend to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # or ["*"] for all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_FOLDER = Path("uploads")
UPLOAD_FOLDER.mkdir(exist_ok=True)

DB_FILE = "invoices.db"

# Initialize the database
def init_db():
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute("""
        CREATE TABLE IF NOT EXISTS invoices (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            filename TEXT,
            date TEXT,
            order_number TEXT,
            merchant TEXT,
            amount TEXT,
            category TEXT,
            card_used TEXT,
            notes TEXT,
            line_items TEXT
        )
    """)
    conn.commit()
    conn.close()

init_db()

@app.get("/invoices/")
async def get_invoices():
    """
    Returns a list of all invoices from the database.
    """
    try:
        conn = sqlite3.connect(DB_FILE)
        c = conn.cursor()
        c.execute("SELECT * FROM invoices")
        rows = c.fetchall()
        conn.close()

        return {
            "invoices": [
                {
                    "id": row[0],
                    "filename": row[1],
                    "date": row[2],
                    "order_number": row[3],
                    "merchant": row[4],
                    "amount": row[5],
                    "category": row[6],
                    "card_used": row[7],
                    "notes": row[8],
                    "line_items": json.loads(row[9]) if row[9] else []
                }
                for row in rows
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/invoice/{invoice_id}")
async def get_invoice(invoice_id: int):
    """
    Returns a single invoice by ID, or 404 if not found.
    """
    try:
        conn = sqlite3.connect(DB_FILE)
        c = conn.cursor()
        c.execute("SELECT * FROM invoices WHERE id=?", (invoice_id,))
        row = c.fetchone()
        conn.close()

        if not row:
            raise HTTPException(status_code=404, detail="Invoice not found")

        return {
            "id": row[0],
            "filename": row[1],
            "date": row[2],
            "order_number": row[3],
            "merchant": row[4],
            "amount": row[5],
            "category": row[6],
            "card_used": row[7],
            "notes": row[8],
            "line_items": json.loads(row[9]) if row[9] else []
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/upload/")
async def upload_invoice(file: UploadFile = File(...)):
    """
    Uploads a PDF invoice and inserts a new record into the `invoices` table.
    """
    try:
        file_path = UPLOAD_FOLDER / file.filename
        with open(file_path, "wb") as f:
            f.write(file.file.read())

        conn = sqlite3.connect(DB_FILE)
        c = conn.cursor()
        # Insert a new row with default/empty fields
        c.execute(
            """
            INSERT INTO invoices (
                filename, date, order_number,
                merchant, amount, category,
                card_used, notes, line_items
            ) VALUES (?, '', '', '', '', '', '', '', ?)
            """,
            (file.filename, json.dumps([]))
        )
        conn.commit()
        conn.close()

        return {"message": "File uploaded successfully", "filename": file.filename}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/update/{invoice_id}")
async def update_invoice(invoice_id: int, invoice_data: dict):
    """
    Updates an existing invoice in the DB. This partial-update logic merges
    new fields with the existing invoice so we don't overwrite everything
    when only changing one field (e.g. category).
    """
    try:
        # 1️⃣ Fetch existing invoice from DB
        conn = sqlite3.connect(DB_FILE)
        c = conn.cursor()
        c.execute("SELECT * FROM invoices WHERE id=?", (invoice_id,))
        row = c.fetchone()
        if not row:
            conn.close()
            raise HTTPException(status_code=404, detail="Invoice not found")

        # Convert the existing row to a dict
        existing_invoice = {
            "filename": row[1],
            "date": row[2],
            "order_number": row[3],
            "merchant": row[4],
            "amount": row[5],
            "category": row[6],
            "card_used": row[7],
            "notes": row[8],
            "line_items": json.loads(row[9]) if row[9] else []
        }

        # 2️⃣ Merge existing data with the new data from the request
        merged_invoice = {**existing_invoice, **invoice_data}

        # 3️⃣ Now update with all fields
        c.execute("""
            UPDATE invoices SET
                filename = ?,
                date = ?,
                order_number = ?,
                merchant = ?,
                amount = ?,
                category = ?,
                card_used = ?,
                notes = ?,
                line_items = ?
            WHERE id = ?
        """, (
            merged_invoice.get("filename", ""),
            merged_invoice.get("date", ""),
            merged_invoice.get("order_number", ""),
            merged_invoice.get("merchant", ""),
            merged_invoice.get("amount", ""),
            merged_invoice.get("category", ""),
            merged_invoice.get("card_used", ""),
            merged_invoice.get("notes", ""),
            json.dumps(merged_invoice.get("line_items", [])),
            invoice_id
        ))
        conn.commit()
        conn.close()

        return {"message": "Invoice updated successfully"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/uploads/{filename}")
async def get_uploaded_file(filename: str):
    """
    Returns the local file path for an uploaded invoice (for iframes, etc.)
    """
    file_path = UPLOAD_FOLDER / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    return {"url": str(file_path)}

@app.get("/download/{filename}")
def download_invoice(filename: str):
    """
    Downloads the requested PDF file if it exists.
    """
    file_path = UPLOAD_FOLDER / filename
    if os.path.exists(file_path):
        return FileResponse(file_path, media_type="application/pdf", filename=filename)
    return JSONResponse(content={"detail": "File not found"}, status_code=404)

@app.delete("/delete/{invoice_id}")
async def delete_invoice(invoice_id: int, filename: str):
    """
    Deletes an invoice from the database and removes the PDF file if it exists.
    Expects 'filename' as a query parameter, e.g. /delete/123?filename=MyInvoice.pdf
    """
    try:
        conn = sqlite3.connect(DB_FILE)
        c = conn.cursor()

        # Delete from database
        c.execute("DELETE FROM invoices WHERE id=?", (invoice_id,))
        conn.commit()
        conn.close()

        # Construct file path
        file_path = UPLOAD_FOLDER / filename
        print(f"Trying to delete: {file_path}")  # Debugging

        # Check if file exists before deleting
        if file_path.exists():
            os.remove(file_path)
            print(f"Deleted file: {file_path}")
        else:
            print(f"File not found: {file_path}")

        return {"message": "Invoice deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting invoice: {str(e)}")

# Optional: Categories endpoint, if your frontend calls /categories/
@app.get("/categories/")
async def get_categories():
    return {"categories": ["Office Supplies", "Travel", "Food", "Other"]}
