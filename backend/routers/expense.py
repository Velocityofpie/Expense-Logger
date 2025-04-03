# backend/routers/expense.py
from typing import List, Optional
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session
import json

from database import get_db
from models.invoice import Invoice, InvoiceItem, ExpenseCategory, InvoiceExpenseCategory, Category, InvoiceCategory
from schemas.expense import ExpenseSummary, ExpenseResponse, ExpenseGroupResponse

router = APIRouter(
    prefix="/expenses",
    tags=["expenses"],
    responses={404: {"description": "Not found"}}
)

@router.get("/categories/", response_model=List[str])
async def get_expense_categories(db: Session = Depends(get_db), user_id: Optional[int] = None):
    """Get all expense categories, optionally filtered by user."""
    try:
        query = db.query(ExpenseCategory.name)
        
        if user_id:
            query = query.filter(ExpenseCategory.user_id == user_id)
            
        categories = query.all()
        return [category[0] for category in categories]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/summary/", response_model=List[ExpenseGroupResponse])
async def get_expense_summary(
    db: Session = Depends(get_db), 
    user_id: Optional[int] = None,
    category: Optional[str] = None,
    date_filter: Optional[str] = None,
    view_by: Optional[str] = "category"
):
    """Get expense summary data, grouped by the specified view_by parameter."""
    try:
        # Base query
        query = db.query(Invoice).filter(Invoice.is_deleted == False)
        
        # Apply filters
        if user_id:
            query = query.filter(Invoice.user_id == user_id)
            
        # Updated category filtering to check regular Categories
        if category and category != "All":
            # Try to find the category in either Category or ExpenseCategory
            query = query.join(InvoiceCategory).join(Category)
            query = query.filter(Category.category_name == category)
            
        if date_filter and date_filter != "all":
            # Handle date filtering logic here
            now = datetime.utcnow()
            months_to_subtract = {
                "3months": 3,
                "6months": 6,
                "1year": 12
            }.get(date_filter, 0)
            
            if months_to_subtract > 0:
                cutoff_date = now - timedelta(days=30 * months_to_subtract)
                query = query.filter(Invoice.purchase_date >= cutoff_date)
        
        # Get all matching invoices
        invoices = query.all()
        
        # Process and group the data based on view_by parameter
        grouped_data = []
        
        if view_by == "category":
            # Group by category
            categories = {}
            for invoice in invoices:
                if invoice.categories:
                    for category_obj in invoice.categories:
                        # Convert Category object to string
                        category = category_obj.category_name if hasattr(category_obj, 'category_name') else str(category_obj)
                        
                        if category not in categories:
                            categories[category] = {
                                "name": category,
                                "count": 0,
                                "total": 0,
                                "items": []
                            }
                        categories[category]["count"] += 1
                        categories[category]["total"] += float(invoice.grand_total or 0)
                        
                        # Add invoice data to items
                        item_data = {
                            "id": invoice.invoice_id,
                            "store": invoice.merchant_name or "",
                            "orderNumber": invoice.order_number or f"Order # {invoice.invoice_id}",
                            "date": invoice.purchase_date.strftime("%B %d, %Y") if invoice.purchase_date else "",
                            "category": category,  # Use string value
                            "creditCard": invoice.payment_method or "",
                            "total": float(invoice.grand_total or 0),
                            "products": []
                        }
                        
                        # Add product data
                        for item in invoice.items:
                            item_data["products"].append({
                                "name": item.product_name,
                                "price": float(item.unit_price) if item.unit_price else 0,
                                "quantity": item.quantity if item.quantity else 0
                            })
                            
                        categories[category]["items"].append(item_data)
                else:
                    # Handle uncategorized invoices
                    category = "Uncategorized"
                    if category not in categories:
                        categories[category] = {
                            "name": category,
                            "count": 0,
                            "total": 0,
                            "items": []
                        }
                    categories[category]["count"] += 1
                    categories[category]["total"] += float(invoice.grand_total or 0)
                    
                    # Add invoice data to items (same as above)
                    item_data = {
                        "id": invoice.invoice_id,
                        "store": invoice.merchant_name or "",
                        "orderNumber": invoice.order_number or f"Order # {invoice.invoice_id}",
                        "date": invoice.purchase_date.strftime("%B %d, %Y") if invoice.purchase_date else "",
                        "category": category,
                        "creditCard": invoice.payment_method or "",
                        "total": float(invoice.grand_total or 0),
                        "products": []
                    }
                    
                    for item in invoice.items:
                        item_data["products"].append({
                            "name": item.product_name,
                            "price": float(item.unit_price) if item.unit_price else 0,
                            "quantity": item.quantity if item.quantity else 0
                        })
                        
                    categories[category]["items"].append(item_data)
            
            # Convert dictionary to list
            grouped_data = list(categories.values())
            
        elif view_by == "store":
            # Group by store/merchant
            stores = {}
            for invoice in invoices:
                store = invoice.merchant_name or "Unknown"
                if store not in stores:
                    stores[store] = {
                        "name": store,
                        "count": 0,
                        "total": 0,
                        "items": []
                    }
                stores[store]["count"] += 1
                stores[store]["total"] += float(invoice.grand_total or 0)
                
                # Get category as string
                category = "Uncategorized"
                if invoice.categories and len(invoice.categories) > 0:
                    category_obj = invoice.categories[0]
                    category = category_obj.category_name if hasattr(category_obj, 'category_name') else str(category_obj)
                
                # Add invoice data (similar to above)
                item_data = {
                    "id": invoice.invoice_id,
                    "store": store,
                    "orderNumber": invoice.order_number or f"Order # {invoice.invoice_id}",
                    "date": invoice.purchase_date.strftime("%B %d, %Y") if invoice.purchase_date else "",
                    "category": category,
                    "creditCard": invoice.payment_method or "",
                    "total": float(invoice.grand_total or 0),
                    "products": []
                }
                
                for item in invoice.items:
                    item_data["products"].append({
                        "name": item.product_name,
                        "price": float(item.unit_price) if item.unit_price else 0,
                        "quantity": item.quantity if item.quantity else 0
                    })
                    
                stores[store]["items"].append(item_data)
            
            # Convert dictionary to list
            grouped_data = list(stores.values())
            
        elif view_by == "date":
            # Group by month
            months = {}
            for invoice in invoices:
                if invoice.purchase_date:
                    month_year = invoice.purchase_date.strftime("%B %Y")
                else:
                    month_year = "Unknown Date"
                    
                if month_year not in months:
                    months[month_year] = {
                        "name": month_year,
                        "count": 0,
                        "total": 0,
                        "items": []
                    }
                months[month_year]["count"] += 1
                months[month_year]["total"] += float(invoice.grand_total or 0)
                
                # Get category as string
                category = "Uncategorized"
                if invoice.categories and len(invoice.categories) > 0:
                    category_obj = invoice.categories[0]
                    category = category_obj.category_name if hasattr(category_obj, 'category_name') else str(category_obj)
                
                # Add invoice data (similar to above)
                item_data = {
                    "id": invoice.invoice_id,
                    "store": invoice.merchant_name or "",
                    "orderNumber": invoice.order_number or f"Order # {invoice.invoice_id}",
                    "date": invoice.purchase_date.strftime("%B %d, %Y") if invoice.purchase_date else "",
                    "category": category,
                    "creditCard": invoice.payment_method or "",
                    "total": float(invoice.grand_total or 0),
                    "products": []
                }
                
                for item in invoice.items:
                    item_data["products"].append({
                        "name": item.product_name,
                        "price": float(item.unit_price) if item.unit_price else 0,
                        "quantity": item.quantity if item.quantity else 0
                    })
                    
                months[month_year]["items"].append(item_data)
            
            # Convert dictionary to list
            grouped_data = list(months.values())
            
        elif view_by == "card":
            # Group by credit card
            cards = {}
            for invoice in invoices:
                card = invoice.payment_method or "Unknown"
                if card not in cards:
                    cards[card] = {
                        "name": card,
                        "count": 0,
                        "total": 0,
                        "items": []
                    }
                cards[card]["count"] += 1
                cards[card]["total"] += float(invoice.grand_total or 0)
                
                # Get category as string
                category = "Uncategorized"
                if invoice.categories and len(invoice.categories) > 0:
                    category_obj = invoice.categories[0]
                    category = category_obj.category_name if hasattr(category_obj, 'category_name') else str(category_obj)
                
                # Add invoice data (similar to above)
                item_data = {
                    "id": invoice.invoice_id,
                    "store": invoice.merchant_name or "",
                    "orderNumber": invoice.order_number or f"Order # {invoice.invoice_id}",
                    "date": invoice.purchase_date.strftime("%B %d, %Y") if invoice.purchase_date else "",
                    "category": category,
                    "creditCard": card,
                    "total": float(invoice.grand_total or 0),
                    "products": []
                }
                
                for item in invoice.items:
                    item_data["products"].append({
                        "name": item.product_name,
                        "price": float(item.unit_price) if item.unit_price else 0,
                        "quantity": item.quantity if item.quantity else 0
                    })
                    
                cards[card]["items"].append(item_data)
            
            # Convert dictionary to list
            grouped_data = list(cards.values())
            
        elif view_by == "itemType":
            # Group by item type
            item_types = {}
            for invoice in invoices:
                for item in invoice.items:
                    item_type = item.item_type or "Other"
                    if item_type not in item_types:
                        item_types[item_type] = {
                            "name": item_type,
                            "count": 0,
                            "total": 0,
                            "items": []
                        }
                    
                    # Only count the invoice once per item type
                    if not any(i["id"] == invoice.invoice_id for i in item_types[item_type]["items"]):
                        item_types[item_type]["count"] += 1
                        item_types[item_type]["total"] += float(invoice.grand_total or 0)
                        
                        # Get category as string
                        category = "Uncategorized"
                        if invoice.categories and len(invoice.categories) > 0:
                            category_obj = invoice.categories[0]
                            category = category_obj.category_name if hasattr(category_obj, 'category_name') else str(category_obj)
                        
                        # Add invoice data (similar to above)
                        item_data = {
                            "id": invoice.invoice_id,
                            "store": invoice.merchant_name or "",
                            "orderNumber": invoice.order_number or f"Order # {invoice.invoice_id}",
                            "date": invoice.purchase_date.strftime("%B %d, %Y") if invoice.purchase_date else "",
                            "category": category,
                            "creditCard": invoice.payment_method or "",
                            "total": float(invoice.grand_total or 0),
                            "products": []
                        }
                        
                        # Add relevant products (of this item type)
                        for inv_item in invoice.items:
                            if inv_item.item_type == item_type:
                                item_data["products"].append({
                                    "name": inv_item.product_name,
                                    "price": float(inv_item.unit_price) if inv_item.unit_price else 0,
                                    "quantity": inv_item.quantity if inv_item.quantity else 0
                                })
                                
                        item_types[item_type]["items"].append(item_data)
            
            # Convert dictionary to list
            grouped_data = list(item_types.values())
        
        # Sort grouped data by total (descending)
        grouped_data.sort(key=lambda x: x["total"], reverse=True)
            
        return grouped_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))