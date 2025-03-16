#!/bin/bash

# Wait for PostgreSQL to be ready
until PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "\q"; do
  >&2 echo "Postgres is unavailable - sleeping"
  sleep 1
done

>&2 echo "Postgres is up - starting application"

# Create tables if they don't exist
python -c "from main import Base, engine; Base.metadata.create_all(engine)"

# Create a default user if it doesn't exist
python -c "
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
import os
from datetime import datetime

DB_HOST = os.environ.get('DB_HOST', 'postgres_db')
DB_NAME = os.environ.get('DB_NAME', 'expense_logger')
DB_USER = os.environ.get('DB_USER', 'postgres')
DB_PASSWORD = os.environ.get('DB_PASSWORD', 'secret')

DATABASE_URL = f'postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}/{DB_NAME}'
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

# Check if default user exists
result = db.execute(text('SELECT count(*) FROM users WHERE user_id = 1')).scalar()

if result == 0:
    # Add default user
    db.execute(text(\"\"\"
        INSERT INTO users (user_id, username, password_hash, email, created_at, is_deleted) 
        VALUES (1, 'default', 'defaultpasswordhash', 'default@example.com', :created_at, false)
    \"\"\"), {'created_at': datetime.utcnow()})
    db.commit()
    print('Default user created')
else:
    print('Default user already exists')

db.close()
"

# Start application
uvicorn main:app --host 0.0.0.0 --port 8000 --reload