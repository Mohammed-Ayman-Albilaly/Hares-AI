import re
from typing import List, Dict, Any, Tuple
from .patterns import PATTERNS, Entity

class RiskSeverity:
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class GuardrailEngine:
    def __init__(self):
        self.patterns = PATTERNS

    def inspect(self, text: str) -> Dict[str, Any]:
        """
        Inspects a prompt for sensitive data and returns risk assessment and masked content.
        """
        raw_entities: List[Entity] = []
        
        # Find all matches for all patterns
        for entity_type, pattern in self.patterns.items():
            for match in re.finditer(pattern, text):
                raw_entities.append({
                    "type": entity_type,
                    "value": match.group(),
                    "start": match.start(),
                    "end": match.end()
                })

        # Sort entities by start position
        raw_entities.sort(key=lambda x: x["start"])

        # Resolve overlaps: Prefer the longest match or the first match
        detected_entities: List[Entity] = []
        if raw_entities:
            current = raw_entities[0]
            for next_entity in raw_entities[1:]:
                if next_entity["start"] < current["end"]:
                    # Overlap detected. Keep the one that ends later (usually the more specific/longer one)
                    if next_entity["end"] > current["end"]:
                        current = next_entity
                else:
                    detected_entities.append(current)
                    current = next_entity
            detected_entities.append(current)

        # Masking and severity calculation
        masked_text = text
        max_severity = RiskSeverity.LOW
        
        # Simple severity mapping
        severity_map = {
            "EMAIL": RiskSeverity.MEDIUM,
            "PHONE": RiskSeverity.MEDIUM,
            "CREDIT_CARD": RiskSeverity.HIGH,
            "API_KEY": RiskSeverity.CRITICAL,
            "GENERIC_SECRET": RiskSeverity.CRITICAL,
        }

        # We iterate backwards to avoid offset issues during masking
        for entity in reversed(detected_entities):
            entity_type = entity["type"]
            
            # Update max severity
            entity_severity = severity_map.get(entity_type, RiskSeverity.LOW)
            if self._severity_to_score(entity_severity) > self._severity_to_score(max_severity):
                max_severity = entity_severity
            
            # Apply masking
            start, end = entity["start"], entity["end"]
            masked_text = masked_text[:start] + f"<{entity_type}>" + masked_text[end:]

        return {
            "risk_severity": max_severity,
            "detected_entities": detected_entities,
            "masked_content": masked_text,
            "original_content": text
        }

    def _severity_to_score(self, severity: str) -> int:
        scores = {
            RiskSeverity.LOW: 0,
            RiskSeverity.MEDIUM: 1,
            RiskSeverity.HIGH: 2,
            RiskSeverity.CRITICAL: 3,
        }
        return scores.get(severity, 0)

# Singleton instance for easy access
engine = GuardrailEngine()
