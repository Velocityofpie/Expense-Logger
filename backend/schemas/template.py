# backend/schemas/template.py
from typing import Dict, Any, Optional, List
from datetime import datetime
from pydantic import BaseModel

class TemplateBase(BaseModel):
    name: str
    vendor: Optional[str] = None
    version: Optional[str] = "1.0"
    description: Optional[str] = None
    is_active: Optional[bool] = True
    template_data: Dict[str, Any]
    
    class Config:
        orm_mode = True


class TemplateCreate(TemplateBase):
    pass


class TemplateResponse(TemplateBase):
    template_id: int
    created_at: datetime
    updated_at: datetime
    created_by: Optional[int] = None
    
    class Config:
        orm_mode = True


class TemplateUpdate(BaseModel):
    name: Optional[str] = None
    vendor: Optional[str] = None
    version: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None
    template_data: Optional[Dict[str, Any]] = None
    
    class Config:
        orm_mode = True


class TemplateTestRequest(BaseModel):
    template_id: int
    invoice_id: int
    
    class Config:
        orm_mode = True


class TemplateTestResponse(BaseModel):
    result_id: int
    template_id: int
    invoice_id: int
    test_date: datetime
    success: bool
    match_score: float
    fields_matched: int
    fields_total: int
    notes: Optional[str] = None
    extracted_data: Dict[str, Any]
    
    class Config:
        orm_mode = True