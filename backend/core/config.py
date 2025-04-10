# backend/core/config.py
import os
from pathlib import Path

# ─────────────────────────────────────────────────────────
# ENVIRONMENT VARIABLES AND SETTINGS
# ─────────────────────────────────────────────────────────

# Base paths
BASE_DIR = Path(__file__).resolve().parent.parent
UPLOAD_FOLDER = BASE_DIR / "uploads"

# Database settings
DB_HOST = os.environ.get("DB_HOST", "postgres_db")
DB_NAME = os.environ.get("DB_NAME", "expense_logger")
DB_USER = os.environ.get("DB_USER", "postgres")
DB_PASSWORD = os.environ.get("DB_PASSWORD", "secret")
DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}/{DB_NAME}"

# API Settings
API_TITLE = "Invoice Management System"
API_MAX_REQUEST_SIZE = 10 * 1024 * 1024  # 10MB in bytes

# CORS Settings
CORS_ORIGINS = [
    "http://localhost", 
    "http://localhost:3000", 
    "http://127.0.0.1", 
    "http://127.0.0.1:3000", 
    "http://frontend", 
    "http://frontend:3000", 
    "*"
]

# Server Settings
SERVER_HOST = "0.0.0.0"
SERVER_PORT = 8000
SERVER_TIMEOUT_KEEP_ALIVE = 300
SERVER_LIMIT_CONCURRENCY = 10
SERVER_LIMIT_MAX_REQUESTS = 100

# OCR Settings
DEFAULT_OCR_LANGUAGE = "eng"
DEFAULT_OCR_DPI = 300

# File upload settings
ALLOWED_EXTENSIONS = {".pdf", ".jpg", ".jpeg", ".png"}