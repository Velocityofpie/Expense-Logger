# backend/Dockerfile

FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    postgresql-client \
    gcc \
    python3-dev \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Create a directory for the app
WORKDIR /app

# Create uploads directory
RUN mkdir -p /app/uploads && chmod 777 /app/uploads

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Copy all backend code into the container
COPY . .

# Create start script
RUN echo '#!/bin/bash\n\
# Wait for PostgreSQL to be ready\n\
until PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "\\q"; do\n\
  >&2 echo "Postgres is unavailable - sleeping"\n\
  sleep 1\n\
done\n\
\n\
>&2 echo "Postgres is up - starting application"\n\
\n\
# Create tables if they dont exist\n\
python -c "from main import Base, engine; Base.metadata.create_all(engine)"\n\
\n\
# Start application\n\
uvicorn main:app --host 0.0.0.0 --port 8000 --reload\n\
' > /app/start.sh

RUN chmod +x /app/start.sh

# Expose port 8000 for FastAPI
EXPOSE 8000

# Start application
CMD ["/bin/bash", "/app/start.sh"]