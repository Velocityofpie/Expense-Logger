# backend/routers/expense.py

@router.get("/expenses/categories/")
async def get_expense_categories(db: Session = Depends(get_db), user_id: Optional[int] = None):
    """Get all expense categories, optionally filtered by user."""
    try:
        query = db.query(ExpenseCategory)
        
        if user_id:
            query = query.filter(ExpenseCategory.user_id == user_id)
            
        categories = query.all()
        return categories
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/expenses/summary/")
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
            
        if category and category != "All":
            query = query.join(InvoiceExpenseCategory).join(ExpenseCategory)
            query = query.filter(ExpenseCategory.name == category)
            
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
            # Group by category logic
            pass
        elif view_by == "store":
            # Group by store logic
            pass
        elif view_by == "date":
            # Group by date logic
            pass
        elif view_by == "card":
            # Group by credit card logic
            pass
            
        return grouped_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))