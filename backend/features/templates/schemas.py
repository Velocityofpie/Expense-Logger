# features/templates/schemas.py
from typing import Dict, Any, Optional, List, Union
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field

class FieldExtractionConfig(BaseModel):
    """Enhanced configuration for field extraction patterns."""
    regex: Optional[str] = None
    alternative_regex: Optional[str] = None
    additional_patterns: Optional[List[str]] = None
    post_processing: Optional[str] = None
    capture_groups: Optional[Dict[str, int]] = None
    
    model_config = ConfigDict(from_attributes=True)

class ValidationConfig(BaseModel):
    """Field validation configuration."""
    required: bool = False
    pattern: Optional[str] = None
    min_length: Optional[int] = None
    max_length: Optional[int] = None
    min_value: Optional[float] = None
    max_value: Optional[float] = None
    allowed_values: Optional[List[str]] = None
    
    model_config = ConfigDict(from_attributes=True)

class TemplateField(BaseModel):
    """Enhanced template field definition."""
    field_name: str
    display_name: Optional[str] = None
    data_type: str = "string"  # string, date, currency, integer, float, boolean, address, array
    extraction: FieldExtractionConfig
    validation: Optional[ValidationConfig] = None
    default_value: Optional[Any] = None
    
    model_config = ConfigDict(from_attributes=True)

class TemplateMarker(BaseModel):
    """Template identification marker."""
    text: str
    required: bool = False
    
    model_config = ConfigDict(from_attributes=True)

class TemplateIdentification(BaseModel):
    """Template identification configuration."""
    markers: List[TemplateMarker]
    min_match_score: Optional[float] = 0.3
    
    model_config = ConfigDict(from_attributes=True)

class TemplateData(BaseModel):
    """Complete template data structure."""
    identification: TemplateIdentification
    fields: List[TemplateField]
    vendor_specific: Optional[Dict[str, Any]] = None
    
    model_config = ConfigDict(from_attributes=True)

class TemplateBase(BaseModel):
    """Base template model."""
    name: str
    vendor: Optional[str] = None
    version: Optional[str] = "1.0"
    description: Optional[str] = None
    is_active: Optional[bool] = True
    template_data: Dict[str, Any]
    
    model_config = ConfigDict(from_attributes=True)

class TemplateCreate(TemplateBase):
    """Template creation model."""
    pass

class TemplateResponse(TemplateBase):
    """Template response model."""
    template_id: int
    created_at: datetime
    updated_at: datetime
    created_by: Optional[int] = None

class TemplateUpdate(BaseModel):
    """Template update model."""
    name: Optional[str] = None
    vendor: Optional[str] = None
    version: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None
    template_data: Optional[Dict[str, Any]] = None
    
    model_config = ConfigDict(from_attributes=True)

class TemplateTestRequest(BaseModel):
    """Template test request model."""
    template_id: int
    invoice_id: int
    
    model_config = ConfigDict(from_attributes=True)

class FieldResult(BaseModel):
    """Field test result."""
    field_name: str
    display_name: str
    required: bool
    matched: bool
    value: Optional[str] = None
    match_method: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)

class TemplateTestResponse(BaseModel):
    """Template test response model."""
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
    field_results: Optional[List[FieldResult]] = None
    
    model_config = ConfigDict(from_attributes=True)