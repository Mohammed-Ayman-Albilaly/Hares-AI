from datetime import datetime
from typing import Optional, List, Any
from uuid import UUID
from pydantic import BaseModel

class AuditLogBase(BaseModel):
    prompt_id: str
    risk_severity: str
    detected_entities: List[Any]
    original_prompt: Optional[str] = None
    masked_prompt: Optional[str] = None
    justification: Optional[str] = None

class AuditLogCreate(AuditLogBase):
    user_id: Optional[UUID] = None

class AuditLogRead(AuditLogBase):
    id: UUID
    user_id: Optional[UUID] = None
    timestamp: datetime

    class Config:
        from_attributes = True
