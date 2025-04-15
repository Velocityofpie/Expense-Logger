# features/templates/services.py

import re
import logging
from typing import Dict, Optional, Any, List
from sqlalchemy.orm import Session
from datetime import datetime, date

from features.ocr.services import extract_text_from_file

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
        
        # Get extraction regex patterns
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
                # Try case-insensitive matching with multiline flag
                match = re.search(regex, text, re.IGNORECASE | re.MULTILINE)
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
                match = re.search(alt_regex, text, re.IGNORECASE | re.MULTILINE)
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
                    match = re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
                    if match:
                        match_value = match.group(1) if match.groups() else match.group(0)
                        match_method = f"additional_regex_{i}"
                        field_debug["matches_found"].append({"pattern": f"additional_{i}", "value": match_value})
                        break
                except Exception as e:
                    logger.error(f"Error with additional regex #{i} for {field_name}: {e}")
        
        # For specific fields, try more specialized patterns if no match yet
        if not match:
            # For date fields - try common date patterns
            if field_name == "purchase_date" or "date" in field_name.lower():
                specialized_patterns = [
                    r'(?:order|purchase|invoice|receipt)\s+date\s*[:;]\s*([A-Za-z]+\s+\d{1,2},?\s+\d{4})',  # Order date: January 15, 2023
                    r'(?:order|purchase|invoice|receipt)\s+date\s*[:;]\s*(\d{1,2}[/-]\d{1,2}[/-]\d{4})',  # Order date: 01/15/2023
                    r'(?:order|purchase|invoice|receipt)\s+date\s*[:;]\s*(\d{4}[/-]\d{1,2}[/-]\d{1,2})',  # Order date: 2023/01/15
                    r'(?:date|dated)[:;]?\s*([A-Za-z]+\s+\d{1,2},?\s+\d{4})',  # Date: January 15, 2023
                    r'(?:date|dated)[:;]?\s*(\d{1,2}[/-]\d{1,2}[/-]\d{4})',  # Date: 01/15/2023
                    r'(\d{1,2}[/-]\d{1,2}[/-]\d{4})',  # Just date format MM/DD/YYYY or DD/MM/YYYY
                    r'(\d{4}[/-]\d{1,2}[/-]\d{1,2})',  # Just date format YYYY/MM/DD
                    r'([A-Za-z]+\s+\d{1,2},?\s+\d{4})',  # Just date format Month DD, YYYY
                ]
                
                # Look first in upper half of document where dates typically appear
                upper_half = text[:len(text)//2]
                
                for i, pattern in enumerate(specialized_patterns):
                    field_debug["regex_tried"].append({"pattern": pattern, "type": f"specialized_date_{i}"})
                    try:
                        # Try upper half first
                        match = re.search(pattern, upper_half, re.IGNORECASE | re.MULTILINE)
                        if match:
                            match_value = match.group(1)
                            match_method = f"specialized_date_{i}_upper"
                            field_debug["matches_found"].append({"pattern": f"specialized_date_{i}", "value": match_value})
                            break
                        
                        # If not found in upper half, try whole document
                        match = re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
                        if match:
                            match_value = match.group(1)
                            match_method = f"specialized_date_{i}_full"
                            field_debug["matches_found"].append({"pattern": f"specialized_date_{i}", "value": match_value})
                            break
                    except Exception as e:
                        logger.error(f"Error with specialized date pattern #{i}: {e}")
            
            # For price/total fields - try in last third of document where totals typically appear
            elif field_name in ["grand_total", "total", "amount", "price", "cost"]:
                last_third = text[len(text)//3*2:]  # Last third of document
                
                specialized_patterns = [
                    r'(?:order|grand|invoice)\s+total\s*[:;]?\s*[$€£]?\s*(\d+[.,]\d{2})',  # Grand total: $XX.XX
                    r'total\s*[:;]?\s*[$€£]?\s*(\d+[.,]\d{2})',  # Total: $XX.XX
                    r'(?:balance|amount)\s+due\s*[:;]?\s*[$€£]?\s*(\d+[.,]\d{2})',  # Amount due: $XX.XX
                    r'(?:to|total)\s+pay\s*[:;]?\s*[$€£]?\s*(\d+[.,]\d{2})',  # To pay: $XX.XX
                    r'(?:payment|paid)\s+(?:amount|total)\s*[:;]?\s*[$€£]?\s*(\d+[.,]\d{2})',  # Payment amount: $XX.XX
                    r'[$€£]\s*(\d+[.,]\d{2})',  # Just $XX.XX
                ]
                
                for i, pattern in enumerate(specialized_patterns):
                    field_debug["regex_tried"].append({"pattern": pattern, "type": f"specialized_total_{i}"})
                    try:
                        # Try last third first (where totals usually appear)
                        match = re.search(pattern, last_third, re.IGNORECASE | re.MULTILINE)
                        if match:
                            match_value = match.group(1)
                            match_method = f"specialized_total_{i}_last_third"
                            field_debug["matches_found"].append({"pattern": f"specialized_total_{i}", "value": match_value})
                            break
                        
                        # If not found in last third, try whole document
                        match = re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
                        if match:
                            match_value = match.group(1)
                            match_method = f"specialized_total_{i}_full"
                            field_debug["matches_found"].append({"pattern": f"specialized_total_{i}", "value": match_value})
                            break
                    except Exception as e:
                        logger.error(f"Error with specialized total pattern #{i}: {e}")
            
            # For merchant name fields - try at beginning of document
            elif field_name == "merchant_name" or "merchant" in field_name.lower() or "seller" in field_name.lower():
                first_quarter = text[:len(text)//4]  # First quarter of document
                
                specialized_patterns = [
                    r'(?:AMAZON(?:\.COM)?)',  # Common Amazon variations
                    r'^([A-Za-z0-9\s&.,\'"-]{2,50})(?:\n|invoice|receipt|order)',  # Company at start of line
                    r'(?:sold|shipped)\s+by\s*[;:]\s*([A-Za-z0-9\s&.,\'"-]{2,50})',  # Sold by: Company
                    r'(?:from|vendor|merchant|seller)[;:]?\s*([A-Za-z0-9\s&.,\'"-]{2,50})',  # From: Company
                ]
                
                for i, pattern in enumerate(specialized_patterns):
                    field_debug["regex_tried"].append({"pattern": pattern, "type": f"specialized_merchant_{i}"})
                    try:
                        # Try first quarter first for merchant name
                        match = re.search(pattern, first_quarter, re.IGNORECASE | re.MULTILINE)
                        if match:
                            match_value = match.group(0) if i == 0 else match.group(1)  # Special case for Amazon
                            if i == 0:  # Amazon case
                                match_value = "Amazon"
                            match_method = f"specialized_merchant_{i}_top"
                            field_debug["matches_found"].append({"pattern": f"specialized_merchant_{i}", "value": match_value})
                            break
                        
                        # If not found in first quarter, try first half of document
                        if i > 0:  # Skip first case (Amazon) for whole document
                            match = re.search(pattern, text[:len(text)//2], re.IGNORECASE | re.MULTILINE)
                            if match:
                                match_value = match.group(1)
                                match_method = f"specialized_merchant_{i}_half"
                                field_debug["matches_found"].append({"pattern": f"specialized_merchant_{i}", "value": match_value})
                                break
                    except Exception as e:
                        logger.error(f"Error with specialized merchant pattern #{i}: {e}")
                
                # Special case: filename often contains merchant for invoices
                if not match and "file_path" in locals():
                    import os
                    filename = os.path.basename(file_path)
                    merchant_match = re.search(r'^([^-]+)', filename)
                    if merchant_match:
                        match_value = merchant_match.group(1).strip()
                        match_method = "filename_extraction"
                        field_debug["matches_found"].append({"pattern": "filename", "value": match_value})
            
            # For order number fields - look for patterns across the document
            elif field_name == "order_number" or "order" in field_name.lower() and "number" in field_name.lower():
                specialized_patterns = [
                    r'(?:order|invoice|confirmation)\s+(?:number|#|id|ref)[;:]?\s*([A-Z0-9\-]+)',  # Order #: ABC-123
                    r'(?:order|invoice|confirmation)\s+(?:number|#|id|ref)[;:]?\s*([a-zA-Z0-9\-_]+)',  # Order #: any format
                    r'#\s*([a-zA-Z0-9\-_]+)',  # Just #ABC-123
                    r'(?:order|invoice|confirmation)[;:]?\s*([a-zA-Z0-9\-_]+)',  # Order: ABC-123
                ]
                
                for i, pattern in enumerate(specialized_patterns):
                    field_debug["regex_tried"].append({"pattern": pattern, "type": f"specialized_order_{i}"})
                    try:
                        match = re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
                        if match:
                            match_value = match.group(1)
                            match_method = f"specialized_order_{i}"
                            field_debug["matches_found"].append({"pattern": f"specialized_order_{i}", "value": match_value})
                            break
                    except Exception as e:
                        logger.error(f"Error with specialized order pattern #{i}: {e}")
                
                # Special case: check filename for order number
                if not match and "file_path" in locals():
                    import os
                    filename = os.path.basename(file_path)
                    order_match = re.search(r'order\s*#?\s*([a-zA-Z0-9\-_]+)', filename, re.IGNORECASE)
                    if order_match:
                        match_value = order_match.group(1).strip()
                        match_method = "filename_order_extraction"
                        field_debug["matches_found"].append({"pattern": "filename_order", "value": match_value})
        
        # If we found a match, process it
        if match_value:
            fields_matched += 1
            field_result["matched"] = True
            field_result["match_method"] = match_method
            
            # Apply any post-processing
            post_processing = field.get("extraction", {}).get("post_processing", "")
            if post_processing == "trim" and isinstance(match_value, str):
                match_value = match_value.strip()
            
            # Handle data type conversion and cleaning
            if data_type == "date":
                # Keep as string, we'll convert it during invoice update
                if isinstance(match_value, str):
                    # Clean up date string
                    match_value = re.sub(r'\s+', ' ', match_value.strip())
                    # Remove ordinal suffixes (1st, 2nd, 3rd, etc.)
                    match_value = re.sub(r'(\d+)(st|nd|rd|th)', r'\1', match_value)
            elif data_type == "currency" and isinstance(match_value, str):
                # Clean up currency string - remove currency symbols, spaces
                match_value = re.sub(r'[$€£¥\s]', '', match_value)
                # Handle different decimal separators
                if ',' in match_value and '.' not in match_value:
                    match_value = match_value.replace(',', '.')
                # Remove any commas used as thousand separators
                match_value = match_value.replace(',', '')
                
                # Convert to float
                try:
                    match_value = float(match_value)
                except ValueError:
                    # Try a simpler approach if conversion fails
                    numeric_match = re.search(r'(\d+\.\d+|\d+)', match_value)
                    if numeric_match:
                        try:
                            match_value = float(numeric_match.group(1))
                        except ValueError:
                            # Keep as string if conversion still fails
                            pass
            elif field_name == "merchant_name" and isinstance(match_value, str):
                # Clean up merchant name
                match_value = match_value.strip()
                match_value = re.sub(r'^(from|vendor|merchant|company|business|seller)[\s:]+', '', match_value, flags=re.IGNORECASE)
                match_value = re.sub(r'[.,;:]*$', '', match_value).strip()
                
                # Special case for Amazon
                if re.search(r'amazon', match_value, re.IGNORECASE):
                    match_value = "Amazon"
            
            # Store the extracted value
            extracted_data[field_name] = match_value
            # Make sure field_result["value"] is always a string for the response
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


def process_special_fields(extracted_data: Dict, text: str) -> None:
    """Process special fields that require custom handling."""
    # Special handling for Amazon invoices
    if "merchant_name" in extracted_data and extracted_data["merchant_name"] == "Amazon":
        # Look for shipping amount in Amazon format
        shipping_match = re.search(r'shipping\s*&?\s*handling\s*:?\s*\$?(\d+\.\d{2})', text, re.IGNORECASE)
        if shipping_match and "shipping_handling" not in extracted_data:
            try:
                extracted_data["shipping_handling"] = float(shipping_match.group(1))
            except ValueError:
                pass
        
        # Look for tax in Amazon format
        tax_match = re.search(r'estimated\s*tax\s*:?\s*\$?(\d+\.\d{2})', text, re.IGNORECASE)
        if tax_match and "estimated_tax" not in extracted_data:
            try:
                extracted_data["estimated_tax"] = float(tax_match.group(1))
            except ValueError:
                pass
    
    # Extract items if not already present
    if "items" not in extracted_data:
        items = []
        # Look for common item patterns
        # Format: quantity x product $price
        item_matches = re.finditer(r'(\d+)\s*x\s*([^$\n]+?)\s*\$?(\d+\.\d{2}|\d+)', text, re.IGNORECASE)
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
            
            # Handle date fields with more robust parsing
            if invoice_field == "purchase_date":
                # If the value is already a date object, use it
                if isinstance(value, date):
                    pass
                elif isinstance(value, datetime):
                    value = value.date()
                elif isinstance(value, str):
                    # Try to parse dates in various formats
                    date_formats = [
                        '%B %d, %Y',     # July 23, 2024
                        '%B %d %Y',      # July 23 2024
                        '%b %d, %Y',     # Jul 23, 2024
                        '%b %d %Y',      # Jul 23 2024
                        '%d %B %Y',      # 23 July 2024
                        '%d %b %Y',      # 23 Jul 2024
                        '%d-%b-%Y',      # 23-Jul-2024
                        '%Y-%m-%d',      # 2024-07-23
                        '%m/%d/%Y',      # 07/23/2024
                        '%d/%m/%Y',      # 23/07/2024
                        '%m-%d-%Y',      # 07-23-2024
                        '%d-%m-%Y',      # 23-07-2024
                        '%Y/%m/%d',      # 2024/07/23
                    ]
                    
                    # Clean up the date string
                    value = re.sub(r'\s+', ' ', value.strip())
                    value = re.sub(r'(\d+)(st|nd|rd|th)', r'\1', value)
                    
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
                        # If all parsing attempts fail, try a more general approach with dateutil
                        try:
                            from dateutil import parser
                            parsed_date = parser.parse(value).date()
                            value = parsed_date
                        except (ValueError, TypeError, ImportError):
                            # Skip this field if we can't parse the date
                            continue
                else:
                    # Skip this field if value is not a recognized type
                    continue
            
            # Handle numeric fields with robust parsing
            elif invoice_field in ["grand_total", "shipping_handling", "estimated_tax", "total_before_tax"]:
                if isinstance(value, (int, float)):
                    # Already a number, use as is
                    pass
                elif isinstance(value, str):
                    # Handle complex string formats
                    try:
                        # Remove any non-numeric chars except decimal point
                        clean_value = re.sub(r'[^\d.]', '', value.replace(',', '.'))
                        value = float(clean_value)
                    except ValueError:
                        # Skip this field if conversion fails
                        continue
                else:
                    # Skip this field if value is not a recognized type
                    continue
            
            # Set the value on the invoice object
            setattr(invoice, invoice_field, value)
    
    # Import here to avoid circular imports
    from features.invoices.models import InvoiceItem
    
    # Handle item details if available
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