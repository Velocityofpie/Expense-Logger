# core/models.py
from sqlalchemy import Column, Integer, DateTime, Boolean
from sqlalchemy.sql import func
from core.models import Base, TimestampMixin, SoftDeleteMixin

class TimestampMixin:
    """Mixin for adding created_at and updated_at timestamps to models."""
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)

class SoftDeleteMixin:
    """Mixin for adding soft delete functionality to models."""
    is_deleted = Column(Boolean, default=False)