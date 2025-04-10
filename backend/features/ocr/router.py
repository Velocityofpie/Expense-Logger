# backend/features/ocr/router.py
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from fastapi.responses import JSONResponse
from typing import Optional
import tempfile
import os

from .schemas import OcrOptions, OcrResponse, LanguageResponse
from .services import process_pdf_with_ocr, get_available_languages

router = APIRouter(
    prefix="/ocr",
    tags=["ocr"],
    responses={404: {"description": "Not found"}}
)

@router.post("/extract/", response_model=OcrResponse)
async def extract_text_from_pdf(
    file: UploadFile = File(...),
    language: str = Form("eng"),
    dpi: int = Form(300),
    preprocess: bool = Form(False),
    page_start: Optional[int] = Form(None),
    page_end: Optional[int] = Form(None)
):
    """Extract text from a PDF file using OCR."""
    if not file.filename.endswith(('.pdf', '.PDF')):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    try:
        # Create options object
        options = OcrOptions(
            language=language,
            dpi=dpi,
            preprocess=preprocess,
            page_range=[page_start, page_end] if page_start is not None else None
        )
        
        # Create temporary file to store the uploaded PDF
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp:
            temp_path = temp.name
            content = await file.read()
            temp.write(content)
        
        # Extract text using OCR
        try:
            extracted_text = process_pdf_with_ocr(temp_path, options)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"OCR processing failed: {str(e)}")
        finally:
            # Clean up temp file
            if os.path.exists(temp_path):
                os.unlink(temp_path)
        
        return {"text": extracted_text}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OCR processing error: {str(e)}")


@router.get("/languages/", response_model=LanguageResponse)
async def get_ocr_languages():
    """Get available OCR languages."""
    try:
        languages = get_available_languages()
        return {"languages": languages}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get languages: {str(e)}")