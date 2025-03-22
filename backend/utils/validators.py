# backend/utils/validators.py
from typing import Dict, Any, List, Optional
from fastapi import HTTPException

def validate_invoice_data(data: Dict[str, Any]) -> Dict[str, Any]:
    """Validate invoice data before processing."""
    errors = []
    
    # Check required fields
    if 'grand_total' in data and data['grand_total'] is not None:
        if not isinstance(data['grand_total'], (int, float)) or data['grand_total'] < 0:
            errors.append("Grand total must be a non-negative number")
    
    # Check status values
    valid_statuses = ["Open", "Paid", "Draft", "Needs Attention", "Resolved"]
    if 'status' in data and data['status'] is not None:
        if data['status'] not in valid_statuses:
            errors.append(f"Status must be one of: {', '.join(valid_statuses)}")
    
    # Check items structure
    if 'items' in data and data['items'] is not None:
        if not isinstance(data['items'], list):
            errors.append("Items must be a list")
        else:
            for i, item in enumerate(data['items']):
                if not isinstance(item, dict):
                    errors.append(f"Item at index {i} must be an object")
                elif 'product_name' not in item or not item['product_name']:
                    errors.append(f"Item at index {i} must have a product name")
    
    # If there are validation errors, raise an exception
    if errors:
        raise HTTPException(status_code=400, detail={"errors": errors})
    
    return data