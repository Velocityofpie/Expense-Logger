# backend/services/template.py

import re
from typing import Dict, Optional, Any, List
from sqlalchemy.orm import Session
from datetime import datetime

from backend.features.ocr.services import extract_text_from_file
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
            
        # Get data type
        data_type = field.get("data_type", "string")
        
        # Get extraction regex patterns
        regex = field.get("extraction", {}).get("regex", "")
        alt_regex = field.get("extraction", {}).get("alternative_regex", "")
        
        # Prepare field result
        field_result = {
            "field_name": field_name,
            "display_name": field.get("display_name", field_name),
            "required": field.get("validation", {}).get("required", False),
            "matched": False,
            "value": None
        }
        
        # Handle different data types
        if data_type == "array":
            # For array types, find all matches in the text
            matches = []
            
            # Try to match using the primary regex
            if regex:
                # Get all matches
                all_matches = list(re.finditer(regex, text))
                
                # Check if we need to process capture groups differently
                capture_groups = field.get("extraction", {}).get("capture_groups", {})
                
                if all_matches:
                    # We found at least one match for an array field
                    fields_matched += 1
                    field_result["matched"] = True
                    
                    # Process each match
                    for match in all_matches:
                        if capture_groups:
                            # Process structured capture groups
                            item_data = {}
                            for key, group_index in capture_groups.items():
                                try:
                                    item_data[key] = match.group(group_index)
                                except (IndexError, AttributeError):
                                    pass
                            matches.append(item_data)
                        else:
                            # Simple array item (just the match)
                            value = match.group(1) if match.groups() else match.group(0)
                            matches.append(value)
                
                # If primary regex fails, try alternative
                if not matches and alt_regex:
                    all_matches = list(re.finditer(alt_regex, text))
                    for match in all_matches:
                        value = match.group(1) if match.groups() else match.group(0)
                        matches.append(value)
            
            # Store the extracted array
            if matches:
                extracted_data[field_name] = matches
                field_result["value"] = f"{len(matches)} item(s)"  # This is already a string
            
        else:
            # For non-array types, find the first match
            # Try to match using the primary regex
            match = re.search(regex, text) if regex else None
            
            # If primary regex fails, try alternative
            if not match and alt_regex:
                match = re.search(alt_regex, text)
            
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
                
                # Handle data type conversion
                if data_type == "date":
                    value = value  # Keep as string, we'll convert it later
                elif data_type == "currency":
                    # Try to extract numeric value
                    numeric_match = re.search(r'(\d+\.\d+)', value)
                    value = float(numeric_match.group(1)) if numeric_match else value
                
                # Store the extracted value
                extracted_data[field_name] = value
                # Make sure field_result["value"] is always a string
                field_result["value"] = str(value) if value is not None else None
        
        field_results.append(field_result)
    
    # Special processing for item_details into proper item objects
    if "item_details" in extracted_data and isinstance(extracted_data["item_details"], list):
        items = []
        
        for item_data in extracted_data["item_details"]:
            # Check if item_data is already a dict (structured capture groups)
            if isinstance(item_data, dict):
                # Process quantity
                quantity = 1
                if "quantity" in item_data:
                    try:
                        quantity = int(item_data["quantity"])
                    except (ValueError, TypeError):
                        quantity = 1
                
                # Process item name
                name = item_data.get("name", "Unknown item")
                
                # Build proper item object
                item = {
                    "product_name": name,
                    "quantity": quantity,
                    "unit_price": 0,  # We don't have price info yet
                    "condition": item_data.get("condition", "New"),
                    "item_type": ""  # Add default item_type
                }
                
                items.append(item)
            else:
                # Simple string item, add as product name
                items.append({
                    "product_name": item_data,
                    "quantity": 1,
                    "unit_price": 0,
                    "condition": "New",
                    "item_type": ""
                })
        
        # Replace the raw matches with properly structured items
        extracted_data["item_details"] = items
    
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
        "merchant_name": "merchant_name",
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
                # If it's already a float, use it
                if isinstance(value, float):
                    pass
                # Otherwise, try to extract the numeric part from values like "$123.45"
                elif isinstance(value, str):
                    numeric_match = re.search(r'(\d+\.\d+)', value)
                    if numeric_match:
                        value = float(numeric_match.group(1))
                    else:
                        continue
                else:
                    continue
            
            # Set the value
            setattr(invoice, invoice_field, value)
    
    # Import here to avoid circular imports
    from backend.features.invoices.models import InvoiceItem
    
    # Handle item details if available (preferred method)
    if "item_details" in extracted_data and isinstance(extracted_data["item_details"], list):
        # Create new invoice items
        for item_data in extracted_data["item_details"]:
            # Create a new invoice item
            item = InvoiceItem(
                invoice_id=invoice.invoice_id,
                product_name=item_data.get("product_name", ""),
                quantity=int(item_data.get("quantity", 1)),
                unit_price=float(item_data.get("unit_price", 0)),
                product_link=item_data.get("product_link", ""),
                condition=item_data.get("condition", "New"),
                item_type=item_data.get("item_type", "")
            )
            db.add(item)
            
    # Fallback: Handle separate item/count lists
    elif "items" in extracted_data and "item_counts" in extracted_data:
        # Get the lists
        items = extracted_data["items"]
        counts = extracted_data["item_counts"]
        
        # Make sure both lists have data
        if items and counts:
            # Convert counts to integers if they're strings
            parsed_counts = []
            for count in counts:
                try:
                    if isinstance(count, str):
                        parsed_counts.append(int(count))
                    else:
                        parsed_counts.append(count)
                except (ValueError, TypeError):
                    parsed_counts.append(1)
            
            # Process items and counts
            for i in range(len(items)):
                # Get the count for this item (use 1 if index is out of range)
                quantity = parsed_counts[i] if i < len(parsed_counts) else 1
                
                # Create a new invoice item
                item = InvoiceItem(
                    invoice_id=invoice.invoice_id,
                    product_name=items[i],
                    quantity=quantity,
                    unit_price=0,  # Default unit price since we don't have it
                    item_type=extracted_data.get("category", "")  # Use category as item_type if available
                )
                db.add(item)
    
    # Get item prices if available
    if "item_prices" in extracted_data and isinstance(extracted_data["item_prices"], list):
        # Get newly created items for this invoice
        invoice_items = db.query(InvoiceItem).filter(InvoiceItem.invoice_id == invoice.invoice_id).all()
        prices = extracted_data["item_prices"]
        
        # Update prices for items
        for i, price in enumerate(prices):
            if i < len(invoice_items):
                try:
                    if isinstance(price, str):
                        # Convert string price to float
                        numeric_match = re.search(r'(\d+\.\d+)', price)
                        if numeric_match:
                            invoice_items[i].unit_price = float(numeric_match.group(1))
                    else:
                        invoice_items[i].unit_price = float(price)
                except (ValueError, TypeError):
                    pass
    
    # Get item types if available
    if "item_types" in extracted_data and isinstance(extracted_data["item_types"], list):
        # Get newly created items for this invoice
        invoice_items = db.query(InvoiceItem).filter(InvoiceItem.invoice_id == invoice.invoice_id).all()
        types = extracted_data["item_types"]
        
        # Update types for items
        for i, item_type in enumerate(types):
            if i < len(invoice_items):
                invoice_items[i].item_type = item_type
    
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
    from backend.features.templates.models import InvoiceTemplate
    
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