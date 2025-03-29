# backend/services/template.py - FIXED VERSION

import re
from typing import Dict, Optional, Any
from sqlalchemy.orm import Session
from datetime import datetime

from services.ocr import extract_text_from_file
from utils.helpers import parse_date

def match_template_to_text(template_data: Dict, text: str) -> float:
    """Calculate how well a template matches the extracted text."""
    # Check for marker texts
    markers = template_data.get("identification", {}).get("markers", [])
    if not markers:
        return 0
    
    matched_markers = 0
    required_markers = 0
    
    for marker in markers:
        is_required = marker.get("required", False)
        marker_text = marker.get("text", "")
        
        if is_required:
            required_markers += 1
        
        if marker_text and marker_text.lower() in text.lower():
            matched_markers += 1
    
    # If any required markers are missing, it's not a match
    if required_markers > 0 and matched_markers < required_markers:
        return 0
    
    # Calculate match score based on percentage of markers found
    return matched_markers / len(markers) if len(markers) > 0 else 0


def process_with_template(file_path: str, template_data: Dict) -> Dict:
    """Process a document with a template and extract data."""
    # Extract text from the file
    text = extract_text_from_file(file_path)
    
    # Extract data using template fields
    fields = template_data.get("fields", [])
    extracted_data = {}
    fields_total = len(fields)
    fields_matched = 0
    field_results = []  # Store detailed results for each field
    
    for field in fields:
        field_name = field.get("field_name", "")
        if not field_name:
            continue
            
        # Get extraction regex patterns
        regex = field.get("extraction", {}).get("regex", "")
        alt_regex = field.get("extraction", {}).get("alternative_regex", "")
        
        # Try to match using the primary regex
        match = re.search(regex, text) if regex else None
        
        # If primary regex fails, try alternative
        if not match and alt_regex:
            match = re.search(alt_regex, text)
        
        # Prepare field result
        field_result = {
            "field_name": field_name,
            "display_name": field.get("display_name", field_name),
            "required": field.get("validation", {}).get("required", False),
            "matched": False,
            "value": None
        }
        
        # If we found a match, extract the data
        if match:
            fields_matched += 1
            field_result["matched"] = True
            
            # Get the first capture group, or the whole match if no groups
            value = match.group(1) if match.groups() else match.group(0)
            
            # Apply any post-processing
            post_processing = field.get("extraction", {}).get("post_processing", "")
            if post_processing == "trim":
                value = value.strip()
            
            # Store the extracted value
            extracted_data[field_name] = value
            field_result["value"] = value
        
        field_results.append(field_result)
    
    # Special handling for item details - split into separate item and count fields
    # If there's an "item_details" field in the template, process it
    for field in fields:
        if field.get("field_name") == "item_details":
            # Check if we've successfully extracted item_details
            if "item_details" in extracted_data and isinstance(extracted_data["item_details"], list):
                item_list = extracted_data["item_details"]
                
                # Create separate lists for item names and counts
                item_names = []
                item_counts = []
                
                for item in item_list:
                    # Extract name and quantity
                    item_names.append(item.get("product_name", ""))
                    item_counts.append(item.get("quantity", 1))
                
                # Add as separate fields in extracted data
                extracted_data["items"] = item_names
                extracted_data["item_counts"] = item_counts
    
    # Calculate match score
    match_score = fields_matched / fields_total if fields_total > 0 else 0
    
    return {
        "success": match_score > 0.5,  # At least 50% of fields must match
        "match_score": match_score,
        "fields_matched": fields_matched,
        "fields_total": fields_total,
        "extracted_data": extracted_data,
        "field_results": field_results  # Include detailed results
    }


# Update the update_invoice_with_extracted_data function to handle separated item fields

def update_invoice_with_extracted_data(invoice, extracted_data: Dict, db: Session):
    """Update an invoice with data extracted using a template."""
    # Map extracted fields to invoice fields
    field_mapping = {
        "order_number": "order_number",
        "purchase_date": "purchase_date",
        "grand_total": "grand_total",
        "shipping_handling": "shipping_handling",
        "estimated_tax": "estimated_tax",
        "total_before_tax": "total_before_tax",
        "payment_method": "payment_method",
        "billing_address": "billing_address",
        "merchant_name": "merchant_name",  # Make sure merchant_name is mapped
    }
    
    # Update invoice fields
    for template_field, invoice_field in field_mapping.items():
        if template_field in extracted_data:
            value = extracted_data[template_field]
            
            # Handle date fields
            if invoice_field == "purchase_date":
                # Try to parse dates in various formats
                date_formats = [
                    '%B %d, %Y',  # July 23, 2024
                    '%b %d, %Y',  # Jul 23, 2024
                    '%Y-%m-%d',   # 2024-07-23
                    '%m/%d/%Y',   # 07/23/2024
                    '%d/%m/%Y',   # 23/07/2024
                ]
                
                parsed_date = None
                for date_format in date_formats:
                    try:
                        parsed_date = datetime.strptime(value, date_format).date()
                        break
                    except ValueError:
                        continue
                
                if parsed_date:
                    value = parsed_date
                else:
                    continue
            
            # Handle numeric fields
            elif invoice_field in ["grand_total", "shipping_handling", "estimated_tax", "total_before_tax"]:
                # Extract the numeric part from values like "$123.45"
                numeric_match = re.search(r'(\d+\.\d+)', value)
                if numeric_match:
                    value = float(numeric_match.group(1))
                else:
                    continue
            
            # Set the value
            setattr(invoice, invoice_field, value)
    
    # Handle item details if available
    if "item_details" in extracted_data and isinstance(extracted_data["item_details"], list):
        # Import here to avoid circular imports
        from models.invoice import InvoiceItem
        
        # Create new invoice items
        for item_data in extracted_data["item_details"]:
            # Create a new invoice item
            item = InvoiceItem(
                invoice_id=invoice.invoice_id,
                product_name=item_data.get("product_name", ""),
                quantity=int(item_data.get("quantity", 1)),
                unit_price=float(item_data.get("price", 0)),
                product_link=item_data.get("product_link", ""),
                condition=item_data.get("condition", "New"),
                item_type=item_data.get("item_type", "")  # Make sure to include item_type
            )
            db.add(item)
    # Add support for separated items and item_counts
    elif "items" in extracted_data and "item_counts" in extracted_data:
        # Import here to avoid circular imports
        from models.invoice import InvoiceItem
        
        # Get the lists
        items = extracted_data["items"]
        counts = extracted_data["item_counts"]
        
        # Make sure both lists have data and are the same length
        if items and counts and len(items) == len(counts):
            for i in range(len(items)):
                # Create a new invoice item
                item = InvoiceItem(
                    invoice_id=invoice.invoice_id,
                    product_name=items[i],
                    quantity=int(counts[i]),
                    unit_price=0,  # Default unit price since we don't have it
                    item_type=extracted_data.get("category", "")  # Use category as item_type if available
                )
                db.add(item)
    
    # Extract and set tags/categories if available
    if "tags" in extracted_data and isinstance(extracted_data["tags"], list):
        from utils.helpers import get_or_create_tag
        
        for tag_name in extracted_data["tags"]:
            tag = get_or_create_tag(db, tag_name)
            invoice.tags.append(tag)
    
    if "categories" in extracted_data and isinstance(extracted_data["categories"], list):
        from utils.helpers import get_or_create_category
        
        for category_name in extracted_data["categories"]:
            category = get_or_create_category(db, category_name)
            invoice.categories.append(category)


def find_matching_template(file_path: str, db: Session) -> Optional[Any]:
    """Find the best matching template for a document."""
    # Extract text from the file
    extracted_text = extract_text_from_file(file_path)
    
    # Import here to avoid circular imports
    from models.template import InvoiceTemplate  # FIXED: Changed from backend.models.template
    
    # Get all active templates
    templates = db.query(InvoiceTemplate).filter(InvoiceTemplate.is_active == True).all()
    
    best_match = None
    best_score = 0
    
    # Try to match each template
    for template in templates:
        score = match_template_to_text(template.template_data, extracted_text)
        if score > best_score and score > 0.5:  # Require at least 50% match
            best_match = template
            best_score = score
    
    return best_match