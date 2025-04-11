
# utils/audit.py
from typing import Dict, Optional
from sqlalchemy.orm import Session
from features.invoices.models import AuditLog

def log_audit(db: Session, user_id: int, action: str, table_name: str, record_id: int, old_data: Optional[Dict] = None, new_data: Optional[Dict] = None):
    """Create audit log entry."""
    log = AuditLog(
        user_id=user_id,
        action=action,
        table_name=table_name,
        record_id=record_id,
        old_data=old_data,
        new_data=new_data
    )
    db.add(log)
    db.flush()
    return log