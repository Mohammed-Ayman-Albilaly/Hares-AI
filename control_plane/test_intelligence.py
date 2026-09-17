import pytest
from unittest.mock import AsyncMock, patch
from control_plane.app.services.intelligence import intelligence_service, IntelligenceResult

@pytest.mark.asyncio
async def test_intelligence_service_no_key():
    """Verify that the service returns None when no API key is configured."""
    with patch.dict("os.environ", {"OPENAI_API_KEY": ""}):
        # Re-initialize to pick up env change
        from control_plane.app.services.intelligence import IntelligenceService
        service = IntelligenceService()
        result = await service.evaluate_contextual_risk("Hello world", {})
        assert result is None

@pytest.mark.asyncio
async def test_intelligence_service_openai_success():
    """Verify that the service correctly parses a successful OpenAI response."""
    mock_response = {
        "choices": [
            {
                "message": {
                    "content": '{"contextual_risk_score": 0.9, "detected_intents": ["leak_secret"], "recommended_action": "BLOCK"}'
                }
            }
        ]
    }
    
    with patch("httpx.AsyncClient.post") as mock_post:
        mock_post.return_value = AsyncMock(
            status_code=200,
            json=lambda: mock_response,
            raise_for_status=lambda: None
        )
        
        with patch.dict("os.environ", {"OPENAI_API_KEY": "sk-test-123", "LLM_PROVIDER": "openai"}):
            from control_plane.app.services.intelligence import IntelligenceService
            service = IntelligenceService()
            result = await service.evaluate_contextual_risk("Secret text", {})
            
            assert isinstance(result, IntelligenceResult)
            assert result.contextual_risk_score == 0.9
            assert result.recommended_action == "BLOCK"

@pytest.mark.asyncio
async def test_intelligence_service_openai_failure():
    """Verify that the service returns None on API failure (Fail-Safe)."""
    with patch("httpx.AsyncClient.post") as mock_post:
        mock_post.side_effect = Exception("API Down")
        
        with patch.dict("os.environ", {"OPENAI_API_KEY": "sk-test-123", "LLM_PROVIDER": "openai"}):
            from control_plane.app.services.intelligence import IntelligenceService
            service = IntelligenceService()
            result = await service.evaluate_contextual_risk("Secret text", {})
            assert result is None
