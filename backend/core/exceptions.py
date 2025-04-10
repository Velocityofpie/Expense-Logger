# backend/core/exceptions.py
from fastapi import HTTPException, Request, status
from fastapi.responses import JSONResponse
from typing import Dict, Any, Optional, List, Union

class AppException(HTTPException):
    """
    Base application exception that extends FastAPI's HTTPException.
    Provides additional context and consistent error responses.
    """
    def __init__(
        self, 
        status_code: int = 500, 
        detail: Union[str, Dict[str, Any], List[Dict[str, Any]]] = "An error occurred",
        headers: Optional[Dict[str, str]] = None,
        code: Optional[str] = None
    ):
        super().__init__(status_code=status_code, detail=detail, headers=headers)
        self.code = code or f"ERROR_{status_code}"

class ResourceNotFoundException(AppException):
    """Exception raised when a requested resource is not found."""
    def __init__(
        self, 
        resource_type: str, 
        resource_id: Union[int, str],
        headers: Optional[Dict[str, str]] = None
    ):
        detail = f"{resource_type} with id {resource_id} not found"
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=detail,
            headers=headers,
            code="RESOURCE_NOT_FOUND"
        )

class ValidationException(AppException):
    """Exception raised when request data fails validation."""
    def __init__(
        self, 
        detail: Union[str, Dict[str, Any], List[Dict[str, Any]]] = "Validation failed",
        headers: Optional[Dict[str, str]] = None
    ):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=detail,
            headers=headers,
            code="VALIDATION_ERROR"
        )

# Exception handlers
async def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
    """Handler for custom application exceptions."""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": exc.code,
                "message": exc.detail,
            }
        }
    )

def register_exception_handlers(app):
    """Register exception handlers with the FastAPI application."""
    app.add_exception_handler(AppException, app_exception_handler)