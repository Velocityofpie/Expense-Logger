# backend/template_processor.py
import os
import re
import json
import tempfile
from typing import Dict, List, Optional, Union, Any
from datetime import datetime
from PIL import Image
import pytesseract
from pdf2image import convert_from_path

def extract_text_from_file(file_path: str) -> str:
    """Extract text content from a file (PDF or image)."""
    try:
        # Check if it's a PDF
        if file_path.lower().endswith('.pdf'):
            return extract_text_from_pdf(file_path)
        # Check if it's an image
        elif file_path.lower().endswith(('.png', '.jpg', '.jpeg')):
            return extract_text_from_image(file_path)
        else:
            return ""
    except Exception as e:
        print(f"Error extracting text: {e}")
        return ""


def extract_text_from_pdf(pdf_path: str) -> str:
    """Extract text from a PDF file using OCR."""
    # Create a temporary directory for extracted images
    with tempfile.TemporaryDirectory() as temp_dir:
        text = ""
        
        # Convert PDF pages to images
        images = convert_from_path(pdf_path)
        
        # Process each page
        for i, image in enumerate(images):
            # Save image to temp file
            image_path = os.path.join(temp_dir, f'page_{i}.png')
            image.save(image_path, 'PNG')
            
            # Extract text using OCR
            page_text = pytesseract.image_to_string(Image.open(image_path))
            text += f"\n\n----- Page {i+1} -----\n\n{page_text}"
        
        return text


def extract_text_from_image(image_path: str) -> str:
    """Extract text from an image file using OCR."""
    # Open the image
    image = Image.open(image_path)
    
    # Extract text using OCR
    return pytesseract.image_to_string(image)


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
        
        # If we found a match, extract the data
        if match:
            fields_matched += 1
            # Get the first capture group, or the whole match if no groups
            value = match.group(1) if match.groups() else match.group(0)
            
            # Apply any post-processing
            post_processing = field.get("extraction", {}).get("post_processing", "")
            if post_processing == "trim":
                value = value.strip()
            
            # Store the extracted value
            extracted_data[field_name] = value
    
    # Calculate match score
    match_score = fields_matched / fields_total if fields_total > 0 else 0
    
    return {
        "success": match_score > 0.5,  # At least 50% of fields must match
        "match_score": match_score,
        "fields_matched": fields_matched,
        "fields_total": fields_total,
        "extracted_data": extracted_data
    }


def update_invoice_with_extracted_data(invoice, extracted_data: Dict, db):
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
        # First, we'll clear existing items if we have item data
        from main import InvoiceItem
        
        # Create new invoice items
        for item_data in extracted_data["item_details"]:
            # Create a new invoice item
            item = InvoiceItem(
                invoice_id=invoice.invoice_id,
                product_name=item_data.get("product_name", ""),
                quantity=int(item_data.get("quantity", 1)),
                unit_price=float(item_data.get("price", 0)),
                product_link=item_data.get("product_link", ""),
                condition=item_data.get("condition", "New")
            )
            db.add(item)
    
    # Extract and set tags/categories if available
    if "tags" in extracted_data and isinstance(extracted_data["tags"], list):
        from main import get_or_create_tag
        
        for tag_name in extracted_data["tags"]:
            tag = get_or_create_tag(db, tag_name)
            invoice.tags.append(tag)
    
    if "categories" in extracted_data and isinstance(extracted_data["categories"], list):
        from main import get_or_create_category
        
        for category_name in extracted_data["categories"]:
            category = get_or_create_category(db, category_name)
            invoice.categories.append(category)


def find_matching_template(file_path: str, db) -> Optional[Any]:
    """Find the best matching template for a document."""
    # Extract text from the file
    extracted_text = extract_text_from_file(file_path)
    
    # Import here to avoid circular imports
    from main import InvoiceTemplate
    
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