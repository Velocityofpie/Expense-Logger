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

# Allow calls from frontend at http://localhost:3000
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


def init_db():
    """
    Create the 'invoices' table if it doesn't exist.
    Notice we now have 'payment' TEXT instead of 'card_used'.
    """
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute(
        """
        CREATE TABLE IF NOT EXISTS invoices (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            filename TEXT,
            date TEXT,
            order_number TEXT,
            merchant TEXT,
            amount TEXT,
            category TEXT,
            payment TEXT,
            notes TEXT,
            line_items TEXT,
            status TEXT,  -- e.g. "Resolved", "Draft", "Needs Attention", "Open"
            tags TEXT     -- store as JSON or comma separated
        )
        """
    )
    conn.commit()
    conn.close()


init_db()


@app.get("/invoices/")
async def get_invoices():
    """
    Return all invoices from the database.
    """
    try:
        conn = sqlite3.connect(DB_FILE)
        c = conn.cursor()
        c.execute("SELECT * FROM invoices")
        rows = c.fetchall()
        conn.close()

        # Convert DB rows into JSON-friendly objects
        invoices = []
        for row in rows:
            (
                invoice_id,
                filename,
                date,
                order_number,
                merchant,
                amount,
                category,
                payment,
                notes,
                line_items_json,
                status,
                tags_raw,
            ) = row

            # Parse JSON columns
            line_items = json.loads(line_items_json) if line_items_json else []
            if tags_raw:
                try:
                    tags_list = json.loads(tags_raw)  # if stored as JSON
                except:
                    tags_list = tags_raw.split(",")   # fallback if CSV
            else:
                tags_list = []

            invoices.append(
                {
                    "id": invoice_id,
                    "filename": filename,
                    "date": date,
                    "order_number": order_number,
                    "merchant": merchant,
                    "amount": amount,
                    "category": category,
                    "payment": payment,
                    "notes": notes,
                    "line_items": line_items,
                    "status": status,
                    "tags": tags_list,
                }
            )
        return {"invoices": invoices}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/invoice/{invoice_id}")
async def get_invoice(invoice_id: int):
    """
    Return a single invoice by ID.
    """
    try:
        conn = sqlite3.connect(DB_FILE)
        c = conn.cursor()
        c.execute("SELECT * FROM invoices WHERE id = ?", (invoice_id,))
        row = c.fetchone()
        conn.close()

        if not row:
            raise HTTPException(status_code=404, detail="Invoice not found")

        (
            invoice_id,
            filename,
            date,
            order_number,
            merchant,
            amount,
            category,
            payment,
            notes,
            line_items_json,
            status,
            tags_raw,
        ) = row

        line_items = json.loads(line_items_json) if line_items_json else []
        if tags_raw:
            try:
                tags_list = json.loads(tags_raw)
            except:
                tags_list = tags_raw.split(",")
        else:
            tags_list = []

        return {
            "id": invoice_id,
            "filename": filename,
            "date": date,
            "order_number": order_number,
            "merchant": merchant,
            "amount": amount,
            "category": category,
            "payment": payment,
            "notes": notes,
            "line_items": line_items,
            "status": status,
            "tags": tags_list,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/add-entry/")
async def add_entry(entry_data: dict):
    """
    Add a new "bank entry" without a PDF file.
    """
    try:
        date = entry_data.get("date", "")
        order_number = entry_data.get("order_number", "")
        merchant = entry_data.get("merchant", "")
        amount = entry_data.get("amount", "")
        category = entry_data.get("category", "")
        payment = entry_data.get("payment", "")
        notes = entry_data.get("notes", "")
        line_items = entry_data.get("line_items", [])
        status = entry_data.get("status", "Open")
        tags = entry_data.get("tags", [])

        tags_str = json.dumps(tags)  # store as JSON
        line_items_str = json.dumps(line_items)

        conn = sqlite3.connect(DB_FILE)
        c = conn.cursor()
        c.execute(
            """
            INSERT INTO invoices
            (filename, date, order_number, merchant, amount, category, payment,
             notes, line_items, status, tags)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                "",  # no PDF
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

        conn = sqlite3.connect(DB_FILE)
        c = conn.cursor()
        c.execute(
            """
            INSERT INTO invoices
            (filename, date, order_number, merchant, amount, category, payment,
             notes, line_items, status, tags)
            VALUES (?, '', '', '', '', '', '', '', ?, ?,
                    ?)
            """,
            (
                file.filename,
                json.dumps([]),  # line_items
                "Open",          # default status
                json.dumps([]),  # default tags
            ),
        )
        conn.commit()
        conn.close()

        return {"message": "File uploaded successfully", "filename": file.filename}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.put("/update/{invoice_id}")
async def update_invoice(invoice_id: int, invoice_data: dict):
    """
    Update an existing invoice, including 'payment' (renamed from card_used).
    If merchant & order_number exist, rename the file on disk.
    """
    try:
        conn = sqlite3.connect(DB_FILE)
        c = conn.cursor()

        # 1) fetch old filename
        c.execute("SELECT filename FROM invoices WHERE id=?", (invoice_id,))
        row = c.fetchone()
        if not row:
            conn.close()
            raise HTTPException(status_code=404, detail="Invoice not found")

        old_filename = row[0]
        old_file_path = UPLOAD_FOLDER / old_filename

        # read new data
        merchant = invoice_data.get("merchant", "")
        order_number = invoice_data.get("order_number", "")
        new_filename = old_filename  # default to old

        # rename logic if we have merchant, order_number, and an old file
        if merchant and order_number and old_filename:
            # keep the extension if it existed
            _, ext = os.path.splitext(old_filename)
            if not ext:
                ext = ".pdf"  # default if no extension

            # build new filename
            new_filename = f"{merchant} - Order# {order_number}{ext}"
            new_file_path = UPLOAD_FOLDER / new_filename

            if new_filename != old_filename and old_file_path.exists():
                os.rename(old_file_path, new_file_path)
            else:
                print(f"Warning: old file {old_file_path} not found on disk or no rename needed.")

        # convert tags to JSON
        tags_list = invoice_data.get("tags", [])
        if isinstance(tags_list, str):
            # if user sent "tag1, tag2"
            tags_list = [t.strip() for t in tags_list.split(",") if t.strip()]
        tags_str = json.dumps(tags_list)

        line_items_list = invoice_data.get("line_items", [])
        line_items_str = json.dumps(line_items_list)

        # do the update
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
                payment = ?,
                notes = ?,
                line_items = ?,
                status = ?,
                tags = ?
            WHERE id = ?
            """,
            (
                new_filename,
                invoice_data.get("date", ""),
                order_number,
                merchant,
                invoice_data.get("amount", ""),
                invoice_data.get("category", ""),
                invoice_data.get("payment", ""),  # <--- renamed field
                invoice_data.get("notes", ""),
                line_items_str,
                invoice_data.get("status", "Open"),
                tags_str,
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
    Return a JSON with the local path. (Typically used if you need direct access.)
    """
    file_path = UPLOAD_FOLDER / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    return {"url": str(file_path)}


@app.get("/download/{filename}")
def download_invoice(filename: str):
    """
    Return a FileResponse so the user can download the file from the server.
    """
    file_path = UPLOAD_FOLDER / filename
    if os.path.exists(file_path):
        return FileResponse(file_path, media_type="application/pdf", filename=filename)
    return JSONResponse(content={"detail": "File not found"}, status_code=404)


@app.delete("/delete/{invoice_id}")
async def delete_invoice(invoice_id: int, filename: str):
    """
    Delete an invoice by ID, optionally removing the file on disk if it exists.
    """
    try:
        conn = sqlite3.connect(DB_FILE)
        c = conn.cursor()

        c.execute("DELETE FROM invoices WHERE id=?", (invoice_id,))
        conn.commit()
        conn.close()

        file_path = UPLOAD_FOLDER / filename
        if file_path.exists():
            os.remove(file_path)

        return {"message": "Invoice deleted successfully"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting invoice: {str(e)}")
