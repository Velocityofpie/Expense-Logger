#!/bin/bash

# Wait for PostgreSQL to be ready
until PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "\q"; do
  >&2 echo "Postgres is unavailable - sleeping"
  sleep 1
done

>&2 echo "Postgres is up - starting application"

# Create database schema if it doesn't exist
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "
CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE
);

-- Create default user if not exists
INSERT INTO users (user_id, username, password_hash, email, is_deleted)
SELECT 1, 'default', 'defaultpasswordhash', 'default@example.com', false
WHERE NOT EXISTS (SELECT 1 FROM users WHERE user_id = 1);
"

# Now let SQLAlchemy create the rest of the tables
python -c "from main import Base, engine; Base.metadata.create_all(engine)"

# Start application
uvicorn main:app --host 0.0.0.0 --port 8000 --reload