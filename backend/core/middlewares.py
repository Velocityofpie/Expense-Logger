# backend/core/middlewares.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.config import CORS_ORIGINS
import time
from typing import Callable
from fastapi import Request, Response
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class RequestLoggingMiddleware:
    """Middleware for logging request details."""
    async def __call__(self, request: Request, call_next: Callable) -> Response:
        start_time = time.time()
        
        # Process the request and get response
        response = await call_next(request)
        
        # Calculate processing time
        process_time = time.time() - start_time
        
        # Log request details
        logger.info(
            f"{request.method} {request.url.path} "
            f"- Status: {response.status_code} "
            f"- Processing time: {process_time:.4f}s"
        )
        
        return response

def setup_middlewares(app: FastAPI) -> None:
    """Configure middleware for the application."""
    # Add CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Add request logging middleware
    app.middleware("http")(RequestLoggingMiddleware())