# backend/models/template.py
import sqlalchemy as sa
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import JSONB
from datetime import datetime
from backend.core.database import Base
from backend.core.models import Base, TimestampMixin

class InvoiceTemplate(Base, TimestampMixin):
    __tablename__ = "invoice_templates"
    
    template_id = sa.Column(sa.Integer, primary_key=True)
    name = sa.Column(sa.String(100), nullable=False)
    vendor = sa.Column(sa.String(100))
    version = sa.Column(sa.String(20))
    description = sa.Column(sa.Text)
    is_active = sa.Column(sa.Boolean, default=True)
    created_by = sa.Column(sa.Integer, sa.ForeignKey("users.user_id"))
    template_data = sa.Column(JSONB)  # Store the full template as JSON
    
    # Relationships
    creator = relationship("User", back_populates="templates")
    test_results = relationship("TemplateTestResult", back_populates="template", cascade="all, delete-orphan")


class TemplateTestResult(Base):
    __tablename__ = "template_test_results"
    
    result_id = sa.Column(sa.Integer, primary_key=True)
    template_id = sa.Column(sa.Integer, sa.ForeignKey("invoice_templates.template_id"))
    invoice_id = sa.Column(sa.Integer, sa.ForeignKey("invoices.invoice_id"))
    test_date = sa.Column(sa.DateTime, default=datetime.utcnow)
    success = sa.Column(sa.Boolean)
    match_score = sa.Column(sa.Float)
    fields_matched = sa.Column(sa.Integer)
    fields_total = sa.Column(sa.Integer)
    notes = sa.Column(sa.Text)
    extracted_data = sa.Column(JSONB)
    field_results = sa.Column(JSONB)  # Add this field to store detailed results
    
    # Relationships
    template = relationship("InvoiceTemplate", back_populates="test_results")
    invoice = relationship("Invoice", back_populates="template_tests")