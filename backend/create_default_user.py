# backend/create_default_user.py

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
from datetime import datetime
from main import User, Base

def create_default_user():
    """Create a default user if one doesn't exist already."""
    # Get database connection info from environment or use defaults
    DB_HOST = os.environ.get("DB_HOST", "postgres_db")
    DB_NAME = os.environ.get("DB_NAME", "expense_logger")
    DB_USER = os.environ.get("DB_USER", "postgres")
    DB_PASSWORD = os.environ.get("DB_PASSWORD", "secret")

    DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}/{DB_NAME}"
    
    try:
        # Create engine and session
        engine = create_engine(DATABASE_URL)
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        db = SessionLocal()
        
        # Check if default user exists
        default_user = db.query(User).filter(User.user_id == 1).first()
        
        if not default_user:
            # Create default user
            default_user = User(
                user_id=1,
                username="default",
                password_hash="defaultpasswordhash",
                email="default@example.com",
                created_at=datetime.utcnow(),
                is_deleted=False
            )
            
            db.add(default_user)
            db.commit()
            print("Default user created successfully")
        else:
            print("Default user already exists")
            
        db.close()
        return True
    except Exception as e:
        print(f"Error creating default user: {e}")
        return False

if __name__ == "__main__":
    create_default_user()