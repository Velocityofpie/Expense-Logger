# features/auth/router.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from core.database import get_db
from features.auth.models import User
from features.auth.schemas import UserCreate, UserResponse

router = APIRouter(
    prefix="/users",
    tags=["users"],
    responses={404: {"description": "Not found"}},
)

@router.get("/", response_model=list[UserResponse])
async def get_users(db: Session = Depends(get_db), skip: int = 0, limit: int = 100):
    """Get all users."""
    users = db.query(User).filter(User.is_deleted == False).offset(skip).limit(limit).all()
    return users


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: int, db: Session = Depends(get_db)):
    """Get a specific user by ID."""
    user = db.query(User).filter(User.user_id == user_id, User.is_deleted == False).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.post("/", response_model=UserResponse)
async def create_user(user_data: UserCreate, db: Session = Depends(get_db)):
    """Create a new user."""
    # In a real app, you would add password hashing here
    new_user = User(
        username=user_data.username,
        email=user_data.email,
        password_hash=user_data.password  # Note: should be hashed in production
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user