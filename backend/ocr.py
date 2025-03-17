# backend/ocr.py
import os
import tempfile
from PIL import Image
import pytesseract
from pdf2image import convert_from_path
from pydantic import BaseModel
from typing import List, Optional

# You may need to set the Tesseract path if it's not in PATH
# pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'  # Example for Windows

# Define OCR configuration options
class OcrOptions(BaseModel):
    """Options for OCR processing."""
    language: str = "eng"  # Default to English
    dpi: int = 300
    preprocess: bool = False
    page_range: Optional[List[int]] = None  # Process specific pages, None for all


def process_pdf_with_ocr(pdf_path: str, options: OcrOptions) -> str:
    """Process a PDF file and extract text using OCR."""
    try:
        # Set up page range if specified
        if options.page_range and options.page_range[0] is not None:
            first_page = options.page_range[0]
            last_page = options.page_range[1] if options.page_range[1] is not None else first_page
        else:
            first_page = None
            last_page = None
        
        # Convert PDF to images
        images = convert_from_path(
            pdf_path, 
            dpi=options.dpi,
            first_page=first_page,
            last_page=last_page
        )
        
        # Extract text from each image
        full_text = ""
        for i, image in enumerate(images):
            page_num = (first_page or 1) + i
            
            # Preprocess image if requested
            if options.preprocess:
                image = preprocess_image(image)
            
            # Perform OCR
            page_text = pytesseract.image_to_string(image, lang=options.language)
            
            # Add page header and text
            full_text += f"\n\n----- Page {page_num} -----\n\n"
            full_text += page_text
        
        return full_text.strip()
        
    except Exception as e:
        # Log the error
        print(f"Error processing PDF: {str(e)}")
        raise


def preprocess_image(image):
    """
    Preprocess image to improve OCR accuracy.
    Applies basic image enhancements.
    """
    # Convert to grayscale
    gray = image.convert('L')
    
    # Optional: Apply additional preprocessing techniques
    # - Noise removal
    # - Thresholding
    # - Deskewing
    # - etc.
    
    return gray


def get_available_languages():
    """Get list of available OCR languages."""
    try:
        # This tries to get all available languages in Tesseract
        # It may not work in all environments
        languages = pytesseract.get_languages()
        return [{"code": lang, "name": lang} for lang in languages if lang != "osd"]
    except:
        # Fallback to common languages
        return [
            {"code": "eng", "name": "English"},
            {"code": "fra", "name": "French"},
            {"code": "deu", "name": "German"},
            {"code": "spa", "name": "Spanish"},
            {"code": "ita", "name": "Italian"},
            {"code": "por", "name": "Portuguese"},
            {"code": "chi_sim", "name": "Chinese (Simplified)"},
            {"code": "chi_tra", "name": "Chinese (Traditional)"},
            {"code": "jpn", "name": "Japanese"},
            {"code": "kor", "name": "Korean"},
            {"code": "ara", "name": "Arabic"},
            {"code": "rus", "name": "Russian"}
        ]