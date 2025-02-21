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
    allow_origins=["http://localhost:3000"],
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
    c.execute(
        """
        CREATE TABLE IF NOT EXISTS invoices (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            filename TEXT, date TEXT, order_number TEXT,
            merchant TEXT, amount TEXT, category TEXT,
            card_used TEXT, notes TEXT, line_items TEXT
        )
        """
    )
    conn.commit()
    conn.close()

init_db()

@app.get("/invoices/")
async def get_invoices():
    """
    Returns all invoices in the database.
    """
    try:
        conn = sqlite3.connect(DB_FILE)
        c = conn.cursor()
        c.execute("SELECT * FROM invoices")
        rows = c.fetchall()
        conn.close()

        # Convert DB rows into JSON-friendly objects
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
                    "line_items": json.loads(row[9]) if row[9] else [],
                }
                for row in rows
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/invoice/{invoice_id}")
async def get_invoice(invoice_id: int):
    """
    Fetches a single invoice by its ID.
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
            "line_items": json.loads(row[9]) if row[9] else [],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/upload/")
async def upload_invoice(file: UploadFile = File(...)):
    """
    Uploads a file and inserts a new invoice record into the DB.
    """
    try:
        file_path = UPLOAD_FOLDER / file.filename
        with open(file_path, "wb") as f:
            f.write(file.file.read())

        conn = sqlite3.connect(DB_FILE)
        c = conn.cursor()
        # Insert with empty date/order_number/merchant, etc. for now
        c.execute(
            """
            INSERT INTO invoices
            (filename, date, order_number, merchant, amount, category, card_used, notes, line_items)
            VALUES (?, '', '', '', '', '', '', '', ?)
            """,
            (file.filename, json.dumps([])),
        )
        conn.commit()
        conn.close()

        return {"message": "File uploaded successfully", "filename": file.filename}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/update/{invoice_id}")
async def update_invoice(invoice_id: int, invoice_data: dict):
    """
    Updates an existing invoice record.
    If merchant & order_number exist, we rename the file on disk to "Merchant - Order# ####.pdf"
    and update the DB's filename field.
    """
    try:
        conn = sqlite3.connect(DB_FILE)
        c = conn.cursor()

        # 1) Fetch old filename from DB
        c.execute("SELECT filename FROM invoices WHERE id=?", (invoice_id,))
        row = c.fetchone()
        if not row:
            conn.close()
            raise HTTPException(status_code=404, detail="Invoice not found")

        old_filename = row[0]
        old_file_path = UPLOAD_FOLDER / old_filename

        # 2) Build new filename if merchant & order_number exist
        merchant = invoice_data.get("merchant")
        order_number = invoice_data.get("order_number")

        if merchant and order_number:
            new_filename = f"{merchant} - Order# {order_number}.pdf"
        else:
            # If either is missing, keep the old filename (or do your own fallback)
            new_filename = old_filename

        new_file_path = UPLOAD_FOLDER / new_filename

        # 3) If we have a new name, rename the file on disk
        if new_filename != old_filename:
            if old_file_path.exists():
                # Optional: handle collisions if new_file_path already exists
                os.rename(old_file_path, new_file_path)
            else:
                print(f"Warning: old file {old_file_path} not found on disk.")

        # 4) Update the DB row with new filename & other fields
        c.execute(
            """
            UPDATE invoices
            SET
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
            """,
            (
                new_filename,                          # updated filename
                invoice_data.get("date"),
                order_number,
                merchant,
                invoice_data.get("amount"),
                invoice_data.get("category"),
                invoice_data.get("card_used"),
                invoice_data.get("notes"),
                json.dumps(invoice_data.get("line_items", [])),
                invoice_id,
            ),
        )

        conn.commit()
        conn.close()
        return {"message": "Invoice updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/uploads/{filename}")
async def get_uploaded_file(filename: str):
    """
    Returns a JSON with the local file path for the uploaded file.
    (If you want to directly serve the file, see the /download/ endpoint.)
    """
    file_path = UPLOAD_FOLDER / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    return {"url": str(file_path)}

@app.get("/download/{filename}")
def download_invoice(filename: str):
    """
    Downloads the actual file as a PDF (or any type).
    """
    file_path = UPLOAD_FOLDER / filename
    if os.path.exists(file_path):
        return FileResponse(file_path, media_type="application/pdf", filename=filename)
    return JSONResponse(content={"detail": "File not found"}, status_code=404)

UPLOAD_DIR = "uploads"

@app.delete("/delete/{invoice_id}")
async def delete_invoice(invoice_id: int, filename: str):
    """
    Deletes the invoice from DB and removes the file on disk.
    """
    try:
        conn = sqlite3.connect(DB_FILE)
        c = conn.cursor()
        
        # Remove from database
        c.execute("DELETE FROM invoices WHERE id=?", (invoice_id,))
        conn.commit()
        conn.close()

        # Construct the file path
        file_path = UPLOAD_FOLDER / filename

        print(f"Trying to delete: {file_path}")
        if file_path.exists():
            os.remove(file_path)
            print(f"Deleted file: {file_path}")
        else:
            print(f"File not found: {file_path}")

        return {"message": "Invoice deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting invoice: {str(e)}")
