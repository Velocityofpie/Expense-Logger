# features/templates/services.py

import re
import logging
from typing import Dict, Optional, Any, List
from sqlalchemy.orm import Session
from datetime import datetime

from features.ocr.services import extract_text_from_file
from utils.helpers import parse_date

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def match_template_to_text(template_data: Dict, text: str) -> float:
    """Calculate how well a template matches the extracted text."""
    # Check for marker texts
    markers = template_data.get("identification", {}).get("markers", [])
    if not markers:
        return 0
    
    matched_markers = 0
    required_markers = 0
    
    logger.info(f"Template has {len(markers)} markers, checking against text of length {len(text)}")
    
    for marker in markers:
        is_required = marker.get("required", False)
        marker_text = marker.get("text", "").lower()  # Convert to lowercase for case-insensitive matching
        
        if is_required:
            required_markers += 1
        
        if marker_text and marker_text in text.lower():
            matched_markers += 1
            logger.info(f"✅ Marker matched: '{marker_text}'")
        else:
            logger.info(f"❌ Marker not found: '{marker_text}'")
    
    # If any required markers are missing, it's not a match
    if required_markers > 0 and matched_markers < required_markers:
        logger.warning(f"Required markers missing: found {matched_markers} of {required_markers}")
        return 0
    
    # Calculate match score based on percentage of markers found
    match_score = matched_markers / len(markers) if len(markers) > 0 else 0
    logger.info(f"Template match score: {match_score:.2f}")
    return match_score


def process_with_template(file_path: str, template_data: Dict) -> Dict:
    """Process a document with a template and extract data with improved regex matching."""
    # Extract text from the file
    text = extract_text_from_file(file_path)
    
    logger.info(f"Extracted text from {file_path}: {len(text)} characters")
    
    # Save a sample of text for debugging
    text_sample = text[:500] + ("..." if len(text) > 500 else "")
    logger.info(f"Text sample: {text_sample}")
    
    # Extract data using template fields
    fields = template_data.get("fields", [])
    extracted_data = {}
    fields_total = len(fields)
    fields_matched = 0
    field_results = []  # Store detailed results for each field
    field_debug_info = {}  # Store debugging information
    
    for field in fields:
        field_name = field.get("field_name", "")
        if not field_name:
            continue
        
        # Get data type
        data_type = field.get("data_type", "string")
        
        # Get extraction regex patterns - convert to lowercase for better matching
        regex = field.get("extraction", {}).get("regex", "")
        alt_regex = field.get("extraction", {}).get("alternative_regex", "")
        additional_regex = field.get("extraction", {}).get("additional_patterns", [])
        
        # Prepare field result
        field_result = {
            "field_name": field_name,
            "display_name": field.get("display_name", field_name),
            "required": field.get("validation", {}).get("required", False),
            "matched": False,
            "value": None,
            "match_method": None
        }
        
        # Debugging info for this field
        field_debug = {
            "regex_tried": [],
            "matches_found": [],
            "final_match": None
        }
        
        # Try multiple approaches to increase chances of matching
        match = None
        match_value = None
        match_method = None
        
        # Try with the primary regex
        if regex:
            field_debug["regex_tried"].append({"pattern": regex, "type": "primary"})
            try:
                # Try case-insensitive matching
                match = re.search(regex, text, re.IGNORECASE)
                if match:
                    match_value = match.group(1) if match.groups() else match.group(0)
                    match_method = "primary_regex"
                    field_debug["matches_found"].append({"pattern": "primary", "value": match_value})
            except Exception as e:
                logger.error(f"Error with primary regex for {field_name}: {e}")
        
        # If primary regex fails, try alternative
        if not match and alt_regex:
            field_debug["regex_tried"].append({"pattern": alt_regex, "type": "alternative"})
            try:
                match = re.search(alt_regex, text, re.IGNORECASE)
                if match:
                    match_value = match.group(1) if match.groups() else match.group(0)
                    match_method = "alternative_regex"
                    field_debug["matches_found"].append({"pattern": "alternative", "value": match_value})
            except Exception as e:
                logger.error(f"Error with alternative regex for {field_name}: {e}")
        
        # Try additional patterns if provided
        if not match and additional_regex:
            for i, pattern in enumerate(additional_regex):
                field_debug["regex_tried"].append({"pattern": pattern, "type": f"additional_{i}"})
                try:
                    match = re.search(pattern, text, re.IGNORECASE)
                    if match:
                        match_value = match.group(1) if match.groups() else match.group(0)
                        match_method = f"additional_regex_{i}"
                        field_debug["matches_found"].append({"pattern": f"additional_{i}", "value": match_value})
                        break
                except Exception as e:
                    logger.error(f"Error with additional regex #{i} for {field_name}: {e}")
        
        # Try common patterns based on field type if no match yet
        if not match:
            common_patterns = get_common_patterns_for_field_type(field_name, data_type)
            for i, pattern in enumerate(common_patterns):
                field_debug["regex_tried"].append({"pattern": pattern, "type": f"common_{i}"})
                try:
                    match = re.search(pattern, text, re.IGNORECASE)
                    if match:
                        match_value = match.group(1) if match.groups() else match.group(0)
                        match_method = f"common_pattern_{i}"
                        field_debug["matches_found"].append({"pattern": f"common_{i}", "value": match_value})
                        break
                except Exception as e:
                    logger.error(f"Error with common pattern #{i} for {field_name}: {e}")
        
        # If we found a match, process it
        if match_value:
            fields_matched += 1
            field_result["matched"] = True
            field_result["match_method"] = match_method
            
            # Apply any post-processing
            post_processing = field.get("extraction", {}).get("post_processing", "")
            if post_processing == "trim":
                match_value = match_value.strip()
            
            # Handle data type conversion
            if data_type == "date":
                # Keep as string, we'll convert it later
                pass
            elif data_type == "currency":
                # Try to extract numeric value
                numeric_match = re.search(r'(\d+\.\d+|\d+)', match_value)
                if numeric_match:
                    try:
                        match_value = float(numeric_match.group(1))
                    except ValueError:
                        # Keep as string if conversion fails
                        pass
            
            # Store the extracted value
            extracted_data[field_name] = match_value
            # Make sure field_result["value"] is always a string
            field_result["value"] = str(match_value) if match_value is not None else None
            
            # Debug info
            field_debug["final_match"] = {
                "value": match_value,
                "method": match_method
            }
        else:
            logger.warning(f"No match found for field: {field_name}")
        
        field_results.append(field_result)
        field_debug_info[field_name] = field_debug
    
    # Process specific fields that require special handling
    process_special_fields(extracted_data, text)
    
    # Calculate match score
    match_score = fields_matched / fields_total if fields_total > 0 else 0
    
    return {
        "success": match_score > 0.3,  # Lower threshold to 30% for more lenient matching
        "match_score": match_score,
        "fields_matched": fields_matched,
        "fields_total": fields_total,
        "extracted_data": extracted_data,
        "field_results": field_results,
        "debug_info": {
            "text_length": len(text),
            "text_sample": text_sample,
            "field_debug": field_debug_info
        }
    }


def get_common_patterns_for_field_type(field_name: str, data_type: str) -> List[str]:
    """Get common regex patterns based on field name and type."""
    field_name_lower = field_name.lower()
    
    # Common patterns dictionary
    patterns = {
        "date": [
            r'(?:date|dated)[\s:]+([a-zA-Z]+ \d{1,2},? \d{4})',  # January 1, 2023
            r'(?:date|dated)[\s:]+(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})',  # MM/DD/YYYY or DD/MM/YYYY
            r'(?:date|dated)[\s:]+(\d{4}[/-]\d{1,2}[/-]\d{1,2})',  # YYYY/MM/DD
            r'(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})',  # Any date format
            r'(\d{4}[/-]\d{1,2}[/-]\d{1,2})'  # Any date format YYYY/MM/DD
        ],
        "currency": [
            r'(?:total|amount|price|cost)[\s:]+[$€£]?(\d+\.\d{2})',  # Total: $123.45
            r'(?:total|amount|price|cost)[\s:]+[$€£]?(\d+)',  # Total: $123
            r'[$€£](\d+\.\d{2})',  # $123.45
            r'(\d+\.\d{2})[$€£]',  # 123.45$
            r'(?:total|amount|price|cost)[\s:]*?(\d+\.\d{2})' # Total 123.45
        ],
        "order_number": [
            r'(?:order|invoice)[:\s#]+([a-zA-Z0-9-]+)',  # Order #: ABC-123
            r'(?:order|invoice)[:\s#]+(\d+)',  # Order #: 123456
            r'#\s*([a-zA-Z0-9-]+)',  # # ABC-123
            r'(?:order|invoice)[\s:]*([a-zA-Z0-9-]+)'  # Order ABC-123
        ],
        "merchant_name": [
            r'(?:from|seller|vendor|merchant|company)[\s:]+([a-zA-Z0-9\s&]+)',  # From: Company Name
            r'^([a-zA-Z0-9\s&]+)(?:invoice|receipt)',  # Company Name Invoice
            r'^([a-zA-Z0-9\s&]{2,40})$'  # Just the company name at the start of a line
        ]
    }
    
    # Select patterns based on field name and data type
    if "date" in field_name_lower or data_type == "date":
        return patterns["date"]
    elif "total" in field_name_lower or "amount" in field_name_lower or "price" in field_name_lower or data_type == "currency":
        return patterns["currency"]
    elif "order" in field_name_lower or "invoice" in field_name_lower or "number" in field_name_lower:
        return patterns["order_number"]
    elif "merchant" in field_name_lower or "seller" in field_name_lower or "vendor" in field_name_lower or "company" in field_name_lower:
        return patterns["merchant_name"]
    
    # Default: empty list
    return []


def process_special_fields(extracted_data: Dict, text: str) -> None:
    """Process special fields that require custom handling."""
    # Example: Try to extract items if not already present
    if "items" not in extracted_data:
        items = []
        # Look for common item patterns
        # Format: quantity x product $price
        item_matches = re.finditer(r'(\d+)\s*x\s*([a-zA-Z0-9\s]+)\s*\$?(\d+\.\d{2}|\d+)', text, re.IGNORECASE)
        for match in item_matches:
            try:
                quantity = int(match.group(1))
                product_name = match.group(2).strip()
                unit_price = float(match.group(3))
                
                items.append({
                    "product_name": product_name,
                    "quantity": quantity,
                    "unit_price": unit_price
                })
            except (ValueError, IndexError):
                continue
        
        if items:
            extracted_data["items"] = items


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
                    except (ValueError, TypeError):
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
                    numeric_match = re.search(r'(\d+\.\d+|\d+)', value)
                    if numeric_match:
                        try:
                            value = float(numeric_match.group(1))
                        except ValueError:
                            continue
                    else:
                        continue
                else:
                    continue
            
            # Set the value
            setattr(invoice, invoice_field, value)
    
    # Import here to avoid circular imports
    from features.invoices.models import InvoiceItem
    
    # Handle item details if available (preferred method)
    if "items" in extracted_data and isinstance(extracted_data["items"], list):
        # Create new invoice items
        for item_data in extracted_data["items"]:
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
                        numeric_match = re.search(r'(\d+\.\d+|\d+)', price)
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
    from features.templates.models import InvoiceTemplate
    
    # Get all active templates
    templates = db.query(InvoiceTemplate).filter(InvoiceTemplate.is_active == True).all()
    
    best_match = None
    best_score = 0
    
    # Try to match each template
    for template in templates:
        score = match_template_to_text(template.template_data, extracted_text)
        if score > best_score and score > 0.3:  # Lower threshold to 30%
            best_match = template
            best_score = score
    
    return best_match