# features/templates/router.py
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, BackgroundTasks, Form, Body
from fastapi.responses import FileResponse, JSONResponse
from sqlalchemy.orm import Session
import os
import json
import tempfile

from core.database import get_db
from features.templates.models import InvoiceTemplate, TemplateTestResult
from features.invoices.models import Invoice, InvoiceFile
from features.templates.schemas import (
    TemplateResponse, 
    TemplateCreate, 
    TemplateUpdate,
    TemplateTestRequest,
    TemplateTestResponse
)
from features.templates.services import process_with_template

router = APIRouter(
    prefix="/templates",
    tags=["templates"],
    responses={404: {"description": "Not found"}},
)


@router.get("/", response_model=List[TemplateResponse])
async def get_templates(
    db: Session = Depends(get_db), 
    skip: int = 0, 
    limit: int = 100,
    active_only: bool = True
):
    """Return all templates, optionally filtered by active status."""
    query = db.query(InvoiceTemplate)
    
    if active_only:
        query = query.filter(InvoiceTemplate.is_active == True)
        
    templates = query.offset(skip).limit(limit).all()
    return templates


@router.get("/{template_id}", response_model=TemplateResponse)
async def get_template(template_id: int, db: Session = Depends(get_db)):
    """Return a single template by ID."""
    template = db.query(InvoiceTemplate).filter(InvoiceTemplate.template_id == template_id).first()
    
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    return template


@router.post("/", response_model=TemplateResponse)
async def create_template(
    template_data: TemplateCreate, 
    db: Session = Depends(get_db), 
    user_id: int = 1
):
    """Create a new template."""
    try:
        # Create new template
        new_template = InvoiceTemplate(
            name=template_data.name,
            vendor=template_data.vendor,
            version=template_data.version,
            description=template_data.description,
            is_active=template_data.is_active,
            template_data=template_data.template_data,
            created_by=user_id
        )
        
        db.add(new_template)
        db.commit()
        db.refresh(new_template)
        
        return new_template
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{template_id}", response_model=TemplateResponse)
async def update_template(
    template_id: int, 
    template_update: TemplateUpdate, 
    db: Session = Depends(get_db)
):
    """Update an existing template."""
    try:
        template = db.query(InvoiceTemplate).filter(InvoiceTemplate.template_id == template_id).first()
        
        if not template:
            raise HTTPException(status_code=404, detail="Template not found")
        
        # Update fields if provided
        if template_update.name is not None:
            template.name = template_update.name
            
        if template_update.vendor is not None:
            template.vendor = template_update.vendor
            
        if template_update.version is not None:
            template.version = template_update.version
            
        if template_update.description is not None:
            template.description = template_update.description
            
        if template_update.is_active is not None:
            template.is_active = template_update.is_active
            
        if template_update.template_data is not None:
            template.template_data = template_update.template_data
        
        db.commit()
        db.refresh(template)
        
        return template
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{template_id}")
async def delete_template(template_id: int, db: Session = Depends(get_db)):
    """Delete a template."""
    try:
        template = db.query(InvoiceTemplate).filter(InvoiceTemplate.template_id == template_id).first()
        
        if not template:
            raise HTTPException(status_code=404, detail="Template not found")
        
        db.delete(template)
        db.commit()
        
        return {"message": "Template deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/import")
async def import_template(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user_id: int = 1
):
    """Import a template from a JSON file."""
    try:
        content = await file.read()
        try:
            template_data = json.loads(content)
        except json.JSONDecodeError:
            raise HTTPException(status_code=400, detail="Invalid JSON file")
        
        # Validate template structure
        if "name" not in template_data:
            raise HTTPException(status_code=400, detail="Template requires a name field")
        
        # Create new template
        new_template = InvoiceTemplate(
            name=template_data.get("name"),
            vendor=template_data.get("vendor"),
            version=template_data.get("version", "1.0"),
            description=template_data.get("description"),
            is_active=True,
            template_data=template_data,
            created_by=user_id
        )
        
        db.add(new_template)
        db.commit()
        db.refresh(new_template)
        
        return {"message": "Template imported successfully", "template_id": new_template.template_id}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{template_id}/export")
async def export_template(
    template_id: int, 
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Export a template as a JSON file."""
    template = db.query(InvoiceTemplate).filter(InvoiceTemplate.template_id == template_id).first()
    
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    # Create the JSON content
    template_json = json.dumps(template.template_data, indent=2)
    
    # Create a temporary file
    with tempfile.NamedTemporaryFile(delete=False, suffix=".json") as temp:
        temp_path = temp.name
        temp.write(template_json.encode())
    
    # Function to remove the temp file after sending
    def remove_file(path: str):
        try:
            os.unlink(path)
        except Exception as e:
            print(f"Error removing temp file: {e}")
    
    # Add cleanup task to the background
    background_tasks.add_task(remove_file, temp_path)
    
    # Return the file
    return FileResponse(
        path=temp_path, 
        filename=f"{template.name.replace(' ', '_')}_v{template.version}.json",
        media_type="application/json"
    )


@router.post("/test", response_model=TemplateTestResponse)
async def test_template(
    test_request: TemplateTestRequest,
    db: Session = Depends(get_db)
):
    """Test a template against an invoice."""
    try:
        # Get template and invoice
        template = db.query(InvoiceTemplate).filter(InvoiceTemplate.template_id == test_request.template_id).first()
        invoice = db.query(Invoice).filter(Invoice.invoice_id == test_request.invoice_id).first()
        
        if not template:
            raise HTTPException(status_code=404, detail="Template not found")
            
        if not invoice:
            raise HTTPException(status_code=404, detail="Invoice not found")
            
        # Get invoice file path
        invoice_file = db.query(InvoiceFile).filter(InvoiceFile.invoice_id == invoice.invoice_id).first()
        
        if not invoice_file or not invoice_file.file_path:
            raise HTTPException(status_code=400, detail="Invoice has no associated file")
        
        # Process the invoice with the template
        result = process_with_template(invoice_file.file_path, template.template_data)
        
        # Store the test result
        test_result = TemplateTestResult(
            template_id=template.template_id,
            invoice_id=invoice.invoice_id,
            success=result["success"],
            match_score=result["match_score"],
            fields_matched=result["fields_matched"],
            fields_total=result["fields_total"],
            notes=None,
            extracted_data=result["extracted_data"],
            field_results=result.get("field_results", [])  # Store the detailed field results
        )
        
        db.add(test_result)
        db.commit()
        db.refresh(test_result)
        
        # Add the field_results to the response
        response_data = {
            "result_id": test_result.result_id,
            "template_id": test_result.template_id,
            "invoice_id": test_result.invoice_id,
            "test_date": test_result.test_date,
            "success": test_result.success,
            "match_score": test_result.match_score,
            "fields_matched": test_result.fields_matched,
            "fields_total": test_result.fields_total,
            "notes": test_result.notes,
            "extracted_data": test_result.extracted_data,
            "field_results": result.get("field_results", [])  # Include field results in response
        }
        
        return response_data
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))