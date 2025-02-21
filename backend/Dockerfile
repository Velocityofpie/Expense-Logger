# backend/Dockerfile

FROM python:3.11-slim

# Create a directory for the app
WORKDIR /app

# Copy requirements and install
COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Copy all backend code into the container
COPY . /app

# Expose port 8000 for FastAPI
EXPOSE 8000

# By default, docker-compose will override the CMD with "uvicorn main:app ..."
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
