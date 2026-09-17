import re
from typing import Dict, List, TypedDict

class Entity(TypedDict):
    type: str
    value: str
    start: int
    end: int

# Regex patterns for common sensitive data
# Note: These are basic patterns and can be expanded for higher precision
PATTERNS: Dict[str, str] = {
    "EMAIL": r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+",
    "PHONE": r"(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}",
    "CREDIT_CARD": r"\b(?:\d[ -]*?){13,16}\b",
    "API_KEY": r"(?i)(?:api[_-]?key|secret|token|auth)[=:]\s*['\"]?([a-zA-Z0-9_\-]{16,})['\"]?",
    "GENERIC_SECRET": r"(?i)(?:password|passwd|secret)[=:]\s*['\"]?([a-zA-Z0-9_\-]{8,})['\"]?",
}

def get_patterns() -> Dict[str, str]:
    return PATTERNS
