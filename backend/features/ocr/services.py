# backend/features/ocr/services.py
import os
import tempfile
import re
import pytesseract
from PIL import Image, ImageEnhance, ImageFilter
from pdf2image import convert_from_path
from typing import List, Dict, Optional, Union

def extract_text_from_file(file_path: str) -> str:
    """Extract text content from a file (PDF or image) with enhanced preprocessing."""
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
    """Extract text from a PDF file using OCR with improved preprocessing."""
    # Create a temporary directory for extracted images
    with tempfile.TemporaryDirectory() as temp_dir:
        text = ""
        
        # Convert PDF pages to images
        try:
            images = convert_from_path(pdf_path, dpi=300)  # Higher DPI for better quality
        except Exception as e:
            print(f"Error converting PDF to images: {e}")
            return ""
        
        # Process each page
        for i, image in enumerate(images):
            # Save image to temp file
            image_path = os.path.join(temp_dir, f'page_{i}.png')
            image.save(image_path, 'PNG')
            
            # Extract text using OCR with preprocessing
            page_text = preprocess_and_extract_text(image_path)
            text += f"\n\n----- Page {i+1} -----\n\n{page_text}"
        
        # Clean up the combined text
        cleaned_text = clean_ocr_text(text)
        return cleaned_text


def extract_text_from_image(image_path: str) -> str:
    """Extract text from an image file using OCR with improved preprocessing."""
    text = preprocess_and_extract_text(image_path)
    return clean_ocr_text(text)


def preprocess_and_extract_text(image_path: str) -> str:
    """Apply image preprocessing and extract text."""
    # Open the image
    image = Image.open(image_path)
    
    # Convert to grayscale
    image = image.convert('L')
    
    # Apply enhancements
    image = ImageEnhance.Contrast(image).enhance(1.5)  # Increase contrast
    image = ImageEnhance.Sharpness(image).enhance(1.5)  # Increase sharpness
    
    # Apply median filter to reduce noise
    image = image.filter(ImageFilter.MedianFilter(size=3))
    
    # Binarize the image (convert to black and white)
    threshold = 150
    image = image.point(lambda p: 255 if p > threshold else 0)
    
    # Save processed image
    processed_path = image_path + '_processed.png'
    image.save(processed_path)
    
    # Extract text using OCR
    try:
        text = pytesseract.image_to_string(Image.open(processed_path), lang='eng')
    except Exception as e:
        print(f"OCR error: {e}")
        text = ""
    finally:
        # Remove temporary processed image
        if os.path.exists(processed_path):
            os.unlink(processed_path)
    
    return text


def clean_ocr_text(text: str) -> str:
    """Clean OCR text to improve pattern matching."""
    # Replace multiple spaces with a single space
    text = re.sub(r'\s+', ' ', text)
    
    # Remove non-printable characters
    text = ''.join(c for c in text if c.isprintable() or c in ['\n', '\t'])
    
    # Normalize common OCR errors
    text = text.replace('l', '1').replace('O', '0')  # Common digit confusions
    
    # Convert all to lowercase for better matching
    text = text.lower()
    
    # Normalize newlines
    text = re.sub(r'\n+', '\n', text)
    
    return text


def process_pdf_with_ocr(pdf_path: str, options) -> str:
    """Process a PDF file with OCR using specified options with enhanced preprocessing."""
    # Create a temporary directory for extracted images
    with tempfile.TemporaryDirectory() as temp_dir:
        text = ""
        
        # Set up page range if specified
        first_page = None
        last_page = None
        if options.page_range and options.page_range[0] is not None:
            first_page = options.page_range[0]
            last_page = options.page_range[1] if options.page_range[1] is not None else first_page
        
        # Convert PDF pages to images
        images = convert_from_path(
            pdf_path, 
            dpi=options.dpi,
            first_page=first_page,
            last_page=last_page
        )
        
        # Process each page
        for i, image in enumerate(images):
            page_num = (first_page or 1) + i
            
            # Preprocess image if requested
            if options.preprocess:
                image = preprocess_image(image)
            
            # Save image to temp file
            image_path = os.path.join(temp_dir, f'page_{i}.png')
            image.save(image_path, 'PNG')
            
            # Extract text using OCR
            page_text = pytesseract.image_to_string(Image.open(image_path), lang=options.language)
            text += f"\n\n----- Page {page_num} -----\n\n{page_text}"
        
        # Clean the text for better pattern matching
        return clean_ocr_text(text)


def preprocess_image(image):
    """
    Preprocess image to improve OCR accuracy.
    Applies image enhancements.
    """
    # Convert to grayscale
    gray = image.convert('L')
    
    # Apply contrast enhancement
    enhancer = ImageEnhance.Contrast(gray)
    gray = enhancer.enhance(1.5)
    
    # Apply sharpness enhancement
    enhancer = ImageEnhance.Sharpness(gray)
    gray = enhancer.enhance(1.5)
    
    # Apply noise reduction
    gray = gray.filter(ImageFilter.MedianFilter(size=3))
    
    # Binarize the image
    threshold = 150
    gray = gray.point(lambda p: 255 if p > threshold else 0)
    
    return gray


def get_available_languages() -> List[Dict[str, str]]:
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