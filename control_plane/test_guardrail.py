from fastapi.testclient import TestClient
from control_plane.app.main import app
from control_plane.app.core.db import get_db
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from control_plane.app.models.audit import Base, AuditLog

# Setup a test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_db.db"
engine_db = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine_db)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

def test_log_justification():
    # Create tables in test db
    Base.metadata.create_all(bind=engine_db)
    
    client = TestClient(app)
    payload = {
        "originalText": "My secret key is sk-123",
        "maskedText": "My secret key is <API_KEY>",
        "justification": "Needed for emergency debugging of production issue #99",
        "riskLevel": "CRITICAL",
        "url": "https://chat.openai.com",
        "timestamp": "2026-09-18T12:00:00Z"
    }
    
    response = client.post("/api/v1/guardrail/audit/justification", json=payload)
    
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "audit_id" in data
    
    # Verify it's in the database
    db = TestingSessionLocal()
    log = db.query(AuditLog).filter(AuditLog.justification == "Needed for emergency debugging of production issue #99").first()
    assert log is not None
    assert log.original_prompt == "My secret key is sk-123"
    assert log.risk_severity == "CRITICAL"
    db.close()

import pytest
from control_plane.app.core.guardrail_engine.engine import engine, RiskSeverity

def test_email_detection():
    text = "Contact me at test@example.com or admin@company.org"
    result = engine.inspect(text)
    
    assert any(e["type"] == "EMAIL" for e in result["detected_entities"])
    assert "<EMAIL>" in result["masked_content"]
    assert "test@example.com" not in result["masked_content"]
    assert "admin@company.org" not in result["masked_content"]
    assert result["risk_severity"] == RiskSeverity.MEDIUM

def test_phone_detection():
    text = "Call me at +1-555-0199 or (555) 123-4567"
    result = engine.inspect(text)
    
    assert any(e["type"] == "PHONE" for e in result["detected_entities"])
    assert "<PHONE>" in result["masked_content"]
    assert result["risk_severity"] == RiskSeverity.MEDIUM

def test_credit_card_detection():
    text = "My card number is 1234-5678-9012-3456"
    result = engine.inspect(text)
    
    assert any(e["type"] == "CREDIT_CARD" for e in result["detected_entities"])
    assert "<CREDIT_CARD>" in result["masked_content"]
    assert result["risk_severity"] == RiskSeverity.HIGH

def test_api_key_and_secrets_detection():
    text = "Here is the key: api_key='sk-1234567890abcdef' and password: 'secretpassword123'"
    result = engine.inspect(text)
    
    assert any(e["type"] == "API_KEY" for e in result["detected_entities"])
    assert any(e["type"] == "GENERIC_SECRET" for e in result["detected_entities"])
    assert "<API_KEY>" in result["masked_content"]
    assert "<GENERIC_SECRET>" in result["masked_content"]
    assert result["risk_severity"] == RiskSeverity.CRITICAL

def test_risk_severity_hierarchy():
    # Low/None
    res_low = engine.inspect("Hello world")
    assert res_low["risk_severity"] == RiskSeverity.LOW
    
    # Medium (Email)
    res_med = engine.inspect("Email: a@b.com")
    assert res_med["risk_severity"] == RiskSeverity.MEDIUM
    
    # High (Credit Card)
    res_high = engine.inspect("Card: 1234567812345678")
    assert res_high["risk_severity"] == RiskSeverity.HIGH
    
    # Critical (API Key)
    res_crit = engine.inspect("api_key: abcdef1234567890")
    assert res_crit["risk_severity"] == RiskSeverity.CRITICAL

def test_masking_offsets_and_multiple_entities():
    text = "My email is test@test.com and my key is api_key: secret1234567890"
    result = engine.inspect(text)
    
    # Verify that both are masked and the string length/structure is preserved logically
    assert result["masked_content"] == "My email is <EMAIL> and my key is <API_KEY>"
    
    # Verify entity counts
    assert len(result["detected_entities"]) == 2

def test_no_false_positives():
    text = "This is a normal sentence with no sensitive data."
    result = engine.inspect(text)
    
    assert len(result["detected_entities"]) == 0
    assert result["masked_content"] == text
    assert result["risk_severity"] == RiskSeverity.LOW
