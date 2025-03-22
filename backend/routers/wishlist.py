# backend/routers/wishlist.py
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session

from database import get_db
from models.wishlist import WishlistItem
from schemas.wishlist import WishlistItemResponse

router = APIRouter(
    prefix="",
    tags=["wishlist"],
    responses={404: {"description": "Not found"}},
)

@router.post("/wishlist/", response_model=dict)
async def add_wishlist_item(
    product_name: str = Body(...),
    product_link: str = Body(...),
    user_id: int = Body(1),
    db: Session = Depends(get_db)
):
    """Add an item to the user's wishlist."""
    try:
        wishlist_item = WishlistItem(
            user_id=user_id,
            product_name=product_name,
            product_link=product_link
        )
        db.add(wishlist_item)
        db.commit()
        return {"message": "Item added to wishlist", "wishlist_id": wishlist_item.wishlist_id}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/wishlist/", response_model=List[dict])
async def get_wishlist(user_id: int = 1, db: Session = Depends(get_db)):
    """Get all items in a user's wishlist."""
    try:
        items = db.query(WishlistItem).filter(WishlistItem.user_id == user_id).all()
        return [
            {
                "wishlist_id": item.wishlist_id,
                "product_name": item.product_name,
                "product_link": item.product_link,
                "added_at": item.created_at
            } for item in items
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/wishlist/{wishlist_id}")
async def delete_wishlist_item(wishlist_id: int, db: Session = Depends(get_db)):
    """Remove an item from the wishlist."""
    try:
        item = db.query(WishlistItem).filter(WishlistItem.wishlist_id == wishlist_id).first()
        if not item:
            raise HTTPException(status_code=404, detail="Wishlist item not found")
        
        db.delete(item)
        db.commit()
        return {"message": "Item removed from wishlist"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))