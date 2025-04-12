# backend/Dockerfile
FROM python:3.12-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    postgresql-client \
    gcc \
    python3-dev \
    libpq-dev \
    # OCR system dependencies
    tesseract-ocr \
    tesseract-ocr-eng \
    poppler-utils \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Create uploads directory
RUN mkdir -p /app/uploads && chmod 777 /app/uploads

# Copy requirements and install dependencies
COPY requirements.txt .

# Install dependencies - no need to modify requirements
# If requirements.txt includes Pillow 10.2.0, it will be replaced with 11.1.0 automatically
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Copy all backend code
COPY . .

# Expose port for FastAPI
EXPOSE 8000

# The command is specified in docker-compose.yml
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]