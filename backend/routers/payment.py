# backend/routers/payments.py
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session

from database import get_db
from models.payment import Card, CardNumber, Payment
from models.invoice import Invoice
from schemas.payment import CardCreate, CardResponse, CardNumberCreate, PaymentCreate

router = APIRouter(
    prefix="",
    tags=["payments"],
    responses={404: {"description": "Not found"}},
)

@router.post("/cards/", response_model=dict)
async def add_card(card_name: str = Body(...), user_id: int = Body(1), db: Session = Depends(get_db)):
    """Add a new card."""
    try:
        card = Card(
            user_id=user_id,
            card_name=card_name
        )
        db.add(card)
        db.commit()
        return {"message": "Card added successfully", "card_id": card.card_id}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/card-numbers/", response_model=dict)
async def add_card_number(
    card_id: int = Body(...),
    last_four: str = Body(...),
    expiration_date: str = Body(...),
    db: Session = Depends(get_db)
):
    """Add a new card number to an existing card."""
    try:
        # Check if card exists
        card = db.query(Card).filter(Card.card_id == card_id).first()
        if not card:
            raise HTTPException(status_code=404, detail="Card not found")
        
        # Parse date using helper function
        from utils.helpers import parse_date
        exp_date = parse_date(expiration_date)
        if not exp_date:
            raise HTTPException(status_code=400, detail="Invalid expiration date format")
        
        # Add card number
        card_number = CardNumber(
            card_id=card_id,
            last_four=last_four,
            expiration_date=exp_date
        )
        db.add(card_number)
        db.commit()
        
        return {"message": "Card number added successfully", "card_number_id": card_number.card_number_id}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/payments/", response_model=dict)
async def add_payment(
    invoice_id: int = Body(...),
    card_number_id: int = Body(...), 
    amount: float = Body(...),
    transaction_id: str = Body(...),
    db: Session = Depends(get_db)
):
    """Add a payment for an invoice."""
    try:
        # Check if invoice exists
        invoice = db.query(Invoice).filter(Invoice.invoice_id == invoice_id, Invoice.is_deleted == False).first()
        if not invoice:
            raise HTTPException(status_code=404, detail="Invoice not found")
        
        # Check if card number exists
        card_number = db.query(CardNumber).filter(CardNumber.card_number_id == card_number_id).first()
        if not card_number:
            raise HTTPException(status_code=404, detail="Card number not found")
        
        # Add payment
        payment = Payment(
            invoice_id=invoice_id,
            card_number_id=card_number_id,
            amount=amount,
            transaction_id=transaction_id
        )
        db.add(payment)
        
        # Update invoice status if needed (e.g., change to "Paid" if total payment matches grand_total)
        total_payments = sum([float(p.amount) for p in invoice.payments]) + amount
        if total_payments >= float(invoice.grand_total or 0):
            old_status = invoice.status
            invoice.status = "Paid"
            
            # Add status history if status changed
            if old_status != "Paid":
                from utils.helpers import add_status_history
                add_status_history(db, invoice_id, "Paid")
        
        db.commit()
        return {"message": "Payment added successfully", "payment_id": payment.payment_id}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))