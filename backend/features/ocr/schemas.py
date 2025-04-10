# backend/features/ocr/schemas.py
from typing import List, Optional, Union
from pydantic import BaseModel, Field

class OcrOptions(BaseModel):
    """Options for OCR processing."""
    language: str = Field(default="eng", description="OCR language code")
    dpi: int = Field(default=300, description="DPI for PDF conversion")
    preprocess: bool = Field(default=False, description="Apply image preprocessing")
    page_range: Optional[List[Optional[int]]] = Field(
        default=None, 
        description="Page range to process [start, end]"
    )
    
    class Config:
        schema_extra = {
            "example": {
                "language": "eng",
                "dpi": 300,
                "preprocess": True,
                "page_range": [1, 3]
            }
        }

class OcrRequest(BaseModel):
    """Request model for OCR processing."""
    language: str = Field(default="eng", description="OCR language code")
    dpi: int = Field(default=300, description="DPI for PDF conversion")
    preprocess: bool = Field(default=False, description="Apply image preprocessing")
    page_start: Optional[int] = Field(default=None, description="Start page")
    page_end: Optional[int] = Field(default=None, description="End page")
    
    class Config:
        schema_extra = {
            "example": {
                "language": "eng",
                "dpi": 300,
                "preprocess": True,
                "page_start": 1,
                "page_end": 3
            }
        }

class OcrResponse(BaseModel):
    """Response model for OCR processing."""
    text: str = Field(..., description="Extracted text")
    
    class Config:
        schema_extra = {
            "example": {
                "text": "Extracted text content from document..."
            }
        }

class LanguageResponse(BaseModel):
    """Response model for available languages."""
    languages: List[dict] = Field(..., description="Available OCR languages")
    
    class Config:
        schema_extra = {
            "example": {
                "languages": [
                    {"code": "eng", "name": "English"},
                    {"code": "fra", "name": "French"}
                ]
            }
        }