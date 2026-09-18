from datetime import datetime
from typing import Optional, List, Any
from uuid import UUID, uuid4
from sqlalchemy import String, DateTime, JSON, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column
from .base_models import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    prompt_id: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    user_id: Mapped[Optional[UUID]] = mapped_column(ForeignKey("users.id"), nullable=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    risk_severity: Mapped[str] = mapped_column(String(20), nullable=False)
    detected_entities: Mapped[List[Any]] = mapped_column(JSON, nullable=False)
    original_prompt: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    masked_prompt: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    justification: Mapped[Optional[str]] = mapped_column(String, nullable=True)
