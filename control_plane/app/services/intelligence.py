import os
import json
import logging
from typing import Dict, Any, Optional
import httpx
from pydantic import BaseModel

logger = logging.getLogger(__name__)

class IntelligenceResult(BaseModel):
    contextual_risk_score: float
    detected_intents: list[str]
    recommended_action: str  # e.g., "ALLOW", "MASK", "BLOCK"

class IntelligenceService:
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY")
        self.provider = os.getenv("LLM_PROVIDER", "openai")
        self.base_url = "https://api.openai.com/v1/chat/completions" if self.provider == "openai" else "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent"

    async def evaluate_contextual_risk(self, text: str, local_results: Dict[str, Any]) -> Optional[IntelligenceResult]:
        """
        Sends the partially-masked text to the LLM for secondary contextual risk evaluation.
        """
        if not self.api_key:
            logger.warning("Intelligence Service: API key missing. Skipping contextual evaluation.")
            return None

        prompt = (
            f"You are a PII and Security Guardrail Auditor. Analyze the following prompt for contextual risk. "
            f"Local regex already detected: {local_results.get('detected_entities', [])}. "
            f"The prompt is: \"{text}\"\n\n"
            f"Provide a structured JSON response with:\n"
            f"1. contextual_risk_score: (0.0 to 1.0, where 1.0 is highest risk)\n"
            f"2. detected_intents: (list of strings describing the user's goal)\n"
            f"3. recommended_action: ('ALLOW', 'MASK', or 'BLOCK')\n"
            f"Return ONLY the JSON object."
        )

        try:
            if self.provider == "openai":
                return await self._call_openai(prompt)
            elif self.provider == "gemini":
                return await self._call_gemini(prompt)
            else:
                logger.error(f"Unsupported provider: {self.provider}")
                return None
        except Exception as e:
            logger.error(f"Intelligence Service error: {str(e)}")
            return None

    async def _call_openai(self, prompt: str) -> Optional[IntelligenceResult]:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                self.base_url,
                headers={"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"},
                json={
                    "model": "gpt-4o-mini",
                    "messages": [{"role": "user", "content": prompt}],
                    "response_format": {"type": "json_object"}
                },
                timeout=10.0
            )
            response.raise_for_status()
            data = response.json()
            content = data["choices"][0]["message"]["content"]
            return IntelligenceResult.model_validate_json(content)

    async def _call_gemini(self, prompt: str) -> Optional[IntelligenceResult]:
        # Simplified Gemini call implementation
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}?key={self.api_key}",
                headers={"Content-Type": "application/json"},
                json={
                    "contents": [{"parts": [{"text": prompt}]}]
                },
                timeout=10.0
            )
            response.raise_for_status()
            data = response.json()
            # Gemini returns text in a different structure
            content = data["candidates"][0]["content"]["parts"][0]["text"]
            # Gemini might not support strict json_object mode in the same way as OpenAI, 
            # so we manually strip potential markdown markers
            json_content = content.strip()
            if json_content.startswith("```json"):
                json_content = json_content.split("```json")[1].split("```")[0].strip()
            elif json_content.startswith("```"):
                json_content = json_content.split("```")[1].split("```")[0].strip()
                
            return IntelligenceResult.model_validate_json(json_content)

# Singleton instance
intelligence_service = IntelligenceService()
