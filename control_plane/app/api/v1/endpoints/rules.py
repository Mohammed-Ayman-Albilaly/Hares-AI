from fastapi import Request

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from uuid import uuid4
from sqlalchemy.orm import Session

from control_plane.app.core.guardrail_engine.engine import engine
from control_plane.app.models.audit import AuditLog
from control_plane.app.schemas.audit import AuditLogCreate
from control_plane.app.core.db import get_db
from control_plane.app.services.intelligence import intelligence_service
from control_plane.app.core.rate_limit import limiter, _rate_limit

class InspectRequest(BaseModel):
    text: str
    user_id: Optional[str] = None
    prompt_id: Optional[str] = None

class InspectResponse(BaseModel):
    risk_severity: str
    detected_entities: List[Dict[str, Any]]
    masked_content: str
    original_content: str
    intelligence_analysis: Optional[Dict[str, Any]] = None

class JustificationRequest(BaseModel):
    originalText: str
    maskedText: str
    justification: str
    riskLevel: str
    url: Optional[str] = None
    timestamp: Optional[str] = None
    user_id: Optional[str] = None

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
@_rate_limit(limiter, "100-per-minute")
async def inspect_prompt(request: Request, payload: InspectRequest, db: Session = Depends(get_db)):
    """
    Inspects a prompt for sensitive data using the GuardrailEngine and logs the event.
    Now includes a secondary evaluation layer via the Intelligence Service.
    """
    # 1. Local Deterministic Inspection (Regex)
    result = engine.inspect(payload.text)
    
    # 2. Secondary Contextual Evaluation (Intelligence Layer)
    # We send the masked content to the LLM to avoid leaking PII to the external provider
    intelligence_analysis = await intelligence_service.evaluate_contextual_risk(
        result["masked_content"], 
        result
    )
    
    # 3. Final Severity Adjustment
    # If the Intelligence Layer identifies a high risk or a "BLOCK" action, we override the severity
    final_severity = result["risk_severity"]
    if intelligence_analysis:
        if intelligence_analysis.recommended_action == "BLOCK":
            final_severity = "CRITICAL"
        elif intelligence_analysis.contextual_risk_score > 0.8:
            final_severity = "HIGH"
        elif intelligence_analysis.contextual_risk_score > 0.5:
            final_severity = "MEDIUM"

    # Task 2.2: Audit Log Ingestion
    prompt_id = payload.prompt_id or str(uuid4())
    
    audit_entry = AuditLog(
        prompt_id=prompt_id,
        user_id=payload.user_id if payload.user_id else None,
        risk_severity=final_severity,
        detected_entities=result["detected_entities"],
        original_prompt=result["original_content"],
        masked_prompt=result["masked_content"]
    )
    
    db.add(audit_entry)
    db.commit()
    db.refresh(audit_entry)
    
    return {
        **result,
        "risk_severity": final_severity,
        "intelligence_analysis": intelligence_analysis.model_dump() if intelligence_analysis else None
    }

@router.get("/rules")
@_rate_limit(limiter, "20-per-minute")
async def get_rules(request: Request):
    """
    Returns the currently active inspection and masking rules.
    """
    return DYNAMIC_RULES

@router.post("/rules")
@_rate_limit(limiter, "10-per-minute")
async def update_rules(request: Request, rules: Dict[str, Any]):
    """
    Updates the dynamic rules configuration.
    """
    global DYNAMIC_RULES
    DYNAMIC_RULES.update(rules)
    return {"status": "success", "updated_rules": DYNAMIC_RULES}

@router.post("/audit/justification")
@_rate_limit(limiter, "60-per-minute")
async def log_justification(request: Request, payload: JustificationRequest, db: Session = Depends(get_db)):
    """
    Logs a user's business justification for overriding a blocked or high-risk prompt.
    """
    prompt_id = str(uuid4())
    
    audit_entry = AuditLog(
        prompt_id=prompt_id,
        risk_severity=payload.riskLevel,
        detected_entities=[], # Justification comes after initial detection
        original_prompt=payload.originalText,
        masked_prompt=payload.maskedText,
        justification=payload.justification,
        user_id=None # In a real scenario, extract from JWT token
    )
    
    db.add(audit_entry)
    db.commit()
    db.refresh(audit_entry)
    
    return {"status": "success", "audit_id": str(audit_entry.id)}

@router.get("/audit/logs")
@_rate_limit(limiter, "30-per-minute")
async def get_audit_logs(request: Request, db: Session = Depends(get_db)):
    """
    Retrieves all audit logs for review in the Admin Dashboard.
    """
    logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).all()
    return logs
