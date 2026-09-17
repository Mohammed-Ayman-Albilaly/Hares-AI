from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from uuid import uuid4
from sqlalchemy.orm import Session

from control_plane.app.core.guardrail_engine.engine import engine
from control_plane.app.models.audit import AuditLog
from control_plane.app.schemas.audit import AuditLogCreate
from control_plane.app.core.db import get_db

class InspectRequest(BaseModel):
    text: str
    user_id: Optional[str] = None
    prompt_id: Optional[str] = None

class InspectResponse(BaseModel):
    risk_severity: str
    detected_entities: List[Dict[str, Any]]
    masked_content: str
    original_content: str

router = APIRouter()

# In-memory storage for dynamic rules
DYNAMIC_RULES = {
    "active_rules": ["EMAIL", "PHONE", "CREDIT_CARD", "API_KEY", "GENERIC_SECRET"],
    "settings": {
        "masking_enabled": True,
        "block_critical": True
    }
}

@router.post("/inspect", response_model=InspectResponse)
async def inspect_prompt(request: InspectRequest, db: Session = Depends(get_db)):
    """
    Inspects a prompt for sensitive data using the GuardrailEngine and logs the event.
    """
    result = engine.inspect(request.text)
    
    # Task 2.2: Audit Log Ingestion
    prompt_id = request.prompt_id or str(uuid4())
    
    audit_entry = AuditLog(
        prompt_id=prompt_id,
        user_id=request.user_id if request.user_id else None,
        risk_severity=result["risk_severity"],
        detected_entities=result["detected_entities"],
        original_prompt=result["original_content"],
        masked_prompt=result["masked_content"]
    )
    
    db.add(audit_entry)
    db.commit()
    db.refresh(audit_entry)
    
    return result

@router.get("/rules")
async def get_rules():
    """
    Returns the currently active inspection and masking rules.
    """
    return DYNAMIC_RULES

@router.post("/rules")
async def update_rules(rules: Dict[str, Any]):
    """
    Updates the dynamic rules configuration.
    """
    global DYNAMIC_RULES
    DYNAMIC_RULES.update(rules)
    return {"status": "success", "updated_rules": DYNAMIC_RULES}
