from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
from control_plane.app.core.guardrail_engine.engine import engine

class InspectRequest(BaseModel):
    text: str

class InspectResponse(BaseModel):
    risk_severity: str
    detected_entities: List[Dict[str, Any]]
    masked_content: str
    original_content: str

router = APIRouter()

# In-memory storage for dynamic rules (Task 2.1 requirement)
# In a real scenario, this would be in the DB, but for Task 2.1 we implement the API structure.
DYNAMIC_RULES = {
    "active_rules": ["EMAIL", "PHONE", "CREDIT_CARD", "API_KEY", "GENERIC_SECRET"],
    "settings": {
        "masking_enabled": True,
        "block_critical": True
    }
}

@router.post("/inspect", response_model=InspectResponse)
async def inspect_prompt(request: InspectRequest):
    """
    Inspects a prompt for sensitive data using the GuardrailEngine.
    """
    result = engine.inspect(request.text)
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
