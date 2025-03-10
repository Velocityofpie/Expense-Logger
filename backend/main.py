import os
import json
import psycopg2
from psycopg2.extras import RealDictCursor
from pathlib import Path

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

app = FastAPI()
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────────────────
# POSTGRES CONFIG
# ─────────────────────────────────────────────────────────
DB_HOST = os.environ.get("DB_HOST", "postgres_db")
DB_NAME = os.environ.get("DB_NAME", "expense_logger")
DB_USER = os.environ.get("DB_USER", "postgres")
DB_PASSWORD = os.environ.get("DB_PASSWORD", "secret")

def get_db_connection():
    return psycopg2.connect(
        host=DB_HOST,
        database=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
    )

# Ensure the uploads folder exists
UPLOAD_FOLDER = Path("uploads")
UPLOAD_FOLDER.mkdir(exist_ok=True)

def init_db():
    """
    Create the invoices table if it doesn't exist.
    Note: 'payment' is the column used for the payment method.
    """
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS invoices (
            id SERIAL PRIMARY KEY,
            filename TEXT,
            date TEXT,
            order_number TEXT,
            merchant TEXT,
            amount TEXT,
            category TEXT,
            payment TEXT,
            notes TEXT,
            line_items TEXT,
            status TEXT,
            tags TEXT
        )
        """
    )
    conn.commit()
    cur.close()
    conn.close()

init_db()

@app.get("/invoices/")
async def get_invoices():
    """Return all invoices from PostgreSQL."""
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("SELECT * FROM invoices")
        rows = cur.fetchall()
        cur.close()
        conn.close()

        invoices = []
        for row in rows:
            # parse line_items
            line_items_raw = row.get("line_items") or "[]"
            try:
                line_items = json.loads(line_items_raw)
            except:
                line_items = []

            # parse tags
            tags_raw = row.get("tags") or "[]"
            try:
                tags_list = json.loads(tags_raw)
            except:
                tags_list = tags_raw.split(",")

            invoices.append(
                {
                    "id": row["id"],
                    "filename": row["filename"] or "",
                    "date": row["date"],
                    "order_number": row["order_number"],
                    "merchant": row["merchant"],
                    "amount": row["amount"],
                    "category": row["category"],
                    "payment": row["payment"],  # <─ Payment column
                    "notes": row["notes"],
                    "line_items": line_items,
                    "status": row["status"],
                    "tags": tags_list,
                }
            )
        return {"invoices": invoices}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/invoice/{invoice_id}")
async def get_invoice(invoice_id: int):
    """
    Return a single invoice by ID, with line_items + tags parsed.
    """
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("SELECT * FROM invoices WHERE id = %s", (invoice_id,))
        row = cur.fetchone()
        cur.close()
        conn.close()

        if not row:
            raise HTTPException(status_code=404, detail="Invoice not found")

        # parse line_items
        line_items_raw = row.get("line_items") or "[]"
        try:
            line_items = json.loads(line_items_raw)
        except:
            line_items = []

        # parse tags
        tags_raw = row.get("tags") or "[]"
        try:
            tags_list = json.loads(tags_raw)
        except:
            tags_list = tags_raw.split(",")

        return {
            "id": row["id"],
            "filename": row["filename"] or "",
            "date": row["date"],
            "order_number": row["order_number"],
            "merchant": row["merchant"],
            "amount": row["amount"],
            "category": row["category"],
            "payment": row["payment"],  # <─ Payment column
            "notes": row["notes"],
            "line_items": line_items,
            "status": row["status"],
            "tags": tags_list,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/add-entry/")
async def add_entry(entry_data: dict):
    """
    Add a new "bank entry" with no PDF. 'payment' is stored in the 'payment' column.
    """
    try:
        date = entry_data.get("date", "")
        order_number = entry_data.get("order_number", "")
        merchant = entry_data.get("merchant", "")
        amount = entry_data.get("amount", "")
        category = entry_data.get("category", "")
        payment = entry_data.get("payment", "")  # Storing in 'payment'
        notes = entry_data.get("notes", "")
        line_items = entry_data.get("line_items", [])
        status = entry_data.get("status", "Open")
        tags = entry_data.get("tags", [])

        tags_str = json.dumps(tags)
        line_items_str = json.dumps(line_items)

        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute(
            """
            INSERT INTO invoices
            (filename, date, order_number, merchant, amount, category, payment,
             notes, line_items, status, tags)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (
                "",  # no file
                date,
                order_number,
                merchant,
                amount,
                category,
                payment,
                notes,
                line_items_str,
                status,
                tags_str,
            ),
        )
        conn.commit()
        cur.close()
        conn.close()
        return {"message": "Bank entry added successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/upload/")
async def upload_invoice(file: UploadFile = File(...)):
    """
    Upload a PDF (or other) and insert a new invoice record with that filename.
    """
    try:
        file_path = UPLOAD_FOLDER / file.filename
        with open(file_path, "wb") as f:
            f.write(file.file.read())

        conn = get_db_connection()
        cur = conn.cursor()
        # Insert a record with an empty line_items array, empty tags, default status=Open
        cur.execute(
            """
            INSERT INTO invoices
            (filename, date, order_number, merchant, amount, category, payment,
             notes, line_items, status, tags)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (
                file.filename,
                "",  # date
                "",  # order_number
                "",  # merchant
                "",  # amount
                "",  # category
                "",  # payment
                "",  # notes
                json.dumps([]),  # line_items
                "Open",  # status
                json.dumps([]),  # tags
            ),
        )
        conn.commit()
        cur.close()
        conn.close()

        return {"message": "File uploaded successfully", "filename": file.filename}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.put("/update/{invoice_id}")
async def update_invoice(invoice_id: int, invoice_data: dict):
    """
    Updates an existing invoice record.
    If merchant + order_number exist, rename the file on disk to keep the old extension.
    Also ensures 'payment' is stored in the 'payment' column.
    """
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        # 1) Fetch old filename from DB
        cur.execute("SELECT filename FROM invoices WHERE id=%s", (invoice_id,))
        row = cur.fetchone()
        if not row:
            cur.close()
            conn.close()
            raise HTTPException(status_code=404, detail="Invoice not found")

        old_filename = row[0] or ""
        old_file_path = (UPLOAD_FOLDER / old_filename) if old_filename else None

        # 2) Build new filename if merchant + order_number exist
        merchant = (invoice_data.get("merchant") or "").strip()
        order_number = (invoice_data.get("order_number") or "").strip()

        # Determine the old file's extension
        _, old_ext = os.path.splitext(old_filename)  # e.g. ".jpg" or ".pdf"
        # If there's no extension, fallback to ".pdf" or just keep it empty
        if not old_ext:
            old_ext = ".pdf"  # <─ Optionally default to .pdf if old had none

        if merchant and order_number:
            # Keep the same extension from the old file
            new_filename = f"{merchant} - Order# {order_number}{old_ext}"
        else:
            # If either is missing, keep old filename
            new_filename = old_filename

        # 3) If old file exists and the name changed, rename on disk
        if old_filename and old_file_path and old_file_path.exists() and (new_filename != old_filename):
            new_file_path = UPLOAD_FOLDER / new_filename
            old_file_path.rename(new_file_path)

        # 4) Convert tags to JSON
        tags_list = invoice_data.get("tags", [])
        tags_str = json.dumps(tags_list)

        # 5) Convert line_items to JSON
        line_items_list = invoice_data.get("line_items", [])
        line_items_str = json.dumps(line_items_list)

        # 6) Update the DB record
        cur.execute(
            """
            UPDATE invoices
            SET
              filename = %s,
              date = %s,
              order_number = %s,
              merchant = %s,
              amount = %s,
              category = %s,
              payment = %s,
              notes = %s,
              line_items = %s,
              status = %s,
              tags = %s
            WHERE id = %s
            """,
            (
                new_filename,
                invoice_data.get("date", ""),
                order_number,
                merchant,
                invoice_data.get("amount", ""),
                invoice_data.get("category", ""),
                invoice_data.get("payment", ""),  # store 'payment' in the DB
                invoice_data.get("notes", ""),
                line_items_str,
                invoice_data.get("status", "Open"),
                tags_str,
                invoice_id,
            ),
        )
        conn.commit()
        cur.close()
        conn.close()

        return {"message": "Invoice updated successfully"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/uploads/{filename}")
async def get_uploaded_file(filename: str):
    """
    Return the file if it exists, else a 200 with a message that no PDF is available.
    """
    file_path = UPLOAD_FOLDER / filename
    if not file_path.exists():
        return JSONResponse(content={"detail": "No PDF available"}, status_code=200)
    return FileResponse(file_path, media_type="application/pdf", filename=filename)


@app.get("/download/{filename}")
def download_invoice(filename: str):
    """Download the file if it exists, else 404."""
    file_path = UPLOAD_FOLDER / filename
    if file_path.exists():
        return FileResponse(file_path, media_type="application/pdf", filename=filename)
    return JSONResponse(content={"detail": "File not found"}, status_code=404)


@app.delete("/delete/{invoice_id}")
async def delete_invoice(invoice_id: int, filename: str):
    """Delete the invoice record and remove the file if it exists."""
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("DELETE FROM invoices WHERE id=%s", (invoice_id,))
        conn.commit()
        cur.close()
        conn.close()

        file_path = UPLOAD_FOLDER / filename
        if file_path.exists():
            file_path.unlink()
        return {"message": "Invoice deleted successfully"}

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error deleting invoice: {str(e)}"
        )
